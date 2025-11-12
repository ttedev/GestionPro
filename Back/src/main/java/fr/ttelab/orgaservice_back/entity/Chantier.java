package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chantier")
@Data
public class Chantier {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Project project;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Client client;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private User owner;

  private String monthTarget; // format "MM/yyyy"


  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EventStatus status = EventStatus.proposed;

  private LocalDateTime dateHeure;

  @Column(nullable = false)
  private Integer dureeEnMinutes; // durée en minutes

  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}

