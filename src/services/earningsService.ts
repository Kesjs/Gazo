// src/services/earningsService.ts
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { PaymentTransaction } from './tronPaymentMonitor'
import { NotificationService } from './notificationService'

export interface Subscription {
  id: number
  user_id: string
  plan_id: number
  amount: number
  static_balance: number
  dynamic_balance: number
  status: 'pending_activation' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date?: string
  payment_tx_hash?: string
  last_credit_date?: string
}

export interface Plan {
  id: number
  name: string
  description: string
  min_amount: number
  daily_profit: number
  duration_days: number
}

export class EarningsService {
  private supabase = createAdminSupabaseClient()
  private notificationService = new NotificationService()

  // Configuration des packs
  private PLANS: Plan[] = [
    {
      id: 1,
      name: 'Starter GNL',
      description: 'Plan de départ pour investir dans le GNL',
      min_amount: 100,
      daily_profit: 1.5,
      duration_days: 90
    },
    {
      id: 2,
      name: 'Premium GNL',
      description: 'Investissement équilibré avec meilleurs rendements',
      min_amount: 225,
      daily_profit: 2.0,
      duration_days: 120
    },
    {
      id: 3,
      name: 'Elite GNL',
      description: 'Investisseur avancé avec accès privilégié',
      min_amount: 999,
      daily_profit: 2.5,
      duration_days: 180
    },
    {
      id: 4,
      name: 'Élite GNL',
      description: 'Investisseur professionnel avec services premium',
      min_amount: 1999,
      daily_profit: 3.0,
      duration_days: 365
    }
  ]

