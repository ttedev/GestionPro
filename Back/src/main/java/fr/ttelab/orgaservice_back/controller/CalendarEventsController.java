package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.CalendarEventDTO;
import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.CalendarEventRepository;
import fr.ttelab.orgaservice_back.repository.ChantierRepository;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/calendar/events")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ACTIVE')")
public class CalendarEventsController {
  private final CalendarEventRepository eventRepository;
  private final ClientRepository clientRepository;
  private final ProjectRepository projectRepository;
  private final ChantierRepository chantierRepository;
  private final SecurityUtil securityUtil;

  @GetMapping
  public List<CalendarEventDTO> list(@RequestParam(required = false) Integer weekOffset,
                                     @RequestParam(required = false) LocalDate startDate,
                                     @RequestParam(required = false) LocalDate endDate,
                                     @RequestParam(required = false) EventType eventType){
    var owner = securityUtil.getCurrentUser();
    // compute start/end if weekOffset provided
    if(weekOffset!=null){
      LocalDate base = LocalDate.now().plusWeeks(weekOffset);
      startDate = base.with(java.time.DayOfWeek.MONDAY);
      endDate = startDate.plusDays(6);
    }
    List<CalendarEventDTO> eventDTOList = new ArrayList<>();

    eventDTOList.addAll(chantierRepository.findFiltered(owner,startDate.atStartOfDay(),endDate.atTime(23,59)).stream().map(MappingUtil::toCalendarEventDTO).toList());
    eventDTOList.addAll(eventRepository.findFiltered(owner, eventType, startDate.atStartOfDay(), endDate.atTime(23,59)).stream().map(MappingUtil::toCalendarEventDTO).toList());
    return eventDTOList;
  }
  @GetMapping("listUnscheduledEvents")
    public List<CalendarEventDTO> listUnscheduledEvents(){
        var owner = securityUtil.getCurrentUser();
        return chantierRepository.findByOwnerUnsechduled(owner).stream().map(MappingUtil::toCalendarEventDTO).toList();
    }


  @Data
  public static class CalendarEventCreateRequest {
    private EventType eventType;
    private String clientId;
    private String interventionId;
    private String chantierId;
    private LocalDate date;
    private String startTime; // HH:MM
    private Integer duration;
    private String title;
    private String description;
    private String location;
    private EventStatus status;
    private String notes;
  }


  @Data
  public static class CalendarEventUpdateRequest {
    private String id;
    private EventType eventType;
    private LocalDate date;
    private String startTime;
    private Integer duration;
    private String title;
    private String description;
    private String location;
    private EventStatus status;
  }

  @PutMapping("updateEvent")
  @Transactional
  public ResponseEntity<?> update(@RequestBody CalendarEventUpdateRequest req){
    var owner = securityUtil.getCurrentUser();

    switch (req.getEventType()){
      case EventType.chantier -> {
        Chantier chantier = chantierRepository.findById(UUID.fromString(req.getId())).orElse(null);
        if (chantier != null && chantier.getOwner().getId().equals(owner.getId())) {
          chantier.setDateHeure(req.getDate() !=null? req.getDate().atTime(Integer.valueOf(req.startTime.split(":")[0]),Integer.valueOf(req.startTime.split(":")[1])):chantier.getDateHeure());
          chantier.setDureeEnMinutes(req.getDuration() !=null? req.getDuration():chantier.getDureeEnMinutes());
          chantier.setStatus(req.getStatus() !=null? req.getStatus():chantier.getStatus());
          chantierRepository.save(chantier);
          return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(chantier));
        }
        return ResponseEntity.status(403).body(error("Cannot update chantier event via this endpoint"));
      }
      case  EventType.rdv-> {
        CalendarEvent event =  eventRepository.findById(UUID.fromString(req.getId())).orElse(null);
        if (event != null || event.getOwner().getId().equals(owner.getId())) {
          event.setDateTime(req.getDate()!=null && req.getStartTime()!=null?req.getDate().atTime(LocalTime.parse(req.getStartTime())):event.getDateTime());;
          event.setDuration(req.getDuration()!=null?req.getDuration():event.getDuration());
          event.setTitle(req.getTitle()!=null?req.getTitle():event.getTitle());
          event.setDescription(req.getDescription()!=null?req.getDescription():event.getDescription());
          event.setLocation(req.getLocation()!=null?req.getLocation():event.getLocation());
          event.setStatus(req.getStatus()!=null?req.getStatus():event.getStatus());
          eventRepository.save(event);
          return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
        }

        return ResponseEntity.status(403).body(error("Cannot update this event"));

      }
      default -> {
        return ResponseEntity.badRequest().body(error("Unsupported event type"));
      }
    }

  }

  @PatchMapping("/{id}/confirm")
  public ResponseEntity<?> confirmEvent(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    CalendarEvent event = eventRepository.findById(UUID.fromString(id)).orElse(null);
    Chantier chantier = chantierRepository.findById(UUID.fromString(id)).orElse(null);
    if(chantier!=null && chantier.getOwner().getId().equals(owner.getId())){
      chantier.setStatus(EventStatus.confirmed);
      chantierRepository.save(chantier);
      return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(chantier));
    }else  if(event!=null && event.getOwner().getId().equals(owner.getId())){
      event.setStatus(EventStatus.confirmed);
      eventRepository.save(event);
      return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
    }
    return ResponseEntity.status(403).body(error("Cannot confirm this event"));
  }

  @Data
  public static class UpdateStatusRequest {
    private EventStatus status;
  }
  @PatchMapping("/{id}/status")
  public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody UpdateStatusRequest req){
    var owner = securityUtil.getCurrentUser();
    CalendarEvent event = eventRepository.findById(UUID.fromString(id)).orElse(null);
    Chantier chantier = chantierRepository.findById(UUID.fromString(id)).orElse(null);
    if(chantier!=null && chantier.getOwner().getId().equals(owner.getId())){
      chantier.setStatus(req.getStatus());
      log.info("Updating chantier {} status to {}", chantier.getId(), req.getStatus());
      chantierRepository.save(chantier);
      return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(chantier));
    }else  if(event!=null && event.getOwner().getId().equals(owner.getId())){
      event.setStatus(req.getStatus());
      eventRepository.save(event);
      return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
    }
    return ResponseEntity.status(403).body(error("Cannot confirm this event"));
  }

  private static record ErrorResponse(String error, String details) {}
  private ErrorResponse error(String details){
    return new ErrorResponse("Invalid request", details);
  }
}
