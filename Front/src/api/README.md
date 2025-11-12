# Guide d'intégration API - Backend Spring Boot

Ce dossier contient tout ce dont vous avez besoin pour connecter l'application frontend à votre backend Spring Boot.

## 📁 Structure des fichiers

```
/api/
├── README.md              # Ce fichier
├── API_DOCUMENTATION.md   # Documentation complète de toutes les APIs à implémenter
├── config.ts             # Configuration (basculer entre mock et API réelle)
├── apiClient.ts          # Client API avec toutes les fonctions d'appel
└── mockData.ts           # Données mockées pour le développement
```

## 🚀 Démarrage rapide

### Mode actuel : MOCK (données simulées)

L'application fonctionne actuellement avec des données mockées. Aucun backend n'est requis.

### Passer en mode API réelle

1. **Démarrez votre backend Spring Boot** sur `http://localhost:8080`

2. **Modifiez `/api/config.ts`** :
   ```typescript
   export const API_CONFIG = {
     USE_MOCK_DATA: false,  // Changez à false
     API_BASE_URL: 'http://localhost:8080/api',
     // ...
   };
   ```

3. **C'est tout !** L'application va maintenant faire de vrais appels API.

## 📖 Documentation des APIs

Consultez `/api/API_DOCUMENTATION.md` pour la documentation complète de toutes les APIs à implémenter.

### Résumé des endpoints

#### Authentication
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

#### Clients
- `GET /api/clients` - Liste des clients
- `GET /api/clients/{id}` - Détails d'un client
- `POST /api/clients` - Créer un client
- `PUT /api/clients/{id}` - Modifier un client
- `DELETE /api/clients/{id}` - Supprimer un client

#### Projects
- `GET /api/projects` - Liste des projets
- `GET /api/projects/{id}` - Détails d'un projet
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/{id}` - Modifier un projet
- `DELETE /api/projects/{id}` - Supprimer un projet

#### Interventions
- `GET /api/interventions` - Liste des interventions
- `GET /api/interventions/{id}` - Détails d'une intervention
- `POST /api/interventions` - Créer une intervention
- `PUT /api/interventions/{id}` - Modifier une intervention
- `DELETE /api/interventions/{id}` - Supprimer une intervention

#### Appointments (Planning)
- `GET /api/appointments` - Liste des rendez-vous
- `GET /api/appointments/{id}` - Détails d'un rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/{id}` - Modifier un rendez-vous
- `PATCH /api/appointments/{id}/status` - Changer le statut
- `PATCH /api/appointments/{id}/confirm` - Confirmer un rendez-vous
- `DELETE /api/appointments/{id}` - Supprimer un rendez-vous

#### Remarks
- `GET /api/clients/{clientId}/remarks` - Remarques d'un client
- `POST /api/clients/{clientId}/remarks` - Ajouter une remarque
- `PUT /api/remarks/{id}` - Modifier une remarque
- `DELETE /api/remarks/{id}` - Supprimer une remarque

#### Dashboard
- `GET /api/dashboard/stats` - Statistiques du tableau de bord

## 💻 Utilisation dans le code

### Importer le client API

```typescript
import api from './api/apiClient';
// ou
import { clientsAPI, projectsAPI, appointmentsAPI } from './api/apiClient';
```

### Exemples d'utilisation

#### Authentification
```typescript
try {
  const { token, user } = await api.auth.login(email, password);
  console.log('Connecté:', user);
} catch (error) {
  console.error('Erreur de connexion:', error);
}
```

#### Récupérer des clients
```typescript
try {
  const clients = await api.clients.getAll();
  console.log('Clients:', clients);
} catch (error) {
  console.error('Erreur:', error);
}
```

#### Créer un client
```typescript
try {
  const newClient = await api.clients.create({
    name: 'Nouveau Client',
    email: 'client@example.com',
    phone: '06 12 34 56 78',
    address: '123 rue Example',
    type: 'particulier',
  });
  console.log('Client créé:', newClient);
} catch (error) {
  console.error('Erreur:', error);
}
```

#### Récupérer les rendez-vous de la semaine
```typescript
try {
  const appointments = await api.appointments.getAll({ weekOffset: 0 });
  console.log('Rendez-vous:', appointments);
} catch (error) {
  console.error('Erreur:', error);
}
```

