# Routes de l'Application

L'application utilise désormais React Router pour la navigation. Voici les routes disponibles :

## Routes Publiques
- `/login` - Page de connexion

## Routes Protégées (nécessitent une authentification)
- `/` - Redirige vers `/dashboard`
- `/dashboard` - Tableau de bord principal
- `/clients` - Liste des clients
- `/clients/:clientId` - Détails d'un client spécifique
- `/projects` - Liste des projets
- `/calendar` - Planning/Calendrier

## Navigation

### Dans le code
Utilisez les hooks React Router :
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/clients'); // Navigation programmatique
```

### Dans les liens
Utilisez les composants Link ou NavLink :
```tsx
import { Link, NavLink } from 'react-router-dom';

<Link to="/clients">Clients</Link>
<NavLink to="/dashboard">Dashboard</NavLink>
```

## Fonctionnalités
- ✅ Navigation par URL (bookmarkable)
- ✅ Boutons précédent/suivant du navigateur
- ✅ Routes protégées avec redirection vers `/login`
- ✅ Redirection automatique après connexion
- ✅ Paramètres d'URL pour les détails clients
- ✅ Persistance de l'authentification via localStorage
