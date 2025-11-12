# Nouveau Modèle de Données - Interventions et Chantiers

## Vue d'ensemble

Le système a été restructuré pour séparer clairement les **Interventions** (récurrentes ou ponctuelles) des **Chantiers** (événements uniques programmés).

## Structure hiérarchique

```
Intervention (récurrente)
  └── Chantier 1
  └── Chantier 2
  └── Chantier 3
  └── ...

Intervention (one-shot)
  └── Chantier unique
```

## Types de données

### Intervention

Une intervention peut être :
- **Récurrente** : contient plusieurs chantiers planifiés sur plusieurs mois
- **One-shot** : crée directement un chantier unique

#### Propriétés d'une intervention récurrente

- `type`: `'recurring'`
- `title`: Titre de l'intervention
- `clientId` / `clientName`: Client associé
- `description`: Description des travaux
- `location`: Lieu des interventions
- `durationInMonths`: Durée totale en mois (ex: 6, 12)
- `startMonth`: Mois de départ (format YYYY-MM, par défaut mois en cours)
- `unitDuration`: Durée unitaire d'un chantier en minutes
- `monthlyPlans`: Plan détaillé par mois

#### Plan mensuel (MonthlyPlan)

Pour chaque mois de l'intervention récurrente :
```typescript
{
  month: '2025-11',              // Format YYYY-MM
  numberOfInterventions: 2       // Nombre de chantiers à réaliser ce mois
}
```

### Chantier

Un chantier est un événement unique dans le planning :

- `id`: Identifiant unique
- `interventionId`: ID de l'intervention parente
- `title`: Titre du chantier
- `clientId` / `clientName`: Client
- `date`: Date du chantier (YYYY-MM-DD), peut être `null` si non programmé
- `startTime`: Heure de début (HH:MM), peut être `null` si non programmé
- `duration`: Durée en minutes
- `location`: Lieu
- `description`: Description
- `eventType`: Type d'événement
  - `'chantier'`: Chantier de travail (couleurs jaune/vert/bleu)
  - `'rdv'`: Rendez-vous avec un client (couleur violette)
  - `'prospection'`: Rendez-vous de prospection (couleur violette)
  - `'autre'`: Autre type d'événement (couleur violette)
- `status`: État du chantier
  - `'proposed'`: Proposé (affiché en jaune pour chantiers, violet pour rdv/prospection)
  - `'confirmed'`: Confirmé (affiché en vert pour chantiers, violet foncé pour rdv/prospection)
  - `'in-progress'`: En cours
  - `'completed'`: Terminé
  - `'cancelled'`: Annulé
- `daysSinceLastChantier`: (Pour chantiers récurrents uniquement) Nombre de jours écoulés depuis le dernier chantier confirmé/terminé de la même intervention
- `notes`: Notes supplémentaires

### Événement du planning (CalendarEvent)

Représente un événement dans le planning (peut être un chantier ou un autre type d'événement) :

- Tous les champs d'un `Chantier`
- `chantierId`: Référence au chantier si `eventType === 'chantier'`
- `isRecurring`: Indique si l'événement fait partie d'une intervention récurrente

**Chantiers à programmer** : Les chantiers créés sans date/heure (`date === null`) apparaissent dans la liste "À programmer" du planning et peuvent être glissés-déposés dans le calendrier.

## Formulaire de création

### Création d'une intervention récurrente

1. **Informations générales** :
   - Titre
   - Client
   - Description
   - Lieu

2. **Configuration récurrente** (activée via switch) :
   - Mois de départ (input type="month")
   - Durée en mois (1-24)
   - Durée unitaire d'un chantier (en minutes)

3. **Plan mensuel** (généré automatiquement) :
   - Une ligne par mois
   - Input pour saisir le nombre d'interventions par mois
   - Exemple : 
     ```
     Octobre 2025    [2]
     Novembre 2025   [2]
     Décembre 2025   [1]
     ```

### Création d'un chantier one-shot

1. **Informations générales** :
   - Titre
   - Client
   - Description
   - Lieu

2. **Configuration ponctuelle** :
   - Date du chantier
   - Durée (en minutes)

## Pages et navigation

### Page Interventions (`/components/ProjectsPage.tsx`)

- Liste toutes les interventions (récurrentes et one-shot)
- Filtres : Toutes / Récurrentes / Chantiers
- Pour chaque intervention récurrente :
  - Affiche le titre, client, durée, statistiques
  - Bouton "Voir détails" pour accéder à la vue détaillée

### Page Détail Intervention (`/components/InterventionDetailPage.tsx`)

Accessible en cliquant sur une intervention récurrente :
- **En-tête** : Informations de l'intervention
- **Statistiques** : Chantiers terminés, à venir, total
- **Liste des chantiers** avec 3 onglets :
  - Tous
  - À venir
  - Passés
- Actions sur chaque chantier :
  - Modifier
  - Supprimer

### Fiche Client (`/components/ClientDetailPage.tsx`)

Nouvelle section "Interventions récurrentes" :
- Liste des interventions récurrentes du client
- Clic sur une intervention → accès à la page de détail
- Affichage des statistiques (chantiers à venir, terminés)

### Dashboard (`/components/Dashboard.tsx`)

- Bouton "Ajouter une intervention" utilise le nouveau formulaire
- Possibilité de créer intervention récurrente ou chantier one-shot

## Composants

### `InterventionForm` (`/components/InterventionForm.tsx`)

Formulaire unifié pour :
- Créer une intervention récurrente (avec plan mensuel)
- Créer un chantier one-shot

Caractéristiques :
- Switch récurrent/ponctuel
- Génération automatique du plan mensuel
- Validation des données

### `InterventionDetailPage` (`/components/InterventionDetailPage.tsx`)

Page de détail d'une intervention récurrente :
- Vue d'ensemble de l'intervention
- Liste filtrée des chantiers
- Actions sur les chantiers

## Données mock

Fichier `/data/mockData.ts` contient :
- `mockClients`: Liste de clients
- `mockInterventions`: Liste d'interventions
- `mockChantiers`: Liste de chantiers

Utilisé pour le développement et les tests.

## Types TypeScript

Fichier `/types/index.ts` définit :
- `Intervention`
- `Chantier`
- `CalendarEvent` (événement du planning)
- `MonthlyPlan`
- `Client`
- Types énumérés :
  - `InterventionType` : `'recurring' | 'one-shot'`
  - `ChantierStatus` : `'proposed' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'`
  - `EventType` : `'chantier' | 'rdv' | 'prospection' | 'autre'`

## Évolutions futures

1. **Génération automatique des chantiers** : Lors de la création d'une intervention récurrente, générer automatiquement les chantiers en statut "proposed"

2. **Modification du plan mensuel** : Permettre d'ajuster le nombre de chantiers par mois après création

3. **Notification des chantiers proposés** : Alerter l'utilisateur des chantiers en attente de validation

4. **Synchronisation calendrier** : Afficher les chantiers dans le planning interactif

5. **Statistiques avancées** : Rapports sur les interventions récurrentes (taux de complétion, revenus générés, etc.)
