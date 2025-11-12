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

  @Query("select e from Chantier e where e.owner = :owner " +
      "and (e.dateHeure is null ) ")
  List<Chantier> findByOwnerUnsechduled(User owner);

  @Query("select e from Chantier e where e.owner = :owner " +
      "and (:startDate is null or e.dateHeure >= :startDate) " +
      "and (:endDate is null or e.dateHeure <= :endDate)")
  List<Chantier> findFiltered(@Param("owner") User owner,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

}

