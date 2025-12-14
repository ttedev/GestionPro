/**
 * API Client pour l'application Paysagiste
 * 
 * Ce fichier contient toutes les fonctions d'appel API pour communiquer avec le backend Spring Boot.
 * 
 * Configuration:
 * - Modifier API_BASE_URL pour pointer vers votre backend
 * - Le token JWT est automatiquement ajouté aux headers depuis le localStorage
 */

// Configuration

const API_BASE_URL= 'https://jardin.vps.ttelab.fr/api';
//const API_BASE_URL= 'http://localhost:8080/api';


export type EventStatus = 'unscheduled' | 'proposed' | 'confirmed' | 'completed' | 'cancelled';
export type EventType = 'chantier' | 'rdv' | 'prospection' | 'autre'
export type UserStatus =  'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
// Types
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  workStartTime: string;
  workEndTime: string;
  status: UserStatus;
  endLicenseDate: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  access: string | null;
  hasKey: boolean;
  type: 'particulier' | 'professionnel';
  status: 'actif' | 'inactif';
  createdAt: string;
}

// =====================
// Nouveau modèle Projet / Chantier (aligné backend actuel)
// =====================

// Enums backend (Java):
// public enum ProjectType { ponctuel, recurrent }
// public enum ProjectStatus { en_cours, termine, en_attente }
// public enum ChantierStatus { planifiee, en_cours, terminee, annulee }

export type BackendProjectType = 'ponctuel' | 'recurrent';
export type BackendProjectStatus = 'en_cours' | 'termine' ;

// Extensions potentielles pour la récurrence (non encore implémentées côté backend)
export interface PlanTravauxItemDTO {
  mois: string; // format AAAA-MM ou code mois
  occurence: number; // nombre d'occurrences prévues ce mois
}

export interface ChantierDTO {
  id: string;
  clientId: string;
  projectName: string;
  status: EventStatus;
  dateHeure: string; // LocalDateTime ISO
  projectId?: string; // optionnel si découplé
  createdAt?: string;
  // Champs supplémentaires potentiels
  endDate?: string | null;
  dureeEnMinutes?: number;
}

export interface ProjectDTO {
  id: string;
  clientId: string;
  clientName?: string; // MappingUtil peut remplir
  title: string;
  description: string;
  status: BackendProjectStatus;

  dureeEnMinutes?: number | null;
  createdAt?: string;
  // Champs de récurrence (à implémenter côté backend si besoin)
  type?: BackendProjectType;
  dureeMois?: number | null;
  premierMois?: string | null;
  planTravaux?: PlanTravauxItemDTO[];
  chantiers?: ChantierDTO[]; // liste intégrée
}



export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  interventionId: string | null;
  dayIndex: number;
  date: string;
  startTime: string;
  duration: number;
  type: string;
  location: string;
  status: EventStatus;
  isRecurring: boolean;
  eventType?: EventType;
  daysSinceLastChantier?: number | null;
  completed: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  eventType: EventType;
  clientId: string;
  clientName: string;
  interventionId: string | null;
  chantierId: string | null;
  dayIndex: number | null;
  date: string | null;
  startTime: string | null;
  duration: number;
  title: string;
  description: string;
  location: string;
  status: EventStatus;
  isRecurring: boolean;
  daysSinceLastChantier: number | null;
  notes: string | null;
  createdAt: string;
}

export interface Remark {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  pendingAppointments: number;
  completedThisMonth: number;
  revenueThisMonth: number | null;
  upcomingAppointments: Array<{
    id: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    clientAccess: string | null;
    clientHasKey: boolean;
    type: string;
    date: string;
    time: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'client_added' | 'project_created' | 'appointment_confirmed';
    description: string;
    timestamp: string;
  }>;
}

// Helpers
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Une erreur est survenue' }));
    throw new Error(error.error || error.details || `HTTP ${response.status}`);
  }
  
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

export const authAPI = {
  /**
   * Connexion utilisateur
   */
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse<{ token: string; user: User }>(response);
    
    // Sauvegarder le token
    localStorage.setItem('authToken', data.token);
    
    return data;
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    // Supprimer le token
    localStorage.removeItem('authToken');
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    
    return handleResponse<User>(response);
  },
  /**
   * Redirection OAuth2 Google (front only)
   */
  loginWithGoogle: () => {
    const base = API_BASE_URL.replace(/\/api$/,'');
    window.location.href = `${base}/oauth2/authorization/google`;
  },
};

// =============================================================================
// CLIENTS
// =============================================================================

