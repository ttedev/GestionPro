package fr.ttelab.orgaservice_back.repository;

import fr.ttelab.orgaservice_back.entity.SupportMessage;
import fr.ttelab.orgaservice_back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, UUID> {

  List<SupportMessage> findByUserOrderByCreatedAtAsc(User user);

  long countByUserAndFromAdminTrueAndReadByUserFalse(User user);

  long countByUserAndFromAdminFalseAndReadByAdminFalse(User user);

  @Modifying
  @Query("UPDATE SupportMessage m SET m.readByUser = true WHERE m.user = :user AND m.fromAdmin = true")
  void markAllAdminMessagesAsReadByUser(@Param("user") User user);

  @Modifying
  @Query("UPDATE SupportMessage m SET m.readByAdmin = true WHERE m.user = :user AND m.fromAdmin = false")
  void markAllUserMessagesAsReadByAdmin(@Param("user") User user);

  @Query("SELECT DISTINCT m.user.id FROM SupportMessage m WHERE m.fromAdmin = false AND m.readByAdmin = false")
  List<UUID> findUserIdsWithUnreadMessages();
}

