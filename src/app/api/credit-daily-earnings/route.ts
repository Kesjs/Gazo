import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Cette API devrait être appelée par un cron job ou un système automatisé
  // Pour l'instant, elle peut être appelée manuellement pour les tests

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Vérifier si l'utilisateur est admin
  const { data: adminCheck } = await supabase
    .from('admins')
    .select('id')
    .eq('email', user.email)
    .single()

  if (!adminCheck) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    // Récupérer toutes les souscriptions actives
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString()) // Seulement celles qui ont commencé

    if (subError) {
      console.error('Erreur récupération souscriptions:', subError)
      return NextResponse.json({ error: 'Erreur lors de la récupération des souscriptions' }, { status: 500 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let processedCount = 0
    const results = []

    for (const subscription of subscriptions || []) {
      const plan = subscription.plans
      if (!plan) continue

      // Calculer le nombre de jours écoulés depuis l'activation
      const startDate = new Date(subscription.start_date)
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceStart < 2) continue // Les gains commencent au jour 2 (24h après activation)

      // Calculer le nombre de jours avec gains (jour 2 = 1 jour de gains, jour 3 = 2 jours de gains, etc.)
      const earningDays = daysSinceStart - 1 // Soustraire le jour 1 sans gains

      // Calculer le gain total cumulé : daily_profit * nombre de jours avec gains
      const expectedGain = (plan.daily_profit / 100) * subscription.amount * earningDays

      // Vérifier si ce gain a déjà été crédité
      const currentDynamicBalance = subscription.dynamic_balance || 0

      if (currentDynamicBalance >= expectedGain) {
        continue // Déjà crédité
      }

      // Le gain d'aujourd'hui
      const todayGain = (plan.daily_profit / 100) * subscription.amount

      // Nouveau solde dynamique
      const newDynamicBalance = currentDynamicBalance + todayGain

      // Mettre à jour la souscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          dynamic_balance: newDynamicBalance
        })
        .eq('id', subscription.id)

      if (updateError) {
        console.error(`Erreur mise à jour souscription ${subscription.id}:`, updateError)
        continue
      }

      // Créer une transaction pour les gains
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: subscription.user_id,
          type: 'earnings',
          amount: todayGain,
          description: `Gains quotidiens ${plan.name} - Jour ${daysSinceStart} (${earningDays} jour(s) de gains)`
        })

      if (transactionError) {
        console.error(`Erreur création transaction pour ${subscription.id}:`, transactionError)
        continue
      }

      processedCount++
      results.push({
        subscriptionId: subscription.id,
        userId: subscription.user_id,
        planName: plan.name,
        day: daysSinceStart,
        gainCredited: todayGain,
        newBalance: newDynamicBalance
      })
    }

    return NextResponse.json({
      success: true,
      message: `Gains quotidiens crédités pour ${processedCount} souscriptions`,
      results
    })

  } catch (error) {
    console.error('Erreur API credit-daily-earnings:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
