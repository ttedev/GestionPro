import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Repeat, Calendar } from 'lucide-react';
import { projectsAPI, chantiersAPI, type BackendProjectStatus, clientsAPI, Client } from '../api/apiClient';
import { MonthlyPlan } from '../types';

interface MonthlyPlanItem { month: string; occurence: number; }

interface ProjectFormProps {
  clientId?: string;
  onCreated?: (id: string) => void;
}

export function ProjectForm({ clientId, onCreated }: ProjectFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [location, setLocation] = useState('');
  const [durationHoursInput, setDurationHoursInput] = useState('1');
  const [clients, setClients] = useState<Client[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [durationMonthsInput, setDurationMonthsInput] = useState('3');
  const [startMonth, setStartMonth] = useState<string>('');
  const [plans, setPlans] = useState<MonthlyPlanItem[]>([]);
  const [status, setStatus] = useState<BackendProjectStatus>('en_cours');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRecurring) {
      const durationMonths = parseInt(durationMonthsInput) || 1;
      const base = startMonth ? new Date(startMonth + '-01') : new Date();
      const newPlans: MonthlyPlanItem[] = [];
      for (let i = 0; i < durationMonths; i++) {
        const d = new Date(base);
        d.setMonth(base.getMonth() + i);
        d.setHours(12, 0, 0, 0);
        const mStr = d.toISOString().slice(0,7);
        const existing = plans.find(p => p.month === mStr);
        newPlans.push({ month: mStr, occurence: existing?.occurence || 1 });
      }

      setPlans(newPlans);
    } else {
      setPlans([]);
    }

  }, [isRecurring, durationMonthsInput, startMonth]);


    useEffect(() => {
      loadClients();
    }, []);

    const loadClients = useCallback(async () => {
      try {
        const data = await clientsAPI.getAll();
        setClients(data);
      } catch (e) {
        console.error('Erreur chargement clients', e);
      }
    }, []);

  const updatePlan = (month: string, occurence: number) => {
    setPlans(prev => prev.map(p => p.month === month ? { ...p, occurence } : p));
  };

  const handleSubmit = async () => {
    if (!selectedClientId || !title.trim()) {
      setError('Client et titre requis');
      return;
    }
    setSubmitting(true); setError(null);
    try {
      const project = await projectsAPI.create({
        clientId: selectedClientId,
        title: title.trim(),
        description: description.trim(),
        type: isRecurring ? 'recurrent' : 'ponctuel',
        status,
        planTravaux: isRecurring ? plans.map(p => ({
          mois: p.month,
          occurence: p.occurence,
        })) : [],
        startDate: startDate || undefined,
        location: location || undefined,
        dureeEnMinutes: Math.round((parseFloat(durationHoursInput.replace(',', '.')) || 1) * 60),
        premierMois: isRecurring ? startMonth : undefined,
        dureeMois: isRecurring ? (parseInt(durationMonthsInput) || 1) : undefined,
      });

      onCreated?.(project.id);
      // reset
      setTitle(''); setDescription(''); setLocation(''); setStartDate(''); setStartMonth(''); setPlans([]);
    } catch (e: any) {
      setError(e.message || 'Erreur création projet');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Titre</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entretien pelouse" />
      </div>
            <div>
        <Label htmlFor="client-select">Client</Label>
        <Select defaultValue={clientId || ''} value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger id="client-select">
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={String(client.id)}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Durée unitaire (heures)</Label>
          <Input type="text" inputMode="decimal" value={durationHoursInput} onChange={e => {
            const val = e.target.value.replace(',', '.');
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              setDurationHoursInput(e.target.value);
            }
          }} placeholder="Ex: 2.5 ou 2,5 pour 2h30" />
        </div>
      </div>
      <div>
        <Label>Statut initial</Label>
        <Select value={status} onValueChange={(v: BackendProjectStatus) => setStatus(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Repeat className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-gray-900">Projet récurrent</div>
            <div className="text-sm text-gray-500">Créer plusieurs chantiers sur plusieurs mois</div>
          </div>
        </div>
        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
      </div>
      {isRecurring ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mois de départ</Label>
              <Input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} />
            </div>
            <div>
              <Label>Durée (mois)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={durationMonthsInput}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^\d{0,2}$/.test(val)) {
                    setDurationMonthsInput(val);
                  }
                }}
                placeholder="3"
              />
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-3">
            <Label>Nombre de chantiers par mois</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {plans.map(plan => (
                <div key={plan.month} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{new Date(plan.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <Input type="number" min={0} max={31} value={plan.occurence} onChange={e => updatePlan(plan.month, parseInt(e.target.value)||0)} className="w-20" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) 
      : null}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button disabled={submitting} className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
        {submitting ? 'Création...' : 'Créer le projet'}
      </Button>
    </div>
  );
}
