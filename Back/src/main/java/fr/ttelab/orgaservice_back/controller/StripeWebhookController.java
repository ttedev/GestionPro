package fr.ttelab.orgaservice_back.controller;

import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/billing")
public class StripeWebhookController {

  StripeWebhookController( UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  private UserRepository userRepository;

  @Value("${stripe.webhookSecret}")
  private String webhookSecret;

  @PostMapping("/webhook")
  public ResponseEntity<String> handleWebhook(HttpServletRequest request) throws Exception {

    String payload = request.getReader().lines().collect(Collectors.joining("\n"));
    String sigHeader = request.getHeader("Stripe-Signature");

    Event event;
    try {
      event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    } catch (Exception e) {
      return ResponseEntity.status(404).body("Invalid signature");
    }

    // ⚠️ Ici tu branches ton code métier
    switch (event.getType()) {
      case "checkout.session.completed" -> {
        Session session = extractSessionFromEvent(event);

        // Récupérer les metadata - d'abord essayer depuis l'event, sinon récupérer via l'API
        Map<String, String> metadata = session.getMetadata();

        if (metadata == null || !metadata.containsKey("userId")) {
          // Si les metadata ne sont pas dans l'event, récupérer la session complète via l'API
          Session fullSession = Session.retrieve(session.getId());
          metadata = fullSession.getMetadata();
        }

        if (metadata == null || !metadata.containsKey("userId")) {
          return ResponseEntity.badRequest().body("userId manquant dans les metadata");
        }

        UUID userId = UUID.fromString(metadata.get("userId"));
        User user = userRepository.findById(userId).orElse(null);

        if (user != null) {
          user.setStatus(fr.ttelab.orgaservice_back.entity.UserStatus.ACTIVE);
          user.setEndLicenseDate(java.time.LocalDate.now().plusYears(1));
          userRepository.save(user);
        }
      }
      case "invoice.payment_failed" -> {
        // marquer licence "past_due" / restreindre accès
      }
      case "customer.subscription.deleted" -> {
        // désactiver licence
      }
      default -> { /* ignore */ }
    }

    return ResponseEntity.ok("ok");
  }

  /**
   * Extrait la Session Stripe de l'événement webhook.
   * Essaie d'abord via getDataObjectDeserializer(), sinon via getData().getObject()
   */
  private Session extractSessionFromEvent(Event event) {
    // Méthode 1 : via le deserializer
    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
    if (deserializer.getObject().isPresent()) {
      StripeObject obj = deserializer.getObject().get();
      if (obj instanceof Session) {
        return (Session) obj;
      }
    }

    // Méthode 2 : directement via getData().getObject()
    StripeObject rawObject = event.getData().getObject();
    if (rawObject instanceof Session) {
      return (Session) rawObject;
    }

    throw new IllegalStateException("Impossible d'extraire la Session de l'événement Stripe");
  }
}

