/**
 * Export centralisé de tous les services
 */

export * from './base.service';
export * from './transaction.service';
export * from './subscription.service';
// export * from './dashboard.service';

// Instances singleton
export { transactionService } from './transaction.service';
export { subscriptionService } from './subscription.service';
// export { dashboardService } from './dashboard.service';
