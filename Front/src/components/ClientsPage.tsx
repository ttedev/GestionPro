import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Key } from 'lucide-react';
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
import { clientsAPI, type Client } from '../api/apiClient';

interface ClientsPageProps {
  onSelectClient: (clientId: string) => void;
}

export function ClientsPage({ onSelectClient }: ClientsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Form state for new client
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newAccess, setNewAccess] = useState('');
  const [newHasKey, setNewHasKey] = useState(false);
  const [newType, setNewType] = useState<'particulier' | 'professionnel'>('particulier');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Debounce logic to avoid too many requests when typing
  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const fetchClients = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsAPI.getAll(q?.trim() ? q.trim() : undefined);
      setClients(data);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version
  const debouncedFetch = useCallback(debounce(fetchClients, 400), [fetchClients]);

  useEffect(() => {
    debouncedFetch(searchQuery);
  }, [searchQuery, debouncedFetch]);


  const filteredClients = clients; // Server side filtering already applied (search param)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Gérez vos clients et leurs informations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
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
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" placeholder="Ex: Marie Dubois" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemple.fr" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" placeholder="06 12 34 56 78" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="12 rue des Fleurs, 75001 Paris" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="access">Informations d'accès</Label>
                <Textarea
                  id="access"
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
                <Checkbox id="hasKey" checked={newHasKey} onCheckedChange={(v: boolean | 'indeterminate') => setNewHasKey(v === true)} />
                <label
                  htmlFor="hasKey"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-amber-600" />
                  Je possède une clé pour ce client
                </label>
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
              {createError && (
                <div className="text-sm text-red-600">{createError}</div>
              )}
              {createSuccess && (
                <div className="text-sm text-green-600">Client ajouté avec succès.</div>
              )}
              <Button className="w-full bg-green-600 hover:bg-green-700"
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
                    // refresh clients list
                    await fetchClients(searchQuery);
                    // reset form
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
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-sm text-gray-500">Chargement des clients...</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && filteredClients.length === 0 && (
            <div className="text-sm text-gray-500">Aucun client trouvé.</div>
          )}
          {!loading && !error && filteredClients.map((client) => {
            const statusLabel = client.status === 'actif' ? 'Actif' : 'Inactif';
            const statusStyles = client.status === 'actif'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600';
            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700">{client.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{client.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-sm ${statusStyles}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {client.address}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    {client.access && (
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-600" /> Accès: {client.access}
                      </span>
                    )}
                    <span>
                      Clé: {client.hasKey ? 'Oui' : 'Non'}
                    </span>
                    <span>
                      Type: {client.type === 'particulier' ? 'Particulier' : 'Professionnel'}
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={(e) => { e.stopPropagation(); }}>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
