# API Documentation - Application Paysagiste

Documentation complète des endpoints à implémenter dans votre backend Spring Boot.

## Configuration

**Base URL:** `http://localhost:8080/api`

**Headers requis:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

---

## 🔐 Authentication

### POST /api/auth/login
Authentification d'un utilisateur

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "company": "string"
  }
}
```

**Response 401:**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout
Déconnexion de l'utilisateur

**Response 200:**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me
Récupérer l'utilisateur connecté

**Response 200:**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "company": "string"
}
```

---

## 👥 Clients

### GET /api/clients
Récupérer tous les clients du paysagiste connecté

**Query Parameters:**
- `search` (optional): Recherche par nom

**Response 200:**
```json
[
  {
    "id": "number",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "access": "string | null (informations d'accès, code portail, etc.)",
    "hasKey": "boolean (indique si le paysagiste a une clé)",
    "type": "particulier | professionnel",
    "status": "actif | inactif",
    "createdAt": "ISO date string"
  }
]
```

---

### GET /api/clients/{id}
Récupérer un client spécifique

**Response 200:**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "access": "string | null (informations d'accès, code portail, etc.)",
  "hasKey": "boolean (indique si le paysagiste a une clé)",
  "type": "particulier | professionnel",
  "status": "actif | inactif",
  "createdAt": "ISO date string"
}
```

**Response 404:**
```json
{
  "error": "Client not found"
}
```

---

### POST /api/clients
Créer un nouveau client

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "access": "string | null (optionnel)",
  "hasKey": "boolean (optionnel, défaut: false)",
  "type": "particulier | professionnel"
}
```

**Response 201:**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "access": "string | null",
  "hasKey": "boolean",
  "type": "particulier | professionnel",
  "status": "actif",
  "createdAt": "ISO date string"
}
```

---

### PUT /api/clients/{id}
Mettre à jour un client

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "access": "string | null",
  "hasKey": "boolean",
  "type": "particulier | professionnel",
  "status": "actif | inactif"
}
```

**Response 200:**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "access": "string | null",
  "hasKey": "boolean",
  "type": "particulier | professionnel",
  "status": "actif | inactif",
  "createdAt": "ISO date string"
}
```

---

### DELETE /api/clients/{id}
Supprimer un client

**Response 204:** No content

---

## 🏗️ Projects (Chantiers)

### GET /api/projects
Récupérer tous les projets

**Query Parameters:**
- `clientId` (optional): Filtrer par client
- `status` (optional): Filtrer par statut

**Response 200:**
```json
[
  {
    "id": "number",
    "clientId": "number",
    "clientName": "string",
    "title": "string",
    "description": "string",
    "status": "en_cours | termine | en_attente",
    "startDate": "ISO date string",
    "endDate": "ISO date string | null",
    "location": "string",
    "budget": "number | null",
    "createdAt": "ISO date string"
  }
]
```

---

### GET /api/projects/{id}
Récupérer un projet spécifique

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "title": "string",
  "description": "string",
  "status": "en_cours | termine | en_attente",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "location": "string",
  "budget": "number | null",
  "createdAt": "ISO date string"
}
```

---

### POST /api/projects
Créer un nouveau projet

**Request Body:**
```json
{
  "clientId": "number",
  "title": "string",
  "description": "string",
  "status": "en_cours | termine | en_attente",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "location": "string",
  "budget": "number | null"
}
```

