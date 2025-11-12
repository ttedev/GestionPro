package fr.ttelab.orgaservice_back.dto;


import fr.ttelab.orgaservice_back.entity.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChantierDTO {
  private String id;
  private String clientId;
  private String clientName;
  private String projectId;
  private String projectName;
  private EventStatus status;
  private LocalDateTime dateHeure;
  private LocalDateTime dateHeureEnd;
  private LocalDateTime createdAt;
  private Integer durationMinutes;
}

