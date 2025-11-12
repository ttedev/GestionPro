# ✅ Checklist d'implémentation Backend

Utilisez cette checklist pour suivre votre progression.

## 🎯 Phase 1: Setup Initial (30-45 min)

- [ ] Créer le projet Spring Boot sur start.spring.io
- [ ] Importer le projet dans votre IDE (IntelliJ/Eclipse/VS Code)
- [ ] Configurer `application.properties` (H2 pour commencer)
- [ ] Ajouter les dépendances JWT dans `pom.xml`
- [ ] Tester que l'application démarre sur `http://localhost:8080`

**📖 Référence:** `/api/QUICKSTART_SPRINGBOOT.md`

---

## 🔐 Phase 2: Authentification (1-2h)

### Entités
- [ ] Créer `User.java` (entity)
- [ ] Créer `UserRepository.java`

### Security
- [ ] Créer `JwtUtil.java` (génération/validation tokens)
- [ ] Créer `CorsConfig.java` (autoriser le frontend)
- [ ] Créer `SecurityConfig.java` (configuration Spring Security)

### DTOs
- [ ] Créer `LoginRequest.java`
- [ ] Créer `LoginResponse.java`
- [ ] Créer `UserDTO.java`

### API
- [ ] Créer `AuthController.java`
  - [ ] `POST /api/auth/login` - Connexion
  - [ ] `POST /api/auth/logout` - Déconnexion
  - [ ] `GET /api/auth/me` - Utilisateur actuel

### Tests
- [ ] Créer un utilisateur de test (via `DataInitializer.java`)
- [ ] Tester login avec Postman/curl
- [ ] Vérifier que le token JWT est généré

**📖 Référence:** `/api/SPRING_BOOT_EXAMPLES.md` - Section Authentication

---

## 👥 Phase 3: Clients (2h)

### Entités
- [ ] Créer `Client.java` (entity)
- [ ] Créer enum `ClientType` (PARTICULIER, PROFESSIONNEL)
- [ ] Créer enum `ClientStatus` (ACTIF, INACTIF)
- [ ] Créer `ClientRepository.java`

### DTOs
- [ ] Créer `ClientDTO.java`
- [ ] Créer `CreateClientRequest.java`

### Service
- [ ] Créer `ClientService.java`
  - [ ] Méthode `getAllClients()`
  - [ ] Méthode `getClient(id)`
  - [ ] Méthode `createClient()`
  - [ ] Méthode `updateClient(id)`
  - [ ] Méthode `deleteClient(id)`

### API
- [ ] Créer `ClientController.java`
  - [ ] `GET /api/clients` - Liste des clients
  - [ ] `GET /api/clients/{id}` - Détails d'un client
  - [ ] `POST /api/clients` - Créer un client
  - [ ] `PUT /api/clients/{id}` - Modifier un client
  - [ ] `DELETE /api/clients/{id}` - Supprimer un client

### Tests
- [ ] Créer des clients de test
- [ ] Tester tous les endpoints avec Postman/curl
- [ ] Vérifier le filtrage par utilisateur (multi-tenant)

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Clients

---

## 🏗️ Phase 4: Projects (2h)

### Entités
- [ ] Créer `Project.java` (entity)
- [ ] Créer enum `ProjectStatus` (EN_COURS, TERMINE, EN_ATTENTE)
- [ ] Créer `ProjectRepository.java`

### DTOs
- [ ] Créer `ProjectDTO.java`
- [ ] Créer `CreateProjectRequest.java`

### Service
- [ ] Créer `ProjectService.java`
  - [ ] Méthode `getAllProjects()`
  - [ ] Méthode `getProject(id)`
  - [ ] Méthode `createProject()`
  - [ ] Méthode `updateProject(id)`
  - [ ] Méthode `deleteProject(id)`

### API
- [ ] Créer `ProjectController.java`
  - [ ] `GET /api/projects` - Liste des projets
  - [ ] `GET /api/projects/{id}` - Détails d'un projet
  - [ ] `POST /api/projects` - Créer un projet
  - [ ] `PUT /api/projects/{id}` - Modifier un projet
  - [ ] `DELETE /api/projects/{id}` - Supprimer un projet

### Tests
- [ ] Créer des projets de test
- [ ] Tester tous les endpoints
- [ ] Vérifier les filtres (par client, par statut)

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Projects

---

## 🔧 Phase 5: Interventions (2h)

### Entités
- [ ] Créer `Intervention.java` (entity)
- [ ] Créer enum `InterventionType` (PONCTUELLE, RECURRENTE)
- [ ] Créer enum `InterventionStatus` (PLANIFIEE, EN_COURS, TERMINEE, ANNULEE)
- [ ] Créer enum `Frequency` (HEBDOMADAIRE, MENSUELLE)
- [ ] Créer `InterventionRepository.java`