**Response 201:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "title": "string",
  "description": "string",
  "status": "en_cours | termine | en_attente",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "location": "string",
  "budget": "number | null",
  "createdAt": "ISO date string"
}
```

---

### PUT /api/projects/{id}
Mettre à jour un projet

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "en_cours | termine | en_attente",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "location": "string",
  "budget": "number | null"
}
```

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "title": "string",
  "description": "string",
  "status": "en_cours | termine | en_attente",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "location": "string",
  "budget": "number | null",
  "createdAt": "ISO date string"
}
```

---

### DELETE /api/projects/{id}
Supprimer un projet

**Response 204:** No content

---

## 🔧 Interventions

### GET /api/interventions
Récupérer toutes les interventions

**Query Parameters:**
- `clientId` (optional): Filtrer par client
- `projectId` (optional): Filtrer par projet
- `type` (optional): `ponctuelle | recurrente`

**Response 200:**
```json
[
  {
    "id": "number",
    "clientId": "number",
    "clientName": "string",
    "projectId": "number | null",
    "projectName": "string | null",
    "type": "ponctuelle | recurrente",
    "title": "string",
    "description": "string",
    "status": "planifiee | en_cours | terminee | annulee",
    "startDate": "ISO date string",
    "endDate": "ISO date string | null",
    "frequency": "hebdomadaire | mensuelle | null",
    "occurrences": "number | null",
    "createdAt": "ISO date string"
  }
]
```

---

### GET /api/interventions/{id}
Récupérer une intervention spécifique

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "projectId": "number | null",
  "projectName": "string | null",
  "type": "ponctuelle | recurrente",
  "title": "string",
  "description": "string",
  "status": "planifiee | en_cours | terminee | annulee",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "frequency": "hebdomadaire | mensuelle | null",
  "occurrences": "number | null",
  "createdAt": "ISO date string"
}
```

---

### POST /api/interventions
Créer une nouvelle intervention

**Request Body:**
```json
{
  "clientId": "number",
  "projectId": "number | null",
  "type": "ponctuelle | recurrente",
  "title": "string",
  "description": "string",
  "status": "planifiee | en_cours | terminee | annulee",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "frequency": "hebdomadaire | mensuelle | null",
  "occurrences": "number | null"
}
```

**Response 201:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "projectId": "number | null",
  "projectName": "string | null",
  "type": "ponctuelle | recurrente",
  "title": "string",
  "description": "string",
  "status": "planifiee | en_cours | terminee | annulee",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "frequency": "hebdomadaire | mensuelle | null",
  "occurrences": "number | null",
  "createdAt": "ISO date string"
}
```

---

### PUT /api/interventions/{id}
Mettre à jour une intervention

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "planifiee | en_cours | terminee | annulee",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null"
}
```

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "projectId": "number | null",
  "projectName": "string | null",
  "type": "ponctuelle | recurrente",
  "title": "string",
  "description": "string",
  "status": "planifiee | en_cours | terminee | annulee",
  "startDate": "ISO date string",
  "endDate": "ISO date string | null",
  "frequency": "hebdomadaire | mensuelle | null",
  "occurrences": "number | null",
  "createdAt": "ISO date string"
}
```

---

### DELETE /api/interventions/{id}
Supprimer une intervention

**Response 204:** No content

---

## 📅 Calendar Events (Planning)

### GET /api/calendar/events
Récupérer les événements du planning (chantiers, rdv, prospection)

**Query Parameters:**
- `weekOffset` (optional): Décalage de semaine (0 = semaine actuelle, 1 = semaine suivante, -1 = semaine précédente)
- `startDate` (optional): Date de début (ISO format)
- `endDate` (optional): Date de fin (ISO format)
- `eventType` (optional): Filtrer par type d'événement (`chantier | rdv | prospection | autre`)
- `includeUnscheduled` (optional): Inclure les événements non programmés (sans date)

**Response 200:**
```json
[
  {
    "id": "number",
    "eventType": "chantier | rdv | prospection | autre",
    "clientId": "number",
    "clientName": "string",
    "interventionId": "number | null",
    "chantierId": "number | null (référence au chantier si eventType === 'chantier')",
    "dayIndex": "number (0-6)",
    "date": "ISO date string | null (null si non programmé)",
    "startTime": "string (HH:MM) | null",
    "duration": "number (en minutes)",
    "title": "string",
    "description": "string",
    "location": "string",
    "status": "proposed | confirmed | in-progress | completed | cancelled",
    "isRecurring": "boolean",
    "daysSinceLastChantier": "number | null (pour chantiers récurrents uniquement)",
    "notes": "string | null",
    "createdAt": "ISO date string"
  }
]
```

**Notes importantes:**
- `eventType`: Détermine le type d'événement et influence la couleur d'affichage
  - `chantier`: Événement de travail (jaune/vert/bleu selon le statut)
  - `rdv`: Rendez-vous avec un client (violet)
  - `prospection`: Rendez-vous de prospection (violet)
  - `autre`: Autre type d'événement (violet)
- `daysSinceLastChantier`: Calculé automatiquement par le backend pour les chantiers récurrents. Représente le nombre de jours écoulés depuis le dernier chantier de la même intervention récurrente.
- `date` et `startTime` peuvent être `null` pour les événements "à programmer" (non encore planifiés)

---

### GET /api/appointments
**[DEPRECATED - Utilisez /api/calendar/events à la place]**

Récupérer les rendez-vous du planning (ancien endpoint)

**Query Parameters:**
- `weekOffset` (optional): Décalage de semaine (0 = semaine actuelle, 1 = semaine suivante, -1 = semaine précédente)
- `startDate` (optional): Date de début (ISO format)
- `endDate` (optional): Date de fin (ISO format)

**Response 200:**
```json
[
  {
    "id": "number",
    "clientId": "number",
    "clientName": "string",
    "interventionId": "number | null",
    "dayIndex": "number (0-6)",
    "date": "ISO date string",
    "startTime": "string (HH:MM)",
    "duration": "number (heures, peut être décimal: 1.5)",
    "type": "string",
    "location": "string",
    "status": "proposed | confirmed | manual",
    "isRecurring": "boolean",
    "completed": "boolean",
    "eventType": "chantier | rdv | prospection | autre (nouveau)",
    "daysSinceLastChantier": "number | null (nouveau)",
    "createdAt": "ISO date string"
  }
]
```

---

### GET /api/appointments/{id}
Récupérer un rendez-vous spécifique

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "interventionId": "number | null",
  "dayIndex": "number (0-6)",
  "date": "ISO date string",
  "startTime": "string (HH:MM)",
  "duration": "number",
  "type": "string",
  "location": "string",
  "status": "proposed | confirmed | manual",
  "isRecurring": "boolean",
  "completed": "boolean",
  "createdAt": "ISO date string"
}
```

