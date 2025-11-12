package fr.ttelab.orgaservice_back.util;

import fr.ttelab.orgaservice_back.dto.*;
import fr.ttelab.orgaservice_back.entity.*;

import java.util.stream.Collectors;

public class MappingUtil {

  public static ClientDTO toClientDTO(Client c) {
    ClientDTO dto = new ClientDTO();
    dto.setId(c.getId().toString());
    dto.setName(c.getName());
    dto.setEmail(c.getEmail());
    dto.setPhone(c.getPhone());
    dto.setAddress(c.getAddress());
    dto.setAccess(c.getAccess());
    dto.setHasKey(c.isHasKey());
    dto.setType(c.getType());
    dto.setStatus(c.getStatus());
    dto.setCreatedAt(c.getCreatedAt());
    return dto;
  }

  public static ProjectDTO toProjectDTO(Project p) {
    ProjectDTO dto = new ProjectDTO();
    dto.setId(String.valueOf(p.getId()));
    dto.setClientId(String.valueOf(p.getClient().getId()));
    dto.setClientName(p.getClient().getName());
    dto.setTitle(p.getTitle());
    dto.setDescription(p.getDescription());
    dto.setType(p.getType());
    dto.setDureeMois(p.getDureeMois());
    dto.setPremierMois(p.getPremierMois());
    if (p.getChantiers() != null) {
      dto.setChantiers(p.getChantiers().stream().map(MappingUtil::toChantierDTO).collect(Collectors.toList()));
    }
    if (p.getPlanTravaux() != null) {
      dto.setPlanTravaux(p.getPlanTravaux().stream().map(MappingUtil::toPlanTravauxItemDTO).collect(Collectors.toList()));
    }
    dto.setStatus(p.getStatus());
    dto.setDureeEnMinutes(p.getDureeEnMinutes());

    dto.setCreatedAt(p.getCreatedAt());
    return dto;
  }

  public static ChantierDTO toChantierDTO(Chantier c) {
    ChantierDTO dto = new ChantierDTO();
    dto.setId(String.valueOf(c.getId()));
    dto.setClientId(String.valueOf(c.getClient().getId()));
    dto.setClientName(c.getClient().getName());
    dto.setProjectId(String.valueOf(c.getProject().getId()));
    dto.setProjectName(c.getProject().getTitle());
    dto.setStatus(c.getStatus());
    dto.setDateHeure(c.getDateHeure());
    dto.setCreatedAt(c.getCreatedAt());
    if (c.getDateHeure() != null) dto.setDateHeureEnd(c.getDateHeure().plusMinutes(c.getDureeEnMinutes()));
    dto.setDurationMinutes(c.getDureeEnMinutes());
    return dto;
  }

  public static PlanTravauxItemDTO toPlanTravauxItemDTO(PlanTravauxItem item) {
    PlanTravauxItemDTO dto = new PlanTravauxItemDTO();
    dto.setMois(item.getMois());
    dto.setOccurence(item.getOccurence());
    return dto;
  }

  public static CalendarEventDTO toCalendarEventDTO(CalendarEvent e) {
    CalendarEventDTO dto = new CalendarEventDTO();
    dto.setId(String.valueOf(e.getId()));
    dto.setEventType(e.getEventType());
    dto.setClientId(String.valueOf(e.getClient().getId()));
    dto.setClientName(e.getClient().getName());
    if (e.getProject() != null) dto.setInterventionId(String.valueOf(e.getProject().getId()));
    if (e.getChantier() != null) dto.setChantierId(String.valueOf(e.getChantier().getId()));
    dto.setDayIndex(e.getDayIndex());
    dto.setDate(e.getDateTime() != null ? e.getDateTime().toLocalDate() : null);
    dto.setStartTime(e.getDateTime() != null ? e.getDateTime().toLocalTime() : null);
    dto.setDuration(e.getDuration());
    dto.setTitle(e.getTitle());
    dto.setDescription(e.getDescription());
    dto.setLocation(e.getLocation());
    dto.setStatus(e.getStatus());
    dto.setIsRecurring(e.isRecurring());
    dto.setDaysSinceLastChantier(e.getDaysSinceLastChantier());
    dto.setNotes(e.getNotes());
    dto.setCreatedAt(e.getCreatedAt());
    return dto;
  }

  public static RemarkDTO toRemarkDTO(Remark r) {
    RemarkDTO dto = new RemarkDTO();
    dto.setId(String.valueOf(r.getId()));
    dto.setClientId(String.valueOf(r.getClient().getId()));
    dto.setContent(r.getContent());
    dto.setImages(r.getImages());
    dto.setCreatedAt(r.getCreatedAt());
    dto.setUpdatedAt(r.getUpdatedAt());
    return dto;
  }

  public static CalendarEventDTO toCalendarEventDTO(Chantier chantier) {
    CalendarEventDTO calendarEventDTO = new CalendarEventDTO();
    calendarEventDTO.setId(String.valueOf(chantier.getId()));
    calendarEventDTO.setEventType(fr.ttelab.orgaservice_back.entity.EventType.chantier);
    calendarEventDTO.setClientId(String.valueOf(chantier.getClient().getId()));
    calendarEventDTO.setClientName(chantier.getClient().getName());
    calendarEventDTO.setChantierId(String.valueOf(chantier.getId()));
    calendarEventDTO.setDate(chantier.getDateHeure() != null ? chantier.getDateHeure().toLocalDate() : null);
    calendarEventDTO.setStartTime(chantier.getDateHeure() != null ? chantier.getDateHeure().toLocalTime() : null);
    calendarEventDTO.setDuration(chantier.getDureeEnMinutes());
    calendarEventDTO.setTitle(chantier.getProject().getTitle());
    calendarEventDTO.setDescription(chantier.getProject().getDescription());
    calendarEventDTO.setStatus(chantier.getStatus());
    return calendarEventDTO.computeDayIndex();
  }
}