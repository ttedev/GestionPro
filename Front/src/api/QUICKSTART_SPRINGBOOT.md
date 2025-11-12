# 🚀 Quick Start - Backend Spring Boot

Guide rapide pour démarrer votre backend en 30 minutes.

## ⚡ Setup rapide (5 min)

### 1. Créer le projet Spring Boot

Allez sur [start.spring.io](https://start.spring.io) et configurez :

**Project:** Maven  
**Language:** Java  
**Spring Boot:** 3.2.x (ou version stable récente)  
**Group:** com.example  
**Artifact:** paysagiste-backend  
**Package name:** com.example.paysagiste  
**Java:** 17 ou 21

**Dépendances à ajouter:**
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL Driver (ou H2 pour test)
- Lombok

Cliquez sur **GENERATE** et décompressez le projet.

### 2. Configuration Database

Pour démarrer rapidement, utilisez **H2** (base en mémoire) :

**pom.xml** - Ajoutez H2 :
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**application.properties** :
```properties
# H2 Database (pour test rapide)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true

# Server
server.port=8080

# JWT (changez la clé en production)
jwt.secret=mysupersecretkeyforjwttoken123456789
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### 3. Ajoutez JWT dependency

**pom.xml** :
```xml
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
```

## 📁 Structure du projet minimal

```
src/main/java/com/example/paysagiste/
├── PaysagisteApplication.java
├── config/
│   ├── CorsConfig.java
│   └── SecurityConfig.java
├── entity/
│   ├── User.java
│   ├── Client.java
│   └── Appointment.java
├── repository/
│   ├── UserRepository.java
│   ├── ClientRepository.java
│   └── AppointmentRepository.java
├── service/
│   ├── AuthService.java
│   └── ClientService.java
├── controller/
│   ├── AuthController.java
│   └── ClientController.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── UserDTO.java
│   └── ClientDTO.java
└── security/
    ├── JwtUtil.java
    └── JwtAuthenticationFilter.java
```

## 🔧 Code minimal pour démarrer

### 1. CorsConfig.java

```java
package com.example.paysagiste.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2. User.java (entité minimale)

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
    
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String password;
    
    private String company;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 3. Client.java (entité minimale)

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
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String name;
    private String email;
    private String phone;
    private String address;
    private String type; // particulier, professionnel
    private String status; // actif, inactif
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "actif";
    }
}
```

### 4. UserRepository.java

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

### 5. ClientRepository.java

```java
package com.example.paysagiste.repository;

import com.example.paysagiste.entity.Client;
import com.example.paysagiste.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUser(User user);
    Optional<Client> findByIdAndUser(Long id, User user);
}
```

### 6. JwtUtil.java

```java
package com.example.paysagiste.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
```

### 7. SecurityConfig.java (TEMPORAIRE - Sans sécurité pour tester)

```java
package com.example.paysagiste.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // TEMPORAIRE: Désactive la sécurité pour tester rapidement
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 8. AuthController.java (Version simple)

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.*;
import com.example.paysagiste.entity.User;
import com.example.paysagiste.repository.UserRepository;
import com.example.paysagiste.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Pour tester, on skip la vérification du mot de passe
        // En production, utilisez: passwordEncoder.matches(request.getPassword(), user.getPassword())
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setCompany(user.getCompany());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userDTO);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().build();
    }
}
```

### 9. ClientController.java

```java
package com.example.paysagiste.controller;

import com.example.paysagiste.dto.ClientDTO;
import com.example.paysagiste.entity.Client;
import com.example.paysagiste.entity.User;
import com.example.paysagiste.repository.ClientRepository;
import com.example.paysagiste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<ClientDTO>> getAllClients() {
        // Pour tester, on prend le premier user
        User user = userRepository.findAll().get(0);
        
        List<Client> clients = clientRepository.findByUser(user);
        List<ClientDTO> dtos = clients.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClient(@PathVariable Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return ResponseEntity.ok(toDTO(client));
    }
    
    private ClientDTO toDTO(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setAddress(client.getAddress());
        dto.setType(client.getType());
        dto.setStatus(client.getStatus());
        dto.setCreatedAt(client.getCreatedAt().toString());
        return dto;
    }
}
```

### 10. DTOs (dans un seul fichier pour commencer)

```java
package com.example.paysagiste.dto;

