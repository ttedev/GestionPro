import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Mail, Building2, Save, X, Clock, Lock, Eye, EyeOff, CreditCard, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User as MyUser, authAPI, supportAPI } from '../api/apiClient';
import { SupportChatDialog } from './SupportChatDialog';

interface UserProfilePageProps {
  user: MyUser;
  onUpdateUser: (user: MyUser) => void;
  onNavigateToSubscription?: () => void;
}

export function UserProfilePage({ user, onUpdateUser, onNavigateToSubscription }: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company,
    workStartTime: user.workStartTime,
    workEndTime: user.workEndTime,
  });

  // États pour le changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  // Charger le nombre de messages non lus
  const loadUnreadCount = useCallback(async () => {
    try {
      const { unreadCount } = await supportAPI.getUnreadCount();
      setUnreadSupportCount(unreadCount);
    } catch (e) {
      console.error('Erreur chargement messages non lus', e);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Ouvrir le portail client Stripe pour gérer l'abonnement
  const handleOpenCustomerPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const { url } = await authAPI.openCustomerPortal();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du portail client:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ouverture du portail');
      setIsOpeningPortal(false);
    }
  };

  // Rafraîchir les données utilisateur à l'arrivée sur la page
  // Important après un paiement Stripe pour mettre à jour le statut
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const updatedUser = await authAPI.getCurrentUser();
        onUpdateUser(updatedUser);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      }
    };

    refreshUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!formData.company?.trim()) {
      toast.error('L\'entreprise est requise');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }

    setIsSubmitting(true);
    try {
      // Envoyer les modifications au backend
      const updatedUser = await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        workStartTime: formData.workStartTime,
        workEndTime: formData.workEndTime,
      });

      // Update user localement
      onUpdateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation du mot de passe
    if (!passwordData.newPassword) {
      toast.error('Le nouveau mot de passe est requis');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await authAPI.updatePassword(passwordData.newPassword);
      toast.success('Mot de passe modifié avec succès !');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      company: user.company,
        workStartTime: user.workStartTime,
        workEndTime: user.workEndTime,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Gérez vos informations personnelles</p>
        </div>
        {/* Bouton Contact Support */}
        <Button
          onClick={() => setIsSupportChatOpen(true)}
          variant="outline"
          className="relative gap-2 w-full sm:w-auto"
        >
          <MessageCircle className="w-4 h-4" />
          Contacter le support
          {unreadSupportCount > 0 && (
            <span className="-top-2 -right-2 min-w-5 h-5 px-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadSupportCount}
            </span>
          )}
        </Button>
      </div>

      {/* Support Chat Dialog */}
      <SupportChatDialog
        open={isSupportChatOpen}
        onOpenChange={setIsSupportChatOpen}
        onUnreadCountChange={setUnreadSupportCount}
      />

      {/* Warning for inactive users */}
      {user.status !== 'ACTIVE' && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Compte {user.status}</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Votre compte n'est pas encore actif. Vous avez un accès limité à l'application. 
                  Souscrivez à un abonnement pour activer votre compte et accéder à toutes les fonctionnalités.
                </p>
                <Button 
                  onClick={onNavigateToSubscription}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Souscrire à un abonnement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription info for active users */}
      {user.status === 'ACTIVE' && (
        <Card className="mb-6 border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  {user.hasActiveSubscription ? 'Abonnement mensuel actif' : 'Licence annuelle active'}
                </h3>
                <p className="text-sm text-green-800 mb-1">
                  Votre compte est actif jusqu'au {user.endLicenseDate ? new Date(user.endLicenseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}.
                </p>
                {user.hasActiveSubscription ? (
                  <>
                    <p className="text-xs text-green-700 mb-3">
                      Gérez votre abonnement, consultez vos factures ou mettez à jour votre moyen de paiement.
                    </p>
                    <Button
                      onClick={handleOpenCustomerPortal}
                      disabled={isOpeningPortal}
                      variant="outline"
                      className="gap-2 border-green-600 text-green-700 hover:bg-green-100"
                    >
                      <CreditCard className="w-4 h-4" />
                      {isOpeningPortal ? 'Redirection...' : 'Gérer mon abonnement'}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-green-700">
                    Vous avez payé pour une année complète.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Vos informations personnelles et professionnelles
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.company}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom complet
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md max-w-md">
                    {user.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre.email@exemple.com"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md max-w-md">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Company Field */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Entreprise
                </Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nom de votre entreprise"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md max-w-md">
                    {user.company}
                  </p>
                )}
              </div>

            {/* Work Start Time Field */}
                <div className="space-y-2">
                    <Label htmlFor="workStartTime" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Heure de début de travail
                    </Label>
                    {isEditing ? (
                        <Input
                            id="workStartTime"
                            type="time"
                            value={formData.workStartTime || ''}
                            onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                            className="max-w-md"
                        />
                    ) : (
                        <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md max-w-md">
                            {user.workStartTime || 'Non défini'}
                        </p>
                    )}
                </div>

            {/* Work End Time Field */}
                <div className="space-y-2">
                    <Label htmlFor="workEndTime" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Heure de fin de travail
                    </Label>
                    {isEditing ? (
                        <Input
                            id="workEndTime"
                            type="time"
                            value={formData.workEndTime || ''}
                            onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                            className="max-w-md"
                        />
                    ) : (
                        <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md max-w-md">
                            {user.workEndTime || 'Non défini'}
                        </p>
                    )}
                </div>
            </div>
            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Informations supplémentaires sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Statut du compte</span>
              <span className={`font-semibold ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{user.status}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Fin de la license</span>
              <span className="text-gray-900">{user.endLicenseDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Modifier le mot de passe
              </CardTitle>
              <CardDescription>
                Changez votre mot de passe de connexion
              </CardDescription>
            </div>
            {!isChangingPassword && (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                Changer
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nouveau mot de passe
                </Label>
                <div className="relative max-w-md">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Entrez votre nouveau mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 caractères</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmer le mot de passe
                </Label>
                <div className="relative max-w-md">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" className="gap-2" disabled={isSubmittingPassword}>
                  <Save className="w-4 h-4" />
                  {isSubmittingPassword ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelPassword}
                  className="gap-2"
                  disabled={isSubmittingPassword}
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
