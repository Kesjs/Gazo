/**
 * Service de base pour toutes les API
 * Fournit des méthodes communes et la gestion d'erreur
 */

import { fetchWithRetry, NetworkError } from '@/lib/network-error-handler';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ServiceOptions {
  showToast?: boolean;
  retry?: {
    maxRetries?: number;
    retryDelay?: number;
  };
  timeout?: number;
}

export class BaseService {
  protected supabase: SupabaseClient;
  protected baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.supabase = createClient();
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  protected async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Utilisateur non authentifié');
    }
    return user;
  }

  /**
   * Récupère le token d'authentification
   */
  protected async getAuthToken(): Promise<string> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Session non valide');
    }
    return session.access_token;
  }

  /**
   * Effectue une requête GET
   */
  protected async get<T>(
    endpoint: string,
    options: ServiceOptions = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    return fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      retry: options.retry,
      timeout: options.timeout,
      showToast: options.showToast,
    });
  }

  /**
   * Effectue une requête POST
   */
  protected async post<T>(
    endpoint: string,
    body?: unknown,
    options: ServiceOptions = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    return fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      retry: options.retry,
      timeout: options.timeout,
      showToast: options.showToast,
    });
  }

  /**
   * Effectue une requête PUT
   */
  protected async put<T>(
    endpoint: string,
    body?: unknown,
    options: ServiceOptions = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    return fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      retry: options.retry,
      timeout: options.timeout,
      showToast: options.showToast,
    });
  }

  /**
   * Effectue une requête DELETE
   */
  protected async delete<T>(
    endpoint: string,
    options: ServiceOptions = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    return fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      retry: options.retry,
      timeout: options.timeout,
      showToast: options.showToast,
    });
  }

  /**
   * Requête Supabase avec gestion d'erreur
   */
  protected async supabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await queryFn();
    
    if (error) {
      throw new Error(error.message || 'Erreur lors de la requête');
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée');
    }
    
    return data;
  }
}
