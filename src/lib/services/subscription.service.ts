/**
 * Service pour la gestion des souscriptions
 */

import { BaseService } from './base.service';
import type { Subscription, Plan } from '@/types';

export class SubscriptionService extends BaseService {
  constructor() {
    super('/api/subscriptions');
  }

  /**
   * Récupère toutes les souscriptions de l'utilisateur
   */
  async getAll(): Promise<Subscription[]> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Récupère les souscriptions actives
   */
  async getActive(): Promise<Subscription[]> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Récupère une souscription par ID
   */
  async getById(id: string | number): Promise<Subscription> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
    );
  }

  /**
   * Crée une nouvelle souscription
   */
  async create(planId: number | string, amount: number): Promise<Subscription> {
    const user = await this.getCurrentUser();
    
    const subscription = {
      user_id: user.id,
      plan_id: planId,
      amount,
      status: 'active',
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    return this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single()
    );
  }

  /**
   * Annule une souscription
   */
  async cancel(id: string | number): Promise<Subscription> {
    const user = await this.getCurrentUser();
    
    return this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    );
  }

  /**
   * Récupère les statistiques des souscriptions
   */
  async getStats() {
    const user = await this.getCurrentUser();
    
    const subscriptions = await this.supabaseQuery(() =>
      this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
    );

    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter((s: any) => s.status === 'active').length,
      completed: subscriptions.filter((s: any) => s.status === 'completed').length,
      cancelled: subscriptions.filter((s: any) => s.status === 'cancelled').length,
      totalInvested: subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
      totalEarned: subscriptions.reduce((sum: number, s: any) => sum + (s.total_earned || 0), 0),
    };

    return stats;
  }
}

export const subscriptionService = new SubscriptionService();
