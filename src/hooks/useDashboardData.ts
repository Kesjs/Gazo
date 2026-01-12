'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { queryKeys, handleQueryError } from '@/lib/react-query';
import { toast } from 'sonner';

// Types
interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface Subscription {
  id: number;
  user_id: string;
  plan_id: number;
  amount: number;
  static_balance: number;
  dynamic_balance: number;
  start_date: string;
  end_date?: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: number;
  user_id: string;
  type: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  metadata?: any;
  created_at: string;
}

interface DashboardData {
  profile: Profile | null;
  subscriptions: Subscription[];
  transactions: Transaction[];
  balance: {
    static: number;
    dynamic: number;
    total: number;
  };
}

// Hook principal pour les données du dashboard
export function useDashboardData(userId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.dashboard(userId || ''),
    queryFn: async (): Promise<DashboardData> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Charger toutes les données en parallèle
      const [profileResult, subscriptionsResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      console.log('🔍 Dashboard data for user:', userId)
      console.log('📊 Transactions found:', transactionsResult.data?.length || 0)
      if (transactionsResult.data) {
        transactionsResult.data.forEach((tx, index) => {
          console.log(`  ${index + 1}. ${tx.type}: ${tx.amount}€ - ${tx.description} (${tx.created_at})`)
        })
      }

      // Vérifier les erreurs
      if (profileResult.error) throw profileResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (transactionsResult.error) throw transactionsResult.error;

      // Calculer le solde depuis les souscriptions actives
      const staticBalance = subscriptionsResult.data
        ?.filter(sub => sub.status === 'active')
        ?.reduce((sum, sub) => sum + (sub.static_balance || 0), 0) || 0;

      const dynamicBalance = subscriptionsResult.data
        ?.filter(sub => sub.status === 'active')
        ?.reduce((sum, sub) => sum + (sub.dynamic_balance || 0), 0) || 0;

      return {
        profile: profileResult.data,
        subscriptions: subscriptionsResult.data || [],
        transactions: transactionsResult.data || [],
        balance: {
          static: staticBalance,
          dynamic: dynamicBalance,
          total: staticBalance + dynamicBalance
        }
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes pour le dashboard (données critiques)
  });
}

// Hook pour les souscriptions uniquement
export function useSubscriptions(userId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.subscriptions(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

// Hook pour les transactions avec pagination
export function useTransactions(userId: string | undefined, page: number = 1, perPage: number = 20) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.transactions(userId || '', page),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        transactions: data || [],
        total: count || 0,
        hasMore: count ? (from + (data?.length || 0)) < count : false,
      };
    },
    enabled: !!userId,
  });
}

// Hook pour les plans (données statiques, cache long)
export function usePlans() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('min_amount', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (les plans changent rarement)
    gcTime: 60 * 60 * 1000, // 1 heure
  });
}

// Hook pour le solde
export function useBalance(userId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.balance(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId);

      if (error) throw error;

      return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
    },
    enabled: !!userId,
  });
}

// Mutation pour créer une souscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ planId, amount }: { planId: number; amount: number }) => {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la souscription');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalider les caches pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(data.userId) });

      toast.success('Souscription réussie !', {
        description: 'Votre investissement a été enregistré avec succès',
      });
    },
    onError: (error) => {
      const { message } = handleQueryError(error);
      toast.error('Erreur de souscription', {
        description: message,
      });
    },
  });
}

// Mutation pour créer un dépôt
export function useCreateDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: string }) => {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du dépôt');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(data.userId) });

      toast.success('Demande de dépôt enregistrée', {
        description: `Votre demande de dépôt de $${data.amount} a été enregistrée. Vous recevrez une confirmation par email.`,
      });
    },
    onError: (error) => {
      const { message } = handleQueryError(error);
      toast.error('Erreur de dépôt', {
        description: message,
      });
    },
  });
}

// Mutation pour créer un retrait
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: string }) => {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du retrait');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(data.userId) });

      toast.success('Demande de retrait enregistrée', {
        description: `Votre demande de retrait de $${data.amount} est en cours de traitement.`,
      });
    },
    onError: (error) => {
      const { message } = handleQueryError(error);
      toast.error('Erreur de retrait', {
        description: message,
      });
    },
  });
}

// Mutation pour mettre à jour le profil
export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (profileData: {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      bio: string;
      dateOfBirth?: string;
      nationality?: string;
    }) => {
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        date_of_birth: profileData.dateOfBirth,
        nationality: profileData.nationality,
        full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.auth.updateUser({
        data: updateData
      });

      if (error) throw error;

      return updateData;
    },
    onSuccess: () => {
      // Invalider le cache du profil
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
      }

      toast.success('Profil mis à jour', {
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    },
    onError: (error) => {
      const { message } = handleQueryError(error);
      toast.error('Erreur de mise à jour', {
        description: message,
      });
    },
  });
}

// Mutation pour mettre à jour le mot de passe
export function useUpdatePassword() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Mot de passe mis à jour', {
        description: 'Votre mot de passe a été changé avec succès.',
      });
    },
    onError: (error) => {
      const { message } = handleQueryError(error);
      toast.error('Erreur de mise à jour du mot de passe', {
        description: message,
      });
    },
  });
}

// Hook pour les notifications
export function useNotifications(userId: string | undefined, limit: number = 20) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.notifications(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 secondes (notifications changent souvent)
  });
}

// Hook pour compter les notifications non lues
export function useUnreadNotificationsCount(userId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.unreadNotifications(userId || ''),
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 secondes
  });
}

// Mutation pour marquer une notification comme lue
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: number; userId: string }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalider les caches de notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications(variables.userId) });
    },
  });
}

// Mutation pour marquer toutes les notifications comme lues
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      // Invalider les caches de notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications(userId) });
    },
  });
}
