package fr.ttelab.orgaservice_back.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class PlanTravauxItem {
  private String mois; // format "MM/yyyy"
  private Integer occurence;
}
