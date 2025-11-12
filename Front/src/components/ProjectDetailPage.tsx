import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChantierDTO, ProjectDTO } from '../api/apiClient';

interface ProjectDetailPageProps {
  project: ProjectDTO;
  chantiers: ChantierDTO[];
  onBack: () => void;
  onEditChantier?: (chantier: ChantierDTO) => void;
  onDeleteChantier?: (chantierId: string) => void;
}

export function ProjectDetailPage({
  project,
  chantiers,
  onBack,
  onEditChantier,
  onDeleteChantier,
}: ProjectDetailPageProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'proposed':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      proposed: 'Proposé',
      confirmed: 'Confirmé',
      'in-progress': 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingChantiers = chantiers.filter(c => {
    if (!c.dateHeure) return true;
    return new Date(c.dateHeure) >= today;
  });

  const pastChantiers = chantiers.filter(c => {
    if (!c.dateHeure) return false;
    return new Date(c.dateHeure) < today;
  });

  const filteredChantiers =
    filter === 'upcoming'
      ? upcomingChantiers
      : filter === 'past'
      ? pastChantiers
      : chantiers;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Non planifié';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-gray-900 mb-1">{project.title}</h1>
          <p className="text-gray-600">Intervention récurrente</p>
        </div>
      </div>

      {/* Intervention Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Client</div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{project.clientName}</span>
              </div>
            </div>


            <div>
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <p className="text-gray-700">{project.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Période</div>
              <div className="text-gray-900">
                {project.type === 'recurrent' ? project.dureeMois+' mois' : 'Ponctuel'} 
                {project.premierMois && (
                  <span className="text-gray-600 ml-2">
                    (depuis {project.premierMois ? project.premierMois : 'Inconnu'})
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Durée unitaire</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formatDuration(project.dureeEnMinutes || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <div className="text-2xl text-green-600">{project.chantiers?.filter(c => c.status === 'completed').length || 0}</div>
                <div className="text-sm text-gray-500">Terminés</div>
              </div>
              <div>
                <div className="text-2xl text-blue-600">{project.chantiers?.filter(c => c.status != 'completed').length || 0}</div>
                <div className="text-sm text-gray-500">À venir</div>
              </div>
              <div>
                <div className="text-2xl text-gray-600">{project.chantiers?.length || 0}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Chantiers List */}
      <div>
        <Tabs defaultValue="all" onValueChange={(v: any) => setFilter(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Tous ({chantiers.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              À venir ({upcomingChantiers.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passés ({pastChantiers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {filteredChantiers.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun chantier trouvé</p>
              </Card>
            ) : (
              filteredChantiers.map((chantier) => (
                <Card key={chantier.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getStatusColor(chantier.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(chantier.status)}
                            <span>{getStatusLabel(chantier.status)}</span>
                          </div>
                        </Badge>
                        {chantier.dateHeure && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(chantier.dateHeure)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {chantier.dateHeure && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            {chantier.dateHeure} - {formatDuration(chantier.dureeEnMinutes || 0)}
                          </div>
                        )}
                      </div>

                      {chantier.projectName && (
                        <p className="text-sm text-gray-700">{chantier.projectName}</p>
                      )}

                    </div>

                    <div className="flex gap-2">
                      {onEditChantier && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditChantier(chantier)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDeleteChantier && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Supprimer ce chantier ?')) {
                              onDeleteChantier(chantier.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