---

### POST /api/calendar/events
Créer un nouvel événement au planning

**Request Body:**
```json
{
  "eventType": "chantier | rdv | prospection | autre",
  "clientId": "number",
  "interventionId": "number | null",
  "chantierId": "number | null",
  "date": "ISO date string | null (null si non programmé)",
  "startTime": "string (HH:MM) | null",
  "duration": "number (en minutes)",
  "title": "string",
  "description": "string",
  "location": "string",
  "status": "proposed | confirmed | in-progress | completed | cancelled",
  "notes": "string | null (optionnel)"
}
```

**Response 201:**
```json
{
  "id": "number",
  "eventType": "chantier | rdv | prospection | autre",
  "clientId": "number",
  "clientName": "string",
  "interventionId": "number | null",
  "chantierId": "number | null",
  "dayIndex": "number (0-6) | null",
  "date": "ISO date string | null",
  "startTime": "string (HH:MM) | null",
  "duration": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "status": "proposed | confirmed | in-progress | completed | cancelled",
  "isRecurring": "boolean",
  "daysSinceLastChantier": "number | null",
  "notes": "string | null",
  "createdAt": "ISO date string"
}
```

---

### POST /api/appointments
**[DEPRECATED - Utilisez /api/calendar/events à la place]**

Créer un nouveau rendez-vous (ancien endpoint)

**Request Body:**
```json
{
  "clientId": "number",
  "interventionId": "number | null",
  "date": "ISO date string",
  "startTime": "string (HH:MM)",
  "duration": "number",
  "type": "string",
  "location": "string",
  "status": "proposed | confirmed | manual",
  "isRecurring": "boolean",
  "eventType": "chantier | rdv | prospection | autre (nouveau)",
  "completed": "boolean (optionnel, défaut: false)"
}
```