#### Confirmer un rendez-vous
```typescript
try {
  const appointment = await api.appointments.confirm(appointmentId);
  console.log('Rendez-vous confirmé:', appointment);
} catch (error) {
  console.error('Erreur:', error);
}
```

## 🔐 Gestion de l'authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification.

### Flux d'authentification

1. **Login**: L'utilisateur se connecte avec email/password
2. **Token**: Le backend renvoie un token JWT
3. **Stockage**: Le token est sauvegardé dans `localStorage`
4. **Utilisation**: Le token est automatiquement ajouté à tous les appels API
5. **Logout**: Le token est supprimé du `localStorage`

### Headers automatiques

Le client API ajoute automatiquement ces headers :
```
Content-Type: application/json
Authorization: Bearer {token}
```

## 🛠️ Configuration Spring Boot

### CORS Configuration

Ajoutez cette configuration dans votre Spring Boot :

```java
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

### Security Configuration (JWT)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/**").authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

## 📊 Modèle de données recommandé

### Entités principales

1. **User** (Paysagiste)
   - id, name, email, password (hashed), company

2. **Client**
   - id, userId (FK), name, email, phone, address, type, status, createdAt

3. **Project**
   - id, userId (FK), clientId (FK), title, description, status, startDate, endDate, location, budget, createdAt

4. **Intervention**
   - id, userId (FK), clientId (FK), projectId (FK nullable), type, title, description, status, startDate, endDate, frequency, occurrences, createdAt

5. **Appointment**
   - id, userId (FK), clientId (FK), interventionId (FK nullable), date, startTime, duration, type, location, status, isRecurring, createdAt

6. **Remark**
   - id, clientId (FK), content, createdAt, updatedAt

### Relations

- Un User a plusieurs Clients, Projects, Interventions, Appointments
- Un Client a plusieurs Projects, Interventions, Appointments, Remarks
- Un Project appartient à un Client
- Une Intervention peut être liée à un Project
- Un Appointment peut être lié à une Intervention

## 🧪 Test de l'API

### Avec le mode Mock activé

Toutes les données sont simulées et stockées en mémoire (perdu au rechargement).

### Avec l'API réelle

1. Démarrez votre backend Spring Boot
2. Testez avec curl ou Postman :

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Récupérer les clients (avec token)
curl -X GET http://localhost:8080/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Debug

### Activer les logs

Dans `/api/config.ts` :
```typescript
DEBUG: true  // Affiche tous les appels API dans la console
```

### Erreurs communes

**CORS Error**: Vérifiez la configuration CORS de Spring Boot

**401 Unauthorized**: Le token est invalide ou expiré, reconnectez-vous

**Network Error**: Le backend n'est pas démarré sur le bon port

**404 Not Found**: L'endpoint n'existe pas côté backend

## 📝 Ordre d'implémentation recommandé

1. ✅ Authentication (`/api/auth/*`)
2. ✅ Clients (`/api/clients/*`)
3. ✅ Projects (`/api/projects/*`)
4. ✅ Interventions (`/api/interventions/*`)
5. ✅ Appointments (`/api/appointments/*`)
6. ✅ Remarks (`/api/clients/{id}/remarks`)
7. ✅ Dashboard Stats (`/api/dashboard/stats`)

## 🔄 Migration des composants

Les composants suivants devront être mis à jour pour utiliser l'API :

- ✅ `LoginPage.tsx` - Login
- ✅ `Dashboard.tsx` - Stats
- ✅ `ClientsPage.tsx` - Liste clients
- ✅ `ClientDetailPage.tsx` - Détails client + remarques
- ✅ `ProjectsPage.tsx` - Liste projets/interventions
- ✅ `CalendarPage.tsx` - Planning

**Note**: Les composants fonctionnent actuellement avec des données mockées. Une fois l'API prête, il suffira de changer `USE_MOCK_DATA` à `false` dans `/api/config.ts`.

## 📞 Support

Si vous avez des questions sur l'implémentation :
1. Consultez `API_DOCUMENTATION.md` pour les détails des endpoints
2. Regardez les exemples dans `apiClient.ts`
3. Vérifiez les types TypeScript pour la structure des données
