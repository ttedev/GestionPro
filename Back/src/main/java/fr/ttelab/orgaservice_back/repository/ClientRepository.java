package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.Client;
import fr.ttelab.orgaservice_back.entity.ClientStatus;
import fr.ttelab.orgaservice_back.entity.ClientType;
import fr.ttelab.orgaservice_back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

  @Query("select c from Client c where c.owner = :owner and (:search is null or lower(c.name) like lower(concat('%', :search, '%')))")
  List<Client> findByOwnerAndSearch(@Param("owner") User owner, @Param("search") String search);

  List<Client> findByOwnerAndStatus(User owner, ClientStatus status);
  List<Client> findByOwnerAndType(User owner, ClientType type);
}