**Response 201:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "interventionId": "number | null",
  "dayIndex": "number (0-6)",
  "date": "ISO date string",
  "startTime": "string (HH:MM)",
  "duration": "number",
  "type": "string",
  "location": "string",
  "status": "proposed | confirmed | manual",
  "isRecurring": "boolean",
  "eventType": "chantier | rdv | prospection | autre",
  "daysSinceLastChantier": "number | null",
  "completed": "boolean",
  "createdAt": "ISO date string"
}
```

---

### PUT /api/calendar/events/{id}
Mettre à jour un événement (déplacement dans le planning, modification des informations)

**Request Body:**
```json
{
  "date": "ISO date string | null",
  "startTime": "string (HH:MM) | null",
  "duration": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "status": "proposed | confirmed | in-progress | completed | cancelled",
  "notes": "string | null"
}
```

**Response 200:**
```json
{
  "id": "number",
  "eventType": "chantier | rdv | prospection | autre",
  "clientId": "number",
  "clientName": "string",
  "interventionId": "number | null",
  "chantierId": "number | null",
  "dayIndex": "number (0-6) | null",
  "date": "ISO date string | null",
  "startTime": "string (HH:MM) | null",
  "duration": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "status": "proposed | confirmed | in-progress | completed | cancelled",
  "isRecurring": "boolean",
  "daysSinceLastChantier": "number | null",
  "notes": "string | null",
  "createdAt": "ISO date string"
}
```

**Note:** Lorsque vous modifiez la date d'un chantier récurrent, le backend doit recalculer automatiquement `daysSinceLastChantier`.

---

### PUT /api/appointments/{id}
**[DEPRECATED - Utilisez /api/calendar/events/{id} à la place]**

Mettre à jour un rendez-vous (déplacement dans le planning)

**Request Body:**
```json
{
  "date": "ISO date string",
  "startTime": "string (HH:MM)",
  "duration": "number",
  "type": "string",
  "location": "string"
}
```

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "clientName": "string",
  "interventionId": "number | null",
  "dayIndex": "number (0-6)",
  "date": "ISO date string",
  "startTime": "string (HH:MM)",
  "duration": "number",
  "type": "string",
  "location": "string",
  "status": "proposed | confirmed | manual",
  "isRecurring": "boolean",
  "eventType": "chantier | rdv | prospection | autre",
  "daysSinceLastChantier": "number | null",
  "completed": "boolean",
  "createdAt": "ISO date string"
}
```

---

### PATCH /api/appointments/{id}/status
Changer le statut d'un rendez-vous

**Request Body:**
```json
{
  "status": "proposed | confirmed | manual"
}
```

**Response 200:**
```json
{
  "id": "number",
  "status": "proposed | confirmed | manual"
}
```

---

### PATCH /api/appointments/{id}/confirm
Confirmer un rendez-vous proposé (passer de "proposed" à "confirmed")

**Response 200:**
```json
{
  "id": "number",
  "status": "confirmed"
}
```

---

### PATCH /api/appointments/{id}/completed
Marquer un rendez-vous comme effectué ou non effectué

**Request Body:**
```json
{
  "completed": "boolean"
}
```

**Response 200:**
```json
{
  "id": "number",
  "completed": "boolean"
}
```

**Exemple d'utilisation:**
```javascript
// Marquer comme effectué
await appointmentsAPI.markAsCompleted(appointmentId, true);

// Marquer comme non effectué
await appointmentsAPI.markAsCompleted(appointmentId, false);
```

---

### DELETE /api/appointments/{id}
Supprimer un rendez-vous

**Response 204:** No content

---

## 💬 Remarks (Remarques Client)

### GET /api/clients/{clientId}/remarks
Récupérer toutes les remarques d'un client

**Response 200:**
```json
[
  {
    "id": "number",
    "clientId": "number",
    "content": "string",
    "images": ["string (base64 or URL)"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
]
```

---

### POST /api/clients/{clientId}/remarks
Ajouter une remarque à un client

**Request Body:**
```json
{
  "content": "string",
  "images": ["string (base64 encoded images or URLs)"]
}
```

**Note:** Le champ `content` peut être vide si des images sont fournies. Au moins un des deux (content ou images) doit être fourni.

**Response 201:**
```json
{
  "id": "number",
  "clientId": "number",
  "content": "string",
  "images": ["string"],
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

### PUT /api/remarks/{id}
Modifier une remarque

**Request Body:**
```json
{
  "content": "string",
  "images": ["string (base64 encoded images or URLs)"]
}
```

**Response 200:**
```json
{
  "id": "number",
  "clientId": "number",
  "content": "string",
  "images": ["string"],
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

### DELETE /api/remarks/{id}
Supprimer une remarque

**Response 204:** No content

---

### POST /api/remarks/upload-image
Upload d'une image pour une remarque (optionnel - alternative à l'envoi en base64)

