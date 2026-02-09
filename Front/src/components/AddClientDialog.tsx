import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Key, Trash2 } from 'lucide-react';
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
import { clientsAPI, type Address } from '../api/apiClient';

interface AddressForm {
  street: string;
  city: string;
  postalCode: string;
  acces: string;
  hasKey: boolean;
}

interface AddClientDialogProps {
  trigger: React.ReactNode;
  onClientCreated?: () => void;
}

export function AddClientDialog({ trigger, onClientCreated }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<'particulier' | 'professionnel'>('particulier');
  const [addresses, setAddresses] = useState<AddressForm[]>([
    { street: '', city: '', postalCode: '', acces: '', hasKey: false }
  ]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

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

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewType('particulier');
    setAddresses([{ street: '', city: '', postalCode: '', acces: '', hasKey: false }]);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleSubmit = async () => {
    setCreateError(null);
    setCreateSuccess(false);

    // Validation
    if (!newName || !newEmail || !newPhone) {
      setCreateError('Veuillez remplir les champs requis (nom, email, téléphone).');
      return;
    }

    // Vérifier qu'au moins une adresse a une rue
    if (!addresses[0].street.trim()) {
      setCreateError('Veuillez remplir au moins une adresse.');
      return;
    }

    setCreateLoading(true);
    try {
      const addressesPayload: Omit<Address, 'id'>[] = addresses
        .filter(addr => addr.street.trim()) // Filtrer les adresses vides
        .map((addr, index) => ({
          street: addr.street.trim(),
          city: addr.city.trim(),
          postalCode: addr.postalCode.trim(),
          acces: addr.acces.trim() || null,
          hasKey: addr.hasKey,
          order: index
        }));

      await clientsAPI.create({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        addresses: addressesPayload,
        type: newType,
      });

      setCreateSuccess(true);

      // Appeler le callback si fourni
      if (onClientCreated) {
        onClientCreated();
      }

      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, 1000);

    } catch (e: any) {
      setCreateError(e.message || 'Erreur lors de la création du client');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
          <DialogDescription>
            Remplissez les informations du client
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                placeholder="Ex: Marie Dubois"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'particulier' | 'professionnel')}
              >
                <option value="particulier">Particulier</option>
                <option value="professionnel">Professionnel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.fr"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                placeholder="06 12 34 56 78"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
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
                    <Label htmlFor={`street-${index}`}>Rue *</Label>
                    <Input
                      id={`street-${index}`}
                      placeholder="12 rue des Fleurs"
                      value={addr.street}
                      onChange={(e) => updateAddress(index, 'street', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`postalCode-${index}`}>Code postal</Label>
                      <Input
                        id={`postalCode-${index}`}
                        placeholder="75001"
                        value={addr.postalCode}
                        onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`city-${index}`}>Ville</Label>
                      <Input
                        id={`city-${index}`}
                        placeholder="Paris"
                        value={addr.city}
                        onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`acces-${index}`}>Informations d'accès</Label>
                    <Textarea
                      id={`acces-${index}`}
                      placeholder="Code portail, digicode, instructions..."
                      rows={2}
                      value={addr.acces}
                      onChange={(e) => updateAddress(index, 'acces', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`hasKey-${index}`}
                      checked={addr.hasKey}
                      onCheckedChange={(v: boolean | 'indeterminate') => updateAddress(index, 'hasKey', v === true)}
                    />
                    <label
                      htmlFor={`hasKey-${index}`}
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
          {createError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{createError}</div>
          )}
          {createSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">Client ajouté avec succès !</div>
          )}

          {/* Bouton de soumission */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={createLoading}
            onClick={handleSubmit}
          >
            {createLoading ? 'Enregistrement...' : 'Ajouter le client'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