### DTOs
- [ ] Créer `InterventionDTO.java`
- [ ] Créer `CreateInterventionRequest.java`

### Service
- [ ] Créer `InterventionService.java`
  - [ ] Méthode `getAllInterventions()`
  - [ ] Méthode `getIntervention(id)`
  - [ ] Méthode `createIntervention()`
  - [ ] Méthode `updateIntervention(id)`
  - [ ] Méthode `deleteIntervention(id)`

### API
- [ ] Créer `InterventionController.java`
  - [ ] `GET /api/interventions` - Liste des interventions
  - [ ] `GET /api/interventions/{id}` - Détails d'une intervention
  - [ ] `POST /api/interventions` - Créer une intervention
  - [ ] `PUT /api/interventions/{id}` - Modifier une intervention
  - [ ] `DELETE /api/interventions/{id}` - Supprimer une intervention

### Tests
- [ ] Créer des interventions de test (ponctuelles et récurrentes)
- [ ] Tester tous les endpoints
- [ ] Vérifier les filtres (par client, par projet, par type)

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Interventions

---

## 📅 Phase 6: Appointments (Planning) (2-3h)

### Entités
- [ ] Créer `Appointment.java` (entity)
- [ ] Ajouter champ `date` (LocalDate) pour la date complète
- [ ] Créer enum `AppointmentStatus` (PROPOSED, CONFIRMED, MANUAL)
- [ ] Créer `AppointmentRepository.java`
- [ ] Ajouter méthode de recherche par plage de dates

### DTOs
- [ ] Créer `AppointmentDTO.java`
- [ ] Créer `CreateAppointmentRequest.java`
- [ ] Créer `UpdateAppointmentRequest.java`
- [ ] Créer `UpdateStatusRequest.java`

### Service
- [ ] Créer `AppointmentService.java`
  - [ ] Méthode `getAllAppointments(weekOffset)`
  - [ ] Méthode `getAppointment(id)`
  - [ ] Méthode `createAppointment()`
  - [ ] Méthode `updateAppointment(id)` (déplacement)
  - [ ] Méthode `updateStatus(id, status)`
  - [ ] Méthode `confirmAppointment(id)`
  - [ ] Méthode `deleteAppointment(id)`
  - [ ] Logique: calculer `dayIndex` depuis la date

### API
- [ ] Créer `AppointmentController.java`
  - [ ] `GET /api/appointments` - Liste des RDV (avec filtres)
  - [ ] `GET /api/appointments/{id}` - Détails d'un RDV
  - [ ] `POST /api/appointments` - Créer un RDV
  - [ ] `PUT /api/appointments/{id}` - Modifier un RDV
  - [ ] `PATCH /api/appointments/{id}/status` - Changer le statut
  - [ ] `PATCH /api/appointments/{id}/confirm` - Confirmer un RDV
  - [ ] `DELETE /api/appointments/{id}` - Supprimer un RDV

### Tests
- [ ] Créer des appointments de test
- [ ] Tester le filtrage par semaine (`weekOffset`)
- [ ] Tester le drag & drop (changement de date/heure)
- [ ] Tester la confirmation des RDV proposés

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Appointments

---

## 💬 Phase 7: Remarks avec Images (1-2h)

### Entités
- [ ] Créer `Remark.java` (entity)
- [ ] Ajouter champ `images` (List<String>) avec `@ElementCollection`
- [ ] Créer table `remark_images` pour stocker les URLs/base64
- [ ] Créer `RemarkRepository.java`

### DTOs
- [ ] Créer `RemarkDTO.java` avec champ `images`
- [ ] Créer `CreateRemarkRequest.java` avec champ `images`
- [ ] Créer `UpdateRemarkRequest.java` avec champ `images`

### Service
- [ ] Créer `RemarkService.java`
  - [ ] Méthode `getRemarksByClientId(clientId)`
  - [ ] Méthode `createRemark(clientId, content, images)`
  - [ ] Méthode `updateRemark(id, content, images)`
  - [ ] Méthode `deleteRemark(id)`
  - [ ] (Optionnel) Méthode `saveImage(file)` pour upload séparé
  - [ ] Validation: au moins contenu OU images requis

### API
- [ ] Créer `RemarkController.java`
  - [ ] `GET /api/clients/{clientId}/remarks` - Remarques d'un client (avec images)
  - [ ] `POST /api/clients/{clientId}/remarks` - Ajouter une remarque (avec images)
  - [ ] `PUT /api/remarks/{id}` - Modifier une remarque (avec images)
  - [ ] `DELETE /api/remarks/{id}` - Supprimer une remarque
  - [ ] (Optionnel) `POST /api/remarks/upload-image` - Upload image séparé

### Configuration (si stockage fichier)
- [ ] Créer `WebConfig.java` pour servir les images uploadées
- [ ] Configurer le répertoire de stockage
- [ ] Ajouter validation (taille max, types MIME)

