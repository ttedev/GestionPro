import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI, type AdminUser, type AdminStats, type UserStatus } from '../api/apiClient';
import { AdminChatDialog } from './AdminChatDialog';

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersWithUnread, setUsersWithUnread] = useState<string[]>([]);

  // Responsive breakpoints
  const getScreenSize = () => {
    if (typeof window === 'undefined') return 'lg';
    if (window.innerWidth >= 1024) return 'lg';
    if (window.innerWidth >= 768) return 'md';
    return 'sm';
  };

  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>(getScreenSize);

  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize(getScreenSize());
    };
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Chat dialog state
  const [chatUser, setChatUser] = useState<AdminUser | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  // Edit dialog state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as UserStatus | '',
    endLicenseDate: '',
    firstName: '',
    lastName: '',
    company: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, statsData, unreadData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getStats(),
        adminAPI.getUsersWithUnreadMessages(),
      ]);
      setUsers(usersData);
      setStats(statsData);
      setUsersWithUnread(unreadData.userIds);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      status: user.status,
      endLicenseDate: user.endLicenseDate || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      company: user.company || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const updatedUser = await adminAPI.updateUser(editingUser.id, {
        status: editForm.status as UserStatus,
        endLicenseDate: editForm.endLicenseDate || undefined,
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        company: editForm.company || undefined,
      });
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsEditDialogOpen(false);
      toast.success('Utilisateur mis à jour');
      loadData(); // Refresh stats
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateUser = async (user: AdminUser) => {
    try {
      const updatedUser = await adminAPI.activateUser(user.id);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast.success(`${user.firstName || user.username} activé pour 1 an`);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'activation');
    }
  };

  const handleDeactivateUser = async (user: AdminUser) => {
    try {
      const updatedUser = await adminAPI.deactivateUser(user.id);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast.success(`${user.firstName || user.username} désactivé`);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la désactivation');
    }
  };

  const handleOpenChat = (user: AdminUser) => {
    setChatUser(user);
    setIsChatDialogOpen(true);
  };

  const handleMessagesRead = () => {
    // Retirer l'utilisateur de la liste des non lus
    if (chatUser) {
      setUsersWithUnread(prev => prev.filter(id => id !== chatUser.id));
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName || user.username} ?`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('Utilisateur supprimé');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-700">Actif</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-700">Inactif</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-700">Suspendu</Badge>;
      case 'ADMIN':
        return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusRowColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50';
      case 'PENDING':
        return 'bg-yellow-50';
      case 'INACTIVE':
        return 'bg-gray-50';
      case 'SUSPENDED':
        return 'bg-red-50';
      case 'ADMIN':
        return 'bg-purple-50';
      default:
        return '';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-500 mt-1">Gestion des utilisateurs et des licences</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-sm text-gray-500">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingUsers}</p>
                  <p className="text-sm text-gray-500">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expiringThisMonth}</p>
                  <p className="text-sm text-gray-500">Expirent ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Liste de tous les utilisateurs enregistrés</CardDescription>
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Colonnes conditionnelles */}
            {(() => {
              const showEmail = screenSize !== 'sm';
              const showEntreprise = screenSize === 'lg';
              const showStatut = screenSize !== 'sm';
              const showLicence = screenSize !== 'sm';
              const showAbonnement = screenSize !== 'sm';
              const showInscritLe = screenSize === 'lg';

              return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Utilisateur</TableHead>
                      {showEmail && <TableHead>Email</TableHead>}
                      {showEntreprise && <TableHead>Entreprise</TableHead>}
                      {showStatut && <TableHead>Statut</TableHead>}
                      {showLicence && <TableHead>Licence</TableHead>}
                      {showAbonnement && <TableHead>Abonnement</TableHead>}
                      {showInscritLe && <TableHead>Inscrit le</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className={getStatusRowColor(user.status)}>
                        <TableCell className="w-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChat(user)}
                            title="Messages"
                            className={`p-2 ${usersWithUnread.includes(user.id) ? 'bg-orange-100' : ''}`}
                          >
                            <Mail className={`w-5 h-5 ${usersWithUnread.includes(user.id) ? 'text-orange-600' : 'text-gray-500'}`} />
                            {usersWithUnread.includes(user.id) && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            {!showEmail && <p className="text-xs text-gray-500">{user.email}</p>}
                          </div>
                        </TableCell>
                        {showEmail && <TableCell>{user.email}</TableCell>}
                        {showEntreprise && <TableCell>{user.company || '—'}</TableCell>}
                        {showStatut && <TableCell>{getStatusBadge(user.status)}</TableCell>}
                        {showLicence && (
                          <TableCell>
                            {user.endLicenseDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className={
                                  new Date(user.endLicenseDate) < new Date()
                                    ? 'text-red-600'
                                    : ''
                                }>
                                  {formatDate(user.endLicenseDate)}
                                </span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        )}
                        {showAbonnement && (
                          <TableCell>
                            {user.hasActiveSubscription ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-sm">Mensuel</span>
                              </div>
                            ) : user.stripeCustomerId ? (
                              <span className="text-sm text-gray-500">One-shot</span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </TableCell>
                        )}
                        {showInscritLe && <TableCell>{formatDate(user.createdAt)}</TableCell>}
                        <TableCell>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {user.status !== 'ADMIN' && (
                          <>
                            {user.status !== 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivateUser(user)}
                                title="Activer (1 an)"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {user.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateUser(user)}
                                title="Désactiver"
                              >
                                <XCircle className="w-4 h-4 text-orange-600" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {user.status !== 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              {editingUser?.firstName} {editingUser?.lastName} (@{editingUser?.username})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as UserStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endLicenseDate">Date de fin de licence</Label>
              <Input
                id="endLicenseDate"
                type="date"
                value={editForm.endLicenseDate}
                onChange={(e) => setEditForm({ ...editForm, endLicenseDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <AdminChatDialog
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
        user={chatUser}
        onMessagesRead={handleMessagesRead}
      />
    </div>
  );
}


