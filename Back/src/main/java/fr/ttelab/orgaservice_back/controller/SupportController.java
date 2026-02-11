package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.SupportMessageDTO;
import fr.ttelab.orgaservice_back.entity.SupportMessage;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.UserStatus;
import fr.ttelab.orgaservice_back.repository.SupportMessageRepository;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/support")
@CrossOrigin("*")
@RequiredArgsConstructor
public class SupportController {

  private final SupportMessageRepository messageRepository;
  private final UserRepository userRepository;
  private final SecurityUtil securityUtil;

  // ==================== Endpoints pour les utilisateurs ====================

  /**
   * Récupérer tous les messages de la conversation de l'utilisateur connecté
   */
  @GetMapping("/messages")
  public List<SupportMessageDTO> getMyMessages() {
    User user = securityUtil.getCurrentUser();
    return messageRepository.findByUserOrderByCreatedAtAsc(user).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  /**
   * Envoyer un message au support
   */
  @PostMapping("/messages")
  @Transactional
  public ResponseEntity<?> sendMessage(@RequestBody SendMessageRequest request) {
    User user = securityUtil.getCurrentUser();

    if (request.getContent() == null || request.getContent().trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Le message ne peut pas être vide"));
    }

    SupportMessage message = new SupportMessage();
    message.setUser(user);
    message.setContent(request.getContent().trim());
    message.setFromAdmin(false);
    message.setReadByUser(true); // L'utilisateur a lu son propre message
    message.setReadByAdmin(false);

    messageRepository.save(message);
    log.info("User {} sent support message", user.getId());

    return ResponseEntity.ok(toDTO(message));
  }

  /**
   * Marquer les messages de l'admin comme lus
   */
  @PostMapping("/messages/mark-read")
  @Transactional
  public ResponseEntity<?> markMessagesAsRead() {
    User user = securityUtil.getCurrentUser();
    messageRepository.markAllAdminMessagesAsReadByUser(user);
    return ResponseEntity.ok(Map.of("success", true));
  }

  /**
   * Compter les messages non lus de l'admin
   */
  @GetMapping("/unread-count")
  public Map<String, Long> getUnreadCount() {
    User user = securityUtil.getCurrentUser();
    long count = messageRepository.countByUserAndFromAdminTrueAndReadByUserFalse(user);
    return Map.of("unreadCount", count);
  }

  // ==================== Endpoints pour les admins ====================

  /**
   * Récupérer les messages d'un utilisateur spécifique (admin uniquement)
   */
  @GetMapping("/admin/messages/{userId}")
  public ResponseEntity<?> getUserMessages(@PathVariable UUID userId) {
    User currentUser = securityUtil.getCurrentUser();
    if (currentUser.getStatus() != UserStatus.ADMIN) {
      return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
    }

    User targetUser = userRepository.findById(userId).orElse(null);
    if (targetUser == null) {
      return ResponseEntity.notFound().build();
    }

    List<SupportMessageDTO> messages = messageRepository.findByUserOrderByCreatedAtAsc(targetUser).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());

    return ResponseEntity.ok(messages);
  }

  /**
   * Envoyer un message à un utilisateur (admin uniquement)
   */
  @PostMapping("/admin/messages/{userId}")
  @Transactional
  public ResponseEntity<?> sendAdminMessage(@PathVariable UUID userId, @RequestBody SendMessageRequest request) {
    User currentUser = securityUtil.getCurrentUser();
    if (currentUser.getStatus() != UserStatus.ADMIN) {
      return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
    }

    User targetUser = userRepository.findById(userId).orElse(null);
    if (targetUser == null) {
      return ResponseEntity.notFound().build();
    }

    if (request.getContent() == null || request.getContent().trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Le message ne peut pas être vide"));
    }

    SupportMessage message = new SupportMessage();
    message.setUser(targetUser);
    message.setContent(request.getContent().trim());
    message.setFromAdmin(true);
    message.setReadByUser(false);
    message.setReadByAdmin(true); // L'admin a lu son propre message

    messageRepository.save(message);
    log.info("Admin {} sent message to user {}", currentUser.getId(), userId);

    return ResponseEntity.ok(toDTO(message));
  }

  /**
   * Marquer les messages d'un utilisateur comme lus par l'admin
   */
  @PostMapping("/admin/messages/{userId}/mark-read")
  @Transactional
  public ResponseEntity<?> markUserMessagesAsRead(@PathVariable UUID userId) {
    User currentUser = securityUtil.getCurrentUser();
    if (currentUser.getStatus() != UserStatus.ADMIN) {
      return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
    }

    User targetUser = userRepository.findById(userId).orElse(null);
    if (targetUser == null) {
      return ResponseEntity.notFound().build();
    }

    messageRepository.markAllUserMessagesAsReadByAdmin(targetUser);
    return ResponseEntity.ok(Map.of("success", true));
  }

  /**
   * Récupérer la liste des IDs d'utilisateurs avec des messages non lus
   */
  @GetMapping("/admin/users-with-unread")
  public ResponseEntity<?> getUsersWithUnreadMessages() {
    User currentUser = securityUtil.getCurrentUser();
    if (currentUser.getStatus() != UserStatus.ADMIN) {
      return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
    }

    List<String> userIds = messageRepository.findUserIdsWithUnreadMessages().stream()
        .map(UUID::toString)
        .collect(Collectors.toList());

    return ResponseEntity.ok(Map.of("userIds", userIds));
  }

  // ==================== DTO ====================

  @Data
  public static class SendMessageRequest {
    private String content;
  }

  private SupportMessageDTO toDTO(SupportMessage message) {
    SupportMessageDTO dto = new SupportMessageDTO();
    dto.setId(message.getId().toString());
    dto.setUserId(message.getUser().getId().toString());
    dto.setUserName(message.getUser().getFirstName() + " " + message.getUser().getLastName());
    dto.setContent(message.getContent());
    dto.setFromAdmin(message.isFromAdmin());
    dto.setReadByUser(message.isReadByUser());
    dto.setReadByAdmin(message.isReadByAdmin());
    dto.setCreatedAt(message.getCreatedAt());
    return dto;
  }
}

