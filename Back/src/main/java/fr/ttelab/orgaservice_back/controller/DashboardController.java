package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.DashboardStatsDTO;
import fr.ttelab.orgaservice_back.entity.EventStatus;
import fr.ttelab.orgaservice_back.entity.EventType;
import fr.ttelab.orgaservice_back.repository.CalendarEventRepository;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ACTIVE')")
public class DashboardController {
  private final ClientRepository clientRepository;
  private final ProjectRepository projectRepository;
  private final CalendarEventRepository eventRepository;
  private final SecurityUtil securityUtil;

  @GetMapping("/stats")
  public DashboardStatsDTO stats(){
    var owner = securityUtil.getCurrentUser();
    DashboardStatsDTO dto = new DashboardStatsDTO();
    dto.setTotalClients(clientRepository.findByOwnerAndSearch(owner, null).stream().count());
    dto.setActiveProjects(projectRepository.findByOwner(owner).stream().filter(p -> p.getStatus().name().equals("en_cours")).count());
    dto.setPendingAppointments(eventRepository.findFiltered(owner, EventType.chantier, LocalDateTime.now(), LocalDateTime.now().plusDays(30)).stream().filter(e -> e.getStatus()==EventStatus.proposed).count());
    dto.setCompletedThisMonth(eventRepository.findFiltered(owner, null, LocalDateTime.now().withDayOfMonth(1), LocalDateTime.now()).stream().filter(e -> e.getStatus()==EventStatus.completed).count());
    dto.setUpcomingAppointments(eventRepository.findFiltered(owner, null, LocalDateTime.now(), LocalDateTime.now().plusDays(7)).stream().limit(5).map(e -> {
      DashboardStatsDTO.UpcomingAppointmentDTO u = new DashboardStatsDTO.UpcomingAppointmentDTO();
      u.setId(String.valueOf(e.getId()));
      u.setClientName(e.getClient().getName());
      u.setClientPhone(e.getClient().getPhone());
      u.setClientAddress(e.getClient().getAddress());
      u.setClientAccess(e.getClient().getAccess());
      u.setClientHasKey(e.getClient().isHasKey());
      u.setType(e.getEventType().name());

      return u;
    }).toList());
    dto.setRecentActivities(List.of()); // stub
    return dto;
  }
}
