// Configuration React Query pour Gazoduc Invest
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Durée pendant laquelle les données sont considérées comme fraîches (5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Durée de conservation en cache (10 minutes)
    gcTime: 10 * 60 * 1000,
    
    // Retry automatique en cas d'erreur
    retry: 3,
    
    // Délai entre les retries (exponentiel)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Ne pas refetch automatiquement au focus de la fenêtre
    refetchOnWindowFocus: false,
    
    // Refetch au montage uniquement si les données sont stale
    refetchOnMount: true,
    
    // Refetch lors de la reconnexion
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry une seule fois pour les mutations
    retry: 1,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query Keys - Centralisation pour éviter les erreurs de typage
export const queryKeys = {
  // User data
  user: ['user'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  
  // Dashboard data
  dashboard: (userId: string) => ['dashboard', userId] as const,
  balance: (userId: string) => ['balance', userId] as const,
  
  // Subscriptions
  subscriptions: (userId: string) => ['subscriptions', userId] as const,
  activeSubscriptions: (userId: string) => ['subscriptions', userId, 'active'] as const,
  
  // Transactions
  transactions: (userId: string, page?: number) => 
    page ? ['transactions', userId, page] as const : ['transactions', userId] as const,
  transactionStats: (userId: string) => ['transactions', userId, 'stats'] as const,
  
  // Reports
  reportStats: (userId: string) => ['reports', userId, 'stats'] as const,
  
  // Plans
  plans: ['plans'] as const,
  plan: (planId: number) => ['plans', planId] as const,
  
  // Notifications
  notifications: (userId: string) => ['notifications', userId] as const,
  unreadNotifications: (userId: string) => ['notifications', userId, 'unread'] as const,
  
  // Admin
  adminStats: ['admin', 'stats'] as const,
  allUsers: ['admin', 'users'] as const,
  allTransactions: (page?: number) => 
    page ? ['admin', 'transactions', page] as const : ['admin', 'transactions'] as const,
};

// Types pour les erreurs
export interface QueryError {
  message: string;
  code?: string;
  details?: unknown;
}

// Helper pour gérer les erreurs
export function handleQueryError(error: unknown): QueryError {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    };
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message: String(error.message),
      details: error,
    };
  }
  
  return {
    message: 'Une erreur inattendue est survenue',
    details: error,
  };
}
