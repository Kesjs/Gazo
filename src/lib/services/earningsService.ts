// src/lib/services/earningsService.ts

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  last_profit_date?: string;
}

interface Plan {
  id: string;
  name: string;
  daily_profit: number;
  duration_days: number;
}

interface EarningsResult {
  user_id: string;
  amount: number;
  description: string;
  subscription_id: string;
}

// Mock data - à remplacer par les vraies données Supabase
const mockPlans: Plan[] = [
  { id: 'starter', name: 'Starter Pack', daily_profit: 1.5, duration_days: 90 },
  { id: 'premium', name: 'Premium Pack', daily_profit: 2.0, duration_days: 120 },
  { id: 'elite', name: 'Elite Pack', daily_profit: 2.5, duration_days: 180 },
];

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    user_id: 'user-1',
    plan_id: 'starter',
    amount: 5000,
    start_date: '2023-11-01',
    end_date: '2024-01-29',
    status: 'active',
    last_profit_date: '2023-11-14'
  },
  {
    id: 'sub-2',
    user_id: 'user-2',
    plan_id: 'premium',
    amount: 10000,
    start_date: '2023-10-15',
    end_date: '2024-01-15',
    status: 'active',
    last_profit_date: '2023-11-14'
  }
];

/**
 * Calcule les gains journaliers pour tous les abonnements actifs
 * Cette fonction devrait être appelée quotidiennement (cron job)
 */
export async function calculateDailyEarnings(): Promise<EarningsResult[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Début de journée

  const earnings: EarningsResult[] = [];

  try {
    // Récupérer tous les abonnements actifs (dans un vrai système, ce serait un appel à Supabase)
    const activeSubscriptions = mockSubscriptions.filter(sub => {
      const endDate = new Date(sub.end_date);
      const startDate = new Date(sub.start_date);
      return sub.status === 'active' &&
             startDate <= today &&
             endDate >= today;
    });

    for (const subscription of activeSubscriptions) {
      // Vérifier si les gains ont déjà été calculés aujourd'hui
      const lastProfitDate = subscription.last_profit_date ? new Date(subscription.last_profit_date) : null;
      const isTodayCalculated = lastProfitDate &&
                               lastProfitDate.toDateString() === today.toDateString();

      if (isTodayCalculated) {
        console.log(`Gains déjà calculés pour l'abonnement ${subscription.id}`);
        continue;
      }

      // Récupérer les détails du plan
      const plan = mockPlans.find(p => p.id === subscription.plan_id);
      if (!plan) {
        console.error(`Plan non trouvé pour l'abonnement ${subscription.id}`);
        continue;
      }

      // Calculer le gain quotidien
      const dailyEarning = (subscription.amount * plan.daily_profit) / 100;

      // Créer l'entrée de gain
      const earning: EarningsResult = {
        user_id: subscription.user_id,
        amount: dailyEarning,
        description: `Gains quotidiens - ${plan.name}`,
        subscription_id: subscription.id
      };

      earnings.push(earning);

      // Mettre à jour la date du dernier gain (dans un vrai système, update Supabase)
      subscription.last_profit_date = today.toISOString();

      console.log(`Gain calculé pour ${subscription.user_id}: +${dailyEarning}€ (${plan.name})`);
    }

    console.log(`Calcul des gains terminé. ${earnings.length} gains générés.`);
    return earnings;

  } catch (error) {
    console.error('Erreur lors du calcul des gains:', error);
    throw error;
  }
}

/**
 * Applique les gains calculés (met à jour les soldes et crée les transactions)
 */
export async function applyEarnings(earnings: EarningsResult[]): Promise<void> {
  try {
    for (const earning of earnings) {
      // 1. Mettre à jour le solde de l'utilisateur (via Supabase RPC)
      // await supabase.rpc('increment_balance', {
      //   user_id: earning.user_id,
      //   amount: earning.amount
      // });

      // 2. Créer la transaction
      // await supabase.from('transactions').insert([{
      //   user_id: earning.user_id,
      //   amount: earning.amount,
      //   type: 'profit',
      //   description: earning.description,
      //   reference_id: earning.subscription_id
      // }]);

      console.log(`Gain appliqué pour ${earning.user_id}: +${earning.amount}€`);
    }

    console.log(`${earnings.length} gains appliqués avec succès.`);

  } catch (error) {
    console.error('Erreur lors de l\'application des gains:', error);
    throw error;
  }
}

/**
 * Fonction principale pour exécuter le calcul quotidien des gains
 * À appeler via un cron job ou une tâche planifiée
 */
export async function runDailyEarningsProcess(): Promise<void> {
  try {
    console.log('Démarrage du processus de calcul des gains journaliers...');

    const earnings = await calculateDailyEarnings();

    if (earnings.length > 0) {
      await applyEarnings(earnings);
      console.log('Processus de calcul des gains terminé avec succès.');
    } else {
      console.log('Aucun gain à calculer aujourd\'hui.');
    }

  } catch (error) {
    console.error('Erreur dans le processus de calcul des gains:', error);
    throw error;
  }
}

/**
 * Calcule les gains estimés pour un abonnement
 */
export function calculateEstimatedEarnings(
  principal: number,
  dailyRate: number,
  days: number
): number {
  return (principal * dailyRate * days) / 100;
}

/**
 * Calcule le ROI (Return on Investment) d'un abonnement
 */
export function calculateROI(principal: number, totalEarnings: number): number {
  return (totalEarnings / principal) * 100;
}

/**
 * Calcule les jours restants pour un abonnement
 */
export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Vérifie si un abonnement est toujours actif
 */
export function isSubscriptionActive(
  startDate: string,
  endDate: string,
  status: string
): boolean {
  if (status !== 'active') return false;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return start <= today && end >= today;
}
