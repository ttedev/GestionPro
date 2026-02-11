import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { calendarEventsAPI, clientsAPI, type Client, type CalendarEvent, type EventType } from '../api/apiClient';
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (event: CalendarEvent) => void;
  defaultDate?: string; // Format YYYY-MM-DD
  defaultTime?: string; // Format HH:mm
}

export function AddEventDialog({
  open,
  onOpenChange,
  onCreated,
  defaultDate,
  defaultTime,
}: AddEventDialogProps) {
  // Form state
  const [eventType, setEventType] = useState<EventType>('rdv');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les clients
  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (e) {
      console.error('Erreur chargement clients', e);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadClients();
      // Réinitialiser le formulaire
      setEventType('rdv');
      setTitle('');
      setDescription('');
      setClientId('');
      setLocation('');
      setDate(defaultDate || '');
      setTime(defaultTime || '');
      setDuration('60');
      setNotes('');
      setError(null);
    }
  }, [open, loadClients, defaultDate, defaultTime]);

  // Mettre à jour le titre automatiquement selon le type
  useEffect(() => {
    if (!title || title === 'Rendez-vous' || title === 'Prospection' || title === 'Autre') {
      switch (eventType) {
        case 'rdv':
          setTitle('Rendez-vous');
          break;
        case 'prospection':
          setTitle('Prospection');
          break;
        case 'autre':
          setTitle('Autre');
          break;
      }
    }
  }, [eventType]);

  // Mettre à jour la location quand un client est sélectionné
  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client && client.addresses && client.addresses.length > 0) {
        const addr = client.addresses[0];
        setLocation(`${addr.street}, ${addr.postalCode} ${addr.city}`);
      }
    }
  }, [clientId, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventData: any = {
        eventType,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        duration: parseInt(duration),
        notes: notes.trim() || null,
        status: date && time ? 'confirmed' : 'proposed',
      };

      // Client optionnel
      if (clientId) {
        eventData.clientId = clientId;
      }

      // Date et heure optionnelles
      if (date && time) {
        eventData.date = date;
        eventData.startTime = time;
      }

      const created = await calendarEventsAPI.create(eventData);
      onCreated?.(created);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un événement</DialogTitle>
          <DialogDescription>
            Créer un nouveau rendez-vous ou événement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type d'événement */}
          <div className="space-y-2">
            <Label>Type d'événement</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rdv">Rendez-vous</SelectItem>
                <SelectItem value="prospection">Prospection</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Titre
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'événement"
              required
            />
          </div>

          {/* Client (optionnel) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Client (optionnel)
            </Label>
            <Select
              value={clientId || 'none'}
              onValueChange={(value) => setClientId(value === 'none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun client</SelectItem>
                {clientsLoading && (
                  <div className="px-2 py-1 text-sm text-gray-500">Chargement...</div>
                )}
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lieu
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Adresse ou lieu"
            />
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Laissez vide pour créer un événement non programmé
          </p>

          {/* Durée */}
          <div className="space-y-2">
            <Label>Durée</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
                <SelectItem value="180">3 heures</SelectItem>
                <SelectItem value="240">4 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'événement"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes supplémentaires"
              rows={2}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'événement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


