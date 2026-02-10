package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChantierRepository extends JpaRepository<Chantier, UUID> {

  List<Chantier> findByOwnerAndClient_Id(User owner, UUID clientId);

  List<Chantier> findByOwnerAndProject_Id(User owner, UUID projectId);

  List<Chantier> findByOwner(User owner);

  @Query("select c from Chantier c where c.owner = :owner " +
      "and (c.calendarEvent is null or c.calendarEvent.status = 'unscheduled') ")
  List<Chantier> findByOwnerUnsechduled(@Param("owner") User owner);

  @Query("select c from Chantier c left join c.calendarEvent e where c.owner = :owner " +
      "and e is not null " +
      "and (:startDate is null or e.dateTime >= :startDate) " +
      "and (:endDate is null or e.dateTime <= :endDate)")
  List<Chantier> findFiltered(@Param("owner") User owner,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

}

