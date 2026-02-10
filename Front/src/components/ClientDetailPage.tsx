import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Mail, Phone, MapPin, Plus, Calendar, Clock, Check, AlertCircle, Edit2, Trash2, Send, Image as ImageIcon, X, Navigation, ChevronDown, ChevronUp, Key, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
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
import { clientsAPI, projectsAPI, remarksAPI, calendarEventsAPI, type Client as ClientType, type ProjectDTO, type ChantierDTO, type Remark as ApiRemark, type CalendarEvent, type EventStatus } from '../api/apiClient';
import { ProjectForm } from './ProjectForm';
import { EditClientDialog } from './EditClientDialog';
import { formatPhone } from '../utils/formatters';

interface ClientDetailPageProps {
  clientId: string;
  onBack: () => void;
}

export function ClientDetailPage({ clientId, onBack }: ClientDetailPageProps) {
  const [listProjects, setListProjects] = useState<ProjectDTO[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPastChantierOpen, setIsPastChantierOpen] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [remarkImages, setRemarkImages] = useState<string[]>([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  // Track previous open state to trigger reload only when closing
  const prevProjectDialogOpen = useRef(isProjectDialogOpen);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // -------- API driven state (replaces mocks) --------
  const [client, setClient] = useState<ClientType | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Type enrichi pour affichage avec infos du CalendarEvent
  interface UIChantier extends ChantierDTO {
    id: string;
    calendarEvent?: CalendarEvent;
    // Propriétés dérivées du CalendarEvent pour faciliter l'affichage
    status?: EventStatus;
    date?: string;
    startTime?: string;
  }
  const [upcomingChantiers, setUpcomingChantiers] = useState<UIChantier[]>([]);
  const [pastChantiers, setPastChantiers] = useState<UIChantier[]>([]);
  const [chantiersLoading, setChantiersLoading] = useState(false);
  const [chantiersError, setChantiersError] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  interface UIRemark { id: number; date: string; time: string; text: string; images: string[]; }
  const [remarks, setRemarks] = useState<UIRemark[]>([]);
  const [remarksLoading, setRemarksLoading] = useState(false);
  const [remarksError, setRemarksError] = useState<string | null>(null);
  // Image preview (lightbox)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };


  const loadClient = useCallback(async () => {
    setClientLoading(true); setClientError(null);
    try { const data = await clientsAPI.getById(clientId); setClient(data); }
    catch (e: any) { setClientError(e.message || 'Erreur client'); }
    finally { setClientLoading(false); }
  }, [clientId]);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true); setProjectsError(null);
    try {
      const data = await projectsAPI.getAll({ clientId });
      setListProjects(data);

      // Charger les CalendarEvents pour ce client
      const [unscheduled, scheduled] = await Promise.all([
        calendarEventsAPI.getUnscheduledEvents(),
        calendarEventsAPI.getAll({
          startDate: '2020-01-01',
          endDate: '2030-12-31',
          eventType: 'chantier'
        })
      ]);

      // Filtrer les événements pour ce client
      const clientEvents = [...unscheduled, ...scheduled].filter(e => e.clientId === clientId);
      setCalendarEvents(clientEvents);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcoming: UIChantier[] = [];
      const past: UIChantier[] = [];

      data.forEach(project => {
        project.chantiers?.forEach(chantier => {
          // Trouver le CalendarEvent associé
          const event = clientEvents.find(e => e.chantierId === chantier.id);
          const enrichedChantier: UIChantier = {
            ...chantier,
            calendarEvent: event,
            status: event?.status || 'unscheduled',
            date: event?.date || undefined,
            startTime: event?.startTime || undefined,
          };

          if (!event?.date) {
            upcoming.push(enrichedChantier);
          } else {
            const d = new Date(event.date);
            if (d.getTime() >= now.getTime()) {
              upcoming.push(enrichedChantier);
            } else {
              past.push(enrichedChantier);
            }
          }
        });
      });

      setUpcomingChantiers(upcoming);
      setPastChantiers(past);
    }
    catch (e: any) { setProjectsError(e.message || 'Erreur projets'); }
    finally { setProjectsLoading(false); }
  }, [clientId]);

  const loadRemarks = useCallback(async () => {
    setRemarksLoading(true); setRemarksError(null);
    try {
      const data = await remarksAPI.getByClientId(clientId);
      const mapped: UIRemark[] = data.map((r: ApiRemark) => ({
        id: Number(r.id),
        date: formatDate(r.createdAt),
        time: formatTime(r.createdAt),
        text: r.content,
        images: r.images || [],
      })).sort((a,b) => b.id - a.id);
      setRemarks(mapped);
    } catch (e: any) { setRemarksError(e.message || 'Erreur remarques'); }
    finally { setRemarksLoading(false); }
  }, [clientId]);

  useEffect(() => { loadClient();  loadRemarks();loadProjects() }, [loadClient,  loadRemarks, loadProjects]);

  // Reload projects when the project dialog closes (after creation or cancel)
  useEffect(() => {
    if (prevProjectDialogOpen.current && !isProjectDialogOpen) {
      // Dialog transitioned from open -> closed
      loadProjects();
    }
    prevProjectDialogOpen.current = isProjectDialogOpen;
  }, [isProjectDialogOpen, loadProjects]);

  const handleConfirmChantier = async (id: string) => {
    try {
      await calendarEventsAPI.confirm(id);
      // Mettre à jour l'état local
      setUpcomingChantiers(prev => prev.map(chantier =>
        chantier.id === id
          ? { ...chantier, status: 'confirmed' as EventStatus }
          : chantier
      ));
    } catch (e: any) {
      console.error('Erreur confirmation chantier', e);
    }
  };

  const handleEdit = (project: ProjectDTO) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingProject) {
      setIsEditDialogOpen(false);
      setEditingProject(null);
      // TODO: patch backend update
    }
  };


  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await calendarEventsAPI.updateStatus(id, status);
      setUpcomingChantiers(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch (e: any) {
      console.error('Erreur changement status', e);
    }
  };

  const handleAddRemark = async () => {
    if (newRemark.trim() || remarkImages.length > 0) {
      try {
        const created = await remarksAPI.create(clientId, newRemark.trim(), remarkImages);
        const newRemarkObj = {
          id: Number(created.id),
          date: formatDate(created.createdAt),
          time: formatTime(created.createdAt),
          text: created.content,
          images: [...remarkImages],
        };
        setRemarks(prev => [newRemarkObj, ...prev]);
        setNewRemark('');
        setRemarkImages([]);
      } catch (e: any) {
        alert(e.message || 'Erreur lors de l\'ajout de la remarque');
      }
    }
  };

  const handleDeleteRemark = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette remarque ?')) {
      try { await remarksAPI.delete(id); setRemarks(prev => prev.filter(r => r.id !== id)); }
      catch (e: any) { alert(e.message || 'Suppression impossible'); }
    }
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

  const handleRemoveImage = (index: number) => {
    setRemarkImages(remarkImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-4">
            <span className="text-green-700 text-3xl">{client ? client.name.charAt(0) : '…'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-center text-gray-900">
              {clientLoading ? 'Chargement…' : clientError ? 'Erreur' : client?.name || '—'}
            </h2>
            {client && (
              <EditClientDialog
                client={client}
                trigger={
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Pencil className="w-4 h-4 text-gray-500 hover:text-green-600" />
                  </Button>
                }
                onClientUpdated={(updatedClient) => {
                  setClient(updatedClient);
                }}
              />
            )}
          </div>
          <div className="space-y-3 text-sm">
            {client && (
              <div className="flex items-center gap-2 text-gray-600 p-2 bg-gray-50 rounded">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600 p-2 bg-gray-50 rounded">
              <Phone className="w-4 h-4 flex-shrink-0" />
              {client?.phone ? formatPhone(client.phone) : '—'}
            </div>

            {/* Liste de toutes les adresses */}
            {client?.addresses && client.addresses.length > 0 ? (
              <div className="space-y-4">
                {client.addresses.map((addr, index) => (
                  <div key={addr.id || index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{addr.street}, {addr.postalCode} {addr.city}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const address = encodeURIComponent(`${addr.street}, ${addr.postalCode} ${addr.city}`);
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Maps
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const address = encodeURIComponent(`${addr.street}, ${addr.postalCode} ${addr.city}`);
                          window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Waze
                      </Button>
                    </div>

                    {addr.acces && (
                      <div className="flex items-start gap-2 text-gray-600 p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-blue-600 text-sm flex-shrink-0">🔑</span>
                        <div className="flex-1">
                          <p className="text-xs text-blue-600">Accès</p>
                          <p className="text-sm text-blue-900">{addr.acces}</p>
                        </div>
                      </div>
                    )}

                    {addr.hasKey && (
                      <div className="flex items-center gap-2 text-amber-700 p-2 bg-amber-50 border border-amber-200 rounded">
                        <Key className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">Clé en possession</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-gray-600 p-2 bg-gray-50 rounded">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Aucune adresse</span>
              </div>
            )}
            {clientError && <p className="text-sm text-red-600">{clientError}</p>}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Interventions récurrentes */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Projets</h2>
              <Dialog  open={isProjectDialogOpen} onOpenChange={(open: boolean) => { 
                setIsProjectDialogOpen(open); 
              }} >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Projet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un projet</DialogTitle>
                    <DialogDescription>
                      Ajouter un projet pour {client?.name || '—'}          
                    </DialogDescription>
                  </DialogHeader>
                  <ProjectForm onCreated={() => setIsProjectDialogOpen(false)} clientId={client?.id}/>

                </DialogContent>
              </Dialog>
            <div className="space-y-3">
              {listProjects.map(project => (
                <div key={project.id} className="flex gap-4 p-4 border border-blue-200 bg-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{project.title}</span>
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                        {project.dureeMois} mois
                      </span>
                    </div>
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{project.chantiers?.length ? upcomingChantiers.filter(c => c.projectId === project.id).length : 0} à venir</span>
                    <span>•</span>
                    <span>{project.chantiers?.length ? pastChantiers.filter(c => c.projectId === project.id && c.status === 'completed').length : 0} terminés</span>
                                        <Button
                        onClick={() => handleEdit(project)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                  </div>
                </div>
              </div>
              ))}
              <p className="text-sm text-gray-500 text-center py-2">
                Cliquez sur une intervention pour voir les chantiers
              </p>
            </div>
          </Card>

          {upcomingChantiers.some(i => i.status === 'proposed') && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-gray-900">
                    Chantiers proposés à valider
                  </p>
                  <p className="text-sm text-gray-600">
                    {upcomingChantiers.filter(i => i.status === 'proposed').length} chantier{upcomingChantiers.filter(i => i.status === 'proposed').length > 1 ? 's' : ''} en attente de validation
                  </p>
                </div>
              </div>
            </Card>
          )}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-gray-900">Prochains chantiers</h2>

            </div>
            <div className="space-y-3">
              {upcomingChantiers.map((chantier) => (
                <div
                  key={chantier.id}
                  className={`flex gap-4 p-4 border rounded-lg transition-all ${
                    chantier.status === 'proposed'
                      ? 'border-yellow-300 bg-yellow-50'
                      : chantier.status === 'confirmed'
                      ? 'border-green-300 bg-green-50'
                      : chantier.status === 'unscheduled'
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${
                    chantier.status === 'proposed'
                      ? 'bg-yellow-100'
                      : chantier.status === 'confirmed'
                      ? 'bg-green-100'
                      : chantier.status === 'unscheduled'
                      ? 'bg-orange-100'
                      : 'bg-blue-50'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      chantier.status === 'proposed'
                        ? 'text-yellow-600'
                        : chantier.status === 'confirmed'
                        ? 'text-green-600'
                        : chantier.status === 'unscheduled'
                        ? 'text-orange-600'
                        : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={
                        chantier.status === 'proposed'
                          ? 'text-yellow-700'
                          : chantier.status === 'confirmed'
                          ? 'text-green-700'
                          : chantier.status === 'unscheduled'
                          ? 'text-orange-700'
                          : 'text-gray-900'
                      }>{chantier.date ? formatDate(chantier.date) : (chantier.monthTarget || 'Non planifié')}</span>
                      {chantier.startTime && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{chantier.startTime}</span>
                        </>
                      )}
                      {chantier.status === 'proposed' && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          À valider
                        </span>
                      )}
                      {chantier.status === 'confirmed' && (
                        <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Confirmé
                        </span>
                      )}
                      {chantier.status === 'unscheduled' && (
                        <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Non planifié
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-1">{chantier.projectName}</p>
                    <p className="text-sm text-gray-600">{chantier.projectName}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {chantier.status === 'proposed' && (
                        <Button
                          onClick={() => handleConfirmChantier(chantier.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Valider
                        </Button>
                      )}
                      {chantier.status === 'confirmed' && (
                        <Button
                          onClick={() => handleStatusChange(chantier.id, 'proposed')}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                          size="sm"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Repasser en proposition</span>
                          <span className="sm:hidden">En proposition</span>
                        </Button>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Collapsible open={isPastChantierOpen} onOpenChange={setIsPastChantierOpen}>
            <Card className="p-6">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between hover:opacity-70 transition-opacity">
                  <h2 className="text-gray-900">Derniers chantiers</h2>
                  {isPastChantierOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4">
                <div className="space-y-3">
                  {pastChantiers.map((chantier) => (
                    <div
                      key={chantier.id}
                      className={`flex gap-4 p-4 border rounded-lg transition-colors ${
                        chantier.status === 'completed'
                          ? 'border-green-200 bg-green-50 hover:border-green-300'
                          : 'border-orange-200 bg-orange-50 hover:border-orange-300'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${
                        chantier.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          chantier.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              chantier.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {chantier.status === 'completed' ? 'Effectué' : 'Non effectué'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{chantier.projectName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{chantier.date ? formatDate(chantier.date) : 'Date inconnue'}</span>
                          {chantier.startTime && (
                            <>
                              <Clock className="w-3 h-3 ml-2" />
                              <span>{chantier.startTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pastChantiers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Aucun chantier passé</p>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="p-6">
            <h2 className="text-gray-900 mb-6">Remarques et notes</h2>
            
            <div className="space-y-4 mb-6">
              {remarks.map((remark) => (
                <div
                  key={remark.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>{remark.date}</span>
                        <span>à {remark.time}</span>
                      </div>
                      {remark.text && <p className="text-gray-700 mb-3">{remark.text}</p>}
                      {remark.images && remark.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {remark.images.map((image, index) => (
                            <div key={index} className="relative group/image">
                              <img
                                src={image}
                                alt={`Remarque image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setPreviewImage(image)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteRemark(remark.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                      title="Supprimer cette remarque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="new-remark" className="text-sm text-gray-700 mb-2 block">
                Nouvelle remarque
              </Label>
              
              {/* Preview des images sélectionnées */}
              {remarkImages.length > 0 && (
                <div className="mb-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {remarkImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    id="new-remark"
                    placeholder="Notez vos observations, demandes du client, etc..."
                    rows={3}
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddRemark();
                      }
                    }}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleAddRemark}
                      disabled={!newRemark.trim() && remarkImages.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                      size="icon"
                      title="Envoyer (Ctrl+Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="icon"
                      type="button"
                      title="Ajouter des images"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Ctrl+Enter pour envoyer
                  </p>
                  {remarkImages.length > 0 && (
                    <p className="text-xs text-green-600">
                      {remarkImages.length} image{remarkImages.length > 1 ? 's' : ''} sélectionnée{remarkImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Intervention Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'intervention</DialogTitle>
            <DialogDescription>
              Modifier les détails de l'intervention
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-recurring"
                  className="rounded"
                  checked={editingProject.type === 'recurrent'}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    type: e.target.checked ? 'recurrent' : 'ponctuel'
                  })}
                />
                <Label htmlFor="edit-recurring" className="cursor-pointer">
                  Intervention récurrente
                </Label>
              </div>

              {editingProject.type === 'recurrent' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                             {/* TODO a implémenter*/}

                </div>
              )}
  
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveEdit}
                >
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProject(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Image Preview Lightbox */}
  <Dialog open={!!previewImage} onOpenChange={(open: boolean) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center">
              <img
                src={previewImage}
                alt="Prévisualisation"
                className="max-h-[80vh] w-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setPreviewImage(null)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
