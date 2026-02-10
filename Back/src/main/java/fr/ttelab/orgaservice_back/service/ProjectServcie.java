package fr.ttelab.orgaservice_back.service;

import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.CalendarEventRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ProjectServcie {

  private final ProjectRepository projectRepository;
  private final CalendarEventRepository calendarEventRepository;
  private final SchedulingService schedulingService;

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

    // Calculer la date proposée si un mois cible est défini
    LocalDateTime proposedDateTime = null;
    EventStatus status = EventStatus.unscheduled;

    if (project.getPremierMois() != null) {
      YearMonth yearMonth = YearMonth.parse(project.getPremierMois(), DateTimeFormatter.ofPattern("yyyy-MM"));
      proposedDateTime = schedulingService.calculateProposedDateTime(
          project.getOwner(), yearMonth, project.getDureeEnMinutes(), 0, 1);
      if (proposedDateTime != null) {
        status = EventStatus.proposed;
      }
    }

    // Créer le CalendarEvent associé
    CalendarEvent calendarEvent = createCalendarEventForChantier(chantier, proposedDateTime, status);
    chantier.setCalendarEvent(calendarEvent);

    project.getChantiers().add(chantier);
  }

  private void generateRecurrentChantiers(Project project) {
    for (PlanTravauxItem item : project.getPlanTravaux()) {
      YearMonth ymOfItem = YearMonth.parse(item.getMois(), DateTimeFormatter.ofPattern("yyyy-MM"));
      int totalInMonth = item.getOccurence();

      for (int j = 0; j < totalInMonth; j++) {
        Chantier chantier = new Chantier();
        chantier.setProject(project);
        chantier.setClient(project.getClient());
        chantier.setMonthTarget(item.getMois());
        chantier.setOwner(project.getOwner());
        chantier.setDureeEnMinutes(project.getDureeEnMinutes());

        // Calculer la date proposée avec le SchedulingService
        LocalDateTime proposedDateTime = schedulingService.calculateProposedDateTime(
            project.getOwner(), ymOfItem, project.getDureeEnMinutes(), j, totalInMonth);

        EventStatus status = (proposedDateTime != null) ? EventStatus.proposed : EventStatus.unscheduled;

        // Créer le CalendarEvent associé
        CalendarEvent calendarEvent = createCalendarEventForChantier(chantier, proposedDateTime, status);
        chantier.setCalendarEvent(calendarEvent);

        project.getChantiers().add(chantier);
      }
    }
  }

  private CalendarEvent createCalendarEventForChantier(Chantier chantier, LocalDateTime dateTime, EventStatus status) {
    CalendarEvent event = new CalendarEvent();
    event.setEventType(EventType.chantier);
    event.setChantier(chantier);
    event.setProject(chantier.getProject());
    event.setClient(chantier.getClient());
    event.setOwner(chantier.getOwner());
    event.setDateTime(dateTime);
    event.setDuration(chantier.getDureeEnMinutes());
    event.setTitle(chantier.getProject().getTitle());
    event.setDescription(chantier.getProject().getDescription());
    event.setStatus(status);
    event.setRecurring(chantier.getProject().getType() == ProjectType.recurrent);
    return event;
  }
}
