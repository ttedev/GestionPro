package fr.ttelab.orgaservice_back.controller;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin("*")
public class BillingController {

  private UserRepository userRepository;

    BillingController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

  @Value("${app.frontendUrl}")
  private String frontendUrl;

  @PostMapping("/checkout-session")
  public ResponseEntity<?> createCheckoutSession() throws Exception {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
    String userName = authentication.getName();

    User user = userRepository.findByUsername(userName).orElse(null);;

    if (user == null) {
      return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    SessionCreateParams params =
        SessionCreateParams.builder()
                           .setMode(SessionCreateParams.Mode.PAYMENT)
                           .setAllowPromotionCodes(true)
                           .setSuccessUrl(frontendUrl + "/login")
                           .setCancelUrl(frontendUrl )
                           .addLineItem(
                               SessionCreateParams.LineItem.builder()
                                                           .setPrice("price_1SyvVnAh24kSM5FuCXSHURS6")
                                                           .setQuantity(1L)
                                                           .build()
                           )
                           // très utile pour relier Stripe à ton user interne
                           .putMetadata("userId", String.valueOf(user.getId()))
                           .build();

    Session session = Session.create(params);
    return ResponseEntity.ok(new BilingResponse(session.getUrl()));
  }

  public record BilingResponse(String url) {}
}

