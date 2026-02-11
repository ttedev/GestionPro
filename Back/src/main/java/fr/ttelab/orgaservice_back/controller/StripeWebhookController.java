package fr.ttelab.orgaservice_back.controller;

import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.UserStatus;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/billing")
public class StripeWebhookController {

  private final UserRepository userRepository;

  @Value("${stripe.webhookSecret}")
  private String webhookSecret;

  StripeWebhookController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @PostMapping("/webhook")
  public ResponseEntity<String> handleWebhook(HttpServletRequest request) throws Exception {

    String payload = request.getReader().lines().collect(Collectors.joining("\n"));
    String sigHeader = request.getHeader("Stripe-Signature");

    Event event;
    try {
      event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    } catch (Exception e) {
      log.error("Invalid Stripe signature", e);
      return ResponseEntity.status(400).body("Invalid signature");
    }

    log.info("Received Stripe event: {}", event.getType());

    switch (event.getType()) {
      case "checkout.session.completed" -> handleCheckoutCompleted(event);
      case "invoice.payment_succeeded" -> handleInvoicePaymentSucceeded(event);
      case "invoice.payment_failed" -> handleInvoicePaymentFailed(event);
      case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
      case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
      default -> log.info("Unhandled event type: {}", event.getType());
    }

    return ResponseEntity.ok("ok");
  }

  /**
   * Gère la fin du checkout (paiement initial réussi)
   */
  private void handleCheckoutCompleted(Event event) {
    Session session = extractSessionFromEvent(event);

    Map<String, String> metadata = session.getMetadata();
    if (metadata == null || !metadata.containsKey("userId")) {
      try {
        Session fullSession = Session.retrieve(session.getId());
        metadata = fullSession.getMetadata();
      } catch (Exception e) {
        log.error("Erreur récupération session Stripe", e);
        return;
      }
    }

    if (metadata == null || !metadata.containsKey("userId")) {
      log.error("userId manquant dans les metadata");
      return;
    }

    UUID userId = UUID.fromString(metadata.get("userId"));
    String priceType = metadata.getOrDefault("priceType", "one_time");

    Optional<User> userOpt = userRepository.findById(userId);
    if (userOpt.isEmpty()) {
      log.error("User not found: {}", userId);
      return;
    }

    User user = userOpt.get();

    // Stocker l'ID client Stripe
    if (session.getCustomer() != null) {
      user.setStripeCustomerId(session.getCustomer());
    }

    // Stocker l'ID subscription si c'est un abonnement
    if (session.getSubscription() != null) {
      user.setStripeSubscriptionId(session.getSubscription());
    }

    // Activer l'utilisateur
    user.setStatus(UserStatus.ACTIVE);

    // Définir la date de fin de licence
    if ("subscription".equals(priceType)) {
      // Abonnement mensuel : licence valide 1 mois (sera renouvelée automatiquement)
      user.setEndLicenseDate(LocalDate.now().plusMonths(1));
    } else {
      // Paiement unique annuel : licence valide 1 an
      user.setEndLicenseDate(LocalDate.now().plusYears(1));
    }

    userRepository.save(user);
    log.info("User {} activated with {} plan until {}", userId, priceType, user.getEndLicenseDate());
  }

  /**
   * Gère le renouvellement réussi d'un abonnement
   */
  private void handleInvoicePaymentSucceeded(Event event) {
    Invoice invoice = extractInvoiceFromEvent(event);

    if (invoice == null || invoice.getSubscription() == null) {
      return; // Pas un paiement d'abonnement
    }

    String subscriptionId = invoice.getSubscription();
    Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

    if (userOpt.isEmpty()) {
      // Essayer de trouver par customer ID
      if (invoice.getCustomer() != null) {
        userOpt = userRepository.findByStripeCustomerId(invoice.getCustomer());
      }
    }

    if (userOpt.isEmpty()) {
      log.warn("User not found for subscription: {}", subscriptionId);
      return;
    }

    User user = userOpt.get();
    user.setStatus(UserStatus.ACTIVE);
    user.setEndLicenseDate(LocalDate.now().plusMonths(1));
    userRepository.save(user);
    log.info("Subscription renewed for user {}", user.getId());
  }