### Tests
- [ ] Créer des remarques de test avec images
- [ ] Tester upload d'images en base64
- [ ] Tester affichage des images dans le frontend
- [ ] Vérifier l'ordre (plus récent en premier)
- [ ] Tester validation (contenu OU images requis)

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Remarks  
**📖 Exemples:** `/api/SPRING_BOOT_EXAMPLES.md` - Section Gestion des Remarks avec Images

---

## 📊 Phase 8: Dashboard Stats (1h)

### DTOs
- [ ] Créer `DashboardStatsDTO.java`
- [ ] Créer `UpcomingAppointmentDTO.java`
- [ ] Créer `RecentActivityDTO.java`

### Service
- [ ] Créer `DashboardService.java`
  - [ ] Méthode `getStats()`
  - [ ] Calculer: totalClients
  - [ ] Calculer: activeProjects
  - [ ] Calculer: pendingAppointments
  - [ ] Calculer: completedThisMonth
  - [ ] Récupérer: upcomingAppointments
  - [ ] Récupérer: recentActivities

### API
- [ ] Créer `DashboardController.java`
  - [ ] `GET /api/dashboard/stats` - Statistiques du dashboard

### Tests
- [ ] Tester l'endpoint
- [ ] Vérifier que les calculs sont corrects

**📖 Référence:** `/api/API_DOCUMENTATION.md` - Section Dashboard

---

## 🔧 Phase 9: Améliorations (2-3h)

### Gestion d'erreurs
- [ ] Créer `GlobalExceptionHandler.java` (@ControllerAdvice)
- [ ] Gérer `NotFoundException`
- [ ] Gérer `UnauthorizedException`
- [ ] Gérer `ValidationException`
- [ ] Retourner des erreurs au format JSON standard

### Validation
- [ ] Ajouter `@Valid` sur les controllers
- [ ] Ajouter annotations de validation sur les DTOs
  - [ ] `@NotNull`, `@NotBlank`, `@Email`, `@Size`, etc.

### Security complète
- [ ] Implémenter `JwtAuthenticationFilter.java`
- [ ] Activer la vérification JWT sur tous les endpoints (sauf /login)
- [ ] Tester l'authentification complète

### Performance
- [ ] Optimiser les requêtes (éviter N+1)
- [ ] Ajouter des index sur les colonnes fréquemment recherchées
- [ ] Utiliser `@EntityGraph` ou `JOIN FETCH` si nécessaire

### Documentation
- [ ] Ajouter Swagger/OpenAPI (optionnel)
- [ ] Documenter les endpoints

---

## ✅ Phase 10: Tests & Déploiement

### Tests
- [ ] Écrire des tests unitaires pour les services
- [ ] Écrire des tests d'intégration pour les controllers
- [ ] Tester tous les cas d'erreur

### Migration vers PostgreSQL
- [ ] Installer PostgreSQL
- [ ] Modifier `application.properties`
- [ ] Créer la base de données
- [ ] Tester la connexion
- [ ] Migrer les données de test

### Connexion Frontend
- [ ] Backend démarré sur `http://localhost:8080`
- [ ] Modifier `/api/config.ts` : `USE_MOCK_DATA: false`
- [ ] Tester le login dans l'app frontend
- [ ] Tester toutes les pages
- [ ] Corriger les bugs éventuels

### Production
- [ ] Configurer les variables d'environnement
- [ ] Sécuriser le JWT secret
- [ ] Configurer HTTPS
- [ ] Déployer sur un serveur (Heroku, AWS, etc.)

---

## 📊 Progression

**Phase 1:** ⬜ Setup Initial  
**Phase 2:** ⬜ Authentification  
**Phase 3:** ⬜ Clients  
**Phase 4:** ⬜ Projects  
**Phase 5:** ⬜ Interventions  
**Phase 6:** ⬜ Appointments  
**Phase 7:** ⬜ Remarks  
**Phase 8:** ⬜ Dashboard Stats  
**Phase 9:** ⬜ Améliorations  
**Phase 10:** ⬜ Tests & Déploiement  

---

## 📝 Notes

- Commencez par la Phase 1 et suivez l'ordre
- Testez chaque phase avant de passer à la suivante
- Utilisez H2 pour démarrer rapidement, puis migrez vers PostgreSQL
- Consultez `/api/SPRING_BOOT_EXAMPLES.md` pour des exemples de code
- Consultez `/api/API_DOCUMENTATION.md` pour les spécifications exactes

**Temps estimé total:** 15-20 heures pour une implémentation complète

---

## 🎯 Objectif

Avoir un backend Spring Boot complet qui répond à tous les endpoints documentés et qui fonctionne parfaitement avec le frontend React.

**Bon courage ! 🚀**
