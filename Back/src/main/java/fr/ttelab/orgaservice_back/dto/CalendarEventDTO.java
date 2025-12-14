package fr.ttelab.orgaservice_back.dto;

import fr.ttelab.orgaservice_back.entity.EventStatus;
import fr.ttelab.orgaservice_back.entity.EventType;
import jakarta.persistence.PrePersist;
import lombok.Data;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CalendarEventDTO {
  private String id;
  private EventType eventType;
  private String clientId;
  private String clientName;
  private String interventionId;
  private String chantierId;
  private Integer dayIndex;
  private LocalDate date;
  private LocalTime startTime;
  private Integer duration; // minutes
  private String title;
  private String description;
  private String location;
  private EventStatus status;
  private Boolean isRecurring;
  private Integer daysSinceLastChantier;
  private String notes;
  private LocalDateTime createdAt;


  public CalendarEventDTO computeDayIndex() {
    createdAt = LocalDateTime.now();
    if(date != null) {
      dayIndex = date.getDayOfWeek().getValue() -1;
    }
    return this;
  }
}
