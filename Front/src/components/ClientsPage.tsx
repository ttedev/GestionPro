import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Key } from 'lucide-react';
import { clientsAPI, type Client } from '../api/apiClient';
import { AddClientDialog } from './AddClientDialog';

interface ClientsPageProps {
  onSelectClient: (clientId: string) => void;
}

export function ClientsPage({ onSelectClient }: ClientsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <AddClientDialog
          trigger={
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          }
          onClientCreated={() => fetchClients(searchQuery)}
        />
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
                      {client.addresses?.[0] ? `${client.addresses[0].street}, ${client.addresses[0].city}` : 'Aucune adresse'}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    {client.addresses?.[0]?.acces && (
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-600" /> Accès: {client.addresses[0].acces}
                      </span>
                    )}
                    {client.addresses?.[0]?.hasKey && (
                      <span>Clé en possession</span>
                    )}
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
