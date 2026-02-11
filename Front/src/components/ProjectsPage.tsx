import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Calendar, User, MapPin, Repeat, Trash2, Eye, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ProjectForm } from './ProjectForm';
import { ProjectDetailPage } from './ProjectDetailPage';
import { EditChantierDialog } from './EditChantierDialog';
import { projectsAPI, chantiersAPI, type ProjectDTO, type ChantierDTO } from '../api/apiClient';

interface ProjectsPageProps {
  onNavigateToClient?: (clientId: string) => void;
  projectId?: string; // ID du projet à pré-sélectionner
}

export function ProjectsPage({ onNavigateToClient, projectId }: ProjectsPageProps) {
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chantiersByProject, setChantiersByProject] = useState<Record<string, ChantierDTO[]>>({});
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingChantier, setEditingChantier] = useState<ChantierDTO | null>(null);
  const [isEditChantierDialogOpen, setIsEditChantierDialogOpen] = useState(false);


  const loadProjects = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
      // Pré-sélectionner le projet si projectId est fourni
      if (projectId) {
        const project = data.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des projets');
    } finally { setLoading(false); }
  }, [projectId]);

  const loadChantiersForProject = useCallback(async (projectId: string) => {
    try {
      const data = await chantiersAPI.getAll({ projectId });
      setChantiersByProject(prev => ({ ...prev, [projectId]: data }));
      return data;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects,isProjectDialogOpen]);

  const filteredProjects = filter === 'all'
    ? projects
    : filter === 'recurring'
    ? projects.filter(p => p.type === 'recurrent')
    : projects.filter(p => p.type === 'ponctuel');

  const handleViewDetails = (project: ProjectDTO) => {
    setSelectedProject(project);
  };

  const handleDelete = async (id: string) => {
    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression du projet');
    }
  };

  const handleEditChantier = (chantier: ChantierDTO) => {
    setEditingChantier(chantier);
    setIsEditChantierDialogOpen(true);
  };

  const handleChantierUpdated = (updatedChantier: ChantierDTO) => {
    // Mettre à jour le chantier dans la liste
    if (selectedProject) {
      setChantiersByProject(prev => ({
        ...prev,
        [selectedProject.id]: prev[selectedProject.id]?.map(c =>
          c.id === updatedChantier.id ? updatedChantier : c
        ) || []
      }));
    }
  };

  const handleDeleteChantier = async (chantierId: string) => {
    try {
      await chantiersAPI.delete(chantierId);
      // Mettre à jour la liste des chantiers pour le projet sélectionné
      if (selectedProject) {
        setChantiersByProject(prev => ({
          ...prev,
          [selectedProject.id]: prev[selectedProject.id]?.filter(c => c.id !== chantierId) || []
        }));
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression du chantier');
    }
  };

  const formatMonthYear = (monthStr?: string) => {
    if (!monthStr) return '';
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  if (selectedProject) {
    const chantiers = chantiersByProject[selectedProject.id] || [];
    if (!chantiers.length) {
      loadChantiersForProject(selectedProject.id);
    }
    // réutilise l'ancienne page détail temporairement
    return (
      <>
        <ProjectDetailPage
          project={selectedProject as any}
          chantiers={chantiers as any}
          onBack={() => setSelectedProject(null)}
          onEditChantier={handleEditChantier}
          onDeleteChantier={handleDeleteChantier}
          onNavigateToClient={onNavigateToClient}
        />
        <EditChantierDialog
          chantier={editingChantier}
          open={isEditChantierDialogOpen}
          onOpenChange={setIsEditChantierDialogOpen}
          onUpdated={handleChantierUpdated}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Projets</h1>
          <p className="text-gray-600">Gérez vos projets récurrents et chantiers</p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={(open: boolean) => { 
                setIsProjectDialogOpen(open); 
              }} >
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>Formulaire provisoire (ProjectForm)</DialogDescription>
            </DialogHeader>
            <ProjectForm onCreated={() => setIsProjectDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={`flex-1 sm:flex-none ${
            filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          Toutes
        </Button>
        <Button
          variant={filter === 'one-shot' ? 'default' : 'outline'}
          onClick={() => setFilter('one-shot')}
          className={`flex-1 sm:flex-none ${
            filter === 'one-shot' ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          Chantiers
        </Button>
        <Button
          variant={filter === 'recurring' ? 'default' : 'outline'}
          onClick={() => setFilter('recurring')}
          className={`flex-1 sm:flex-none ${
            filter === 'recurring' ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          Récurrentes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && (
          <Card className="p-6">Chargement des interventions...</Card>
        )}
        {error && !loading && (
            <Card className="p-6 text-red-600">{error}</Card>
        )}
        {!loading && !error && filteredProjects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900">{project.title}</h3>
                    {project.type === 'recurrent' && (
                      <Repeat className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">
                      {project.type === 'recurrent' ? 'Récurrent' : 'Ponctuel'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  {onNavigateToClient && project.clientId ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigateToClient(project.clientId); }}
                      className="text-green-600 hover:text-green-700 hover:underline font-medium"
                    >
                      {project.clientName}
                    </button>
                  ) : (
                    <span>{project.clientName}</span>
                  )}
                </div>
                {project.type === 'recurrent' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {project.dureeMois} mois - depuis {project.premierMois ? project.premierMois : 'Inconnu'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Durée unitaire: {project.dureeEnMinutes} min
                    </div>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>

              {project.type === 'recurrent' && (
                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-green-600">{project.chantiers?.filter(c => c.status === 'completed').length || 0}</div>
                    <div className="text-xs text-gray-500">Terminés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600">{project.chantiers?.filter(c => c.status != 'completed').length || 0}</div>
                    <div className="text-xs text-gray-500">À venir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">{project.chantiers?.length || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(project)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Supprimer ce projet ?')) {
                      handleDelete(project.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && !error && filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Aucun projet</h3>
          <p className="text-gray-600">Créez votre premier projet pour commencer</p>
        </Card>
      )}
    </div>
  );
}
