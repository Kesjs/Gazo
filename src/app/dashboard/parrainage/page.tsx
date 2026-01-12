'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserPlusIcon,
  GiftIcon,
  ShareIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  UsersIcon,
  LinkIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Referral {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  earnings: number;
  level: number;
}

const referrals: Referral[] = [
  {
    id: '1',
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    joinDate: '2023-11-15',
    status: 'active',
    earnings: 250,
    level: 1
  },
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    joinDate: '2023-11-10',
    status: 'active',
    earnings: 180,
    level: 1
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@email.com',
    joinDate: '2023-11-05',
    status: 'active',
    earnings: 320,
    level: 1
  },
  {
    id: '4',
    name: 'Jean Leroy',
    email: 'jean.leroy@email.com',
    joinDate: '2023-10-28',
    status: 'pending',
    earnings: 0,
    level: 0
  },
  {
    id: '5',
    name: 'Alice Moreau',
    email: 'alice.moreau@email.com',
    joinDate: '2023-10-20',
    status: 'active',
    earnings: 95,
    level: 1
  }
];

const referralStats = [
  {
    title: 'Filleuls Actifs',
    value: '4',
    icon: UsersIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Gains Totaux',
    value: '€845',
    icon: CurrencyDollarIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    title: 'Niveau Actuel',
    value: 'Bronze',
    icon: TrophyIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    title: 'Invitations Envoyées',
    value: '12',
    icon: UserPlusIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  }
];

const rewards = [
  {
    level: 'Bronze',
    requirement: '5 filleuls actifs',
    reward: 'Bonus de €50',
    current: true
  },
  {
    level: 'Argent',
    requirement: '15 filleuls actifs',
    reward: 'Bonus de €150 + 2% supplémentaire',
    current: false
  },
  {
    level: 'Or',
    requirement: '30 filleuls actifs',
    reward: 'Bonus de €500 + 5% supplémentaire',
    current: false
  },
  {
    level: 'Diamant',
    requirement: '50 filleuls actifs',
    reward: 'Bonus de €1000 + 10% supplémentaire',
    current: false
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: (i: number) => ({
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    })
  }
};

export default function SponsorshipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else {
      // Generate unique referral link
      setReferralLink(`${window.location.origin}/register?ref=${user.id}`);
    }
  }, [user, router]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `Rejoignez-moi sur Gazoduc Invest et commencez à investir dans le GNL ! Utilisez mon lien de parrainage : ${referralLink}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
    };
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Programme de Parrainage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Invitez vos amis et gagnez des récompenses supplémentaires
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Inviter un ami
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {referralStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Referral Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Votre Lien de Parrainage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Partagez ce lien unique avec vos amis pour gagner des commissions sur leurs investissements.
            </p>

            <div className="flex space-x-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyToClipboard} variant="outline">
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={() => shareOnSocial('twitter')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareOnSocial('facebook')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => shareOnSocial('linkedin')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Mes Filleuls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Date d&apos;inscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gains</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {referral.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {referral.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(referral.joinDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(referral.status)}>
                            {getStatusLabel(referral.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          €{referral.earnings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2" />
                Récompenses Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewards.map((reward, index) => (
                <div
                  key={reward.level}
                  className={`p-4 rounded-lg border ${
                    reward.current
                      ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reward.current
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {reward.current ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <TrophyIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          reward.current
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          Niveau {reward.level}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reward.requirement}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        reward.current
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {reward.reward}
                      </p>
                      {reward.current && (
                        <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Actuel
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GiftIcon className="h-5 w-5 mr-2" />
              Comment ça marche ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Partagez votre lien
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Envoyez votre lien de parrainage unique à vos amis et contacts.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Ils s&apos;inscrivent
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vos filleuls créent un compte et commencent à investir via votre lien.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gagnez des récompenses
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recevez des commissions sur leurs investissements et débloquez des niveaux.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
