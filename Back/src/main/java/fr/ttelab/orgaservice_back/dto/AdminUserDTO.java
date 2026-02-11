package fr.ttelab.orgaservice_back.dto;

import fr.ttelab.orgaservice_back.entity.UserStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AdminUserDTO {
  private String id;
  private String username;
  private String email;
  private String firstName;
  private String lastName;
  private String company;
  private UserStatus status;
  private LocalDate endLicenseDate;
  private LocalDateTime createdAt;
  private String stripeCustomerId;
  private String stripeSubscriptionId;
  private boolean hasActiveSubscription;
}

