/**
 * Types globaux de l'application Gazoduc Invest
 * Centralise toutes les interfaces et types pour une meilleure maintenabilité
 */

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: UserMetadata;
  app_metadata?: AppMetadata;
}

export interface UserMetadata {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  date_of_birth?: string;
  nationality?: string;
  avatar_url?: string;
}

export interface AppMetadata {
  provider?: string;
  providers?: string[];
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  date_of_birth?: string;
  nationality?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PLANS & SUBSCRIPTIONS
// ============================================================================

export interface Plan {
  id: number | string;
  name: string;
  description: string;
  min_amount: number;
  max_amount?: number;
  daily_profit: number;
  duration_days: number;
  features: string[];
  color?: string;
  icon?: string;
  popular?: boolean;
  badge?: string;
  gradient?: string;
  hoverBg?: string;
  iconColor?: string;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus = 'active' | 'completed' | 'cancelled' | 'pending';

export interface Subscription {
  id: number | string;
  user_id: string;
  plan_id: number | string;
  amount: number;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  progress?: number;
  daily_earnings?: number;
  total_earned?: number;
  last_profit_date?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export type TransactionType = 'deposit' | 'withdrawal' | 'profit' | 'subscription' | 'bonus' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

export interface Transaction {
  id: number | string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  reference?: string;
  method?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  status?: TransactionStatus | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionsPaginated {
  transactions: Transaction[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardData {
  profile: Profile | null;
  subscriptions: Subscription[];
  transactions: Transaction[];
  balance: number;
  totalInvested: number;
  totalEarned: number;
  activeSubscriptions: number;
}

export interface DashboardStats {
  totalBalance: number;
  totalInvested: number;
  totalEarned: number;
  activeSubscriptions: number;
  pendingWithdrawals: number;
  monthlyProfit: number;
  dailyProfit: number;
  roi: number;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export type PaymentMethod = 'bank_transfer' | 'crypto' | 'mobile_money' | 'card';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface DepositRequest {
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface WithdrawalRequest {
  amount: number;
  method: PaymentMethod;
  destination?: string;
}

// ============================================================================
// SUPPORT & TICKETS
// ============================================================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'account' | 'general';

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  content: string;
  sender: 'user' | 'support' | 'system';
  sender_id?: string;
  attachments?: string[];
  created_at: string;
}

export interface CreateTicketRequest {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
}

// ============================================================================
// REPORTS
// ============================================================================

export type ReportType = 'performance' | 'gains' | 'investissement' | 'mensuel' | 'annuel';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  type: ReportType;
  period: {
    start: string;
    end: string;
  };
  data: Record<string, unknown>;
  generated_at: string;
}

export interface ReportRequest {
  type: ReportType;
  format: ReportFormat;
  startDate: string;
  endDate: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'transaction' | 'subscription' | 'system' | 'promo';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

// ============================================================================
// ADMIN
// ============================================================================

export interface Admin {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalInvestments: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  monthlyRevenue: number;
  dailyRevenue: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  field?: string;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
  timestamp?: string;
}

// ============================================================================
// FORMS
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  bio: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';
export type SortField<T> = keyof T;

export interface SortConfig<T> {
  field: SortField<T>;
  direction: SortDirection;
}

export interface FilterConfig<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// ============================================================================
// CONSTANTS
// ============================================================================

export const TRANSACTION_TYPES: Record<TransactionType, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  profit: 'Gains',
  subscription: 'Souscription',
  bonus: 'Bonus',
  refund: 'Remboursement',
};

export const TRANSACTION_STATUSES: Record<TransactionStatus, string> = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
  cancelled: 'Annulé',
};

export const SUBSCRIPTION_STATUSES: Record<SubscriptionStatus, string> = {
  active: 'Actif',
  completed: 'Terminé',
  cancelled: 'Annulé',
  pending: 'En attente',
};
