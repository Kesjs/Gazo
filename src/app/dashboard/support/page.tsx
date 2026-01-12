'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatWidget } from '@/components/ui/chat-widget';
import { toast } from 'sonner';
import {
  LifebuoyIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdate: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  senderName: string;
}

const faqs = [
  {
    question: "Comment souscrire à un pack d'investissement ?",
    answer: "Pour souscrire à un pack, rendez-vous dans la section 'Mes Packs', choisissez le pack qui vous convient, vérifiez que vous avez suffisamment de solde, puis cliquez sur 'Souscrire maintenant'."
  },
  {
    question: "Quels sont les délais de retrait ?",
    answer: "Les retraits sont traités sous 24-48 heures ouvrées. Les fonds apparaîtront sur votre compte bancaire dans les 2-5 jours suivant le traitement."
  },
  {
    question: "Comment sont calculés les gains quotidiens ?",
    answer: "Les gains sont calculés automatiquement chaque jour à minuit (heure de Paris) selon le taux de rendement annuel de votre pack, divisé par 365 jours."
  },
  {
    question: "Puis-je avoir plusieurs packs actifs simultanément ?",
    answer: "Oui, vous pouvez souscrire à plusieurs packs différents. Chaque pack fonctionne indépendamment avec ses propres conditions de rendement."
  },
  {
    question: "Que se passe-t-il si je retire mes fonds avant la fin du pack ?",
    answer: "Vous pouvez retirer vos fonds à tout moment, mais les gains non encore crédités ne seront pas versés. Les fonds investis restent disponibles immédiatement."
  },
  {
    question: "Comment modifier mes informations personnelles ?",
    answer: "Accédez à votre profil depuis le menu latéral, cliquez sur 'Modifier le profil', mettez à jour vos informations, puis sauvegardez les changements."
  }
];

export default function SupportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium' as const,
    message: ''
  });

  // Tickets mockés
  const [tickets] = useState<Ticket[]>([
    {
      id: 'TICK-001',
      subject: 'Problème de dépôt bancaire',
      category: 'Paiements',
      status: 'resolved',
      priority: 'high',
      createdAt: '2023-11-10T14:30:00Z',
      lastUpdate: '2023-11-11T09:15:00Z',
      messages: []
    },
    {
      id: 'TICK-002',
      subject: 'Question sur les gains',
      category: 'Investissement',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2023-11-15T11:20:00Z',
      lastUpdate: '2023-11-15T16:45:00Z',
      messages: []
    }
  ]);

  // Rediriger si non connecté
  useState(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.message) return;

    // Ici, on ferait l'appel API pour créer le ticket
    console.log('Nouveau ticket:', newTicket);

    // Reset form
    setNewTicket({
      subject: '',
      category: '',
      priority: 'medium',
      message: ''
    });

    toast.success('Ticket créé avec succès !', {
      description: 'Notre équipe vous répondra sous 24h.',
      duration: 5000
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            Support Client
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Besoin d&apos;aide ? Nous sommes là pour vous accompagner
          </p>
        </div>

        {/* Chat intégré */}
        <ChatWidget 
          isOpen={isChatOpen} 
          onToggle={() => setIsChatOpen(!isChatOpen)}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          userEmail={user?.email}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="tickets">Mes Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">Nouveau Ticket</TabsTrigger>
        </TabsList>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                Questions Fréquemment Posées
              </CardTitle>
              <CardDescription>
                Trouvez rapidement des réponses à vos questions les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Contact Email
                </CardTitle>
                <CardDescription>
                  Pour les demandes générales et les questions commerciales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">support@gazoduc-invest.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Réponse sous 24h ouvrées
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-green-500" />
                  Support Téléphonique
                </CardTitle>
                <CardDescription>
                  Pour les urgences et les problèmes techniques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">01 42 86 95 30</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lun-Ven: 9h-18h (heure de Paris)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Horaires d&apos;Ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span>9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span>10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Guides et tutoriels pour vous aider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Guide d&apos;utilisation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  FAQ complète
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Conditions générales
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mes Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Mes Tickets de Support</CardTitle>
              <CardDescription>
                Suivez l&apos;état de vos demandes de support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ticket.category} • #{ticket.id}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>Dernière mise à jour: {new Date(ticket.lastUpdate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3">
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nouveau Ticket */}
        <TabsContent value="new-ticket" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Créer un Nouveau Ticket</CardTitle>
              <CardDescription>
                Décrivez votre problème et notre équipe vous répondra rapidement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sujet</label>
                  <Input
                    placeholder="Résumez votre problème en quelques mots"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investissement">Investissement</SelectItem>
                      <SelectItem value="paiements">Paiements</SelectItem>
                      <SelectItem value="technique">Problème technique</SelectItem>
                      <SelectItem value="compte">Gestion du compte</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priorité</label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description détaillée</label>
                <Textarea
                  placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider efficacement."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab('tickets')}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.subject || !newTicket.message}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Créer le ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
