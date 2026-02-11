package fr.ttelab.orgaservice_back.controller;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin("*")
public class BillingController {

  // Price IDs Stripe
  private static final String PRICE_MONTHLY_SUBSCRIPTION = "price_1SziNbAh24kSM5FuFuslFFVy"; // 10€/mois
  private static final String PRICE_YEARLY_ONE_TIME = "price_1SziNpAh24kSM5FuJ1ok6nrt"; // 100€ one-shot

  private UserRepository userRepository;

  BillingController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Value("${app.frontendUrl}")
  private String frontendUrl;

  @Data
  public static class CheckoutRequest {
    private String priceId;
  }

  @PostMapping("/checkout-session")
  public ResponseEntity<?> createCheckoutSession(@RequestBody CheckoutRequest request) throws Exception {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
    String userName = authentication.getName();

    User user = userRepository.findByUsername(userName).orElse(null);

    if (user == null) {
      return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    String priceId = request.getPriceId();

    // Valider le priceId
    if (priceId == null || (!priceId.equals(PRICE_MONTHLY_SUBSCRIPTION) && !priceId.equals(PRICE_YEARLY_ONE_TIME))) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid priceId"));
    }

    // Déterminer le mode en fonction du prix
    boolean isSubscription = priceId.equals(PRICE_MONTHLY_SUBSCRIPTION);
    SessionCreateParams.Mode mode = isSubscription
        ? SessionCreateParams.Mode.SUBSCRIPTION
        : SessionCreateParams.Mode.PAYMENT;

    SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
        .setMode(mode)
        .setAllowPromotionCodes(true)
        .setSuccessUrl(frontendUrl + "/login")
        .setCancelUrl(frontendUrl + "/subscription")
        .addLineItem(
            SessionCreateParams.LineItem.builder()
                .setPrice(priceId)
                .setQuantity(1L)
                .build()
        )
        .putMetadata("userId", String.valueOf(user.getId()))
        .putMetadata("priceType", isSubscription ? "subscription" : "one_time");

    // Pour les abonnements, on peut créer/réutiliser le customer Stripe
    if (user.getStripeCustomerId() != null) {
      paramsBuilder.setCustomer(user.getStripeCustomerId());
    } else {
      paramsBuilder.setCustomerEmail(user.getEmail());
    }

    Session session = Session.create(paramsBuilder.build());
    return ResponseEntity.ok(new BillingResponse(session.getUrl()));
  }

  /**
   * Crée une session de portail client Stripe pour gérer l'abonnement.
   * Permet au client de :
   * - Voir ses factures
   * - Mettre à jour sa carte bancaire
   * - Résilier son abonnement
   */
  @PostMapping("/customer-portal")
  public ResponseEntity<?> createCustomerPortalSession() throws Exception {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
    String userName = authentication.getName();

    User user = userRepository.findByUsername(userName).orElse(null);

    if (user == null) {
      return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    // Vérifier que l'utilisateur a un ID client Stripe
    if (user.getStripeCustomerId() == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "No Stripe customer found for this user"));
    }

    // Créer une session de portail client
    com.stripe.param.billingportal.SessionCreateParams params =
        com.stripe.param.billingportal.SessionCreateParams.builder()
            .setCustomer(user.getStripeCustomerId())
            .setReturnUrl(frontendUrl + "/profile")
            .build();

    com.stripe.model.billingportal.Session portalSession =
        com.stripe.model.billingportal.Session.create(params);

    return ResponseEntity.ok(new BillingResponse(portalSession.getUrl()));
  }

  public record BillingResponse(String url) {}
}

