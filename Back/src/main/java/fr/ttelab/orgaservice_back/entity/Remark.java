package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "remark")
@Data
public class Remark {

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

  @Column(length = 4000)
  private String content; // peut être vide si images fournies

  @ElementCollection
  @CollectionTable(name = "remark_images", joinColumns = @JoinColumn(name = "remark_id"))
  @Column(name = "image_ref", length = 10024000)
  private List<String> images; // base64 ou URL

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = createdAt;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
