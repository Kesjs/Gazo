/**
 * Gestionnaire d'erreurs réseau avec retry automatique
 * Fournit des fonctions utilitaires pour gérer les erreurs réseau de manière cohérente
 */

import { toast } from 'sonner';

// Types
export interface NetworkError extends Error {
  code?: string;
  status?: number;
  retryable?: boolean;
  details?: unknown;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: NetworkError) => void;
}

export interface FetchOptions extends RequestInit {
  retry?: RetryOptions;
  timeout?: number;
  showToast?: boolean;
}

// Configuration par défaut
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: 'exponential',
  onRetry: () => {},
};

const DEFAULT_TIMEOUT = 30000; // 30 secondes

/**
 * Vérifie si une erreur est retryable
 */
export function isRetryableError(error: NetworkError): boolean {
  // Erreurs réseau (pas de réponse du serveur)
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return true;
  }

  // Codes HTTP retryables
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Timeout
  if (error.code === 'TIMEOUT') {
    return true;
  }

  return false;
}

/**
 * Calcule le délai avant le prochain retry
 */
function getRetryDelay(attempt: number, options: Required<RetryOptions>): number {
  if (options.backoff === 'exponential') {
    return Math.min(options.retryDelay * Math.pow(2, attempt), 30000);
  }
  return options.retryDelay;
}

/**
 * Attend un certain délai
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Crée une erreur réseau typée
 */
export function createNetworkError(
  message: string,
  status?: number,
  code?: string,
  details?: unknown
): NetworkError {
  const error = new Error(message) as NetworkError;
  error.status = status;
  error.code = code;
  error.details = details;
  error.retryable = isRetryableError(error);
  return error;
}

/**
 * Fetch avec retry automatique et timeout
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retry = {},
    timeout = DEFAULT_TIMEOUT,
    showToast = true,
    ...fetchOptions
  } = options;

  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...retry };
  let lastError: NetworkError | null = null;

  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Faire la requête
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Vérifier le statut
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createNetworkError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData
        );
      }

      // Parser la réponse
      const data = await response.json();
      return data as T;

    } catch (error: any) {
      // Gérer le timeout
      if (error.name === 'AbortError') {
        lastError = createNetworkError('La requête a expiré', undefined, 'TIMEOUT');
      } else if (error instanceof Error) {
        lastError = error as NetworkError;
        if (!lastError.retryable) {
          lastError.retryable = isRetryableError(lastError);
        }
      } else {
        lastError = createNetworkError('Une erreur inconnue est survenue');
      }

      // Si c'est le dernier essai ou l'erreur n'est pas retryable, throw
      if (attempt === retryOptions.maxRetries || !lastError.retryable) {
        if (showToast) {
          toast.error('Erreur réseau', {
            description: lastError.message,
          });
        }
        throw lastError;
      }

      // Notifier du retry
      retryOptions.onRetry(attempt + 1, lastError);

      // Afficher un toast pour le retry
      if (showToast && attempt < retryOptions.maxRetries) {
        toast.loading(`Nouvelle tentative (${attempt + 1}/${retryOptions.maxRetries})...`, {
          duration: 2000,
        });
      }

      // Attendre avant le prochain essai
      const delay = getRetryDelay(attempt, retryOptions);
      await sleep(delay);
    }
  }

  // Ne devrait jamais arriver ici, mais TypeScript l'exige
  throw lastError || createNetworkError('Échec après plusieurs tentatives');
}

/**
 * GET avec retry
 */
export async function get<T = unknown>(
  url: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST avec retry
 */
export async function post<T = unknown>(
  url: string,
  body?: unknown,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT avec retry
 */
export async function put<T = unknown>(
  url: string,
  body?: unknown,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE avec retry
 */
export async function del<T = unknown>(
  url: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Gestionnaire d'erreur global pour afficher des messages utilisateur-friendly
 */
export function handleError(error: unknown, context?: string): NetworkError {
  let networkError: NetworkError;

  if (error instanceof Error) {
    networkError = error as NetworkError;
  } else if (typeof error === 'string') {
    networkError = createNetworkError(error);
  } else {
    networkError = createNetworkError('Une erreur inconnue est survenue');
  }

  // Ajouter le contexte si fourni
  if (context) {
    networkError.message = `${context}: ${networkError.message}`;
  }

  // Logger l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('Network Error:', networkError);
  }

  return networkError;
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string,
  showToast = true
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const networkError = handleError(error, context);
    
    if (showToast) {
      toast.error('Erreur', {
        description: networkError.message,
      });
    }

    return null;
  }
}
