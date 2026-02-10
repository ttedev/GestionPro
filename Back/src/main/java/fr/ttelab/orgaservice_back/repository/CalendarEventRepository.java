package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

  @Query("select e from CalendarEvent e where e.owner = :owner " +
      "and (:eventType is null or e.eventType = :eventType) " +
      "and (:startDate is null or e.dateTime >= :startDate) " +
      "and (:endDate is null or e.dateTime <= :endDate)")
  List<CalendarEvent> findFiltered(@Param("owner") User owner,
                                   @Param("eventType") EventType eventType,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

  List<CalendarEvent> findByOwnerAndChantier_IdOrderByDateTimeDesc(User owner, UUID chantierId);

  // Tous les événements non programmés (dateTime is null ou status = unscheduled)
  @Query("select e from CalendarEvent e where e.owner = :owner " +
      "and (e.dateTime is null or e.status = 'unscheduled')")
  List<CalendarEvent> findByOwnerUnscheduled(@Param("owner") User owner);

  // Tous les événements de type chantier dans une plage de dates
  @Query("select e from CalendarEvent e where e.owner = :owner " +
      "and e.eventType = 'chantier' " +
      "and e.dateTime is not null " +
      "and (:startDate is null or e.dateTime >= :startDate) " +
      "and (:endDate is null or e.dateTime <= :endDate)")
  List<CalendarEvent> findChantierEventsFiltered(@Param("owner") User owner,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);

  // Trouver un événement par son ID et owner (pour sécurité)
  @Query("select e from CalendarEvent e where e.id = :id and e.owner = :owner")
  CalendarEvent findByIdAndOwner(@Param("id") UUID id, @Param("owner") User owner);
}
