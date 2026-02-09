package fr.ttelab.orgaservice_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {


@Value("${stripe.secretKey}")
private String stripeSecretKey;

@PostConstruct
public void init() {
  com.stripe.Stripe.apiKey = stripeSecretKey;
}
}
