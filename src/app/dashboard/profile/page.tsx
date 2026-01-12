'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useUpdateProfile, useUpdatePassword } from '@/hooks/useDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'sonner';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  dateOfBirth?: string;
  nationality?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // ✅ React Query mutations
  const updateProfile = useUpdateProfile(user?.id);
  const updatePassword = useUpdatePassword();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    nationality: ''
  });

  // Load real user data from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        // Load profile data from user metadata
        const profileData: UserProfile = {
          firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || '',
          bio: user.user_metadata?.bio || '',
          dateOfBirth: user.user_metadata?.date_of_birth || '',
          nationality: user.user_metadata?.nationality || ''
        };

        setFormData(profileData);
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur'

    // Try to get display name from user metadata first
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }

    // Fallback to email username part
    if (user.email) {
      return user.email.split('@')[0]
    }

    return 'Utilisateur'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Utiliser la mutation React Query
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      // ✅ Erreur déjà gérée par le hook
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // ✅ Utiliser la mutation React Query
      await updatePassword.mutateAsync({ newPassword: passwordData.newPassword });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsChangingPassword(false);
    } catch (error) {
      // ✅ Erreur déjà gérée par le hook
      console.error('Error changing password:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={200} height={32} className="mb-2" />
            <Skeleton width={300} height={20} />
          </div>
          <Skeleton width={140} height={40} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton width={200} height={24} />
                <Skeleton width={300} height={16} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Skeleton width="100%" height={40} /></div>
                  <div><Skeleton width="100%" height={40} /></div>
                </div>
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={80} />
                <Skeleton width="100%" height={100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton width={150} height={24} />
                <Skeleton width={250} height={16} />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Skeleton circle width={20} height={20} />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} className="mb-1" />
                      <Skeleton width={80} height={14} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Skeleton circle width={20} height={20} />
                    <div className="flex-1">
                      <Skeleton width={140} height={16} className="mb-1" />
                      <Skeleton width={80} height={14} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Skeleton circle width={80} height={80} className="mx-auto mb-4" />
                  <Skeleton width={120} height={20} className="mb-2" />
                  <Skeleton width={100} height={16} className="mb-3" />
                  <Skeleton width={60} height={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton width={100} height={20} />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={60} height={16} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton width={80} height={20} />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width="100%" height={40} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="transition-all duration-150 hover:scale-105 active:scale-95"
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Vos informations de base et coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative mt-1">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative mt-1">
                    <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="pl-10 min-h-[80px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      disabled={!isEditing || updateProfile.isPending}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ex: Française"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={updateProfile.isPending}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Changer le mot de passe */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyIcon className="h-5 w-5 mr-2 text-blue-500" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isChangingPassword ? (
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      disabled={updatePassword.isPending}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={updatePassword.isPending}>
                      {updatePassword.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changement...
                        </>
                      ) : (
                        <>
                          <KeyIcon className="h-4 w-4 mr-2" />
                          Changer le mot de passe
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Vos dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Souscription Premium Pack
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Il y a 2 jours
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CurrencyEuroIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Dépôt de 5000€
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Il y a 5 jours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec stats */}
        <div className="space-y-6">
          {/* Avatar et statut */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {formData.firstName && formData.lastName
                    ? `${formData.firstName[0]}${formData.lastName[0]}`
                    : formData.firstName[0] || formData.lastName[0] || user.email?.[0]?.toUpperCase() || 'U'
                  }
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.firstName && formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`
                    : formData.firstName || formData.lastName || getUserDisplayName()
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Investisseur Premium
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Badges et Réalisations */}
          <Card className="border border-gray-200 dark:border-gray-700 hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="text-yellow-500 mr-2">🏆</span>
                Réalisations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Premier Investissement</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Atteint le 15 nov. 2023</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">Rentable</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">+2,450€ gagnés</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg opacity-60">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-200 text-sm">Expert</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Investir 50,000€ pour débloquer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total investi</span>
                <span className="font-semibold text-green-600">15,000 €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Gains totaux</span>
                <span className="font-semibold text-green-600">+2,450 €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Packs actifs</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Membre depuis</span>
                <span className="font-semibold text-sm">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Déc 2023
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