  /**
   * Gère l'échec d'un paiement d'abonnement
   */
  private void handleInvoicePaymentFailed(Event event) {
    Invoice invoice = extractInvoiceFromEvent(event);

    if (invoice == null || invoice.getSubscription() == null) {
      return;
    }

    String subscriptionId = invoice.getSubscription();
    Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

    if (userOpt.isEmpty() && invoice.getCustomer() != null) {
      userOpt = userRepository.findByStripeCustomerId(invoice.getCustomer());
    }

    if (userOpt.isEmpty()) {
      log.warn("User not found for failed payment on subscription: {}", subscriptionId);
      return;
    }

    User user = userOpt.get();
    // On peut choisir de suspendre immédiatement ou attendre plusieurs échecs
    // Ici on met en SUSPENDED pour laisser une chance de régularisation
    user.setStatus(UserStatus.SUSPENDED);
    userRepository.save(user);
    log.warn("Payment failed for user {}, status set to SUSPENDED", user.getId());
  }

  /**
   * Gère la suppression/annulation d'un abonnement
   */
  private void handleSubscriptionDeleted(Event event) {
    Subscription subscription = extractSubscriptionFromEvent(event);

    if (subscription == null) {
      return;
    }

    String subscriptionId = subscription.getId();
    Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

    if (userOpt.isEmpty() && subscription.getCustomer() != null) {
      userOpt = userRepository.findByStripeCustomerId(subscription.getCustomer());
    }

    if (userOpt.isEmpty()) {
      log.warn("User not found for deleted subscription: {}", subscriptionId);
      return;
    }

    User user = userOpt.get();
    user.setStatus(UserStatus.INACTIVE);
    user.setStripeSubscriptionId(null); // Supprimer la référence à l'abonnement
    userRepository.save(user);
    log.info("Subscription cancelled for user {}, status set to INACTIVE", user.getId());
  }

  /**
   * Gère les mises à jour d'abonnement (changement de plan, etc.)
   */
  private void handleSubscriptionUpdated(Event event) {
    Subscription subscription = extractSubscriptionFromEvent(event);

    if (subscription == null) {
      return;
    }

    String subscriptionId = subscription.getId();
    Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

    if (userOpt.isEmpty()) {
      return;
    }

    User user = userOpt.get();

    // Mettre à jour la date de fin de licence basée sur la période actuelle
    if (subscription.getCurrentPeriodEnd() != null) {
      LocalDate endDate = Instant.ofEpochSecond(subscription.getCurrentPeriodEnd())
          .atZone(ZoneId.systemDefault())
          .toLocalDate();
      user.setEndLicenseDate(endDate);
    }

    // Gérer les statuts de l'abonnement
    String status = subscription.getStatus();
    switch (status) {
      case "active" -> user.setStatus(UserStatus.ACTIVE);
      case "past_due" -> user.setStatus(UserStatus.SUSPENDED);
      case "canceled", "unpaid" -> user.setStatus(UserStatus.INACTIVE);
    }

    userRepository.save(user);
    log.info("Subscription updated for user {}, stripe status: {}", user.getId(), status);
  }

  // ==================== Extraction helpers ====================

  private Session extractSessionFromEvent(Event event) {
    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
    if (deserializer.getObject().isPresent()) {
      StripeObject obj = deserializer.getObject().get();
      if (obj instanceof Session) {
        return (Session) obj;
      }
    }

    StripeObject rawObject = event.getData().getObject();
    if (rawObject instanceof Session) {
      return (Session) rawObject;
    }

    throw new IllegalStateException("Impossible d'extraire la Session de l'événement Stripe");
  }

  private Invoice extractInvoiceFromEvent(Event event) {
    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
    if (deserializer.getObject().isPresent()) {
      StripeObject obj = deserializer.getObject().get();
      if (obj instanceof Invoice) {
        return (Invoice) obj;
      }
    }

    StripeObject rawObject = event.getData().getObject();
    if (rawObject instanceof Invoice) {
      return (Invoice) rawObject;
    }

    log.warn("Could not extract Invoice from event");
    return null;
  }

  private Subscription extractSubscriptionFromEvent(Event event) {
    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
    if (deserializer.getObject().isPresent()) {
      StripeObject obj = deserializer.getObject().get();
      if (obj instanceof Subscription) {
        return (Subscription) obj;
      }
    }

    StripeObject rawObject = event.getData().getObject();
    if (rawObject instanceof Subscription) {
      return (Subscription) rawObject;
    }

    log.warn("Could not extract Subscription from event");
    return null;
  }
}

