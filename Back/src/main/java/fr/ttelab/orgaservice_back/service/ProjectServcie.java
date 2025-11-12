package fr.ttelab.orgaservice_back.service;

import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.ChantierRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ProjectServcie {

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private ChantierRepository chantierRepository;

  public void genereateChantierForProject(Project project){
    if (project.getType() != ProjectType.recurrent) {
      generateSingleChantier(project);
    } else {
      generateRecurrentChantiers(project);
    }
  }

  private void generateSingleChantier(Project project) {
    Chantier chantier = new Chantier();
    chantier.setProject(project);
    chantier.setClient(project.getClient());
    chantier.setMonthTarget(project.getPremierMois());
    chantier.setOwner(project.getOwner());
    chantier.setDureeEnMinutes(project.getDureeEnMinutes());
    chantier.setStatus(EventStatus.unscheduled);
    project.getChantiers().add(chantier);
  }

  private void generateRecurrentChantiers(Project project) {
    for (PlanTravauxItem item : project.getPlanTravaux()) {
      java.time.YearMonth ymOfItem = java.time.YearMonth.parse(item.getMois(), java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
      for (int j = 0; j < item.getOccurence(); j++) {
        Chantier chantier = new Chantier();
        chantier.setProject(project);
        chantier.setClient(project.getClient());
        chantier.setMonthTarget(item.getMois());
        chantier.setDateHeure(
          LocalDateTime.of(ymOfItem.getYear(), ymOfItem.getMonth(), 1, 8, 0)
            .plusDays((long) ymOfItem.getMonth().length(ymOfItem.isLeapYear()) * j / item.getOccurence())
        );
        chantier.setOwner(project.getOwner());
        chantier.setDureeEnMinutes(project.getDureeEnMinutes());
        chantier.setStatus(EventStatus.proposed);
        project.getChantiers().add(chantier);
      }
    }
  }
}