import lombok.Data;

// LoginRequest
@Data
class LoginRequest {
    private String email;
    private String password;
}

// LoginResponse
@Data
class LoginResponse {
    private String token;
    private UserDTO user;
}

// UserDTO
@Data
class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String company;
}

// ClientDTO
@Data
class ClientDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String type;
    private String status;
    private String createdAt;
}
```

## 🗄️ Initialiser les données de test

Créez un fichier `DataInitializer.java` :

```java
package com.example.paysagiste;

import com.example.paysagiste.entity.Client;
import com.example.paysagiste.entity.User;
import com.example.paysagiste.repository.ClientRepository;
import com.example.paysagiste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        // Créer un utilisateur de test
        User user = new User();
        user.setName("Jean Dupont");
        user.setEmail("jean.dupont@jardinvert.fr");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setCompany("Jardin Vert SARL");
        user = userRepository.save(user);
        
        // Créer des clients de test
        Client client1 = new Client();
        client1.setUser(user);
        client1.setName("Marie Dubois");
        client1.setEmail("marie.dubois@email.com");
        client1.setPhone("06 12 34 56 78");
        client1.setAddress("12 rue des Fleurs, 75001 Paris");
        client1.setType("particulier");
        clientRepository.save(client1);
        
        Client client2 = new Client();
        client2.setUser(user);
        client2.setName("Restaurant Le Jardin");
        client2.setEmail("contact@lejardin.fr");
        client2.setPhone("01 42 43 44 45");
        client2.setAddress("78 boulevard Verdure, 75003 Paris");
        client2.setType("professionnel");
        clientRepository.save(client2);
        
        System.out.println("✅ Données de test créées!");
        System.out.println("Email: jean.dupont@jardinvert.fr");
        System.out.println("Password: password123");
    }
}
```

## 🚀 Démarrer l'application

```bash
# Dans le dossier du projet Spring Boot
./mvnw spring-boot:run

# ou avec Maven installé
mvn spring-boot:run
```

Le backend démarre sur `http://localhost:8080`

## ✅ Tester avec curl

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@jardinvert.fr","password":"password123"}'

# Vous recevrez un token

# 2. Récupérer les clients
curl -X GET http://localhost:8080/api/clients \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 🎯 Connecter le frontend

1. **Backend démarré** sur `http://localhost:8080` ✅

2. **Frontend** - Modifiez `/api/config.ts` :
   ```typescript
   USE_MOCK_DATA: false
   ```

3. **Testez le login** dans l'application :
   - Email: `jean.dupont@jardinvert.fr`
   - Password: `password123`

## 📝 Prochaines étapes

Une fois ce minimum fonctionnel :

1. ✅ Ajoutez l'authentification JWT complète
2. ✅ Implémentez les autres endpoints (Projects, Appointments, etc.)
3. ✅ Ajoutez la validation des données
4. ✅ Gérez les erreurs proprement
5. ✅ Passez de H2 à PostgreSQL
6. ✅ Ajoutez les tests

## 🐛 Troubleshooting

**Port 8080 déjà utilisé?**
```properties
# application.properties
server.port=8081
```

**CORS errors?**
Vérifiez que `CorsConfig.java` est bien configuré.

**Base de données?**
Avec H2, accédez à `http://localhost:8080/h2-console`

**Lombok ne fonctionne pas?**
Installez le plugin Lombok dans votre IDE.

---

**Temps estimé:** 30-45 minutes pour avoir un backend minimal fonctionnel ! 🚀
