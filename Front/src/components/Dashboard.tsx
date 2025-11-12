import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Clock, Phone, MapPin, Key, Plus, UserPlus, Briefcase, CalendarPlus, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ProjectForm } from './ProjectForm';
import { dashboardAPI, clientsAPI, type DashboardStats, type Client, remarksAPI } from '../api/apiClient';

interface DashboardProps {
  onNavigate?: (page: string, clientId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [duration, setDuration] = useState('60');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  // New client form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [remarkImages, setRemarkImages] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newAccess, setNewAccess] = useState('');
  const [newHasKey, setNewHasKey] = useState(false);
  const [newType, setNewType] = useState<'particulier' | 'professionnel'>('particulier');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  // Dialog open state for remark creation
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  // Dialog open state for project/intervention creation
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (e: any) {
      setAppointmentsError(e.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (e: any) {
      setClientsError(e.message || 'Erreur lors du chargement des clients');
    } finally {
      setClientsLoading(false);
    }
  }, []);

    const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              newImages.push(e.target.result as string);
                setRemarkImages([...remarkImages, ...newImages]);
              
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

    const handleAddRemark = async (): Promise<boolean> => {
      if (!selectedClient) {
        alert('Sélectionnez un client');
        return false;
      }
      if (!(newRemark.trim() || remarkImages.length > 0)) {
        alert('Ajoutez du texte ou une image');
        return false;
      }
      try {
        const created = await remarksAPI.create(selectedClient, newRemark.trim(), remarkImages);
        // (Optionnel) On pourrait ajouter la remarque dans une liste si affichée sur le dashboard
        setSelectedClient('');
        setNewRemark('');
        setRemarkImages([]);
        return true;
      } catch (e: any) {
        alert(e.message || 'Erreur lors de l\'ajout de la remarque');
        return false;
      }
    };
    

  useEffect(() => {
    loadStats();
    loadClients();
  }, [loadStats, loadClients]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add Client */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-auto py-6 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-6 h-6" />
              <span>Ajouter un client</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations du client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client-name">Nom complet</Label>
                <Input id="client-name" placeholder="Ex: Marie Dubois" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="client-email">Email</Label>
                <Input id="client-email" type="email" placeholder="email@exemple.fr" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="client-phone">Téléphone</Label>
                <Input id="client-phone" placeholder="06 12 34 56 78" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="client-address">Adresse</Label>
                <Input id="client-address" placeholder="12 rue des Fleurs, 75001 Paris" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="client-access">Informations d'accès</Label>
                <Textarea
                  id="client-access"
                  placeholder="Code portail, digicode, instructions d'accès..."
                  rows={3}
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optionnel : codes, instructions pour accéder au terrain
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="client-hasKey" checked={newHasKey} onCheckedChange={(v: boolean | 'indeterminate') => setNewHasKey(v === true)} />
                <label
                  htmlFor="client-hasKey"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-amber-600" />
                  Je possède une clé pour ce client
                </label>
              </div>
              <div>
                <Label htmlFor="client-type">Type</Label>
                <select
                  id="client-type"
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'particulier' | 'professionnel')}
                >
                  <option value="particulier">Particulier</option>
                  <option value="professionnel">Professionnel</option>
                </select>
              </div>
              {createError && (
                <div className="text-sm text-red-600">{createError}</div>
              )}
              {createSuccess && (
                <div className="text-sm text-green-600">Client ajouté avec succès.</div>
              )}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createLoading}
                onClick={async () => {
                  setCreateError(null);
                  setCreateSuccess(false);
                  if (!newName || !newEmail || !newPhone || !newAddress) {
                    setCreateError('Veuillez remplir les champs requis (nom, email, téléphone, adresse).');
                    return;
                  }
                  setCreateLoading(true);
                  try {
                    await clientsAPI.create({
                      name: newName.trim(),
                      email: newEmail.trim(),
                      phone: newPhone.trim(),
                      address: newAddress.trim(),
                      access: newAccess.trim() || null,
                      hasKey: newHasKey,
                      type: newType,
                    });
                    await loadClients();
                    setNewName('');
                    setNewEmail('');
                    setNewPhone('');
                    setNewAddress('');
                    setNewAccess('');
                    setNewHasKey(false);
                    setNewType('particulier');
                    setCreateSuccess(true);
                  } catch (e: any) {
                    setCreateError(e.message || 'Erreur lors de la création du client');
                  } finally {
                    setCreateLoading(false);
                  }
                }}
              >
                {createLoading ? 'Enregistrement...' : 'Ajouter le client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Intervention */}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-auto py-6 flex flex-col gap-2 bg-green-600 hover:bg-green-700">
              <Briefcase className="w-6 h-6" />
              <span>Ajouter un Projet</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Ajouter un projet ponctuel ou récurrent
              </DialogDescription>
            </DialogHeader>
            <ProjectForm onCreated={() => setIsProjectDialogOpen(false)} />
          </DialogContent>
  </Dialog>
  {/* Add Appointment */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-auto py-6 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700">
              <CalendarPlus className="w-6 h-6" />
              <span>Ajouter un RDV</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un rendez-vous</DialogTitle>
              <DialogDescription>
                Planifier un nouveau rendez-vous
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rdv-client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsLoading && <div className="px-2 py-1 text-sm text-gray-500">Chargement...</div>}
                    {clientsError && <div className="px-2 py-1 text-sm text-red-600">{clientsError}</div>}
                    {!clientsLoading && !clientsError && clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rdv-location">Lieu</Label>
                <Input id="rdv-location" placeholder="Adresse du rendez-vous" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rdv-date">Date</Label>
                  <Input id="rdv-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="rdv-time">Heure</Label>
                  <Input id="rdv-time" type="time" />
                </div>
              </div>
              <div>
                <Label htmlFor="rdv-duration">Durée (minutes)</Label>
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
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Ajouter le rendez-vous
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Add Remark */}
        <Dialog open={isRemarkDialogOpen} onOpenChange={setIsRemarkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-auto py-6 flex flex-col gap-2 bg-orange-600 hover:bg-orange-700">
              <MessageSquare className="w-6 h-6" />
              <span>Ajouter une remarque</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une remarque</DialogTitle>
              <DialogDescription>
                Ajouter une remarque pour un client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="remark-client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsLoading && <div className="px-2 py-1 text-sm text-gray-500">Chargement...</div>}
                    {clientsError && <div className="px-2 py-1 text-sm text-red-600">{clientsError}</div>}
                    {!clientsLoading && !clientsError && clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="remark-text">Remarque</Label>
                <Textarea
                  id="remark-text"
                  placeholder="Notez vos observations, demandes du client, etc..."
                  rows={5}
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}  
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddRemark();
                      }
                    }}
                />
              </div>
              <div>
                <Label htmlFor="remark-images">Images (optionnel)</Label>
                <Input ref={fileInputRef} onChange={handleImageUpload} id="remark-images" type="file" accept="image/*" multiple />
                <p className="text-sm text-gray-500 mt-1">
                  Vous pouvez ajouter plusieurs images
                </p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={async () => {
                  const success = await handleAddRemark();
                  if (success) setIsRemarkDialogOpen(false);
                }}
              >
                Enregistrer la remarque
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Today's Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Rendez-vous d'aujourd'hui</h2>
          <button 
            onClick={() => onNavigate?.('calendar')}
            className="text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
            title="Voir le planning"
          >
            <CalendarPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {appointmentsLoading && (
            <div className="text-sm text-gray-500">Chargement des rendez-vous...</div>
          )}
          {appointmentsError && !appointmentsLoading && (
            <div className="text-sm text-red-600">{appointmentsError}</div>
          )}
          {!appointmentsLoading && !appointmentsError && stats?.upcomingAppointments?.length === 0 && (
            <div className="text-sm text-gray-500">Aucun rendez-vous pour aujourd'hui.</div>
          )}
          {!appointmentsLoading && !appointmentsError && stats?.upcomingAppointments?.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">{appointment.time}</span>
                    {appointment.clientHasKey && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                        <Key className="w-3 h-3" /> Clé
                      </div>
                    )}
                  </div>
                  <p className="text-gray-900 mb-1">{appointment.clientName}</p>
                  <p className="text-sm text-gray-600 mb-2">{appointment.type}</p>
                  
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{appointment.clientAddress}</span>
                  </div>
                  {appointment.clientAccess && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded p-2 mt-2">
                      <span className="text-blue-600">🔑</span>
                      <span className="flex-1 text-blue-900">{appointment.clientAccess}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(appointment.clientAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Ouvrir dans Google Maps"
                  >
                    <MapPin className="w-5 h-5" />
                  </a>
                  <a
                    href={`tel:${appointment.clientPhone.replace(/\s/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title={`Appeler ${appointment.clientName}`}
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
