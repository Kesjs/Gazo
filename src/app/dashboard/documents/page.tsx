'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DocumentTextIcon,
  DocumentIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Document {
  id: string;
  title: string;
  category: 'legal' | 'contract' | 'finance' | 'guide';
  date: string;
  size: string;
  description: string;
  status: 'available' | 'signed' | 'pending';
}

const documents: Document[] = [
  {
    id: '1',
    title: 'Contrat d\'Investissement Premium',
    category: 'contract',
    date: '2023-11-15',
    size: '1.2 MB',
    description: 'Contrat détaillant les termes de votre investissement Premium',
    status: 'signed'
  },
  {
    id: '2',
    title: 'Conditions Générales d\'Utilisation',
    category: 'legal',
    date: '2023-11-01',
    size: '2.5 MB',
    description: 'Document légal définissant les règles d\'utilisation de la plateforme',
    status: 'available'
  },
  {
    id: '3',
    title: 'Politique de Confidentialité',
    category: 'legal',
    date: '2023-11-01',
    size: '1.8 MB',
    description: 'Informations sur la protection de vos données personnelles',
    status: 'available'
  },
  {
    id: '4',
    title: 'Guide d\'Investissement GNL',
    category: 'guide',
    date: '2023-10-15',
    size: '3.2 MB',
    description: 'Guide complet pour comprendre l\'investissement dans le GNL',
    status: 'available'
  },
  {
    id: '5',
    title: 'Rapport Annuel 2023',
    category: 'finance',
    date: '2023-12-01',
    size: '4.1 MB',
    description: 'Rapport annuel de performance de Gazoduc Invest',
    status: 'available'
  },
  {
    id: '6',
    title: 'Accord de Service Financier',
    category: 'contract',
    date: '2023-11-15',
    size: '950 KB',
    description: 'Accord régissant les services financiers fournis',
    status: 'signed'
  }
];

const documentStats = [
  {
    title: 'Documents Disponibles',
    value: '6',
    icon: DocumentTextIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Documents Signés',
    value: '2',
    icon: ShieldCheckIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    title: 'Téléchargements',
    value: '24',
    icon: DocumentArrowDownIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    title: 'Mise à jour récente',
    value: '15 Nov',
    icon: FolderIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
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

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const getDocumentCategoryColor = (category: string) => {
    switch (category) {
      case 'legal':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'contract':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'finance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'guide':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDocumentCategoryLabel = (category: string) => {
    switch (category) {
      case 'legal':
        return 'Légal';
      case 'contract':
        return 'Contrat';
      case 'finance':
        return 'Finance';
      case 'guide':
        return 'Guide';
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'signed':
        return 'Signé';
      case 'available':
        return 'Disponible';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const filteredDocuments = activeTab === 'all'
    ? documents
    : documents.filter(doc => doc.category === activeTab);

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-full w-full"
    >
      <div className="w-full max-w-none px-4 py-6 md:pl-0 md:pr-8 lg:pl-0 lg:pr-12 xl:pl-0 xl:pr-16 2xl:pl-0 2xl:pr-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Documents & Contrats
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Accédez à tous vos documents légaux, contrats et guides d&apos;investissement
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 self-start lg:self-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Télécharger tout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentStats.map((stat, index) => (
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

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Mes Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { value: 'all', label: 'Tous' },
                    { value: 'contract', label: 'Contrats' },
                    { value: 'legal', label: 'Légal' },
                    { value: 'finance', label: 'Finance' },
                    { value: 'guide', label: 'Guides' }
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={activeTab === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(filter.value)}
                      className={activeTab === filter.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-700 border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <DocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{document.title}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getDocumentCategoryColor(document.category)}>
                                    {getDocumentCategoryLabel(document.category)}
                                  </Badge>
                                  <Badge className={getStatusColor(document.status)}>
                                    {getStatusLabel(document.status)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {document.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <span>{new Date(document.date).toLocaleDateString('fr-FR')}</span>
                            <span>{document.size}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedDocument(document)}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucun document trouvé dans cette catégorie.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Document Preview Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedDocument.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDocument.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Aperçu du document - {selectedDocument.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Fonctionnalité d&apos;aperçu à implémenter
                  </p>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                    Fermer
                  </Button>
                  <Button>
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
