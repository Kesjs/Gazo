import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { toast } from 'sonner';

interface ReportParams {
  reportType: 'performance' | 'gains' | 'portfolio' | 'monthly';
  startDate?: string;
  endDate?: string;
}

interface ReportData {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  data: any;
  summary: {
    totalInvested: number;
    totalEarnings: number;
    totalWithdrawals: number;
    currentBalance: number;
    performance: number;
  };
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async (params: ReportParams): Promise<ReportData> => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Rapport généré avec succès', {
        description: `${data.title} est prêt à être consulté.`,
      });
    },
    onError: (error) => {
      toast.error('Erreur de génération', {
        description: error.message || 'Impossible de générer le rapport.',
      });
    },
  });
}

export function useReportStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reportStats(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      // Get user's report statistics from transactions and subscriptions
      const response = await fetch(`/api/reports/stats?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report stats');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
