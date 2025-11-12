package fr.ttelab.orgaservice_back.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DashboardStatsDTO {
  private Long totalClients;
  private Long activeProjects;
  private Long pendingAppointments;
  private Long completedThisMonth;
  private List<UpcomingAppointmentDTO> upcomingAppointments;
  private List<RecentActivityDTO> recentActivities;

  @Data
  public static class UpcomingAppointmentDTO {
    private String id;
    private String clientName;
    private String clientPhone;
    private String clientAddress;
    private String clientAccess;
    private Boolean clientHasKey;
    private String type;
    private LocalDateTime date; // combine date + time for simplicity
    private String time; // hh:mm
  }

  @Data
  public static class RecentActivityDTO {
    private String id;
    private String type; // client_added | project_created | appointment_confirmed
    private String description;
    private LocalDateTime timestamp;
  }
}
