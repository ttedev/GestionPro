package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import fr.ttelab.orgaservice_back.entity.ClientType;
import fr.ttelab.orgaservice_back.entity.ClientStatus;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "client")
@Data
public class Client {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String name;

  private String email;
  private String phone;


  @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @OrderBy("order ASC")
  private List<Adress> addresses = new ArrayList<>();


  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ClientType type; // particulier | professionnel

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ClientStatus status = ClientStatus.actif; // actif | inactif

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private User owner; // multi-tenant isolation

  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }

  @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Project> projects;


  @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Remark> remarks;
}
