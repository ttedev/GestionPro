package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.Project;
import fr.ttelab.orgaservice_back.entity.ProjectStatus;
import fr.ttelab.orgaservice_back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
  List<Project> findByOwner(User owner);
  List<Project> findByOwnerAndStatus(User owner, ProjectStatus status);
  List<Project> findByOwnerAndClient_Id(User owner, UUID clientId);
  List<Project> findByOwnerAndClient_IdAndStatus(User owner, UUID clientId, ProjectStatus status);
}
