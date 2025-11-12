import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Mail, Building2, ArrowLeft, Save, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { User as MyUser} from '../api/apiClient';

interface UserProfilePageProps {
  user: MyUser;
  onUpdateUser: (user: MyUser) => void;
}

export function UserProfilePage({ user, onUpdateUser }: UserProfilePageProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company,
    workStartTime: user.workStartTime,
    workEndTime: user.workEndTime,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('L\'entreprise est requise');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }

    // Update user
    onUpdateUser({
      id: user.id,
      status: user.status,
      endLicense: user.endLicense,
      ...formData,
    });

    setIsEditing(false);
    toast.success('Profil mis à jour avec succès !');
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Warning for inactive users */}
      {user.status !== 'ACTIVE' && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Compte {user.status}</h3>
                <p className="text-sm text-yellow-800">
                  Votre compte n'est pas encore actif. Vous avez un accès limité à l'application. 
                  Veuillez contacter l'administrateur pour activer votre compte et accéder à toutes les fonctionnalités.
                </p>
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
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
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
    </div>
  );
}
