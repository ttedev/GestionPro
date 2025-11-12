# Exemples d'implémentation Spring Boot

Ce fichier contient des exemples de code Spring Boot pour implémenter les APIs.

## 📦 Dépendances Maven

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- PostgreSQL ou H2 -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok (optionnel) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

## 🗄️ Entités JPA

### User Entity

```java
package com.example.paysagiste.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password; // Hashed
    
    @Column(nullable = false)
    private String company;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### Client Entity

```java
package com.example.paysagiste.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientType type; // PARTICULIER, PROFESSIONNEL
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientStatus status; // ACTIF, INACTIF
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ClientStatus.ACTIF;
        }
    }
}

enum ClientType {
    PARTICULIER, PROFESSIONNEL
}

enum ClientStatus {
    ACTIF, INACTIF
}
```

### Appointment Entity

```java
package com.example.paysagiste.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervention_id")
    private Intervention intervention;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "start_time", nullable = false)
    private String startTime; // Format HH:MM
    
    @Column(nullable = false)
    private Double duration; // En heures
    
    @Column(nullable = false)
    private String type;
    
    @Column(nullable = false)
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status; // PROPOSED, CONFIRMED, MANUAL
    
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Calculer le dayIndex (0=Dimanche, 1=Lundi, etc.)
    public int getDayIndex() {
        return date.getDayOfWeek().getValue() % 7;
    }
}

enum AppointmentStatus {
    PROPOSED, CONFIRMED, MANUAL
}
```

## 🎯 Controllers

### AuthController

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        authService.logout(authentication);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication));
    }
}
```

### ClientController

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.ClientDTO;
import com.example.paysagiste.dto.CreateClientRequest;
import com.example.paysagiste.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    
    private final ClientService clientService;
    
    @GetMapping
    public ResponseEntity<List<ClientDTO>> getAllClients(
            Authentication authentication,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(clientService.getAllClients(authentication, search));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClient(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(clientService.getClient(id, authentication));
    }
    
    @PostMapping
    public ResponseEntity<ClientDTO> createClient(
            @RequestBody CreateClientRequest request,
            Authentication authentication) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientService.createClient(request, authentication));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(
            @PathVariable Long id,
            @RequestBody CreateClientRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(clientService.updateClient(id, request, authentication));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(
            @PathVariable Long id,
            Authentication authentication) {
        clientService.deleteClient(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
```

### AppointmentController

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments(
            Authentication authentication,
            @RequestParam(required = false) Integer weekOffset,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        AppointmentFilterDTO filter = new AppointmentFilterDTO();
        filter.setWeekOffset(weekOffset);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        
        return ResponseEntity.ok(
            appointmentService.getAllAppointments(authentication, filter)
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getAppointment(id, authentication));
    }
    
    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(
            @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request, authentication));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @PathVariable Long id,
            @RequestBody UpdateAppointmentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
            appointmentService.updateAppointment(id, request, authentication)
        );
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
            appointmentService.updateStatus(id, request.getStatus(), authentication)
        );
    }
    
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<AppointmentDTO> confirmAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(
            appointmentService.confirmAppointment(id, authentication)
        );
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        appointmentService.deleteAppointment(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
```

## 🔧 Services

### ClientService (exemple)

```java
package com.example.paysagiste.service;

import com.example.paysagiste.dto.ClientDTO;
import com.example.paysagiste.dto.CreateClientRequest;
import com.example.paysagiste.entity.Client;
import com.example.paysagiste.entity.User;
import com.example.paysagiste.repository.ClientRepository;
import com.example.paysagiste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {
    
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    
    public List<ClientDTO> getAllClients(Authentication auth, String search) {
        User user = getCurrentUser(auth);
        List<Client> clients;
        
        if (search != null && !search.isEmpty()) {
            clients = clientRepository.findByUserAndNameContainingIgnoreCase(user, search);
        } else {
            clients = clientRepository.findByUser(user);
        }
        
        return clients.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public ClientDTO getClient(Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        Client client = clientRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return toDTO(client);
    }
    
    @Transactional
    public ClientDTO createClient(CreateClientRequest request, Authentication auth) {
        User user = getCurrentUser(auth);
        
        Client client = new Client();
        client.setUser(user);
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setType(request.getType());
        
        client = clientRepository.save(client);
        return toDTO(client);
    }
    
    @Transactional
    public ClientDTO updateClient(Long id, CreateClientRequest request, Authentication auth) {
        User user = getCurrentUser(auth);
        Client client = clientRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setType(request.getType());
        if (request.getStatus() != null) {
            client.setStatus(request.getStatus());
        }
        
        client = clientRepository.save(client);
        return toDTO(client);
    }
    
    @Transactional
    public void deleteClient(Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        Client client = clientRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        clientRepository.delete(client);
    }
    
    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private ClientDTO toDTO(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setAddress(client.getAddress());
        dto.setType(client.getType().name().toLowerCase());
        dto.setStatus(client.getStatus().name().toLowerCase());
        dto.setCreatedAt(client.getCreatedAt().toString());
        return dto;
    }
}
```

## 🗃️ Repositories

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.Client;
import com.example.paysagiste.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    List<Client> findByUser(User user);
    
    List<Client> findByUserAndNameContainingIgnoreCase(User user, String name);
    
    Optional<Client> findByIdAndUser(Long id, User user);
}
```

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.Appointment;
import com.example.paysagiste.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByUser(User user);
    
    List<Appointment> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
    
    Optional<Appointment> findByIdAndUser(Long id, User user);
}
```

## 🔐 Security Configuration

```java
package com.example.paysagiste.config;

import com.example.paysagiste.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

## 📋 DTOs (Data Transfer Objects)

```java
package com.example.paysagiste.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

@Data
public class LoginResponse {
    private String token;
    private UserDTO user;
}

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String company;
}

@Data
public class ClientDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String type;
    private String status;
    private String createdAt;
}