export const clientsAPI = {
  /**
   * Récupérer tous les clients
   */
  getAll: async (search?: string): Promise<Client[]> => {
    const url = new URL(`${API_BASE_URL}/clients`);
    if (search) {
      url.searchParams.append('search', search);
    }
    
    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    
    return handleResponse<Client[]>(response);
  },

  /**
   * Récupérer un client par ID
   */
  getById: async (id: string): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: getHeaders(),
    });
    
    return handleResponse<Client>(response);
  },

  /**
   * Créer un nouveau client
   */
  create: async (client: Omit<Client, 'id' | 'status' | 'createdAt'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(client),
    });
    
    return handleResponse<Client>(response);
  },

  /**
   * Mettre à jour un client
   */
  update: async (id: number, client: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(client),
    });
    
    return handleResponse<Client>(response);
  },

  /**
   * Supprimer un client
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse<void>(response);
  },
};

// =============================================================================
// PROJECTS
// =============================================================================

export const projectsAPI = {
  /**
   * Récupérer tous les projets (filtrable par clientId, status)
   */
  getAll: async (filters?: { clientId?: string; status?: BackendProjectStatus }): Promise<ProjectDTO[]> => {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (filters?.clientId) url.searchParams.append('clientId', filters.clientId);
    if (filters?.status) url.searchParams.append('status', filters.status);
    const response = await fetch(url.toString(), { headers: getHeaders() });
    return handleResponse<ProjectDTO[]>(response);
  },
  /**
   * Récupérer un projet par ID (UUID string)
   */
  getById: async (id: string): Promise<ProjectDTO> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, { headers: getHeaders() });
    return handleResponse<ProjectDTO>(response);
  },
  /**
   * Créer un projet
   */
  create: async (project: {
    clientId: string;
    title: string;
    type: BackendProjectType;
    description?: string;
    status?: BackendProjectStatus;
    startDate?: string; // yyyy-MM-dd
    endDate?: string | null;
    location?: string;
    planTravaux?: PlanTravauxItemDTO[];
    dureeMois?: number | null;
    premierMois?: string | null;
    dureeEnMinutes?: number;
    budget?: number;
  }): Promise<ProjectDTO> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(project),
    });
    return handleResponse<ProjectDTO>(response);
  },
  /**
   * Mettre à jour un projet
   */
  update: async (id: string, patch: Partial<{
    title: string;
    description: string;
    status: BackendProjectStatus;
    startDate: string;
    endDate: string | null;
    location: string;
    dureeEnMinutes: number;
    budget: number;
  }>): Promise<ProjectDTO> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(patch),
    });
    return handleResponse<ProjectDTO>(response);
  },
  /**
   * Supprimer un projet
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// =============================================================================
// CHANTIERS (nouvelle API - certaines opérations manquent côté backend)
// =============================================================================

export const chantiersAPI = {
  /**
   * Liste des chantiers (id projet / client optionnels)
   */
  getAll: async (filters?: { projectId?: string; clientId?: string; status?: EventStatus }): Promise<ChantierDTO[]> => {
    const url = new URL(`${API_BASE_URL}/chantiers`);
    if (filters?.projectId) url.searchParams.append('projectId', filters.projectId);
    if (filters?.clientId) url.searchParams.append('clientId', filters.clientId);
    if (filters?.status) url.searchParams.append('status', filters.status);
    const response = await fetch(url.toString(), { headers: getHeaders() });
    return handleResponse<ChantierDTO[]>(response);
  },
  /**
   * Chantier par ID
   */
  getById: async (id: string): Promise<ChantierDTO> => {
    const response = await fetch(`${API_BASE_URL}/chantiers/${id}`, { headers: getHeaders() });
    return handleResponse<ChantierDTO>(response);
  },
  /**
   * Créer un chantier (ENDPOINT À AJOUTER côté backend si absent)
   */
  create: async (chantier: {
    projectId?: string;
    clientId: string;
    title: string;
    description?: string;
    dateHeure: string; // ISO LocalDateTime
    status?: EventStatus;
    dureeEnMinutes?: number;
    location?: string;
  }): Promise<ChantierDTO> => {
    const response = await fetch(`${API_BASE_URL}/chantiers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(chantier),
    });
    return handleResponse<ChantierDTO>(response);
  },
  /**
   * Mettre à jour un chantier
   */
  update: async (id: string, patch: Partial<{
    title: string;
    description: string;
    status: EventStatus;
    dateHeure: string;
    dureeEnMinutes: number;
    location: string;
  }>): Promise<ChantierDTO> => {
    const response = await fetch(`${API_BASE_URL}/chantiers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(patch),
    });
    return handleResponse<ChantierDTO>(response);
  },
  /**
   * Supprimer un chantier
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chantiers/${id}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse<void>(response);
  },
  /**
   * Changer statut (PATCH dédié recommandé côté backend)
   */
  updateStatus: async (id: string, status: EventStatus): Promise<ChantierDTO> => {
    const response = await fetch(`${API_BASE_URL}/chantiers/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<ChantierDTO>(response);
  },
};



// =============================================================================
// CALENDAR EVENTS (Planning - Nouveau)
// =============================================================================

export const calendarEventsAPI = {
  /**
   * Récupérer tous les événements du planning
   */
  getAll: async (filters?: { 
    weekOffset?: number; 
    startDate?: string; 
    endDate?: string;
    eventType?: 'chantier' | 'rdv' | 'prospection' | 'autre';
    includeUnscheduled?: boolean;
  }): Promise<CalendarEvent[]> => {
    const url = new URL(`${API_BASE_URL}/calendar/events`);
    if (filters?.weekOffset !== undefined) {
      url.searchParams.append('weekOffset', filters.weekOffset.toString());
    }
    if (filters?.startDate) {
      url.searchParams.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      url.searchParams.append('endDate', filters.endDate);
    }
    if (filters?.eventType) {
      url.searchParams.append('eventType', filters.eventType);
    }
    if (filters?.includeUnscheduled !== undefined) {
      url.searchParams.append('includeUnscheduled', filters.includeUnscheduled.toString());
    }
    
    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    
    return handleResponse<CalendarEvent[]>(response);
  },

  /**
   * Récupérer un événement par ID
   */
  getById: async (id: number): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      headers: getHeaders(),
    });
    
    return handleResponse<CalendarEvent>(response);
  },



    /**
   * listUnscheduledEvents
   */
  getUnscheduledEvents: async (): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/listUnscheduledEvents`, {
      headers: getHeaders(),
    });
    
    return handleResponse<CalendarEvent[]>(response);
  },
  /**
   * Créer un nouvel événement
   */
  create: async (event: Omit<CalendarEvent, 'id' | 'clientName' | 'dayIndex' | 'isRecurring' | 'daysSinceLastChantier' | 'createdAt'>): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    
    return handleResponse<CalendarEvent>(response);
  },

  /**
   * Mettre à jour un événement
   */
  update: async ( event: Partial<Omit<CalendarEvent,  'clientId' | 'clientName' | 'interventionId' | 'chantierId' | 'dayIndex' | 'isRecurring' | 'daysSinceLastChantier' | 'createdAt'>>): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/updateEvent`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    
    return handleResponse<CalendarEvent>(response);
  },

  /**
   * Changer le statut d'un événement
   */
  updateStatus: async (id: string, status: EventStatus): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse<CalendarEvent>(response);
  },

  /**
   * Confirmer un événement proposé
   */
  confirm: async (id: string): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}/confirm`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    
    return handleResponse<CalendarEvent>(response);
  },

  /**
   * Supprimer un événement
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse<void>(response);
  },
};

// =============================================================================
// APPOINTMENTS (Planning - DEPRECATED - Utilisez calendarEventsAPI)
// =============================================================================

export const appointmentsAPI = {
  /**
   * Récupérer les rendez-vous du planning
   */
  getAll: async (filters?: { weekOffset?: number; startDate?: string; endDate?: string }): Promise<Appointment[]> => {
    const url = new URL(`${API_BASE_URL}/appointments`);
    if (filters?.weekOffset !== undefined) {
      url.searchParams.append('weekOffset', filters.weekOffset.toString());
    }
    if (filters?.startDate) {
      url.searchParams.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      url.searchParams.append('endDate', filters.endDate);
    }
    
    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    
    return handleResponse<Appointment[]>(response);
  },

  /**
   * Récupérer un rendez-vous par ID
   */
  getById: async (id: number): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: getHeaders(),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Créer un nouveau rendez-vous
   */
  create: async (appointment: Omit<Appointment, 'id' | 'clientName' | 'dayIndex' | 'createdAt'>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointment),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Mettre à jour un rendez-vous (déplacement dans le planning)
   */
  update: async (id: number, appointment: Partial<Omit<Appointment, 'id' | 'clientId' | 'clientName' | 'interventionId' | 'dayIndex' | 'status' | 'isRecurring' | 'createdAt'>>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(appointment),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Changer le statut d'un rendez-vous
   */
  updateStatus: async (id: number, status: 'proposed' | 'confirmed' | 'manual'): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Confirmer un rendez-vous proposé
   */
  confirm: async (id: number): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/confirm`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Marquer un rendez-vous comme effectué
   */
  markAsCompleted: async (id: number, completed: boolean = true): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/completed`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ completed }),
    });
    
    return handleResponse<Appointment>(response);
  },

  /**
   * Supprimer un rendez-vous
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse<void>(response);
  },
};

// =============================================================================
// REMARKS (Remarques Client)
// =============================================================================

export const remarksAPI = {
  /**
   * Récupérer toutes les remarques d'un client
   */
  getByClientId: async (clientId: string): Promise<Remark[]> => {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/remarks`, {
      headers: getHeaders(),
    });
    
    return handleResponse<Remark[]>(response);
  },

  /**
   * Créer une nouvelle remarque
   */
  create: async (clientId: string, content: string,images: string[]): Promise<Remark> => {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/remarks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, images }),
    });
    
    return handleResponse<Remark>(response);
  },

  /**
   * Mettre à jour une remarque
   */
  update: async (id: number, content: string): Promise<Remark> => {
    const response = await fetch(`${API_BASE_URL}/remarks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    
    return handleResponse<Remark>(response);
  },

  /**
   * Supprimer une remarque
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/remarks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse<void>(response);
  },
};

// =============================================================================
// DASHBOARD
// =============================================================================

export const dashboardAPI = {
  /**
   * Récupérer les statistiques du tableau de bord
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });
    
    return handleResponse<DashboardStats>(response);
  },
};

// Export par défaut
export default {
  auth: authAPI,
  clients: clientsAPI,
  projects: projectsAPI,
  chantiers: chantiersAPI,
  appointments: appointmentsAPI,
  remarks: remarksAPI,
  dashboard: dashboardAPI,
};
