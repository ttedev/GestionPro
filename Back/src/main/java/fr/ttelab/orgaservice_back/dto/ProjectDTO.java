package fr.ttelab.orgaservice_back.dto;

import fr.ttelab.orgaservice_back.entity.ProjectStatus;
import fr.ttelab.orgaservice_back.entity.ProjectType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectDTO {
  private String id;
  private String clientId;
  private String clientName;
  private String title;
  private String description;
  private ProjectType type;
  private Integer dureeMois;
  private String premierMois;
  private List<ChantierDTO> chantiers;
  private Integer dureeEnMinutes;
  private List<PlanTravauxItemDTO> planTravaux;
  private ProjectStatus status;
  private LocalDateTime createdAt;
}