@Data
public class CreateClientRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private ClientType type;
    private ClientStatus status;
}

@Data
public class AppointmentDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long interventionId;
    private Integer dayIndex;
    private String date;
    private String startTime;
    private Double duration;
    private String type;
    private String location;
    private String status;
    private Boolean isRecurring;
    private String createdAt;
}
```

## 🚀 Application Properties

```properties
# application.properties

# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/paysagiste_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=your-secret-key-here-make-it-long-and-secure
jwt.expiration=86400000

# Logging
logging.level.com.example.paysagiste=DEBUG
```

## ✅ Checklist d'implémentation

- [ ] Configurer les dépendances Maven
- [ ] Créer les entités JPA (User, Client, Project, Intervention, Appointment, Remark)
- [ ] Créer les repositories
- [ ] Configurer Spring Security + JWT
- [ ] Implémenter AuthController et AuthService
- [ ] Implémenter ClientController et ClientService
- [ ] Implémenter ProjectController et ProjectService
- [ ] Implémenter InterventionController et InterventionService
- [ ] Implémenter AppointmentController et AppointmentService
- [ ] Implémenter RemarkController et RemarkService
- [ ] Implémenter DashboardController et DashboardService
- [ ] Configurer CORS
- [ ] Tester tous les endpoints
- [ ] Créer des utilisateurs de test
- [ ] Basculer le frontend en mode API réelle

## 📸 Gestion des Remarks avec Images

### Remark Entity (Mise à jour)

```java
package com.example.paysagiste.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "remarks")
@Data
public class Remark {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ElementCollection
    @CollectionTable(name = "remark_images", joinColumns = @JoinColumn(name = "remark_id"))
    @Column(name = "image_data", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### RemarkDTO avec Images

```java
package com.example.paysagiste.dto;

import lombok.Data;
import java.util.List;

@Data
public class RemarkDTO {
    private Long id;
    private Long clientId;
    private String content;
    private List<String> images;
    private String createdAt;
    private String updatedAt;
}

@Data
public class CreateRemarkRequest {
    private String content;
    private List<String> images; // Base64 ou URLs
}

@Data
public class UpdateRemarkRequest {
    private String content;
    private List<String> images;
}
```

### RemarkController avec Upload d'Images

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.service.RemarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RemarkController {
    
    private final RemarkService remarkService;
    
    @GetMapping("/clients/{clientId}/remarks")
    public ResponseEntity<List<RemarkDTO>> getClientRemarks(
            @PathVariable Long clientId,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(remarkService.getClientRemarks(clientId, userId));
    }
    
    @PostMapping("/clients/{clientId}/remarks")
    public ResponseEntity<RemarkDTO> createRemark(
            @PathVariable Long clientId,
            @RequestBody CreateRemarkRequest request,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        RemarkDTO remark = remarkService.createRemark(clientId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(remark);
    }
    
    @PutMapping("/remarks/{id}")
    public ResponseEntity<RemarkDTO> updateRemark(
            @PathVariable Long id,
            @RequestBody UpdateRemarkRequest request,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(remarkService.updateRemark(id, request, userId));
    }
    
    @DeleteMapping("/remarks/{id}")
    public ResponseEntity<Void> deleteRemark(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        remarkService.deleteRemark(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    // Endpoint optionnel pour upload d'images séparément
    @PostMapping(value = "/remarks/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile file,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        String imageUrl = remarkService.saveImage(file, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("imageUrl", imageUrl));
    }
}
```

### RemarkService avec Gestion d'Images

```java
package com.example.paysagiste.service;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.entity.*;
import com.example.paysagiste.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RemarkService {
    
    private final RemarkRepository remarkRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    
    private static final String UPLOAD_DIR = "uploads/remarks/";
    private static final DateTimeFormatter formatter = 
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
    
    @Transactional(readOnly = true)
    public List<RemarkDTO> getClientRemarks(Long clientId, Long userId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        
        if (!client.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        
        return remarkRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public RemarkDTO createRemark(Long clientId, CreateRemarkRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        
        if (!client.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        
        // Validation: au moins du contenu ou des images
        if ((request.getContent() == null || request.getContent().trim().isEmpty()) &&
            (request.getImages() == null || request.getImages().isEmpty())) {
            throw new RuntimeException("Content or images required");
        }
        
        Remark remark = new Remark();
        remark.setUser(user);
        remark.setClient(client);
        remark.setContent(request.getContent());
        
        // Gérer les images (base64 ou URLs)
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            remark.setImages(request.getImages());
        }
        
        remark = remarkRepository.save(remark);
        return toDTO(remark);
    }
    
    @Transactional
    public RemarkDTO updateRemark(Long id, UpdateRemarkRequest request, Long userId) {
        Remark remark = remarkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Remark not found"));
        
        if (!remark.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        
        if (request.getContent() != null) {
            remark.setContent(request.getContent());
        }
        
        if (request.getImages() != null) {
            remark.setImages(request.getImages());
        }
        
        remark = remarkRepository.save(remark);
        return toDTO(remark);
    }
    
    @Transactional
    public void deleteRemark(Long id, Long userId) {
        Remark remark = remarkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Remark not found"));
        
        if (!remark.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        
        remarkRepository.delete(remark);
    }
    
    // Méthode optionnelle pour sauvegarder les images sur le disque
    public String saveImage(MultipartFile file, Long userId) {
        try {
            // Créer le répertoire si nécessaire
            Path uploadPath = Paths.get(UPLOAD_DIR + userId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Générer un nom unique pour le fichier
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            
            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), filePath);
            
            // Retourner l'URL relative
            return "/uploads/remarks/" + userId + "/" + filename;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }
    
    private RemarkDTO toDTO(Remark remark) {
        RemarkDTO dto = new RemarkDTO();
        dto.setId(remark.getId());
        dto.setClientId(remark.getClient().getId());
        dto.setContent(remark.getContent());
        dto.setImages(remark.getImages());
        dto.setCreatedAt(remark.getCreatedAt().format(formatter));
        dto.setUpdatedAt(remark.getUpdatedAt().format(formatter));
        return dto;
    }
}
```

### RemarkRepository

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.Remark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemarkRepository extends JpaRepository<Remark, Long> {
    List<Remark> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
```

### Configuration pour servir les images uploadées

```java
package com.example.paysagiste.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir les images uploadées
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
```

### Notes d'implémentation pour les images

**Option 1: Base64 (Simple)**
- Les images sont envoyées en base64 dans le JSON
- Stockées directement en base de données
- Pas besoin de gestion de fichiers
- ⚠️ Attention à la taille de la base de données

**Option 2: Stockage fichier (Recommandé)**
- Les images sont uploadées via `/api/remarks/upload-image`
- Retourne une URL qui est ensuite incluse dans la remarque
- Stockage sur disque ou cloud (S3, etc.)
- Meilleure performance

**Option 3: Cloud Storage (Production)**
```java
// Exemple avec AWS S3
public String uploadToS3(MultipartFile file) {
    String key = "remarks/" + UUID.randomUUID() + "/" + file.getOriginalFilename();
    s3Client.putObject(bucketName, key, file.getInputStream(), metadata);
    return s3Client.getUrl(bucketName, key).toString();
}
```

---

## 📅 Calendar Events avec Types et Calcul de Récurrence

### Entité CalendarEvent

```java
package com.example.paysagiste.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Entity
@Table(name = "calendar_events")
@Data
public class CalendarEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType; // chantier, rdv, prospection, autre
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervention_id")
    private Intervention intervention;
    
    @Column(name = "chantier_id")
    private Long chantierId; // Référence au chantier si eventType = chantier
    
    @Column(name = "event_date")
    private LocalDate date; // null si non programmé
    
    @Column(name = "start_time")
    private LocalTime startTime; // null si non programmé
    
    @Column(nullable = false)
    private Integer duration; // en minutes
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;
    
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    @Column(name = "days_since_last_chantier")
    private Integer daysSinceLastChantier; // Calculé automatiquement
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

// Enums
enum EventType {
    CHANTIER, RDV, PROSPECTION, AUTRE
}

enum EventStatus {
    PROPOSED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
}
```

### Repository CalendarEvent

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    // Trouver les événements entre deux dates
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.id = :userId " +
           "AND e.date BETWEEN :startDate AND :endDate " +
           "ORDER BY e.date, e.startTime")
    List<CalendarEvent> findByUserIdAndDateBetween(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Trouver les événements non programmés
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.id = :userId " +
           "AND e.date IS NULL " +
           "ORDER BY e.createdAt DESC")
    List<CalendarEvent> findUnscheduledByUserId(@Param("userId") Long userId);
    
    // Trouver le dernier chantier confirmé/terminé d'une intervention
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.id = :userId " +
           "AND e.intervention.id = :interventionId " +
           "AND e.eventType = 'CHANTIER' " +
           "AND e.status IN ('CONFIRMED', 'COMPLETED') " +
           "AND e.date < :beforeDate " +
           "ORDER BY e.date DESC")
    Optional<CalendarEvent> findLastCompletedChantierByInterventionId(
        @Param("userId") Long userId,
        @Param("interventionId") Long interventionId,
        @Param("beforeDate") LocalDate beforeDate
    );
    
    // Filtrer par type d'événement
    List<CalendarEvent> findByUserIdAndEventTypeOrderByDateDesc(
        Long userId, 
        EventType eventType
    );
}
```

### Service CalendarEvent

```java
package com.example.paysagiste.service;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.entity.*;
import com.example.paysagiste.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarEventService {
    
    private final CalendarEventRepository eventRepository;
    private final ClientRepository clientRepository;
    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;
    
    /**
     * Récupérer les événements avec filtres
     */
    public List<CalendarEventDTO> getEvents(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            EventType eventType,
            Boolean includeUnscheduled) {
        
        List<CalendarEvent> events;
        
        if (startDate != null && endDate != null) {
            events = eventRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        } else if (Boolean.TRUE.equals(includeUnscheduled)) {
            events = eventRepository.findUnscheduledByUserId(userId);
        } else if (eventType != null) {
            events = eventRepository.findByUserIdAndEventTypeOrderByDateDesc(userId, eventType);
        } else {
            events = eventRepository.findByUserIdOrderByDateDesc(userId);
        }
        
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Créer un nouvel événement
     */
    @Transactional
    public CalendarEventDTO createEvent(Long userId, CreateCalendarEventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new NotFoundException("Client not found"));
        
        // Vérifier que le client appartient à l'utilisateur
        if (!client.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Client does not belong to user");
        }
        
        CalendarEvent event = new CalendarEvent();
        event.setEventType(request.getEventType());
        event.setClient(client);
        event.setUser(user);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setDate(request.getDate());
        event.setStartTime(request.getStartTime());
        event.setDuration(request.getDuration());
        event.setStatus(request.getStatus());
        event.setNotes(request.getNotes());
        
        // Si intervention spécifiée
        if (request.getInterventionId() != null) {
            Intervention intervention = interventionRepository.findById(request.getInterventionId())
                    .orElseThrow(() -> new NotFoundException("Intervention not found"));
            event.setIntervention(intervention);
            event.setIsRecurring(true);
        }
        
        // Si c'est un chantier avec date, calculer daysSinceLastChantier
        if (event.getEventType() == EventType.CHANTIER && 
            event.getDate() != null && 
            event.getIntervention() != null) {
            event.setDaysSinceLastChantier(
                calculateDaysSinceLastChantier(userId, event.getIntervention().getId(), event.getDate())
            );
        }
        
        CalendarEvent savedEvent = eventRepository.save(event);
        return convertToDTO(savedEvent);
    }
    
    /**
     * Mettre à jour un événement
     */
    @Transactional
    public CalendarEventDTO updateEvent(Long userId, Long eventId, UpdateCalendarEventRequest request) {
        CalendarEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        
        if (!event.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Event does not belong to user");
        }
        
        // Mettre à jour les champs
        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getLocation() != null) event.setLocation(request.getLocation());
        if (request.getDuration() != null) event.setDuration(request.getDuration());
        if (request.getStatus() != null) event.setStatus(request.getStatus());
        if (request.getNotes() != null) event.setNotes(request.getNotes());
        
        // Si la date change, recalculer daysSinceLastChantier
        boolean dateChanged = false;
        if (request.getDate() != null && !request.getDate().equals(event.getDate())) {
            event.setDate(request.getDate());
            dateChanged = true;
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        
        // Recalculer daysSinceLastChantier si nécessaire
        if (dateChanged && 
            event.getEventType() == EventType.CHANTIER && 
            event.getIntervention() != null &&
            event.getDate() != null) {
            event.setDaysSinceLastChantier(
                calculateDaysSinceLastChantier(userId, event.getIntervention().getId(), event.getDate())
            );
        }
        
        CalendarEvent updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }
    
    /**
     * Calculer le nombre de jours depuis le dernier chantier
     */
    private Integer calculateDaysSinceLastChantier(Long userId, Long interventionId, LocalDate currentDate) {
        if (interventionId == null || currentDate == null) {
            return null;
        }
        
        Optional<CalendarEvent> lastChantier = eventRepository
                .findLastCompletedChantierByInterventionId(userId, interventionId, currentDate);
        
        if (lastChantier.isEmpty()) {
            return null; // Pas de chantier précédent
        }
        
        LocalDate lastDate = lastChantier.get().getDate();
        return (int) ChronoUnit.DAYS.between(lastDate, currentDate);
    }
    
    /**
     * Convertir entité en DTO
     */
    private CalendarEventDTO convertToDTO(CalendarEvent event) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setId(event.getId());
        dto.setEventType(event.getEventType());
        dto.setClientId(event.getClient().getId());
        dto.setClientName(event.getClient().getName());
        dto.setInterventionId(event.getIntervention() != null ? event.getIntervention().getId() : null);
        dto.setChantierId(event.getChantierId());
        dto.setDate(event.getDate());
        dto.setStartTime(event.getStartTime());
        dto.setDuration(event.getDuration());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setStatus(event.getStatus());
        dto.setIsRecurring(event.getIsRecurring());
        dto.setDaysSinceLastChantier(event.getDaysSinceLastChantier());
        dto.setNotes(event.getNotes());
        dto.setCreatedAt(event.getCreatedAt());
        
        // Calculer dayIndex si date présente
        if (event.getDate() != null) {
            dto.setDayIndex(event.getDate().getDayOfWeek().getValue() % 7); // 0=Dimanche
        }
        
        return dto;
    }
    
    @Transactional
    public void deleteEvent(Long userId, Long eventId) {
        CalendarEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        
        if (!event.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Event does not belong to user");
        }
        
        eventRepository.delete(event);
    }
}
```

### Controller CalendarEvent

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.entity.EventType;
import com.example.paysagiste.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {
    
    private final CalendarEventService eventService;
    
    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventDTO>> getEvents(
            @RequestParam(required = false) Integer weekOffset,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) EventType eventType,
            @RequestParam(required = false) Boolean includeUnscheduled,
            Authentication authentication) {
        
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        
        // Si weekOffset spécifié, calculer startDate et endDate
        if (weekOffset != null) {
            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.plusWeeks(weekOffset).with(java.time.DayOfWeek.MONDAY);
            startDate = weekStart;
            endDate = weekStart.plusDays(6);
        }
        
        List<CalendarEventDTO> events = eventService.getEvents(
            userId, startDate, endDate, eventType, includeUnscheduled
        );
        
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/events/{id}")
    public ResponseEntity<CalendarEventDTO> getEvent(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(eventService.getEventById(userId, id));
    }
    
    @PostMapping("/events")
    public ResponseEntity<CalendarEventDTO> createEvent(
            @RequestBody @Valid CreateCalendarEventRequest request,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        CalendarEventDTO event = eventService.createEvent(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
    
    @PutMapping("/events/{id}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            @PathVariable Long id,
            @RequestBody UpdateCalendarEventRequest request,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(eventService.updateEvent(userId, id, request));
    }
    
    @PatchMapping("/events/{id}/status")
    public ResponseEntity<CalendarEventDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(eventService.updateStatus(userId, id, request.getStatus()));
    }
    
    @PatchMapping("/events/{id}/confirm")
    public ResponseEntity<CalendarEventDTO> confirmEvent(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(eventService.confirmEvent(userId, id));
    }
    
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = ((UserDetails) authentication.getPrincipal()).getId();
        eventService.deleteEvent(userId, id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 📞 Points d'attention

1. **Multi-tenancy**: Assurez-vous que chaque utilisateur ne voit que ses propres données
2. **Validation**: Validez toutes les entrées utilisateur avec `@Valid` et annotations
3. **Gestion d'erreurs**: Utilisez `@ControllerAdvice` pour gérer les erreurs globalement
4. **Transactions**: Utilisez `@Transactional` pour les opérations de modification
5. **Performance**: Utilisez `@EntityGraph` ou `JOIN FETCH` pour éviter les N+1 queries
6. **Security**: Hashage des mots de passe, JWT sécurisé, HTTPS en production
7. **Images**: Limitez la taille des uploads, validez les types MIME, nettoyez les images orphelines
8. **Calcul daysSinceLastChantier**: Calculé à la création/modification, pas à chaque requête pour optimiser les performances
9. **EventType**: Validez que seuls les chantiers peuvent avoir un chantierId et daysSinceLastChantier
