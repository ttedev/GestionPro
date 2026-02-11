package fr.ttelab.orgaservice_back.dto;

import fr.ttelab.orgaservice_back.entity.UserStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class UserDTO {
  private String id;
  private String name;
  private String email;
  private String company;
  private String workStartTime;
  private String workEndTime;
  private UserStatus status;
  private String endLicenseDate;
  private boolean hasActiveSubscription; // true si l'utilisateur a un abonnement mensuel gérable via Stripe
}