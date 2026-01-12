// /**
//  * Service pour le dashboard
//  */

// import { BaseService } from './base.service';
// import { transactionService } from './transaction.service';
// import { subscriptionService } from './subscription.service';
// import type { DashboardData, DashboardStats } from '@/types';

// export class DashboardService extends BaseService {
//   constructor() {
//     super('/api/dashboard');
//   }

//   /**
//    * Récupère toutes les données du dashboard
//    */
//   async getData(): Promise<DashboardData> {
//     const user = await this.getCurrentUser();
    
//     // Récupérer le profil
//     const profile = await this.supabaseQuery(() =>
//       this.supabase
//         .from('profiles')
//         .select('*')
//         .eq('user_id', user.id)
//         .single()
//     );

//     // Récupérer les souscriptions
//     const subscriptions = await subscriptionService.getAll();

//     // Récupérer les transactions récentes
//     const transactions = await transactionService.getRecent(20);

//     // Calculer le solde
//     const balance = await this.calculateBalance();

//     // Calculer les totaux
//     const totalInvested = subscriptions
//       .filter((s: any) => s.status === 'active')
//       .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

//     const totalEarned = subscriptions
//       .reduce((sum: number, s: any) => sum + (s.total_earned || 0), 0);

//     const activeSubscriptions = subscriptions
//       .filter((s: any) => s.status === 'active').length;

//     return {
//       profile,
//       subscriptions,
//       transactions,
//       balance,
//       totalInvested,
//       totalEarned,
//       activeSubscriptions,
//     };
//   }

//   /**
//    * Récupère les statistiques du dashboard
//    */
//   async getStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
//     const user = await this.getCurrentUser();
    
//     // Récupérer les statistiques des transactions
//     const transactionStats = await transactionService.getStats(startDate, endDate);
    
//     // Récupérer les statistiques des souscriptions
//     const subscriptionStats = await subscriptionService.getStats();

//     // Calculer le solde
//     const balance = await this.calculateBalance();

//     // Calculer le ROI
//     const roi = subscriptionStats.totalInvested > 0
//       ? (subscriptionStats.totalEarned / subscriptionStats.totalInvested) * 100
//       : 0;

//     return {
//       totalBalance: balance,
//       totalInvested: subscriptionStats.totalInvested,
//       totalEarned: subscriptionStats.totalEarned,
//       activeSubscriptions: subscriptionStats.active,
//       pendingWithdrawals: transactionStats.pendingAmount,
//       monthlyProfit: await this.calculateMonthlyProfit(),
//       dailyProfit: await this.calculateDailyProfit(),
//       roi,
//     };
//   }

//   /**
//    * Calcule le solde actuel
//    */
//   private async calculateBalance(): Promise<number> {
//     const user = await this.getCurrentUser();
    
//     const transactions = await this.supabaseQuery(() =>
//       this.supabase
//         .from('transactions')
//         .select('type, amount, status')
//         .eq('user_id', user.id)
//         .eq('status', 'completed')
//     );

//     let balance = 0;
//     transactions.forEach((t: any) => {
//       if (t.type === 'deposit' || t.type === 'profit' || t.type === 'bonus') {
//         balance += t.amount;
//       } else if (t.type === 'withdrawal' || t.type === 'subscription') {
//         balance -= t.amount;
//       }
//     });

//     return balance;
//   }

//   /**
//    * Calcule les gains mensuels
//    */
//   private async calculateMonthlyProfit(): Promise<number> {
//     const user = await this.getCurrentUser();
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const profits = await this.supabaseQuery(() =>
//       this.supabase
//         .from('transactions')
//         .select('amount')
//         .eq('user_id', user.id)
//         .eq('type', 'profit')
//         .eq('status', 'completed')
//         .gte('created_at', startOfMonth.toISOString())
//     );

//     return profits.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
//   }

//   /**
//    * Calcule les gains journaliers
//    */
//   private async calculateDailyProfit(): Promise<number> {
//     const user = await this.getCurrentUser();
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const profits = await this.supabaseQuery(() =>
//       this.supabase
//         .from('transactions')
//         .select('amount')
//         .eq('user_id', user.id)
//         .eq('type', 'profit')
//         .eq('status', 'completed')
//         .gte('created_at', startOfDay.toISOString())
//     );

//     return profits.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
//   }

//   /**
//    * Récupère les données pour les graphiques
//    */
//   async getChartData(period: 'week' | 'month' | 'year' = 'month') {
//     const user = await this.getCurrentUser();
    
//     // Calculer la date de début selon la période
//     const startDate = new Date();
//     if (period === 'week') {
//       startDate.setDate(startDate.getDate() - 7);
//     } else if (period === 'month') {
//       startDate.setMonth(startDate.getMonth() - 1);
//     } else {
//       startDate.setFullYear(startDate.getFullYear() - 1);
//     }

//     // Récupérer les transactions
//     const transactions = await this.supabaseQuery(() =>
//       this.supabase
//         .from('transactions')
//         .select('type, amount, created_at, status')
//         .eq('user_id', user.id)
//         .gte('created_at', startDate.toISOString())
//         .order('created_at', { ascending: true })
//     );

//     // Grouper par date
//     const dataByDate: Record<string, any> = {};
    
//     transactions.forEach((t: any) => {
//       const date = new Date(t.created_at).toISOString().split('T')[0];
      
//       if (!dataByDate[date]) {
//         dataByDate[date] = {
//           date,
//           deposits: 0,
//           withdrawals: 0,
//           profits: 0,
//           total: 0,
//         };
//       }

//       if (t.status === 'completed') {
//         if (t.type === 'deposit') {
//           dataByDate[date].deposits += t.amount;
//           dataByDate[date].total += t.amount;
//         } else if (t.type === 'withdrawal') {
//           dataByDate[date].withdrawals += t.amount;
//           dataByDate[date].total -= t.amount;
//         } else if (t.type === 'profit') {
//           dataByDate[date].profits += t.amount;
//           dataByDate[date].total += t.amount;
//         }
//       }
//     });

//     return Object.values(dataByDate);
//   }
// }

// export const dashboardService = new DashboardService();
