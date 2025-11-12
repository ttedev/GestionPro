# 🆕 Mises à jour récentes - Application Paysagiste

## Date: 28 Octobre 2025

Ce document liste toutes les améliorations récentes apportées à l'application frontend.

---

## ✅ Améliorations de l'interface utilisateur

### 1. 🔐 Page de connexion

**Ajout du bouton "Connexion avec Google"**
- Bouton avec l'icône Google officielle
- Design cohérent avec le bouton de connexion standard
- Simulation de connexion avec le premier compte de démo
- Préparé pour intégration OAuth 2.0 future

**Fichier modifié:** `/components/LoginPage.tsx`

---

### 2. 📊 Dashboard

#### Suppression de la tuile "CA ce mois"
- Tuile de chiffre d'affaires retirée du tableau de bord
- Grid passé de 4 à 3 colonnes
- Interface plus épurée et focalisée sur l'essentiel

#### Interventions récentes cliquables
- Les cartes d'interventions sont maintenant des boutons cliquables
- Redirection automatique vers la fiche du client concerné
- Meilleure navigation dans l'application
- Effet hover pour indiquer l'interactivité

#### Lien "Voir tout" fonctionnel
- Le bouton "Voir tout" des interventions redirige vers la page projets
- Navigation cohérente dans l'application

#### Icône calendrier cliquable
- L'icône de calendrier dans "Rendez-vous du jour" est maintenant cliquable
- Redirige directement vers la vue planning
- Effet hover pour indiquer l'action possible

**Fichier modifié:** `/components/Dashboard.tsx`

---

### 3. 📅 Planning (CalendarPage)

**Correction du bug de changement de semaine** 🐛
- Ajout de la propriété `date` (format YYYY-MM-DD) à tous les appointments
- Implémentation d'un système de filtrage par semaine
- Les tuiles ne restent plus affichées quand on change de semaine
- Calcul automatique de la semaine à partir de la date
- Mise à jour de la date lors du drag & drop
- Les statistiques en bas utilisent maintenant les appointments filtrés

**Détails techniques:**
```typescript
// Avant
appointment = { dayIndex, startTime, duration, ... }

// Après
appointment = { 
  date: "2025-10-28",  // Date complète au format ISO
  dayIndex, 
  startTime, 
  duration, 
  ...
}
```

**Fichier modifié:** `/components/CalendarPage.tsx`

---

### 4. 👤 Page détail client (ClientDetailPage)

#### Remarques avec support d'images 📸

**Zone de saisie toujours visible**
- Plus besoin de cliquer sur "Ajouter une remarque"
- Zone de texte et bouton d'envoi directement accessibles en bas du bloc
- Amélioration de l'expérience utilisateur
- Raccourci clavier Ctrl+Enter pour envoyer

**Upload d'images**
- Bouton d'ajout d'images avec icône
- Support de la sélection multiple d'images
- Prévisualisation des images avant envoi avec miniatures
- Possibilité de supprimer des images de la preview
- Compteur d'images sélectionnées
- Validation: au moins du texte OU des images requis

