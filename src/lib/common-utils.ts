/**
 * Utilitaires communs pour réduire la duplication de code
 * Fonctions réutilisables à travers l'application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// FORMATAGE
// ============================================================================

/**
 * Formate un montant en devise
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formate un nombre avec séparateurs
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formate un pourcentage
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Formate une date
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short',
  locale: string = 'fr-FR'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat(locale, formats[format] as any).format(dateObj);
}

/**
 * Formate une date relative (il y a X jours)
 */
export function formatRelativeDate(date: string | Date, locale: string = 'fr'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone français
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Valide un montant
 */
export function isValidAmount(amount: number, min: number = 0, max?: number): boolean {
  if (isNaN(amount) || amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
}

/**
 * Valide un mot de passe
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  if (password.length < minLength) return false;
  // Au moins une majuscule, une minuscule et un chiffre
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
}

// ============================================================================
// MANIPULATION DE DONNÉES
// ============================================================================

/**
 * Trie un tableau par une clé
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Groupe un tableau par une clé
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Filtre les doublons d'un tableau
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Pagine un tableau
 */
export function paginate<T>(array: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return array.slice(start, end);
}

// ============================================================================
// CALCULS
// ============================================================================

/**
 * Calcule un pourcentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calcule une variation en pourcentage
 */
export function calculateChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calcule la moyenne d'un tableau
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calcule la somme d'un tableau
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Arrondit un nombre à N décimales
 */
export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ============================================================================
// UTILITAIRES DE TEMPS
// ============================================================================

/**
 * Attend un certain délai (pour debounce, etc.)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// UTILITAIRES DE CHAÎNES
// ============================================================================

/**
 * Tronque une chaîne
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Capitalise la première lettre
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convertit en slug (URL-friendly)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// UTILITAIRES D'OBJETS
// ============================================================================

/**
 * Vérifie si un objet est vide
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Deep clone d'un objet
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Fusionne des objets en profondeur
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;

  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (!targetValue || typeof targetValue !== 'object') {
        (target as any)[key] = {};
      }
      deepMerge(target[key] as any, sourceValue as any);
    } else {
      (target as any)[key] = sourceValue;
    }
  }

  return deepMerge(target, ...sources);
}

// ============================================================================
// UTILITAIRES DE CLASSES CSS (Tailwind)
// ============================================================================

/**
 * Combine des classes CSS (déjà dans utils.ts mais on l'ajoute ici pour référence)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// UTILITAIRES DE COULEURS
// ============================================================================

/**
 * Obtient une couleur basée sur un statut
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    failed: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
    cancelled: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300',
  };
  
  return colors[status.toLowerCase()] || colors.pending;
}

/**
 * Obtient une couleur basée sur un type de transaction
 */
export function getTransactionColor(type: string): string {
  const colors: Record<string, string> = {
    deposit: 'text-green-600',
    withdrawal: 'text-red-600',
    profit: 'text-blue-600',
    subscription: 'text-purple-600',
    bonus: 'text-yellow-600',
    refund: 'text-orange-600',
  };
  
  return colors[type.toLowerCase()] || 'text-gray-600';
}

// ============================================================================
// UTILITAIRES DE STOCKAGE LOCAL
// ============================================================================

/**
 * Sauvegarde dans le localStorage avec gestion d'erreur
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Récupère depuis le localStorage avec gestion d'erreur
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue || null;
  }
}

/**
 * Supprime du localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

// ============================================================================
// UTILITAIRES DE GÉNÉRATION
// ============================================================================

/**
 * Génère un ID unique
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Génère une couleur aléatoire
 */
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
