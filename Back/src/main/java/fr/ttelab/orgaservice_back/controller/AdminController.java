package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.AdminUserDTO;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.UserStatus;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  private final UserRepository userRepository;

  /**
   * Liste tous les utilisateurs avec leurs informations de licence
   */
  @GetMapping("/users")
  public List<AdminUserDTO> listUsers() {
    return userRepository.findAll().stream()
        .map(this::toAdminUserDTO)
        .collect(Collectors.toList());
  }

  /**
   * Récupère un utilisateur par son ID
   */
  @GetMapping("/users/{id}")
  public ResponseEntity<?> getUser(@PathVariable UUID id) {
    return userRepository.findById(id)
        .map(user -> ResponseEntity.ok(toAdminUserDTO(user)))
        .orElse(ResponseEntity.notFound().build());
  }

  @Data
  public static class UpdateUserRequest {
    private UserStatus status;
    private LocalDate endLicenseDate;
    private String firstName;
    private String lastName;
    private String company;
  }

  /**
   * Met à jour les informations d'un utilisateur (statut, licence, etc.)
   */
  @PutMapping("/users/{id}")
  public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UpdateUserRequest request) {
    return userRepository.findById(id)
        .map(user -> {
          if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
          }
          if (request.getEndLicenseDate() != null) {
            user.setEndLicenseDate(request.getEndLicenseDate());
          }
          if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
          }
          if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
          }
          if (request.getCompany() != null) {
            user.setCompany(request.getCompany());
          }
          userRepository.save(user);
          log.info("Admin updated user {}: status={}, endLicenseDate={}", id, user.getStatus(), user.getEndLicenseDate());
          return ResponseEntity.ok(toAdminUserDTO(user));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Active un utilisateur (raccourci pour changer le statut à ACTIVE)
   */
  @PostMapping("/users/{id}/activate")
  public ResponseEntity<?> activateUser(@PathVariable UUID id, @RequestBody(required = false) ActivateRequest request) {
    return userRepository.findById(id)
        .map(user -> {
          user.setStatus(UserStatus.ACTIVE);
          // Par défaut, licence d'un an si non spécifié
          if (request != null && request.getEndLicenseDate() != null) {
            user.setEndLicenseDate(request.getEndLicenseDate());
          } else {
            user.setEndLicenseDate(LocalDate.now().plusYears(1));
          }
          userRepository.save(user);
          log.info("Admin activated user {} until {}", id, user.getEndLicenseDate());
          return ResponseEntity.ok(toAdminUserDTO(user));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @Data
  public static class ActivateRequest {
    private LocalDate endLicenseDate;
  }

  /**
   * Désactive un utilisateur (raccourci pour changer le statut à INACTIVE)
   */
  @PostMapping("/users/{id}/deactivate")
  public ResponseEntity<?> deactivateUser(@PathVariable UUID id) {
    return userRepository.findById(id)
        .map(user -> {
          user.setStatus(UserStatus.INACTIVE);
          userRepository.save(user);
          log.info("Admin deactivated user {}", id);
          return ResponseEntity.ok(toAdminUserDTO(user));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Supprime un utilisateur
   */
  @DeleteMapping("/users/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
    return userRepository.findById(id)
        .map(user -> {
          // Ne pas permettre la suppression d'un admin
          if (user.getStatus() == UserStatus.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete an admin user"));
          }
          userRepository.delete(user);
          log.info("Admin deleted user {}", id);
          return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Statistiques globales pour le dashboard admin
   */
  @GetMapping("/stats")
  public Map<String, Object> getStats() {
    List<User> allUsers = userRepository.findAll();

    long totalUsers = allUsers.size();
    long activeUsers = allUsers.stream().filter(u -> u.getStatus() == UserStatus.ACTIVE).count();
    long pendingUsers = allUsers.stream().filter(u -> u.getStatus() == UserStatus.PENDING).count();
    long inactiveUsers = allUsers.stream().filter(u -> u.getStatus() == UserStatus.INACTIVE).count();
    long suspendedUsers = allUsers.stream().filter(u -> u.getStatus() == UserStatus.SUSPENDED).count();
    long adminUsers = allUsers.stream().filter(u -> u.getStatus() == UserStatus.ADMIN).count();
    long usersWithSubscription = allUsers.stream()
        .filter(u -> u.getStripeSubscriptionId() != null && !u.getStripeSubscriptionId().isEmpty())
        .count();
    long expiringThisMonth = allUsers.stream()
        .filter(u -> u.getEndLicenseDate() != null &&
            u.getEndLicenseDate().isAfter(LocalDate.now()) &&
            u.getEndLicenseDate().isBefore(LocalDate.now().plusMonths(1)))
        .count();

    return Map.of(
        "totalUsers", totalUsers,
        "activeUsers", activeUsers,
        "pendingUsers", pendingUsers,
        "inactiveUsers", inactiveUsers,
        "suspendedUsers", suspendedUsers,
        "adminUsers", adminUsers,
        "usersWithSubscription", usersWithSubscription,
        "expiringThisMonth", expiringThisMonth
    );
  }

  // ==================== Mapping ====================

  private AdminUserDTO toAdminUserDTO(User user) {
    AdminUserDTO dto = new AdminUserDTO();
    dto.setId(user.getId().toString());
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setFirstName(user.getFirstName());
    dto.setLastName(user.getLastName());
    dto.setCompany(user.getCompany());
    dto.setStatus(user.getStatus());
    dto.setEndLicenseDate(user.getEndLicenseDate());
    dto.setCreatedAt(user.getCreatedAt());
    dto.setStripeCustomerId(user.getStripeCustomerId());
    dto.setStripeSubscriptionId(user.getStripeSubscriptionId());
    dto.setHasActiveSubscription(user.getStripeSubscriptionId() != null && !user.getStripeSubscriptionId().isEmpty());
    return dto;
  }
}

