import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { chantiersAPI, type ChantierDTO } from '../api/apiClient';
import { Calendar, Clock, User, Briefcase } from 'lucide-react';

interface EditChantierDialogProps {
  chantier: ChantierDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (chantier: ChantierDTO) => void;
}

export function EditChantierDialog({
  chantier,
  open,
  onOpenChange,
  onUpdated,
}: EditChantierDialogProps) {
  const [monthTarget, setMonthTarget] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser les valeurs quand le chantier change
  useEffect(() => {
    if (chantier) {
      setMonthTarget(chantier.monthTarget || '');
      setDurationMinutes(chantier.durationMinutes || 60);
      setError(null);
    }
  }, [chantier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chantier) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await chantiersAPI.update(chantier.id, {
        monthTarget: monthTarget || undefined,
        durationMinutes,
      });
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du chantier');
    } finally {
      setLoading(false);
    }
  };

  if (!chantier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le chantier</DialogTitle>
          <DialogDescription>
            Modifiez les informations du chantier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations en lecture seule */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">Client:</span>
              <span>{chantier.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span className="font-medium">Projet:</span>
              <span>{chantier.projectName}</span>
            </div>
          </div>

          {/* Mois cible */}
          <div className="space-y-2">
            <Label htmlFor="monthTarget" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Mois cible
            </Label>
            <Input
              id="monthTarget"
              type="month"
              value={monthTarget}
              onChange={(e) => setMonthTarget(e.target.value)}
              placeholder="YYYY-MM"
            />
            <p className="text-xs text-gray-500">
              Format: année-mois (ex: 2026-02)
            </p>
          </div>

          {/* Durée en minutes */}
          <div className="space-y-2">
            <Label htmlFor="durationMinutes" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Durée (minutes)
            </Label>
            <Input
              id="durationMinutes"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
            />
            <p className="text-xs text-gray-500">
              Durée estimée de l'intervention
            </p>
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
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

