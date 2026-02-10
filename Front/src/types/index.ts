// Types pour le système de gestion d'interventions et chantiers

export type InterventionType = 'recurring' | 'one-shot';
export type ChantierStatus = 'unscheduled' | 'proposed' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
export type EventType = 'chantier' | 'rdv' | 'prospection' | 'autre';

// Plan mensuel pour une intervention récurrente
export interface MonthlyPlan {
  month: string; // Format: YYYY-MM
  numberOfInterventions: number;
}

// Chantier = événement unique
export interface Chantier {
  id: string;
  interventionId: string;
  title: string;
  clientId: string;
  clientName: string;
  date?: string; // Format: YYYY-MM-DD
  startTime?: string;
  duration: number; // en minutes
  location: string;
  description: string;
  status: ChantierStatus;
  notes?: string;
  eventType: EventType; // Type d'événement (chantier, rdv, prospection, autre)
  daysSinceLastChantier?: number; // Pour les chantiers récurrents : nombre de jours depuis le dernier chantier
}

// Événement du planning (peut être un chantier ou un autre type d'événement)
export interface CalendarEvent {
  id: string;
  eventType: EventType;
  interventionId?: string; // Optionnel, seulement pour les chantiers
  chantierId?: string; // Référence au chantier si eventType === 'chantier'
  title: string;
  clientId: string;
  clientName: string;
  date?: string; // Format: YYYY-MM-DD
  startTime?: string;
  duration: number; // en minutes
  location: string;
  description: string;
  status: ChantierStatus;
  notes?: string;
  isRecurring?: boolean; // Si l'événement fait partie d'une intervention récurrente
  daysSinceLastChantier?: number; // Pour les chantiers récurrents
}


