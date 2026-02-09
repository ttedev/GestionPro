import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Key, Trash2, Pencil } from 'lucide-react';
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
import { Textarea } from './ui/textarea';
import { clientsAPI, type Client, type Address } from '../api/apiClient';

interface AddressForm {
  id?: string;
  street: string;
  city: string;
  postalCode: string;
  acces: string;
  hasKey: boolean;
}

interface EditClientDialogProps {
  client: Client;
  trigger?: React.ReactNode;
  onClientUpdated?: (updatedClient: Client) => void;
}

export function EditClientDialog({ client, trigger, onClientUpdated }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'particulier' | 'professionnel'>('particulier');
  const [status, setStatus] = useState<'actif' | 'inactif'>('actif');
  const [addresses, setAddresses] = useState<AddressForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialiser le formulaire avec les données du client
  const initForm = () => {
    setName(client.name || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setType(client.type || 'particulier');
    setStatus(client.status || 'actif');

    if (client.addresses && client.addresses.length > 0) {
      setAddresses(client.addresses.map(addr => ({
        id: addr.id,
        street: addr.street || '',
        city: addr.city || '',
        postalCode: addr.postalCode || '',
        acces: addr.acces || '',
        hasKey: addr.hasKey || false,
      })));
    } else {
      setAddresses([{ street: '', city: '', postalCode: '', acces: '', hasKey: false }]);
    }

    setError(null);
    setSuccess(false);
  };

  useEffect(() => {
    if (open) {
      initForm();
    }
  }, [open, client]);

  const addAddress = () => {
    setAddresses([...addresses, { street: '', city: '', postalCode: '', acces: '', hasKey: false }]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  const updateAddress = (index: number, field: keyof AddressForm, value: string | boolean) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };
    setAddresses(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setLoading(true);
    try {
      const addressesPayload: Omit<Address, 'id'>[] = addresses
        .filter(addr => addr.street.trim())
        .map((addr, index) => ({
          street: addr.street.trim(),
          city: addr.city.trim(),
          postalCode: addr.postalCode.trim(),
          acces: addr.acces.trim() || null,
          hasKey: addr.hasKey,
          order: index
        }));

      const updatedClient = await clientsAPI.update(client.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        addresses: addressesPayload,
        type,
        status,
      });

      setSuccess(true);

      if (onClientUpdated) {
        onClientUpdated(updatedClient);
      }

      setTimeout(() => {
        setOpen(false);
      }, 1000);

    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour du client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {client.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Nom complet *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Marie Dubois"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={type}
                onChange={(e) => setType(e.target.value as 'particulier' | 'professionnel')}
              >
                <option value="particulier">Particulier</option>
                <option value="professionnel">Professionnel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="email@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-status">Statut</Label>
            <select
              id="edit-status"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'actif' | 'inactif')}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          {/* Section Adresses */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Adresses</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAddress}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une adresse
              </Button>
            </div>

            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Adresse {index + 1}
                    </span>
                    {addresses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAddress(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`edit-street-${index}`}>Rue</Label>
                    <Input
                      id={`edit-street-${index}`}
                      placeholder="12 rue des Fleurs"
                      value={addr.street}
                      onChange={(e) => updateAddress(index, 'street', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`edit-postalCode-${index}`}>Code postal</Label>
                      <Input
                        id={`edit-postalCode-${index}`}
                        placeholder="75001"
                        value={addr.postalCode}
                        onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-city-${index}`}>Ville</Label>
                      <Input
                        id={`edit-city-${index}`}
                        placeholder="Paris"
                        value={addr.city}
                        onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`edit-acces-${index}`}>Informations d'accès</Label>
                    <Textarea
                      id={`edit-acces-${index}`}
                      placeholder="Code portail, digicode, instructions..."
                      rows={2}
                      value={addr.acces}
                      onChange={(e) => updateAddress(index, 'acces', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-hasKey-${index}`}
                      checked={addr.hasKey}
                      onCheckedChange={(v: boolean | 'indeterminate') => updateAddress(index, 'hasKey', v === true)}
                    />
                    <label
                      htmlFor={`edit-hasKey-${index}`}
                      className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-amber-600" />
                      Clé en possession pour cette adresse
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">Client mis à jour avec succès !</div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

