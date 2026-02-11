package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.CalendarEventDTO;
import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.CalendarEventRepository;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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

    // Récupérer tous les événements (chantiers et autres) via CalendarEventRepository
    List<CalendarEvent> events = eventRepository.findFiltered(owner, eventType,
        startDate != null ? startDate.atStartOfDay() : null,
        endDate != null ? endDate.atTime(23, 59) : null);

    return events.stream().map(MappingUtil::toCalendarEventDTO).toList();
  }

  @GetMapping("listUnscheduledEvents")
  public List<CalendarEventDTO> listUnscheduledEvents(){
    var owner = securityUtil.getCurrentUser();
    return eventRepository.findByOwnerUnscheduled(owner).stream()
        .map(MappingUtil::toCalendarEventDTO).toList();
  }

  @PostMapping
  @Transactional
  public ResponseEntity<?> create(@RequestBody CalendarEventCreateRequest req){
    var owner = securityUtil.getCurrentUser();

    // Validation: le type chantier n'est pas autorisé ici (les chantiers sont créés via les projets)
    if (req.getEventType() == EventType.chantier) {
      return ResponseEntity.badRequest().body(error("Les chantiers doivent être créés via les projets"));
    }

    CalendarEvent event = new CalendarEvent();
    event.setOwner(owner);
    event.setEventType(req.getEventType() != null ? req.getEventType() : EventType.rdv);
    event.setTitle(req.getTitle());
    event.setDescription(req.getDescription());
    event.setLocation(req.getLocation());
    event.setDuration(req.getDuration() != null ? req.getDuration() : 60);
    event.setNotes(req.getNotes());
    event.setStatus(req.getStatus() != null ? req.getStatus() : EventStatus.proposed);

    // Client optionnel
    if (req.getClientId() != null && !req.getClientId().isEmpty()) {
      Client client = clientRepository.findById(UUID.fromString(req.getClientId())).orElse(null);
      if (client != null && client.getOwner().getId().equals(owner.getId())) {
        event.setClient(client);
      }
    }

    // Date et heure optionnelles
    if (req.getDate() != null && req.getStartTime() != null) {
      event.setDateTime(req.getDate().atTime(
          Integer.parseInt(req.getStartTime().split(":")[0]),
          Integer.parseInt(req.getStartTime().split(":")[1])));
      event.setStatus(EventStatus.confirmed);
    } else {
      event.setStatus(EventStatus.unscheduled);
    }

    eventRepository.save(event);
    log.info("Created new event: {} for owner {}", event.getTitle(), owner.getId());
    return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
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

    // Récupérer l'événement par son ID
    CalendarEvent event = eventRepository.findByIdAndOwner(UUID.fromString(req.getId()), owner);
    if (event == null) {
      return ResponseEntity.status(404).body(error("Event not found"));
    }

    // Mettre à jour les champs
    if (req.getDate() != null && req.getStartTime() != null) {
      event.setDateTime(req.getDate().atTime(
          Integer.parseInt(req.getStartTime().split(":")[0]),
          Integer.parseInt(req.getStartTime().split(":")[1])));
    }
    if (req.getDuration() != null) event.setDuration(req.getDuration());
    if (req.getStatus() != null) event.setStatus(req.getStatus());
    if (req.getLocation() != null) event.setLocation(req.getLocation());
    if (req.getTitle() != null) event.setTitle(req.getTitle());
    if (req.getDescription() != null) event.setDescription(req.getDescription());

    eventRepository.save(event);
    return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
  }

  @PatchMapping("/{id}/confirm")
  @Transactional
  public ResponseEntity<?> confirmEvent(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    CalendarEvent event = eventRepository.findByIdAndOwner(UUID.fromString(id), owner);

    if (event == null) {
      return ResponseEntity.status(404).body(error("Event not found"));
    }

    event.setStatus(EventStatus.confirmed);
    eventRepository.save(event);
    return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
  }

  @Data
  public static class UpdateStatusRequest {
    private EventStatus status;
  }

  @PatchMapping("/{id}/status")
  @Transactional
  public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody UpdateStatusRequest req){
    var owner = securityUtil.getCurrentUser();
    CalendarEvent event = eventRepository.findByIdAndOwner(UUID.fromString(id), owner);

    if (event == null) {
      return ResponseEntity.status(404).body(error("Event not found"));
    }

    if (req.getStatus() == EventStatus.unscheduled) {
      event.setDateTime(null);
    }
    event.setStatus(req.getStatus());

    log.info("Updating event {} status to {}", event.getId(), req.getStatus());
    eventRepository.save(event);
    return ResponseEntity.ok(MappingUtil.toCalendarEventDTO(event));
  }

  private static record ErrorResponse(String error, String details) {}
  private ErrorResponse error(String details){
    return new ErrorResponse("Invalid request", details);
  }
}
