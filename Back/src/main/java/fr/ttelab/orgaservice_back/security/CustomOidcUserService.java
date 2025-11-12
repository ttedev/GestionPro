package fr.ttelab.orgaservice_back.security;

import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.UserStatus;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class CustomOidcUserService extends OidcUserService {

  @Autowired
  private UserRepository userRepository;

  @Override
  public OidcUser loadUser(OidcUserRequest userRequest)  {
    OidcUser  oauth2User = super.loadUser(userRequest);
    String email = oauth2User.getAttribute("email");


    User user = userRepository.findByEmail(email).orElse(null);
    if (user==null ) {
      user = new User();
      user.setEmail(email);
      user.setUsername(email);
      user.setFirstName(oauth2User.getAttribute("given_name"));
      user.setLastName(oauth2User.getAttribute("family_name"));
      user.setStatus(UserStatus.PENDING);
      userRepository.save(user);
    }

    return oauth2User;
  }
}