package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;


@Entity
@Table(name = "app_user")
@Data
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(nullable = false)
  private String email;

  private String password;

  private String firstName;

  private String lastName;

  private LocalTime workStartTime = LocalTime.of(7,0);

  private LocalTime workEndTime = LocalTime.of(20,0);

  // Jours travaillés - par défaut du lundi au vendredi
  @ElementCollection(fetch = FetchType.EAGER)
  @Enumerated(EnumType.STRING)
  @CollectionTable(name = "user_work_days", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "work_day")
  private Set<WorkDay> workDays = EnumSet.of(
      WorkDay.MONDAY,
      WorkDay.TUESDAY,
      WorkDay.WEDNESDAY,
      WorkDay.THURSDAY,
      WorkDay.FRIDAY
  );

  private String company;

  private LocalDateTime createdAt;

  private LocalDate endLicenseDate;

  // Stripe integration
  private String stripeCustomerId;
  private String stripeSubscriptionId;

  @Enumerated(EnumType.STRING)
    @Column(nullable = false)
  private  UserStatus status = UserStatus.PENDING;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}