**Request:** `multipart/form-data`
- `image`: fichier image (JPEG, PNG, etc.)

**Response 201:**
```json
{
  "imageUrl": "string (URL de l'image uploadée)"
}
```

**Note:** Cette méthode est optionnelle. Vous pouvez soit :
1. Envoyer les images en base64 directement dans le body de POST/PUT remarks
2. Utiliser cet endpoint pour upload les images séparément et récupérer des URLs

---

## 📊 Dashboard Statistics

### GET /api/dashboard/stats
Récupérer les statistiques pour le tableau de bord

**Response 200:**
```json
{
  "totalClients": "number",
  "activeProjects": "number",
  "pendingAppointments": "number",
  "completedThisMonth": "number",
  "revenueThisMonth": "number | null",
  "upcomingAppointments": [
    {
      "id": "number",
      "clientName": "string",
      "clientPhone": "string",
      "clientAddress": "string",
      "clientAccess": "string | null",
      "clientHasKey": "boolean",
      "type": "string",
      "date": "ISO date string",
      "time": "string (HH:MM)"
    }
  ],
  "recentActivities": [
    {
      "id": "number",
      "type": "client_added | project_created | appointment_confirmed",
      "description": "string",
      "timestamp": "ISO date string"
    }
  ]
}
```

---

## 🔒 Gestion des erreurs

Tous les endpoints doivent renvoyer des erreurs au format JSON :

**Response 400 - Bad Request:**
```json
{
  "error": "Invalid request",
  "details": "Description du problème"
}
```

**Response 401 - Unauthorized:**
```json
{
  "error": "Unauthorized",
  "details": "Token invalide ou expiré"
}
```

**Response 403 - Forbidden:**
```json
{
  "error": "Forbidden",
  "details": "Vous n'avez pas accès à cette ressource"
}
```

**Response 404 - Not Found:**
```json
{
  "error": "Not found",
  "details": "Ressource non trouvée"
}
```

**Response 500 - Internal Server Error:**
```json
{
  "error": "Internal server error",
  "details": "Message d'erreur technique"
}
```

---

## 📝 Notes d'implémentation

1. **Authentification**: Utilisez JWT pour les tokens d'authentification
2. **CORS**: Configurez CORS pour accepter les requêtes du frontend
3. **Validation**: Validez toutes les données en entrée
4. **Pagination**: Ajoutez la pagination pour les listes longues (optionnel pour v1)
5. **Filtres**: Implémentez les filtres de recherche et de tri
6. **Dates**: Utilisez le format ISO 8601 pour toutes les dates
7. **Multi-tenant**: Assurez-vous que chaque paysagiste ne voit que ses propres données
8. **Calculs automatiques**: 
   - Pour `dayIndex` dans les appointments, calculez-le automatiquement à partir de la date (0=Dimanche, 1=Lundi, etc.)
   - Pour `daysSinceLastChantier` : Calculez automatiquement le nombre de jours entre la date de l'événement actuel et la date du dernier chantier **confirmé ou terminé** de la même intervention récurrente (même `interventionId`). Ce champ doit être recalculé à chaque modification de date.
9. **Types d'événements**: 
   - Les événements de type `chantier` s'affichent avec les couleurs standards (jaune/vert/bleu)
   - Les événements de type `rdv`, `prospection` et `autre` s'affichent en violet
   - Seuls les chantiers (`eventType === 'chantier'`) peuvent avoir un `chantierId` et `daysSinceLastChantier`

---

## 🚀 Ordre d'implémentation recommandé

1. ✅ Authentication (`/api/auth/*`)
2. ✅ Clients (`/api/clients/*`)
3. ✅ Projects (`/api/projects/*`)
4. ✅ Interventions (`/api/interventions/*`)
5. ✅ Appointments (`/api/appointments/*`)
6. ✅ Remarks (`/api/clients/{id}/remarks`)
7. ✅ Dashboard Stats (`/api/dashboard/stats`)
