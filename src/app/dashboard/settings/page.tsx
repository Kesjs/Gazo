'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyEuroIcon,
  MoonIcon,
  SunIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');

  // États pour les paramètres
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    gains: true,
    system: true
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    currency: 'EUR',
    theme: 'system',
    timezone: 'Europe/Paris'
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  // Rediriger si non connecté
  useState(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecurityChange = (key: string, value: boolean | string) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos préférences et la sécurité de votre compte
          </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {[
          { value: 'notifications', label: 'Notifications', icon: BellIcon },
          { value: 'preferences', label: 'Préférences', icon: GlobeAltIcon },
          { value: 'security', label: 'Sécurité', icon: ShieldCheckIcon },
          { value: 'account', label: 'Compte', icon: EnvelopeIcon }
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === tab.value ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Contenu conditionnel */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-blue-500" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez être informé des activités de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Notifications par email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recevez les mises à jour importantes par email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">Notifications push</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recevez des notifications en temps réel dans votre navigateur</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications" className="font-medium">Notifications SMS</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recevez des alertes critiques par SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gains-notifications" className="font-medium">Alertes de gains</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Soyez informé de vos gains quotidiens</p>
                  </div>
                  <Switch
                    id="gains-notifications"
                    checked={notifications.gains}
                    onCheckedChange={(checked) => handleNotificationChange('gains', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-notifications" className="font-medium">Notifications système</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mises à jour de maintenance et annonces importantes</p>
                  </div>
                  <Switch
                    id="system-notifications"
                    checked={notifications.system}
                    onCheckedChange={(checked) => handleNotificationChange('system', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-green-500" />
                Préférences générales
              </CardTitle>
              <CardDescription>
                Personnalisez votre expérience sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar ($)</SelectItem>
                      <SelectItem value="GBP">Livre (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <SunIcon className="h-4 w-4 mr-2" />
                          Clair
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <MoonIcon className="h-4 w-4 mr-2" />
                          Sombre
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                          Système
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-500" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>
                Protégez votre compte avec des mesures de sécurité avancées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="font-medium">Authentification à deux facteurs</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {security.twoFactor && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activé</Badge>}
                    <Switch
                      id="two-factor"
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => handleSecurityChange('twoFactor', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="session-timeout">Timeout de session</Label>
                  <Select value={security.sessionTimeout} onValueChange={(value) => handleSecurityChange('sessionTimeout', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="240">4 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-alerts" className="font-medium">Alertes de connexion</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Soyez informé des nouvelles connexions à votre compte</p>
                  </div>
                  <Switch
                    id="login-alerts"
                    checked={security.loginAlerts}
                    onCheckedChange={(checked) => handleSecurityChange('loginAlerts', checked)}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4">Actions de sécurité</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                    Gérer les appareils connectés
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Télécharger mes données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Gérez les paramètres généraux de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <div>
                  <Label>ID utilisateur</Label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono">{user?.id}</p>
                </div>
                <div>
                  <Label>Dernière connexion</Label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Il y a 2 heures</p>
                </div>
                <div>
                  <Label>Statut du compte</Label>
                  <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Actif
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles qui affecteront définitivement votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
                Désactiver les notifications
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
                Supprimer toutes mes données
              </Button>
              <Button variant="destructive" className="w-full">
                Supprimer définitivement mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
