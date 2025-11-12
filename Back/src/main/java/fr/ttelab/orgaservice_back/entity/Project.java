package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "project")
@Data
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

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

  @Column(nullable = false)
  private String title;

  @Column(length = 2000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProjectType type = ProjectType.ponctuel;

  @Column()
  private Integer dureeMois; // durée en nombre de mois

  @Column()
  private String premierMois; // format "MM/yyyy"

  @Column(nullable = false)
  private Integer dureeEnMinutes; // durée en minutes

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private java.util.List<Chantier> chantiers = new java.util.ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "plan_travaux", joinColumns = @JoinColumn(name = "project_id"))
  private java.util.List<PlanTravauxItem> planTravaux; // seulement si type = recurrent

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProjectStatus status = ProjectStatus.en_attente;

  private java.time.LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = java.time.LocalDateTime.now();
  }





}

