/**
 * Service pour la gestion des transactions
 */

import { BaseService } from './base.service';
import type {
  Transaction,
  TransactionFilters,
  TransactionsPaginated,
  DepositRequest,
  WithdrawalRequest,
  ApiResponse,
} from '@/types';

export class TransactionService extends BaseService {
  constructor() {
    super('/api/transactions');
  }

  /**
   * Récupère toutes les transactions de l'utilisateur
   */
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    
    let query = this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters?.minAmount !== undefined) {
      query = query.gte('amount', filters.minAmount);
    }
    
    if (filters?.maxAmount !== undefined) {
      query = query.lte('amount', filters.maxAmount);
    }

    return this.supabaseQuery(() => query);
  }

  /**
   * Récupère les transactions paginées
   */
  async getPaginated(
    page: number = 1,
    perPage: number = 20,
    filters?: TransactionFilters
  ): Promise<TransactionsPaginated> {
    const user = await this.getCurrentUser();
    
    // Compter le total
    let countQuery = this.supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (filters?.type && filters.type !== 'all') {
      countQuery = countQuery.eq('type', filters.type);
    }
    
    if (filters?.status && filters.status !== 'all') {
      countQuery = countQuery.eq('status', filters.status);
    }

    const { count } = await countQuery;
    const total = count || 0;

    // Récupérer les données paginées
    const transactions = await this.getAll(filters);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedTransactions = transactions.slice(start, end);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      perPage,
      hasMore: end < total,
    };
  }

  /**
   * Récupère une transaction par ID
   */
  async getById(id: string | number): Promise<Transaction> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
    );
  }

  /**
   * Crée un dépôt
   */
  async createDeposit(request: DepositRequest): Promise<Transaction> {
    const user = await this.getCurrentUser();
    
    const transaction = {
      user_id: user.id,
      type: 'deposit',
      amount: request.amount,
      status: 'pending',
      description: `Dépôt de ${request.amount}€`,
      method: request.method,
      reference: request.reference,
      created_at: new Date().toISOString(),
    };

    return this.supabaseQuery(() =>
      this.supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()
    );
  }

  /**
   * Crée un retrait
   */
  async createWithdrawal(request: WithdrawalRequest): Promise<Transaction> {
    const user = await this.getCurrentUser();
    
    const transaction = {
      user_id: user.id,
      type: 'withdrawal',
      amount: request.amount,
      status: 'pending',
      description: `Retrait de ${request.amount}€`,
      method: request.method,
      metadata: request.destination ? { destination: request.destination } : undefined,
      created_at: new Date().toISOString(),
    };

    return this.supabaseQuery(() =>
      this.supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()
    );
  }

  /**
   * Récupère les statistiques des transactions
   */
  async getStats(startDate?: string, endDate?: string) {
    const user = await this.getCurrentUser();
    
    let query = this.supabase
      .from('transactions')
      .select('type, amount, status, created_at')
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const transactions = await this.supabaseQuery(() => query);

    // Calculer les statistiques
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalProfits: 0,
      pendingAmount: 0,
      completedAmount: 0,
      transactionCount: transactions.length,
    };

    transactions.forEach((t: any) => {
      if (t.type === 'deposit' && t.status === 'completed') {
        stats.totalDeposits += t.amount;
      } else if (t.type === 'withdrawal' && t.status === 'completed') {
        stats.totalWithdrawals += t.amount;
      } else if (t.type === 'profit' && t.status === 'completed') {
        stats.totalProfits += t.amount;
      }

      if (t.status === 'pending') {
        stats.pendingAmount += t.amount;
      } else if (t.status === 'completed') {
        stats.completedAmount += t.amount;
      }
    });

    return stats;
  }

  /**
   * Récupère les transactions par type
   */
  async getByType(type: string): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Récupère les transactions récentes
   */
  async getRecent(limit: number = 10): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }
}

// Instance singleton
export const transactionService = new TransactionService();
