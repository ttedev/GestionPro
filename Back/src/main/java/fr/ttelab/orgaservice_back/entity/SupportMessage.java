package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "support_message")
@Data
public class SupportMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private User user; // L'utilisateur concerné par la conversation

  @Column(nullable = false, length = 2000)
  private String content;

  @Column(nullable = false)
  private boolean fromAdmin; // true si le message vient de l'admin, false si de l'utilisateur

  @Column(nullable = false)
  private boolean readByUser = false; // true si l'utilisateur a lu le message de l'admin

  @Column(nullable = false)
  private boolean readByAdmin = false; // true si l'admin a lu le message de l'utilisateur

  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}

