'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DocumentChartBarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useGenerateReport, useReportStats } from '@/hooks/useReports';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Report {
  id: string;
  title: string;
  type: 'performance' | 'gains' | 'portfolio' | 'monthly';
  date: string;
  status: 'available' | 'generating';
  size?: string;
  description: string;
  data?: any;
  summary?: any;
  generatedAt?: string;
}

interface ReportStats {
  availableReports: number;
  monthlyDownloads: number;
  performance: string;
  lastGeneration: string;
}

const reportTemplates: Report[] = [
  {
    id: 'performance-template',
    title: 'Rapport de Performance',
    type: 'performance',
    date: new Date().toISOString(),
    status: 'available',
    description: 'Analyse détaillée de vos performances d\'investissement avec graphiques'
  },
  {
    id: 'gains-template',
    title: 'Rapport des Gains',
    type: 'gains',
    date: new Date().toISOString(),
    status: 'available',
    description: 'Détail de tous vos gains et intérêts perçus avec évolution temporelle'
  },
  {
    id: 'portfolio-template',
    title: 'Rapport de Portefeuille',
    type: 'portfolio',
    date: new Date().toISOString(),
    status: 'available',
    description: 'Vue d\'ensemble de votre portefeuille d\'investissement et diversification'
  },
  {
    id: 'monthly-template',
    title: 'Rapport Mensuel',
    type: 'monthly',
    date: new Date().toISOString(),
    status: 'available',
    description: 'Rapport mensuel détaillé de vos activités d\'investissement'
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Real data hooks
  const { data: dashboardData } = useDashboardData(user?.id);
  const { data: reportStats, isLoading: statsLoading } = useReportStats(user?.id);
  const generateReport = useGenerateReport();

  // Local state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleGenerateReport = async (reportType: Report['type']) => {
    try {
      const result = await generateReport.mutateAsync({
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      // Add the generated report to the list
      const newReport: Report = {
        id: result.id,
        title: result.title,
        type: result.type as Report['type'],
        date: result.generatedAt,
        status: 'available',
        description: `Rapport généré le ${new Date(result.generatedAt).toLocaleDateString('fr-FR')}`,
        data: result.data,
        summary: result.summary
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);

    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    if (!report.data || !report.summary) {
      toast.error('Données du rapport non disponibles');
      return;
    }

    try {
      toast.loading('Génération du PDF en cours...', { id: 'pdf-generation' });

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Header with title and generation date
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(report.title, margin, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${new Date(report.generatedAt || report.date).toLocaleDateString('fr-FR')} à ${new Date(report.generatedAt || report.date).toLocaleTimeString('fr-FR')}`, margin, currentY);
      currentY += 10;

      // Summary section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé', margin, currentY);
      currentY += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const summaryData = [
        `Investissement Total: $${report.summary.totalInvested.toFixed(2)}`,
        `Gains Totaux: $${report.summary.totalEarnings.toFixed(2)}`,
        `Retraits Totaux: $${report.summary.totalWithdrawals.toFixed(2)}`,
        `Solde Actuel: $${report.summary.currentBalance.toFixed(2)}`,
        `Performance: ${report.summary.performance >= 0 ? '+' : ''}${report.summary.performance.toFixed(1)}%`
      ];

      summaryData.forEach((item, index) => {
        pdf.text(item, margin, currentY);
        currentY += 8;

        // Add new page if needed
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
      });

      currentY += 10;

      // Report-specific data
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Détails du Rapport', margin, currentY);
      currentY += 15;

      if (report.type === 'performance' && report.data) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Évolution Mensuelle', margin, currentY);
        currentY += 12;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Monthly breakdown table
        const monthlyData = Object.entries(report.data.monthlyBreakdown || {});
        if (monthlyData.length > 0) {
          pdf.text('Mois | Investissements | Gains | Retraits', margin, currentY);
          currentY += 8;

          monthlyData.forEach(([month, data]: [string, any]) => {
            const line = `${month.replace('-', '/')} | $${data.investments || 0} | $${data.earnings || 0} | $${data.withdrawals || 0}`;
            pdf.text(line, margin, currentY);
            currentY += 6;

            if (currentY > pageHeight - 30) {
              pdf.addPage();
              currentY = margin;
            }
          });
        }

        currentY += 10;

        // Top performing plans
        if (report.data.topPerformingPlans && report.data.topPerformingPlans.length > 0) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Top Performances par Plan', margin, currentY);
          currentY += 12;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');

          report.data.topPerformingPlans.forEach((plan: any, index: number) => {
            const line = `${index + 1}. ${plan.name}: ${plan.performance >= 0 ? '+' : ''}${plan.performance.toFixed(1)}%`;
            pdf.text(line, margin, currentY);
            currentY += 6;
          });
        }
      }

      if (report.type === 'gains' && report.data) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Statistiques des Gains', margin, currentY);
        currentY += 12;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const gainsData = [
          `Gains Totaux: $${report.data.totalEarnings.toFixed(2)}`,
          `Retraits Totaux: $${report.data.totalWithdrawals.toFixed(2)}`,
          `Nombre de Gains: ${report.data.earningsCount}`,
          `Nombre de Retraits: ${report.data.withdrawalCount}`,
          `Moyenne Quotidienne: $${report.data.averageDailyEarnings.toFixed(2)}`,
          `Plus Gros Gain: $${report.data.largestEarning?.toFixed(2) || '0.00'}`
        ];

        gainsData.forEach(item => {
          pdf.text(item, margin, currentY);
          currentY += 6;

          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
        });
      }

      if (report.type === 'portfolio' && report.data) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Répartition du Portefeuille', margin, currentY);
        currentY += 12;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        pdf.text(`Souscriptions Actives: ${report.data.totalActiveSubscriptions}`, margin, currentY);
        currentY += 8;
        pdf.text(`Ratio de Diversification: ${Object.keys(report.data.portfolioByPlan || {}).length} plans`, margin, currentY);
        currentY += 8;
        pdf.text(`Valeur Totale: $${report.data.totalValue?.toFixed(2) || '0.00'}`, margin, currentY);
        currentY += 12;

        // Portfolio breakdown
        if (report.data.portfolioByPlan) {
          Object.entries(report.data.portfolioByPlan).forEach(([planName, data]: [string, any]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(planName, margin, currentY);
            currentY += 6;

            pdf.setFont('helvetica', 'normal');
            const planDetails = [
              `Souscriptions: ${data.count}`,
              `Investi: $${data.totalInvested.toFixed(2)}`,
              `Valeur Actuelle: $${data.currentValue.toFixed(2)}`,
              `Performance: ${data.averagePerformance >= 0 ? '+' : ''}${data.averagePerformance.toFixed(1)}%`
            ];

            planDetails.forEach(detail => {
              pdf.text(`  ${detail}`, margin, currentY);
              currentY += 5;

              if (currentY > pageHeight - 30) {
                pdf.addPage();
                currentY = margin;
              }
            });

            currentY += 3;
          });
        }
      }

      if (report.type === 'monthly' && report.data) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Rapport Mensuel - ${report.data.period}`, margin, currentY);
        currentY += 12;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const monthlyData = [
          `Nouveaux Investissements: ${report.data.newInvestments}`,
          `Montant Investi: $${report.data.totalNewInvestment.toFixed(2)}`,
          `Gains Générés: $${report.data.earnings.toFixed(2)}`,
          `Retraits: $${report.data.withdrawals.toFixed(2)}`,
          `Croissance Nette: ${report.data.netGrowth >= 0 ? '+' : ''}$${report.data.netGrowth.toFixed(2)}`,
          `Transactions Totales: ${report.data.transactionCount}`,
          `Souscriptions Actives: ${report.data.activeSubscriptions}`
        ];

        monthlyData.forEach(item => {
          pdf.text(item, margin, currentY);
          currentY += 6;

          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
        });
      }

      // Footer
      const totalPages = pdf.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Rapport généré par Gazoduc Invest - Page ${i}/${totalPages}`, margin, pageHeight - 10);
        pdf.text(new Date().toLocaleString('fr-FR'), pageWidth - 50, pageHeight - 10);
      }

      // Save the PDF
      const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF téléchargé avec succès !', { id: 'pdf-generation' });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erreur lors de la génération du PDF', { id: 'pdf-generation' });
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'gains':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investissement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'mensuel':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'performance':
        return 'Performance';
      case 'gains':
        return 'Gains';
      case 'investissement':
        return 'Investissement';
      case 'mensuel':
        return 'Mensuel';
      default:
        return type;
    }
  };

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
      <div className="w-full max-w-none">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Rapports & Analyses
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Consultez vos rapports financiers et analysez vos performances d&apos;investissement
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 self-start lg:self-center">
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              Générer un rapport
            </Button>
          </div>

          {/* Date Range Filter */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Période du rapport
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDateRange({
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    7 jours
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDateRange({
                      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    30 jours
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDateRange({
                      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    90 jours
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              // Loading state for stats
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="ml-4 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              [
                {
                  title: 'Rapports Disponibles',
                  value: reportStats?.availableReports?.toString() || '4',
                  icon: DocumentTextIcon,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-100 dark:bg-blue-900/30'
                },
                {
                  title: 'Téléchargements ce mois',
                  value: reportStats?.monthlyDownloads?.toString() || '0',
                  icon: ArrowDownTrayIcon,
                  color: 'text-green-600',
                  bgColor: 'bg-green-100 dark:bg-green-900/30'
                },
                {
                  title: 'Performance Moyenne',
                  value: reportStats?.performance ? `+${reportStats.performance}%` : '+0.0%',
                  icon: ChartBarIcon,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-100 dark:bg-purple-900/30'
                },
                {
                  title: 'Dernière génération',
                  value: reportStats?.lastGeneration || 'Jamais',
                  icon: CalendarIcon,
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-100 dark:bg-orange-900/30'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
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
              ))
            )}
          </div>

          {/* Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Rapports Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Show generated reports first */}
                      {generatedReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {report.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {report.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getReportTypeColor(report.type)}>
                              {getReportTypeLabel(report.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'available' ? 'default' : 'secondary'}>
                              {report.status === 'available' ? 'Disponible' : 'En cours'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                              {report.status === 'available' && (
                                <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)}>
                                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                  Télécharger
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Show report templates */}
                      {reportTemplates.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 opacity-75">
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {report.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {report.description}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Modèle - Cliquez pour générer
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getReportTypeColor(report.type)}>
                              {getReportTypeLabel(report.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            -
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Modèle
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGenerateReport(report.type)}
                              disabled={generateReport.isPending}
                            >
                              {generateReport.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                  Génération...
                                </>
                              ) : (
                                <>
                                  <DocumentChartBarIcon className="h-4 w-4 mr-1" />
                                  Générer
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Report Preview Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedReport.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedReport.description}
                    </p>
                    {selectedReport.summary && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400">Investi Total</p>
                          <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                            ${selectedReport.summary.totalInvested.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-xs text-green-600 dark:text-green-400">Gains Totaux</p>
                          <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                            ${selectedReport.summary.totalEarnings.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400">Retraits Totaux</p>
                          <p className="text-lg font-semibold text-red-800 dark:text-red-200">
                            ${selectedReport.summary.totalWithdrawals.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400">Solde Actuel</p>
                          <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                            ${selectedReport.summary.currentBalance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  {selectedReport.type === 'performance' && selectedReport.data && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Évolution Mensuelle des Investissements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={Object.entries(selectedReport.data.monthlyBreakdown || {}).map(([month, data]: [string, any]) => ({
                              month: month.replace('-', '/'),
                              investissements: data.investments,
                              gains: data.earnings,
                              retraits: data.withdrawals
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`$${value}`, '']} />
                              <Line type="monotone" dataKey="investissements" stroke="#8884d8" name="Investissements" />
                              <Line type="monotone" dataKey="gains" stroke="#82ca9d" name="Gains" />
                              <Line type="monotone" dataKey="retraits" stroke="#ff7300" name="Retraits" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Performances par Plan</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedReport.data.topPerformingPlans?.map((plan: any, index: number) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{plan.name}</span>
                                  <span className={`text-sm font-semibold ${plan.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {plan.performance >= 0 ? '+' : ''}{plan.performance.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Statistiques Clés</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span>Souscriptions Actives:</span>
                              <span className="font-semibold">{selectedReport.data.activeSubscriptions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Investi:</span>
                              <span className="font-semibold">${selectedReport.data.totalInvested.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valeur Actuelle:</span>
                              <span className="font-semibold">${selectedReport.data.currentBalance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Performance Totale:</span>
                              <span className={`font-semibold ${selectedReport.data.performancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedReport.data.performancePercentage >= 0 ? '+' : ''}{selectedReport.data.performancePercentage.toFixed(1)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'gains' && selectedReport.data && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Évolution Quotidienne des Gains</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(selectedReport.data.dailyEarnings || {}).map(([date, amount]: [string, any]) => ({
                              date: new Date(date).toLocaleDateString('fr-FR'),
                              gains: amount
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`$${value}`, 'Gains']} />
                              <Bar dataKey="gains" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              ${selectedReport.data.totalEarnings.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Gains Totaux</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-red-600 mb-2">
                              ${selectedReport.data.totalWithdrawals.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Retraits Totaux</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              ${selectedReport.data.averageDailyEarnings.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne Quotidienne</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'portfolio' && selectedReport.data && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Répartition du Portefeuille</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={Object.entries(selectedReport.data.portfolioByPlan || {}).map(([name, data]: [string, any]) => ({
                                  name,
                                  value: data.totalInvested
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {Object.entries(selectedReport.data.portfolioByPlan || {}).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Investissement']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Détails par Plan d'Investissement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(selectedReport.data.portfolioByPlan || {}).map(([planName, data]: [string, any]) => (
                              <div key={planName} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold">{planName}</h4>
                                  <span className={`text-sm font-semibold ${data.averagePerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.averagePerformance >= 0 ? '+' : ''}{data.averagePerformance.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Souscriptions:</span>
                                    <p className="font-semibold">{data.count}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Investi:</span>
                                    <p className="font-semibold">${data.totalInvested.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Valeur actuelle:</span>
                                    <p className="font-semibold">${data.currentValue.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {selectedReport.type === 'monthly' && selectedReport.data && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Résumé Mensuel - {selectedReport.data.period}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {selectedReport.data.newInvestments}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux Investissements</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                ${selectedReport.data.totalNewInvestment.toFixed(2)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Montant Investi</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600 mb-1">
                                ${selectedReport.data.earnings.toFixed(2)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Gains Générés</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600 mb-1">
                                ${selectedReport.data.netGrowth.toFixed(2)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Croissance Nette</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Activités du Mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedReport.data.transactionCount}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions Totales</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedReport.data.activeSubscriptions}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Souscriptions Actives</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedReport.data.withdrawals > 0 ? `${((selectedReport.data.withdrawals / (selectedReport.data.earnings + selectedReport.data.withdrawals)) * 100).toFixed(1)}%` : '0%'}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de Retrait</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {!selectedReport.data && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <DocumentChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Données du rapport en cours de chargement...
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6 space-x-3 pt-6 border-t">
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Fermer
                  </Button>
                  <Button onClick={() => handleDownloadReport(selectedReport)}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Télécharger PDF
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
