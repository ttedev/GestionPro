package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.Remark;
import fr.ttelab.orgaservice_back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RemarkRepository extends JpaRepository<Remark, UUID> {
  List<Remark> findByClient_IdAndOwner_Id(UUID clientId, UUID owner);
}
