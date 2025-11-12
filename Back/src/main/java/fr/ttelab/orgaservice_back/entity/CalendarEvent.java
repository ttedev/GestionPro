package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import fr.ttelab.orgaservice_back.entity.EventType;
import fr.ttelab.orgaservice_back.entity.EventStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_event")
@Data
public class CalendarEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EventType eventType; // chantier | rdv | prospection | autre

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Client client;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chantier_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Chantier chantier; // nullable

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Project project; // nullable, only if eventType == chantier

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private User owner;

  private Integer dayIndex; // 0-6 derived from date
  private LocalDateTime dateTime; // null si non programmé
  private Integer duration; // minutes

  @Column(nullable = false)
  private String title;

  @Column(length = 2000)
  private String description;
  private String location;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EventStatus status = EventStatus.proposed; // proposed | confirmed | in-progress | completed | cancelled

  private boolean isRecurring = false;
  private Integer daysSinceLastChantier; // calculé pour chantier récurrent
  @Column(length = 2000)
  private String notes;

  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if(dateTime != null) {
      dayIndex = dateTime.getDayOfWeek().getValue() % 7; // Sunday=7 -> 0
      if(dayIndex == 0) dayIndex = 0; // explicit
    }
  }
}