  /**
   * Traite un paiement USDT détecté
   */
  async processPayment(payment: PaymentTransaction): Promise<boolean> {
    try {
      console.log(`💰 Traitement paiement: ${payment.amount}€ (${payment.hash})`)

      // Trouve l'utilisateur associé à ce paiement
      const userId = await this.findUserForPayment(payment.amount, payment.timestamp)
      if (!userId) {
        console.error('❌ Aucun utilisateur trouvé pour ce paiement')
        return false
      }

      // Trouve le plan correspondant au montant
      const plan = this.PLANS.find(p => p.min_amount === payment.amount)
      if (!plan) {
        console.error(`❌ Plan non trouvé pour ${payment.amount}€`)
        return false
      }

      // Vérifie si l'utilisateur a déjà une souscription active pour ce plan
      const { data: existingSub } = await this.supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_id', plan.id)
        .eq('status', 'active')
        .single()

      if (existingSub) {
        console.log('⚠️ Utilisateur a déjà ce plan actif')
        return false
      }

      // Calcule les dates
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + plan.duration_days)

      // Crée la souscription
      const subscription: Partial<Subscription> = {
        user_id: userId,
        plan_id: plan.id,
        amount: payment.amount,
        static_balance: payment.amount,
        dynamic_balance: 0,
        status: 'active', // ✅ Activation immédiate après paiement
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_tx_hash: payment.hash
      }

      // Enregistre en base
      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single()

      if (error) {
        console.error('Erreur création souscription:', error)
        return false
      }

      // Crée une transaction de dépôt
      await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'subscription',
          amount: payment.amount,
          description: `Souscription ${plan.name} - ${payment.hash}`,
          created_at: new Date().toISOString()
        })

      console.log(`✅ Souscription créée: ${plan.name} pour ${userId}`)

      // ✅ Notification : Souscription créée
      await this.notificationService.notifySubscriptionCreated(
        userId,
        plan.name,
        payment.amount,
        data.id.toString()
      )

      // Marque la session de paiement comme complétée
      await this.supabase
        .from('payment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('amount', payment.amount)
        .eq('status', 'active')

      console.log(`✅ Souscription créée: ${plan.name} pour ${userId}`)
      return true

    } catch (error) {
      console.error('Erreur traitement paiement:', error)
      return false
    }
  }

  /**
   * Trouve l'utilisateur associé à un paiement
   */
  private async findUserForPayment(amount: number, timestamp: number): Promise<string | null> {
    try {
      // Recherche les sessions de paiement actives pour ce montant
      // dans les 30 minutes autour du timestamp du paiement
      const paymentTime = new Date(timestamp * 1000)
      const windowStart = new Date(paymentTime.getTime() - 30 * 60 * 1000) // 30 min avant
      const windowEnd = new Date(paymentTime.getTime() + 30 * 60 * 1000)   // 30 min après

      const { data: sessions } = await this.supabase
        .from('payment_sessions')
        .select('user_id, plan_id, created_at')
        .eq('amount', amount)
        .eq('status', 'active')
        .gte('created_at', windowStart.toISOString())
        .lte('created_at', windowEnd.toISOString())
        .order('created_at', { ascending: false })

      if (!sessions || sessions.length === 0) {
        return null
      }

      // Prend la session la plus récente dans la fenêtre
      return sessions[0].user_id

    } catch (error) {
      console.error('Erreur recherche utilisateur:', error)
      return null
    }
  }

  /**
   * Active les souscriptions en attente après vérification des paiements
   * Maintenant plus intelligent : vérifie si le paiement a été confirmé
   */
  async activatePendingSubscriptions(): Promise<void> {
    try {
      console.log('⏰ Vérification des souscriptions en attente d\'activation...')

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Récupère les souscriptions en attente depuis plus de 24h
      const { data: pendingSubs, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'pending_activation')
        .lt('start_date', yesterday.toISOString())

      if (error) {
        console.error('Erreur récupération souscriptions en attente:', error)
        return
      }

      console.log(`📋 ${pendingSubs?.length || 0} souscription(s) en attente trouvée(s)`)

      for (const sub of pendingSubs || []) {
        try {
          // Vérifier si le paiement a été confirmé via les transactions
          const { data: paymentTx } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('user_id', sub.user_id)
            .eq('amount', sub.amount)
            .eq('type', 'subscription')
            .gte('created_at', sub.start_date)
            .single()

          if (!paymentTx) {
            console.log(`⚠️ Souscription ${sub.id}: paiement non trouvé, maintien en attente`)
            continue
          }

          // Activer la souscription
          const { error: updateError } = await this.supabase
            .from('subscriptions')
            .update({
              status: 'active',
              last_credit_date: new Date().toISOString()
            })
            .eq('id', sub.id)

          if (updateError) {
            console.error(`Erreur activation souscription ${sub.id}:`, updateError)
            continue
          }

          // ✅ Notification : Pack activé
          const plan = this.PLANS.find(p => p.id === sub.plan_id)
          if (plan) {
            await this.notificationService.notifySubscriptionActivated(
              sub.user_id,
              plan.name,
              sub.id.toString()
            )
          }

          console.log(`✅ Souscription ${sub.id} activée automatiquement (${sub.amount}€ - ${plan?.name})`)
        } catch (subError) {
          console.error(`Erreur traitement souscription ${sub.id}:`, subError)
        }
      }

    } catch (error) {
      console.error('Erreur activation souscriptions:', error)
    }
  }

  /**
   * Applique les crédits journaliers aux souscriptions actives
   */
  async processDailyCredits(): Promise<void> {
    try {
      console.log('💰 Début du calcul des crédits journaliers...')

      // Récupère toutes les souscriptions actives
      const { data: activeSubs, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')

      if (error) {
        console.error('Erreur récupération souscriptions actives:', error)
        return
      }

      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      let processedCount = 0
      let totalCredited = 0

      console.log(`📊 ${activeSubs?.length || 0} souscription(s) active(s) trouvée(s)`)

      for (const sub of activeSubs || []) {
        try {
          // Vérifie si crédit déjà appliqué aujourd'hui
          const { data: existingCredit } = await this.supabase
            .from('investment_credits')
            .select('id')
            .eq('subscription_id', sub.id)
            .gte('credit_date', today)
            .single()

          if (existingCredit) {
            console.log(`⏭️ Souscription ${sub.id}: déjà crédité aujourd'hui`)
            continue // Déjà crédité aujourd'hui
          }

          // ✅ Vérification temporelle : Les gains commencent 24h après activation
          const activationDate = new Date(sub.start_date)
          const hoursSinceActivation = (Date.now() - activationDate.getTime()) / (1000 * 60 * 60)

          if (hoursSinceActivation < 24) {
            console.log(`⏳ Souscription ${sub.id}: activée depuis ${hoursSinceActivation.toFixed(1)}h - Gains commencent dans ${Math.max(0, 24 - hoursSinceActivation).toFixed(1)}h`)
            continue // Pas encore 24h écoulées
          }

          const plan = this.PLANS.find(p => p.id === sub.plan_id)
          if (!plan) {
            console.error(`❌ Plan non trouvé pour souscription ${sub.id} (plan_id: ${sub.plan_id})`)
            continue
          }

          // Calcule le crédit journalier
          const dailyCredit = (sub.static_balance * plan.daily_profit) / 100

          // Met à jour le solde dynamique
          const newDynamicBalance = sub.dynamic_balance + dailyCredit

          // Met à jour la souscription
          const { error: updateError } = await this.supabase
            .from('subscriptions')
            .update({
              dynamic_balance: newDynamicBalance,
              last_credit_date: new Date().toISOString()
            })
            .eq('id', sub.id)

          if (updateError) {
            console.error(`Erreur mise à jour souscription ${sub.id}:`, updateError)
            continue
          }

          // Enregistre le crédit dans l'historique
          const { error: creditError } = await this.supabase
            .from('investment_credits')
            .insert({
              subscription_id: sub.id,
              user_id: sub.user_id,
              amount: dailyCredit,
              credit_date: new Date().toISOString(),
              credit_type: 'daily'
            })

          if (creditError) {
            console.error(`Erreur enregistrement crédit ${sub.id}:`, creditError)
            continue
          }

          // Crée une transaction de gains
          const { error: transactionError } = await this.supabase
            .from('transactions')
            .insert({
              user_id: sub.user_id,
              type: 'earnings',
              amount: dailyCredit,
              description: `Crédits journaliers ${plan.name}`,
              created_at: new Date().toISOString()
            })

          if (transactionError) {
            console.error(`Erreur création transaction pour ${sub.id}:`, transactionError)
            continue
          }

          // ✅ Notification : Crédits journaliers
          await this.notificationService.notifyDailyCredits(
            sub.user_id,
            plan.name,
            dailyCredit,
            newDynamicBalance,
            sub.id.toString()
          )

          processedCount++
          totalCredited += dailyCredit

          console.log(`📈 Crédit ${dailyCredit.toFixed(2)}€ ajouté à souscription ${sub.id} (${plan.name}) - Nouveau solde: ${newDynamicBalance.toFixed(2)}€`)

        } catch (subError) {
          console.error(`Erreur traitement souscription ${sub.id}:`, subError)
        }
      }

      console.log(`✅ Crédits journaliers terminés: ${processedCount} souscription(s) traitée(s), ${totalCredited.toFixed(2)}€ crédité(s) au total`)

    } catch (error) {
      console.error('Erreur crédits journaliers:', error)
    }
  }

  /**
   * Vérifie si un utilisateur peut retirer ses gains
   */
  async canWithdraw(subscriptionId: number): Promise<boolean> {
    try {
      const { data: sub, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

      if (error || !sub) {
        return false
      }

      const plan = this.PLANS.find(p => p.id === sub.plan_id)
      if (!plan) return false

      // Seuil de retrait : 25% du montant investi, arrondi en arrière
      const minWithdraw = Math.floor(sub.static_balance * 0.25)

      return sub.status === 'active' && sub.dynamic_balance >= minWithdraw

    } catch (error) {
      console.error('Erreur vérification retrait:', error)
      return false
    }
  }

  /**
   * Traite un retrait d'utilisateur
   */
  async processWithdrawal(subscriptionId: number, amount: number): Promise<boolean> {
    try {
      const { data: sub, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

      if (error || !sub) {
        return false
      }

      // Vérifie que l'utilisateur peut retirer
      if (!await this.canWithdraw(subscriptionId) || sub.dynamic_balance < amount) {
        return false
      }

      // Met à jour le solde dynamique
      const newDynamicBalance = sub.dynamic_balance - amount

      await this.supabase
        .from('subscriptions')
        .update({ dynamic_balance: newDynamicBalance })
        .eq('id', subscriptionId)

      // Crée une transaction de retrait
      await this.supabase
        .from('transactions')
        .insert({
          user_id: sub.user_id,
          type: 'withdrawal',
          amount: -amount,
          description: `Retrait de gains`,
          created_at: new Date().toISOString()
        })

      console.log(`💸 Retrait de ${amount}€ traité pour souscription ${subscriptionId}`)
      return true

    } catch (error) {
      console.error('Erreur traitement retrait:', error)
      return false
    }
  }
}
