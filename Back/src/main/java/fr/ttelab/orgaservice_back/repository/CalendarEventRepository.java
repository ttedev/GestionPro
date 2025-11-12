package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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
}
