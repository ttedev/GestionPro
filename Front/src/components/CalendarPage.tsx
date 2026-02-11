import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, ChevronLeft, ChevronRight, MapPin, Check, Clock, Edit2, X, CalendarX, ChevronsUpDown, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { toast } from 'sonner';
import { calendarEventsAPI, EventStatus, EventType } from '../api/apiClient';
import { AddEventDialog } from './AddEventDialog';

;

interface Appointment {
  id: string;
  dayIndex: number;
  date: string; // Format: YYYY-MM-DD
  startTime: string;
  duration: number;
  client: string;
  type: string;
  location: string;
  status: EventStatus;
  isRecurring?: boolean;
  eventType?: EventType; // Type d'événement
  interventionId?: number; // ID de l'intervention récurrente si applicable
  daysSinceLastChantier?: number; // Jours depuis le dernier chantier de cette intervention
}

interface DraggableAppointmentProps {
  appointment: Appointment;
  style: React.CSSProperties;
  onEdit: (appointment: Appointment) => void;
  onConfirm: (id: string) => void;
  onStatusChange: (id: string, status: EventStatus) => void;
}

function DraggableAppointment({ appointment, style, onEdit, onConfirm, onStatusChange }: DraggableAppointmentProps) {
  const [showActions, setShowActions] = useState(false);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { id: appointment.id, source: 'calendar' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getAppointmentColor = (status: EventStatus, eventType?: EventType) => {
    // Couleurs différentes pour les événements non-chantier
    if (eventType && eventType !== 'chantier') {
      switch (status) {
        case 'proposed':
          return 'bg-purple-400 hover:bg-purple-500 text-white';
        case 'confirmed':
          return 'bg-purple-600 hover:bg-purple-700 text-white';
        case 'unscheduled':
          return 'bg-purple-500 hover:bg-purple-600 text-white';
        default:
          return 'bg-purple-500 text-white';
      }
    }
    
    // Couleurs standard pour les chantiers
    switch (status) {
      case 'proposed':
        return 'bg-yellow-400 hover:bg-yellow-500 text-gray-900';
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'unscheduled':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const colorClass = getAppointmentColor(appointment.status, appointment.eventType);

  return (
    <div
      ref={drag}
      onClick={(e) => {
        if (appointment.status === 'proposed') {
          e.stopPropagation();
          onConfirm(appointment.id);
        } else {
          setShowActions(!showActions);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(appointment);
      }}
      className={`absolute left-1 right-1 ${colorClass} rounded p-2 text-xs overflow-hidden shadow-md hover:shadow-lg transition-all z-10 cursor-move group ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={style}
    >
      {showActions && (
        <div className="absolute top-1 right-1 flex gap-1 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
              setShowActions(false);
            }}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-3 h-3 text-gray-700" />
          </button>
          {appointment.status === 'confirmed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(appointment.id, 'proposed');
                setShowActions(false);
              }}
              className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
              title="Repasser en proposition"
            >
              <Clock className="w-3 h-3 text-gray-900" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
            }}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-3 h-3 text-gray-700" />
          </button>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="truncate flex-1">{appointment.client}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Badge pour le nombre de jours depuis le dernier chantier (interventions récurrentes uniquement) */}
          {appointment.isRecurring && appointment.eventType === 'chantier' && typeof appointment.daysSinceLastChantier === 'number' && (
            <div className="px-1.5 py-0.5 bg-white bg-opacity-90 rounded text-xs font-medium text-gray-700" title={`${appointment.daysSinceLastChantier} jours depuis le dernier chantier`}>
              +{appointment.daysSinceLastChantier}j
            </div>
          )}
          {appointment.status === 'proposed' && (
            <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
              <Check className="w-3 h-3 text-yellow-600" />
            </div>
          )}
          {appointment.status === 'confirmed' && (
            <div className="flex-shrink-0 w-4 h-4 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
      <div className={`truncate text-xs ${
        appointment.status === 'proposed' ? 'text-gray-700' : 'text-white opacity-90'
      }`}>
        {appointment.type}
      </div>
      <div className={`flex items-center gap-1 mt-1 text-xs ${
        appointment.status === 'proposed' ? 'text-gray-600' : 'text-white opacity-80'
      }`}>
        <MapPin className="w-3 h-3" />
        <span className="truncate">{appointment.location}</span>
      </div>
    </div>
  );
}

interface DroppableCellProps {
  dayIndex: number;
  timeSlot: string;
  onDrop: (appointmentId: string, dayIndex: number, timeSlot: string, source: string) => void;
  children?: React.ReactNode;
}

function DroppableCell({ dayIndex, timeSlot, onDrop, children }: DroppableCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['appointment', 'unscheduled'],
    drop: (item: { id: string; source?: string }, monitor) => {
      console.log('Dropped item:', item, 'with monitor:', monitor);
      const offset = monitor.getClientOffset();
      const initialOffset = monitor.getInitialSourceClientOffset();
      const source = item.source || 'calendar';
      
      if (offset && cellRef.current) {
        const cellRect = cellRef.current.getBoundingClientRect();
        
        // Calculer la position relative Y dans la cellule
        let relativeY = offset.y - cellRect.top;
        
        // Si on a l'offset initial, ajuster pour tenir compte de où le curseur a cliqué dans la tuile
        if (initialOffset) {
          const dragStartOffset = monitor.getInitialClientOffset();
          if (dragStartOffset) {
            // Calculer où le curseur était dans la tuile au début du drag
            const cursorOffsetInTile = dragStartOffset.y - initialOffset.y;
            // Soustraire cet offset pour que la tuile se positionne correctement
            relativeY = relativeY - cursorOffsetInTile;
          }
        }
        
        const cellHeight = cellRect.height;
        
        // Calculer les minutes à ajouter (0, 15, 30, ou 45)
        const minutesOffset = Math.floor((relativeY / cellHeight) * 4) * 15;
        console.log('Relative Y:', relativeY, 'Cell Height:', cellHeight, 'Minutes Offset:', minutesOffset);
        
        // Extraire l'heure du timeSlot
        const [hours] = timeSlot.split(':').map(Number);
        const totalMinutes = hours * 60 + minutesOffset;
        const finalHours = Math.floor(totalMinutes / 60);
        const finalMinutes = totalMinutes % 60;
        
        // Formater l'heure finale (HH:MM)
        const finalTimeSlot = `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
        
        console.log('Dropped item at:', dayIndex, finalTimeSlot, 'from source:', source);

        onDrop(item.id, dayIndex, finalTimeSlot, source);
      } else {
        // Fallback au comportement par défaut
        onDrop(item.id, dayIndex, timeSlot, source);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Combiner les refs
  const setRefs = (element: HTMLDivElement | null) => {
    cellRef.current = element;
    drop(element);
  };

  return (
    <div
      ref={setRefs}
      className={`bg-white min-h-[4rem] relative transition-colors ${
        isOver ? 'bg-green-100' : 'hover:bg-gray-50'
      } cursor-pointer`}
    >
      {children}
    </div>
  );
}

interface UnscheduledChantierProps {
  appointment: Appointment;
}

function UnscheduledChantier({ appointment }: UnscheduledChantierProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'unscheduled',
    item: { id: appointment.id, source: 'unscheduled' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm text-gray-900 truncate">{appointment.client}</span>
        <CalendarX className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
      <div className="text-sm text-gray-600 truncate mb-1">{appointment.type}</div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span className="truncate">{appointment.location}</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Durée: {appointment.duration}h
      </div>
    </div>
  );
}

interface UnscheduledDropZoneProps {
  onDrop: (appointmentId: string) => void;
  children: React.ReactNode;
}

function UnscheduledDropZone({ onDrop, children }: UnscheduledDropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment', // Accepte uniquement les rendez-vous du calendrier
    drop: (item: { id: string; source?: string }) => {
      if (item.source !== 'unscheduled') { // Ne permet pas de redéposer un élément déjà unscheduled
        onDrop(item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && monitor.getItem()?.source !== 'unscheduled',
    }),
  }));

  return (
    <div
      ref={drop}
      className={`transition-all ${isOver ? 'ring-2 ring-orange-400 bg-orange-100' : ''}`}
    >
      {children}
    </div>
  );
}

export function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Pour la navigation mobile
  const [isMobile, setIsMobile] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unscheduledAppointments, setUnscheduledAppointments] = useState<Appointment[]>([ ]);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);

  // Détecter si on est en mode mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les événements quand la semaine change
  useEffect(() => {
    loadAppointments();
  }, [currentWeek]); // Se déclenche quand currentWeek change
  
  // Ouvrir/fermer automatiquement le panneau "À programmer" selon s'il y a des éléments
  useEffect(() => {
    setIsUnscheduledOpen(unscheduledAppointments.length > 0);
  }, [unscheduledAppointments.length]);


  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00','19:00','20:00'
  ];

  // Calculer dynamiquement les dates de la semaine
  const weekDays = useMemo(() => {
    // Obtenir la date actuelle
    const today = new Date();
    
    // Trouver le lundi de la semaine actuelle
    const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours, sinon calculer la différence
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + diffToMonday);
    baseDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit

    // Ajouter le nombre de semaines
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() + (currentWeek * 7));
    
    const days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const dayOfWeek = currentDay.getDay();
      const dayName = dayNames[dayOfWeek];
      const date = currentDay.getDate();
      const month = monthNames[currentDay.getMonth()];
      
      // Formatter la date en YYYY-MM-DD sans conversion UTC
      const year = currentDay.getFullYear();
      const monthNum = String(currentDay.getMonth() + 1).padStart(2, '0');
      const dayNum = String(currentDay.getDate()).padStart(2, '0');
      const fullDate = `${year}-${monthNum}-${dayNum}`;
      
      days.push({
        day: dayName,
        date: `${date} ${month}`,
        fullDate: fullDate
      });
    }
    
    return days;
  }, [currentWeek]);

  // Calculer la plage de dates pour l'affichage
  const weekRange = useMemo(() => {
    if (weekDays.length === 0) return '';
    
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    
    return `${firstDay.date} - ${lastDay.date}`;
  }, [weekDays]);

  // Charger les événements depuis l'API
  const loadAppointments = async () => {
    if (weekDays.length === 0) return;
    
    const startDate = weekDays[0].fullDate; // Format: YYYY-MM-DD (LocalDate compatible)
    const endDate = weekDays[6].fullDate;   // Format: YYYY-MM-DD (LocalDate compatible)
    
    try {
      const calendarEvents = await calendarEventsAPI.getAll({ startDate, endDate });
      
      // Mapper CalendarEvent vers Appointment
      const mappedAppointments: Appointment[] = calendarEvents
        .filter(event => event.date && event.startTime) // Filtrer les événements avec date et heure
        .map((event, index) => {
          // Backend et Frontend utilisent la même convention: Lundi=0, Mardi=1, ..., Dimanche=6
          const dayIndex = event.dayIndex ?? 0;
          
          return {
            id: event.id,
            dayIndex: dayIndex,
            date: event.date ?? '',
            startTime: event.startTime ?? '09:00',
            duration: event.duration/60,
            client: event.clientName,
            type: event.title,
            location: event.location,
            status: event.status,
            isRecurring: event.isRecurring,
            eventType: event.eventType,
            interventionId: event.interventionId ? parseInt(event.interventionId) : undefined,
            daysSinceLastChantier: event.daysSinceLastChantier ?? undefined,
          };
        });
      
      setAppointments(mappedAppointments);

      const calendarEventsUnscheduled = await calendarEventsAPI.getUnscheduledEvents();
      
      // Mapper CalendarEvent vers Appointment
      const mappedAppointmentsUnscheduled: Appointment[] = calendarEventsUnscheduled
        .map((event) => ({
          id: event.id, // Convertir string id en number
          dayIndex: event.dayIndex ?? 0,
          date: event.date ?? '',
          startTime: event.startTime ?? '',
          duration: event.duration/60,
          client: event.clientName,
          type: event.title,
          location: event.location,
          status: event.status,
          isRecurring: event.isRecurring,
          eventType: event.eventType,
          interventionId: event.interventionId ? parseInt(event.interventionId) : undefined,
          daysSinceLastChantier: event.daysSinceLastChantier ?? undefined,
        }));
      
      setUnscheduledAppointments(mappedAppointmentsUnscheduled);

      
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements');
    }
  };



  const getAppointmentStyle = (startTime: string, duration: number) => {
    console.log('Calculating style for startTime:', startTime, 'duration:', duration);
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinutes = parseInt(startTime.split(':')[1]);
    const topOffset = ((startHour - 7) * 60 + startMinutes) / 60;
    const height = duration;
    
    console.log('Top offset (in rem):', topOffset * 4, 'Height (in rem):', height * 4);
    return {
      top: `${topOffset * 4}rem`,
      height: `${height * 4}rem`,
    };
  };

  const handleConfirmAppointment = async (id: string) => {
    const update = await calendarEventsAPI.confirm(id);
    setAppointments(appointments.map(apt => 
      apt.id === id && apt.status === 'proposed'
        ? { ...apt, status: 'confirmed' as EventStatus }
        : apt
    ));
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    const update = await calendarEventsAPI.updateStatus(id,status);
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status } : apt
    ));
  };

  // Fonction pour arrondir aux créneaux de 30 minutes (HH:00 ou HH:30)
  const snapToHalfHour = (timeSlot: string): string => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    const finalHours = Math.floor(snappedMinutes / 60);
    const finalMinutes = snappedMinutes % 60;
    return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
  };

  // Fonction pour convertir un time slot en minutes depuis minuit
  const timeToMinutes = (timeSlot: string): number => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Fonction pour convertir des minutes en time slot
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Fonction pour trouver le prochain créneau disponible
  const findNextAvailableSlot = (dayIndex: number, requestedTime: string, duration: number, excludeId?: string): string => {
    const requestedMinutes = timeToMinutes(requestedTime);
    const durationMinutes = duration * 60;
    
    // Récupérer tous les rendez-vous du jour (sauf celui qu'on déplace)
    const dayAppointments = appointments.filter(apt => 
      apt.dayIndex === dayIndex && apt.id !== excludeId
    );

    // Si aucun rendez-vous, retourner l'heure demandée
    if (dayAppointments.length === 0) {
      return requestedTime;
    }

    // Trier les rendez-vous par heure de début
    const sortedAppointments = [...dayAppointments].sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    // Définir les limites de la journée (7h - 20h)
    const dayStartMinutes = 7 * 60; // 7:00
    const dayEndMinutes = 20 * 60; // 20:00

    // Vérifier si le créneau demandé est libre
    const isSlotFree = (startMinutes: number): boolean => {
      const endMinutes = startMinutes + durationMinutes;
      
      for (const apt of sortedAppointments) {
        const aptStartMinutes = timeToMinutes(apt.startTime);
        const aptEndMinutes = aptStartMinutes + (apt.duration * 60);
        
        // Vérifier s'il y a chevauchement
        if (
          (startMinutes >= aptStartMinutes && startMinutes < aptEndMinutes) ||
          (endMinutes > aptStartMinutes && endMinutes <= aptEndMinutes) ||
          (startMinutes <= aptStartMinutes && endMinutes >= aptEndMinutes)
        ) {
          return false;
        }
      }
      return true;
    };

    // Si le créneau demandé est libre, le retourner
    if (isSlotFree(requestedMinutes)) {
      return requestedTime;
    }

    // Construire la liste des créneaux libres APRÈS l'heure demandée
    const freeSlots: { start: number; end: number; duration: number }[] = [];

    // Créneaux entre les rendez-vous (seulement ceux après l'heure demandée)
    for (let i = 0; i < sortedAppointments.length - 1; i++) {
      const currentAptEnd = timeToMinutes(sortedAppointments[i].startTime) + (sortedAppointments[i].duration * 60);
      const nextAptStart = timeToMinutes(sortedAppointments[i + 1].startTime);
      
      // Ne considérer que les créneaux qui commencent après l'heure demandée
      if (nextAptStart > currentAptEnd && currentAptEnd >= requestedMinutes) {
        freeSlots.push({
          start: currentAptEnd,
          end: nextAptStart,
          duration: nextAptStart - currentAptEnd
        });
      }
    }

    // Créneau après le dernier rendez-vous (si après l'heure demandée)
    const lastAptEnd = timeToMinutes(sortedAppointments[sortedAppointments.length - 1].startTime) + 
                       (sortedAppointments[sortedAppointments.length - 1].duration * 60);
    if (lastAptEnd < dayEndMinutes && lastAptEnd >= requestedMinutes) {
      freeSlots.push({
        start: lastAptEnd,
        end: dayEndMinutes,
        duration: dayEndMinutes - lastAptEnd
      });
    }

    // Trouver le premier créneau assez grand APRÈS l'heure demandée
    for (const slot of freeSlots) {
      if (slot.duration >= durationMinutes) {
        // Arrondir au créneau de 30 minutes le plus proche
        const snappedStart = Math.ceil(slot.start / 30) * 30;
        
        // Vérifier que le créneau arrondi rentre toujours dans le slot libre
        if (snappedStart + durationMinutes <= slot.end) {
          return minutesToTime(snappedStart);
        } else {
          // Sinon, prendre le début du slot
          if (slot.start + durationMinutes <= slot.end) {
            return minutesToTime(slot.start);
          }
        }
      }
    }

    // Si aucun créneau après l'heure demandée, chercher AVANT (du début de la journée)
    const freeSlotsBeforeRequest: { start: number; end: number; duration: number }[] = [];
    
    // Créneau avant le premier rendez-vous
    const firstAptStart = timeToMinutes(sortedAppointments[0].startTime);
    if (firstAptStart > dayStartMinutes) {
      freeSlotsBeforeRequest.push({
        start: dayStartMinutes,
        end: firstAptStart,
        duration: firstAptStart - dayStartMinutes
      });
    }

    // Créneaux entre les rendez-vous (avant l'heure demandée)
    for (let i = 0; i < sortedAppointments.length - 1; i++) {
      const currentAptEnd = timeToMinutes(sortedAppointments[i].startTime) + (sortedAppointments[i].duration * 60);
      const nextAptStart = timeToMinutes(sortedAppointments[i + 1].startTime);
      
      if (nextAptStart > currentAptEnd && currentAptEnd < requestedMinutes) {
        freeSlotsBeforeRequest.push({
          start: currentAptEnd,
          end: nextAptStart,
          duration: nextAptStart - currentAptEnd
        });
      }
    }

    for (const slot of freeSlotsBeforeRequest) {
      if (slot.duration >= durationMinutes) {
        const snappedStart = Math.ceil(slot.start / 30) * 30;
        if (snappedStart + durationMinutes <= slot.end) {
          return minutesToTime(snappedStart);
        } else if (slot.start + durationMinutes <= slot.end) {
          return minutesToTime(slot.start);
        }
      }
    }

    // Dernier recours : placer à la fin de la journée
    return minutesToTime(Math.ceil(lastAptEnd / 30) * 30);
  };

  function updateAppointement(apt: Appointment) {
    
    calendarEventsAPI.update({
      id: apt.id,
      date: apt.date,
      startTime: apt.startTime,
      duration: apt.duration * 60,
      title: apt.type,
      location: apt.location,
      status: apt.status,
      eventType: apt.eventType,
    }).then(() => {
      console.log('Rendez-vous mis à jour avec succès');
    }).catch((error) => {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      toast.error('Erreur lors de la mise à jour du rendez-vous');
    });
  }



  const handleDrop = (appointmentId: string, dayIndex: number, timeSlot: string, source: string) => {
    const newDate = weekDays[dayIndex]?.fullDate || '';
    
    // Snap au créneau de 30 minutes le plus proche
    const snappedTimeSlot = snapToHalfHour(timeSlot);
    
    if (source === 'unscheduled') {
      // Utiliser la forme fonctionnelle pour accéder à la valeur actuelle
      setUnscheduledAppointments(currentUnscheduled => {
        const unscheduledApt = currentUnscheduled.find(apt => apt.id === appointmentId);
        console.log("Tentative de drop - appointment trouvé:", unscheduledApt);
        
        if (unscheduledApt) {
          // Trouver le prochain créneau disponible
          const availableTimeSlot = findNextAvailableSlot(dayIndex, snappedTimeSlot, unscheduledApt.duration);
          
          const scheduledApt = {
            ...unscheduledApt,
            dayIndex,
            startTime: availableTimeSlot,
            date: newDate,
            status: 'proposed' as EventStatus,
          };
          
          // Ajouter aux appointments
          setAppointments(current => [...current, scheduledApt]);
          
          // Afficher une notification de succès
          const wasRescheduled = availableTimeSlot !== snappedTimeSlot;
          toast.success('Chantier programmé', {
            description: wasRescheduled 
              ? `${unscheduledApt.client} - ${availableTimeSlot} le ${weekDays[dayIndex].date} (créneau ajusté)`
              : `${unscheduledApt.client} - ${availableTimeSlot} le ${weekDays[dayIndex].date}`,
          });
          //caller API pour mettre à jour l'événement
          updateAppointement(scheduledApt);
          
          // Retourner la nouvelle liste sans l'élément déplacé
          return currentUnscheduled.filter(apt => apt.id !== appointmentId);
        }
        
        // Si non trouvé, retourner la liste inchangée
        return currentUnscheduled;
      });
    } else {
      // Déplacer dans le calendrier - utiliser la forme fonctionnelle
      setAppointments(currentAppointments => {
        const movingApt = currentAppointments.find(apt => apt.id === appointmentId);
        console.log('Tentative de move - appointment trouvé:', movingApt);
        console.log('Liste actuelle appointments:', currentAppointments);
        
        if (movingApt) {
          // Trouver le prochain créneau disponible en excluant le rendez-vous qu'on déplace
          const availableTimeSlot = findNextAvailableSlot(dayIndex, snappedTimeSlot, movingApt.duration, appointmentId);
          
          // Notification si le créneau a été ajusté
          if (availableTimeSlot !== snappedTimeSlot) {
            toast.info('Créneau ajusté', {
              description: `Placé à ${availableTimeSlot} (créneau occupé)`,
            });
          }
          //caller API pour mettre à jour l'événement
          updateAppointement({ ...movingApt, dayIndex, startTime: availableTimeSlot, date: newDate })
          
          // Retourner la nouvelle liste avec l'appointment modifié
          return currentAppointments.map(apt => {
            if (apt.id === appointmentId) {
              return { ...apt, dayIndex, startTime: availableTimeSlot, date: newDate };
            }
            return apt;
          });
        }
        
        // Si non trouvé, retourner la liste inchangée
        return currentAppointments;
      });
    }
  };

  const handleUnschedule = (appointmentId: string) => {
    setAppointments(currentAppointments => {
      const appointment = currentAppointments.find(apt => apt.id === appointmentId);
      
      if (appointment) {
        // Créer une version "unscheduled" du rendez-vous
        const unscheduledApt = {
          ...appointment,
          status: 'unscheduled' as EventStatus,
          date: '',
          startTime: '',
          dayIndex: 0,
        };
        
        // Ajouter aux rendez-vous non programmés
        setUnscheduledAppointments(current => [...current, unscheduledApt]);
        
        // Appeler l'API pour mettre à jour le statut
        calendarEventsAPI.updateStatus(appointmentId, 'unscheduled')
          .then(() => {
            toast.success('Rendez-vous déplacé vers "À programmer"');
          })
          .catch((error) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
            toast.error('Erreur lors de la déprogrammation');
          });
        
        // Retirer des appointments programmés
        return currentAppointments.filter(apt => apt.id !== appointmentId);
      }
      
      return currentAppointments;
    });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;

    try {
      await calendarEventsAPI.update({
        id: editingAppointment.id,
        date: editingAppointment.date,
        startTime: editingAppointment.startTime,
        duration: editingAppointment.duration * 60,
        title: editingAppointment.type,
        location: editingAppointment.location,
        status: editingAppointment.status,
        eventType: editingAppointment.eventType,
      });

      toast.success('Rendez-vous modifié avec succès');
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      
      // Recharger tous les événements pour synchroniser avec le backend
      await loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la modification du rendez-vous:', error);
      toast.error('Erreur lors de la modification du rendez-vous');
    }
  };

  const proposedCount = appointments.filter(a => a.status === 'proposed').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 mb-2">Planning hebdomadaire</h1>
            <p className="text-gray-600 hidden sm:block">Glissez-déposez les interventions pour les déplacer ou programmer</p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={() => setIsAddEventDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
          <AddEventDialog
            open={isAddEventDialogOpen}
            onOpenChange={setIsAddEventDialogOpen}
            onCreated={() => loadAppointments()}
          />
        </div>

        {proposedCount > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-gray-900">
                  Vous avez {proposedCount} intervention{proposedCount > 1 ? 's' : ''} proposée{proposedCount > 1 ? 's' : ''} cette semaine
                </p>
                <p className="text-sm text-gray-600">
                  Cliquez sur les interventions jaunes pour les valider
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          {/* Navigation - Desktop: semaine, Mobile: jour */}
          {!isMobile ? (
            // Vue Desktop - Navigation par semaine
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <Button variant="outline" onClick={() => setCurrentWeek(currentWeek - 1)} className="w-full sm:w-auto">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Semaine précédente
              </Button>
              <h2 className="text-gray-900 text-center">{weekRange}</h2>
              <Button variant="outline" onClick={() => setCurrentWeek(currentWeek + 1)} className="w-full sm:w-auto">
                Semaine suivante
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            // Vue Mobile - Navigation par jour
            <div className="flex items-center justify-between gap-4 mb-6">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentDayIndex(currentDayIndex === 0 ? 6 : currentDayIndex - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <div className="text-sm text-gray-500">{weekDays[currentDayIndex].day}</div>
                <h2 className="text-gray-900">{weekDays[currentDayIndex].date}</h2>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentDayIndex(currentDayIndex === 6 ? 0 : currentDayIndex + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Calendar Grid et Chantiers à programmer */}
          <div className="flex gap-4">
            {/* Liste des chantiers à programmer - rétractable horizontalement */}
            {!isMobile && (
              <div className={`transition-all duration-300 flex-shrink-0 ${
                isUnscheduledOpen ? 'w-64' : 'w-12'
              }`}>
                {isUnscheduledOpen ? (
                  <UnscheduledDropZone onDrop={handleUnschedule}>
                    <Card className="border-2 border-orange-200 bg-orange-50 h-full">
                      <div className="flex items-center justify-between p-4 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                          <CalendarX className="w-5 h-5 text-orange-600" />
                          <span className="text-gray-900">À programmer</span>
                          {unscheduledAppointments.length > 0 && (
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                              {unscheduledAppointments.length}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsUnscheduledOpen(false)}
                          className="h-8 w-8 hover:bg-orange-100"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                        {unscheduledAppointments.length > 0 ? (
                          unscheduledAppointments.map((apt) => (
                            <UnscheduledChantier key={apt.id} appointment={apt} />
                          ))
                        ) : (
                          <div className="text-center text-sm text-gray-500 py-8">
                            Aucun rendez-vous à programmer
                          </div>
                        )}
                      </div>
                    </Card>
                  </UnscheduledDropZone>
                ) : (
                  <button
                    onClick={() => setIsUnscheduledOpen(true)}
                    className="h-full w-12 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex flex-col items-center justify-center gap-2 py-4"
                  >
                    <ChevronRight className="w-5 h-5 text-orange-600" />
                    <div className="text-sm text-gray-900" style={{ writingMode: 'vertical-rl' }}>
                      À programmer
                    </div>
                    {unscheduledAppointments.length > 0 && (
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                        {unscheduledAppointments.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Calendrier */}
            <div className="flex-1">
              {!isMobile ? (
                // Vue Desktop - Toute la semaine
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                {/* Header with days */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-white p-3"></div>
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className={`bg-white p-3 text-center ${
                        index === 3 ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="text-sm text-gray-500">{day.day}</div>
                      <div className="text-gray-900">{day.date}</div>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-200 border-x border-b border-gray-200">
                  {timeSlots.map((time, timeIndex) => (
                    <React.Fragment key={`row-${timeIndex}`}>
                      <div className="bg-white p-2 text-sm text-gray-500 text-right pr-3">
                        {time}
                      </div>
                      {weekDays.map((_, dayIndex) => (
                        <DroppableCell
                          key={`cell-${timeIndex}-${dayIndex}`}
                          dayIndex={dayIndex}
                          timeSlot={time}
                          onDrop={handleDrop}
                        >
                          {timeIndex === 0 &&
                            appointments
                              .filter((apt) => apt.dayIndex === dayIndex)
                              .map((apt) => {
                                const style = getAppointmentStyle(apt.startTime, apt.duration);
                                return (
                                  <DraggableAppointment
                                    key={apt.id}
                                    appointment={apt}
                                    style={style}
                                    onEdit={handleEdit}
                                    onConfirm={handleConfirmAppointment}
                                    onStatusChange={handleStatusChange}
                                  />
                                );
                              })}
                        </DroppableCell>
                      ))}
                    </React.Fragment>
                  ))}
                  </div>
                </div>
              </div>
            ) : (
              // Vue Mobile - Un seul jour
              <div>
              {/* Header pour le jour sélectionné */}
              <div className="grid grid-cols-[60px_1fr] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-px">
                <div className="bg-white p-2"></div>
                <div className="bg-green-50 p-3 text-center">
                  <div className="text-sm text-gray-500">{weekDays[currentDayIndex].day}</div>
                  <div className="text-gray-900">{weekDays[currentDayIndex].date}</div>
                </div>
              </div>

              {/* Calendar grid pour le jour sélectionné */}
              <div className="grid grid-cols-[60px_1fr] gap-px bg-gray-200 border-x border-b border-gray-200">
                {timeSlots.map((time, timeIndex) => (
                  <React.Fragment key={`mobile-row-${timeIndex}`}>
                    <div className="bg-white p-2 text-xs text-gray-500 text-right pr-2">
                      {time}
                    </div>
                    <DroppableCell
                      key={`cell-${timeIndex}-${currentDayIndex}`}
                      dayIndex={currentDayIndex}
                      timeSlot={time}
                      onDrop={handleDrop}
                    >
                      {timeIndex === 0 &&
                        appointments
                          .filter((apt) => apt.dayIndex === currentDayIndex)
                          .map((apt) => {
                            const style = getAppointmentStyle(apt.startTime, apt.duration);
                            return (
                              <DraggableAppointment
                                key={apt.id}
                                appointment={apt}
                                style={style}
                                onEdit={handleEdit}
                                onConfirm={handleConfirmAppointment}
                                onStatusChange={handleStatusChange}
                              />
                            );
                          })}
                    </DroppableCell>
                  </React.Fragment>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Chantiers à programmer - Version mobile */}
          {isMobile && unscheduledAppointments.length > 0 && (
            <div className="mt-6">
              <Collapsible open={isUnscheduledOpen} onOpenChange={setIsUnscheduledOpen}>
                <UnscheduledDropZone onDrop={handleUnschedule}>
                  <Card className="border-2 border-orange-200 bg-orange-50">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 hover:bg-orange-100"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarX className="w-5 h-5 text-orange-600" />
                          <span className="text-gray-900">Chantiers à programmer</span>
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                            {unscheduledAppointments.length}
                          </span>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 space-y-3">
                        {unscheduledAppointments.map((apt) => (
                          <UnscheduledChantier key={apt.id} appointment={apt} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </UnscheduledDropZone>
              </Collapsible>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700">Total {isMobile ? 'jour' : 'semaine'}</span>
              <span className="text-blue-600">
                {isMobile 
                  ? appointments.filter(apt => apt.dayIndex === currentDayIndex).length
                  : appointments.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700">Proposées</span>
              <span className="text-yellow-600">{proposedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700">Confirmées</span>
              <span className="text-green-600">{confirmedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700">À programmer</span>
              <span className="text-orange-600">{unscheduledAppointments.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700">Heures</span>
              <span className="text-purple-600">
                {isMobile
                  ? appointments
                      .filter(apt => apt.dayIndex === currentDayIndex)
                      .reduce((sum, apt) => sum + apt.duration, 0)
                  : appointments.reduce((sum, apt) => sum + apt.duration, 0)}h
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded"></div>
              <span className="text-gray-600">Proposée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Confirmée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Manuelle</span>
            </div>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'intervention</DialogTitle>
              <DialogDescription>
                Modifier les détails de l'intervention
              </DialogDescription>
            </DialogHeader>
            {editingAppointment && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client</Label>
                  <Input
                    id="edit-client"
                    value={editingAppointment.client}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type d'intervention</Label>
                  <Input
                    id="edit-type"
                    value={editingAppointment.type}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      // Calculer le dayIndex basé sur la nouvelle date
                      const selectedDate = new Date(newDate);
                      const weekStart = new Date(weekDays[0].fullDate);
                      const diffTime = selectedDate.getTime() - weekStart.getTime();
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                      
                      setEditingAppointment({
                        ...editingAppointment,
                        date: newDate,
                        dayIndex: diffDays >= 0 && diffDays < 7 ? diffDays : editingAppointment.dayIndex
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-time">Heure de début</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingAppointment.startTime}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      startTime: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Durée (heures)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editingAppointment.duration}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      duration: parseFloat(e.target.value) || 1
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    value={editingAppointment.status}
                    onValueChange={(value: EventStatus) => setEditingAppointment({
                      ...editingAppointment,
                      status: value
                    })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposed">Proposé</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="unscheduled">Non programmé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">Lieu</Label>
                  <Input
                    id="edit-location"
                    value={editingAppointment.location}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      location: e.target.value
                    })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingAppointment(null);
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