**Affichage des images dans les remarques**
- Grille responsive (2-3 colonnes selon l'écran)
- Images cliquables pour ouverture en plein écran
- Hauteur fixe avec object-cover pour un rendu harmonieux
- Effet hover sur les images

**Suppression des remarques**
- Bouton de suppression (icône poubelle) visible au survol
- Confirmation avant suppression
- Animation smooth avec transition d'opacité

**Gestion des données:**
```typescript
remark = {
  id: number,
  date: string,
  time: string,
  text: string,
  images: string[]  // URLs ou base64
}
```

**Fichier modifié:** `/components/ClientDetailPage.tsx`

---

## 🔄 Modifications du backend nécessaires

### Endpoint Remarks mis à jour

#### GET /api/clients/{clientId}/remarks
**Response modifiée:**
```json
[
  {
    "id": "number",
    "clientId": "number",
    "content": "string",
    "images": ["string (base64 or URL)"],  // ← NOUVEAU
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
]
```

#### POST /api/clients/{clientId}/remarks
**Request Body modifié:**
```json
{
  "content": "string",  // Optionnel si images présentes
  "images": ["string (base64 encoded images or URLs)"]  // ← NOUVEAU
}
```

#### PUT /api/remarks/{id}
**Request Body modifié:**
```json
{
  "content": "string",
  "images": ["string"]  // ← NOUVEAU
}
```

#### POST /api/remarks/upload-image (NOUVEAU - Optionnel)
Endpoint pour upload d'images séparément

**Request:** `multipart/form-data`
- `image`: fichier image (JPEG, PNG, etc.)

**Response:**
```json
{
  "imageUrl": "string (URL de l'image uploadée)"
}
```

**Documentation mise à jour:**
- `/api/API_DOCUMENTATION.md` - Spécifications complètes
- `/api/SPRING_BOOT_EXAMPLES.md` - Exemples de code complet
- `/API_INTEGRATION_SUMMARY.md` - Résumé général

---

## 📋 Modèle de données mis à jour

### Appointment
```typescript
{
  id: number;
  clientId: number;
  clientName: string;
  interventionId?: number;
  dayIndex: number;        // 0-6 (0=Dimanche)
  date: string;            // ← NOUVEAU: format "YYYY-MM-DD"
  startTime: string;       // "HH:MM"
  duration: number;        // heures (peut être décimal: 1.5)
  type: string;
  location: string;
  status: 'proposed' | 'confirmed' | 'manual';
  isRecurring: boolean;
}
```

### Remark
```typescript
{
  id: number;
  date: string;
  time: string;
  text: string;
  images: string[];        // ← NOUVEAU: tableau d'URLs ou base64
}
```

---

## 🚀 Instructions de déploiement

### Pour le frontend (déjà fait ✅)
Toutes les modifications sont déjà intégrées et fonctionnelles en mode mock.

### Pour le backend (à faire)

1. **Mettre à jour l'entité Remark**
   ```java
   @ElementCollection
   @CollectionTable(name = "remark_images")
   @Column(name = "image_data", columnDefinition = "TEXT")
   private List<String> images = new ArrayList<>();
   ```

2. **Mettre à jour RemarkController**
   - Accepter le champ `images` dans CreateRemarkRequest
   - Accepter le champ `images` dans UpdateRemarkRequest
   - Optionnel: ajouter l'endpoint POST /api/remarks/upload-image

3. **Mettre à jour l'entité Appointment**
   ```java
   @Column(nullable = false)
   private LocalDate date;
   ```

4. **Tester les nouveaux endpoints**
   - POST avec images en base64
   - GET retournant les images
   - Affichage correct dans le frontend

5. **Considérations de production**
   - Limiter la taille des uploads (ex: 5MB par image)
   - Valider les types MIME (JPEG, PNG uniquement)
   - Option de stockage cloud (S3, etc.) pour production
   - Optimisation des images (compression, thumbnails)

---

## 📝 Notes pour le développement

### Stockage des images

**3 options disponibles:**

1. **Base64 en BDD (Simple - Recommandé pour MVP)**
   - Stockage direct dans la colonne `images`
   - Pas de gestion de fichiers
   - ⚠️ Augmente la taille de la BDD

2. **Stockage fichier local**
   - Upload via multipart/form-data
   - Stockage dans `/uploads/remarks/{userId}/`
   - Servir via Spring MVC
   - Configuration nécessaire dans WebConfig

3. **Cloud Storage (Production)**
   - AWS S3, Google Cloud Storage, Azure Blob
   - URLs publiques ou signées
   - Meilleure scalabilité
   - Coûts à prévoir

### Validation recommandée

```java
@PostMapping("/clients/{clientId}/remarks")
public ResponseEntity<RemarkDTO> createRemark(...) {
    // Validation: au moins contenu ou images
    if ((request.getContent() == null || request.getContent().trim().isEmpty()) &&
        (request.getImages() == null || request.getImages().isEmpty())) {
        throw new BadRequestException("Content or images required");
    }
    
    // Validation: limite de taille pour base64
    if (request.getImages() != null) {
        for (String image : request.getImages()) {
            if (image.length() > 5_000_000) { // ~5MB
                throw new BadRequestException("Image too large");
            }
        }
    }
    
    // ...
}
```

---

## 🎯 Résumé des changements

| Composant | Changement | Impact Backend |
|-----------|-----------|----------------|
| LoginPage | Bouton Google ajouté | Aucun (préparation OAuth future) |
| Dashboard | Tuile CA supprimée | Aucun |
| Dashboard | Interventions cliquables | Aucun |
| Dashboard | Liens fonctionnels | Aucun |
| CalendarPage | Bug semaines corrigé | Champ `date` dans Appointment |
| ClientDetailPage | UI remarques améliorée | Champ `images` dans Remark |
| ClientDetailPage | Support images | Endpoint upload optionnel |

---

## ✅ Checklist de mise à jour backend

- [ ] Ajouter le champ `date` à l'entité Appointment
- [ ] Ajouter le champ `images` (List<String>) à l'entité Remark
- [ ] Créer la table `remark_images` (ElementCollection)
- [ ] Mettre à jour RemarkController (accepter images)
- [ ] Mettre à jour RemarkService (gérer images)
- [ ] Ajouter validation (taille, type MIME)
- [ ] (Optionnel) Ajouter endpoint upload d'images
- [ ] (Optionnel) Configurer stockage fichiers
- [ ] Tester avec Postman
- [ ] Tester avec le frontend

---

## 📚 Ressources

- **Documentation API complète:** `/api/API_DOCUMENTATION.md`
- **Exemples Spring Boot:** `/api/SPRING_BOOT_EXAMPLES.md`
- **Guide de démarrage:** `/api/QUICKSTART_SPRINGBOOT.md`
- **Checklist d'implémentation:** `/api/IMPLEMENTATION_CHECKLIST.md`

---

---

## Date: 28 Octobre 2025 (Mise à jour 2)

### 5. 📅 Planning - Types d'événements et chantiers récurrents

**Distinction chantiers / événements** 🎨
- Ajout du type `EventType` : `'chantier' | 'rdv' | 'prospection' | 'autre'`
- Les chantiers s'affichent avec les couleurs standards (jaune/vert/bleu)
- Les événements (rdv, prospection) s'affichent en **violet**
- Meilleure distinction visuelle dans le planning

**Badge de suivi pour chantiers récurrents** 📊
- Affichage d'une bulle avec le nombre de jours depuis le dernier chantier
- Exemple: "+7j", "+14j", "+21j"
- Calculé automatiquement par le backend
- Visible uniquement pour les chantiers récurrents

**Panneau latéral rétractable** 🎯
- La liste "À programmer" peut maintenant se rétracter horizontalement
- Barre verticale étroite quand fermée avec icône et compteur
- Transition fluide pour une meilleure UX
- Plus d'espace pour le calendrier

**Fichiers modifiés:**
- `/components/CalendarPage.tsx`
- `/types/index.ts` - Ajout de `EventType` et `CalendarEvent`
- `/api/apiClient.ts` - Nouveau `calendarEventsAPI`
- `/api/API_DOCUMENTATION.md` - Documentation des nouveaux endpoints
- `/NEW_DATA_MODEL.md` - Modèle de données mis à jour

---

## 🔄 Nouvelles modifications backend nécessaires

### Nouveaux types et champs

#### EventType
```typescript
type EventType = 'chantier' | 'rdv' | 'prospection' | 'autre';
```

#### CalendarEvent (nouveau)
```typescript
{
  id: number;
  eventType: EventType;              // ← NOUVEAU
  clientId: number;
  clientName: string;
  interventionId: number | null;
  chantierId: number | null;         // ← NOUVEAU
  dayIndex: number | null;
  date: string | null;                // null si non programmé
  startTime: string | null;
  duration: number;                   // en minutes
  title: string;
  description: string;
  location: string;
  status: 'proposed' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  isRecurring: boolean;
  daysSinceLastChantier: number | null;  // ← NOUVEAU - Calculé automatiquement
  notes: string | null;
  createdAt: string;
}
```

#### Chantier (mis à jour)
```typescript
{
  // ... champs existants
  eventType: EventType;                    // ← NOUVEAU
  daysSinceLastChantier: number | null;    // ← NOUVEAU
}
```

### Nouveaux endpoints

#### GET /api/calendar/events
Remplace `/api/appointments` avec support des nouveaux champs

**Query Parameters:**
- `weekOffset` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `eventType` (optional): Filtrer par type
- `includeUnscheduled` (optional): Inclure événements non programmés

**Response:** Voir documentation complète dans `/api/API_DOCUMENTATION.md`

#### POST /api/calendar/events
Créer un nouvel événement avec support du type

#### PUT /api/calendar/events/{id}
Mettre à jour un événement (recalcule `daysSinceLastChantier`)

### Calcul automatique de daysSinceLastChantier

**Logique backend:**
```java
// Pour chaque chantier récurrent, calculer le nombre de jours depuis 
// le dernier chantier CONFIRMÉ ou TERMINÉ de la même intervention
public Integer calculateDaysSinceLastChantier(CalendarEvent event) {
    if (event.getEventType() != EventType.CHANTIER || 
        event.getInterventionId() == null || 
        event.getDate() == null) {
        return null;
    }
    
    // Trouver le dernier chantier confirmé/terminé de la même intervention
    Optional<CalendarEvent> lastChantier = repository
        .findLastCompletedChantierByInterventionId(
            event.getInterventionId(),
            event.getDate(),
            List.of(Status.CONFIRMED, Status.COMPLETED)
        );
    
    if (lastChantier.isEmpty()) {
        return null; // Pas de chantier précédent
    }
    
    // Calculer la différence en jours
    return ChronoUnit.DAYS.between(
        lastChantier.get().getDate(),
        event.getDate()
    );
}
```

### Couleurs par type d'événement

**Dans le frontend:**
- `chantier` + `proposed` → Jaune
- `chantier` + `confirmed` → Vert
- `chantier` + `manual` → Bleu
- `rdv/prospection/autre` (tous statuts) → Violet

---

## 📝 Notes d'implémentation supplémentaires

### 1. Migration des données existantes
- Tous les appointments existants doivent avoir `eventType = 'chantier'` par défaut
- `daysSinceLastChantier` peut être calculé rétroactivement

### 2. Validation
- Un événement de type `rdv`, `prospection` ou `autre` ne doit pas avoir de `chantierId`
- Seuls les événements de type `chantier` peuvent avoir `daysSinceLastChantier`

### 3. Performance
- `daysSinceLastChantier` devrait être calculé et sauvegardé, pas calculé à chaque requête
- Recalculer uniquement lors de la modification de la date d'un chantier

---

## ✅ Checklist mise à jour backend (suite)

### Nouveaux éléments
- [ ] Ajouter l'enum `EventType` au backend
- [ ] Ajouter le champ `eventType` à l'entité Chantier/CalendarEvent
- [ ] Ajouter le champ `daysSinceLastChantier` (Integer, nullable)
- [ ] Créer l'entité CalendarEvent (ou adapter Appointment)
- [ ] Implémenter le calcul de `daysSinceLastChantier`
- [ ] Créer les endpoints `/api/calendar/events/*`
- [ ] Ajouter les filtres (eventType, includeUnscheduled)
- [ ] Gérer les événements non programmés (date === null)
- [ ] Migrer les données existantes
- [ ] Tester les nouveaux endpoints
- [ ] Déprécier (ou adapter) `/api/appointments/*`

---

**Dernière mise à jour:** 28 Octobre 2025 (v2)
**Version frontend:** 1.3.0
**Version backend requise:** 1.2.0+
