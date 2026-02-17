package fr.ttelab.orgaservice_back.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {


  private JwtUtil jwtUtil;

  private CustomUserDetailsService customUserDetailsService;



  public JwtRequestFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
    this.jwtUtil = jwtUtil;
    this.customUserDetailsService = customUserDetailsService;
  }

  @Override
    protected void doFilterInternal(HttpServletRequest request,
        HttpServletResponse response, FilterChain filterChain)
      throws IOException, ServletException {
        // Récupérer le token JWT depuis l'en-tête Authorization
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        try {

          if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
          }
          if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
              UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                  userDetails, null, userDetails.getAuthorities());
              usernamePasswordAuthenticationToken
                  .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
              SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
          }
        } catch (ExpiredJwtException e) {
          log.warn("JWT token expiré: {}", e.getMessage());
          sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_EXPIRED", "Le token JWT a expiré");
          return;
        } catch (JwtException e) {
          log.warn("JWT token invalide: {}", e.getMessage());
          sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_INVALID", "Le token JWT est invalide");
          return;
        } catch (Exception e) {
          log.error("Erreur lors de la validation du token JWT", e);
          sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_ERROR", "Erreur lors de la validation du token");
          return;
        }
    filterChain.doFilter(request, response);

  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    // Ne pas filtrer les routes publiques (login, logout, assets, etc.)
    // Note: /api/auth/me, /api/auth/update-password, /api/auth/update-profile nécessitent un token
    return path.equals("/api/auth/login") ||
           path.equals("/api/auth/logout") ||
           path.equals("/login") ||
           path.startsWith("/assets/") ||
           path.equals("/index.html") ||
           path.equals("/") ||
           path.startsWith("/api/oauth2/") ||
           path.startsWith("/login/oauth2/");
  }

  private void sendErrorResponse(HttpServletResponse response, int status, String errorCode, String message) throws IOException {
    // Ajouter les headers CORS pour que le frontend puisse lire la réponse
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Expose-Headers", "Authorization");

    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    String jsonResponse = String.format("{\"error\": \"%s\", \"message\": \"%s\", \"status\": %d}", errorCode, message, status);
    response.getWriter().write(jsonResponse);
    response.getWriter().flush();
  }
}
