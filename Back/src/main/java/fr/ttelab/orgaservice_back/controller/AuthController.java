package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.UserDTO;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.UserStatus;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import fr.ttelab.orgaservice_back.security.JwtUtil;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

  public record LoginRequest(String email, String password) {
  }

  public record LoginResponse(String token, UserDTO user) {
  }


  private final AuthenticationManager authenticationManager;
  private final UserRepository userRepository;
  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {

    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email, request.password)
    );
    User user= null;
    if (authentication.isAuthenticated()) {

        user = userRepository.findByUsername(request.email).orElse(null);


      if (user != null ) {
        String token = jwtUtil.generateToken(user.getEmail());
        if (user.getStatus().equals(UserStatus.ACTIVE) && user.getEndLicenseDate().isBefore(java.time.LocalDate.now())) {
          user.setStatus(UserStatus.INACTIVE);
          userRepository.save(user);
        }


        UserDTO userDTO = new UserDTO();
        userDTO.setName(user.getFirstName()+" "+user.getLastName());
        userDTO.setCompany(user.getCompany());
        userDTO.setId(user.getId().toString());
        userDTO.setName(user.getFirstName());
        userDTO.setEmail(user.getEmail());
        userDTO.setWorkStartTime(user.getWorkStartTime().toString());
        userDTO.setWorkEndTime(user.getWorkEndTime().toString());
        userDTO.setStatus(user.getStatus());
        if (user.getEndLicenseDate()!=null)userDTO.setEndLicenseDate(user.getEndLicenseDate().toString());

        LoginResponse response = new LoginResponse(token, userDTO);

        return ResponseEntity.ok(response);
      }
    }
    return ResponseEntity.status(403).body("User does not exist");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout () {
      return ResponseEntity.ok().build();
    }


    @GetMapping("/me")
  public ResponseEntity<UserDTO> currentUser(){
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null && authentication.isAuthenticated()){
        String name = authentication.getName();
        User user = userRepository.findByEmail(name).orElseGet(null);
        if (user.getStatus().equals(UserStatus.ACTIVE) && user.getEndLicenseDate().isBefore(java.time.LocalDate.now())) {
          user.setStatus(UserStatus.INACTIVE);
          userRepository.save(user);
        }

        if (user!=null) {
          return ResponseEntity.ok(MappingUtil.toUserDTO(user));
        }
      }
    return ResponseEntity.notFound().build();
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> req) {
      String newPassword = req.get("newPassword");
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null && authentication.isAuthenticated()) {
        String name = authentication.getName();
        User user = userRepository.findByEmail(name).orElseGet(null);
        if (user != null) {
          user.setPassword(passwordEncoder.encode(newPassword));
          userRepository.save(user);
          return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès"));
        }
      }
      return ResponseEntity.status(403).body("Unauthorized");
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> req) {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null && authentication.isAuthenticated()) {
        String name = authentication.getName();
        String email = req.get("email");
        String company = req.get("company");
        String workStartTime = req.get("workStartTime");
        String workEndTime = req.get("workEndTime");

        User user = userRepository.findByEmail(name).orElseGet(null);
        if (user != null) {
          if (email != null) user.setEmail(email);
          if (company != null) user.setCompany(company);
          if (workStartTime != null) user.setWorkStartTime(java.time.LocalTime.parse(workStartTime));
          if (workEndTime != null) user.setWorkEndTime(java.time.LocalTime.parse(workEndTime));
          userRepository.save(user);
          return ResponseEntity.ok(MappingUtil.toUserDTO(user));
        }
      }
        return ResponseEntity.status(403).body("Unauthorized");
    }
  }