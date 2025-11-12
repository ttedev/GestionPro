package fr.ttelab.orgaservice_back.util;

import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {
  private final UserRepository userRepository;

  public User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth == null) return null;
    String email = auth.getName();
    return userRepository.findByEmail(email).orElse(null);
  }
}
