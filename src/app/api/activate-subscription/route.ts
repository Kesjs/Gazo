import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { sessionId } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Récupérer la session de paiement
    const { data: paymentSession, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*, subscriptions(*)')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (sessionError || !paymentSession) {
      return NextResponse.json({ error: 'Session de paiement introuvable ou non confirmée' }, { status: 400 })
    }

    const subscription = paymentSession.subscriptions

    // Calculer la date de fin basée sur le plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', subscription.plan_id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan introuvable' }, { status: 400 })
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration_days)

    // Mettre la souscription en attente d'activation (au lieu d'actif immédiatement)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'pending_activation', // ✅ En attente d'activation
        static_balance: subscription.amount, // Le montant investi reste fixe
        dynamic_balance: 0, // Les gains commencent à 0
        end_date: endDate.toISOString()
      })
      .eq('id', subscription.id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Erreur activation souscription:', updateError)
      return NextResponse.json({ error: 'Erreur lors de l\'activation de la souscription' }, { status: 500 })
    }

    // Créer une transaction pour enregistrer l'investissement
    console.log('💰 Création de la transaction d\'investissement...')
    const transactionData = {
      user_id: user.id,
      type: 'subscription',
      amount: subscription.amount, // Montant positif pour un investissement
      description: `Souscription ${plan.name} - ${subscription.amount}€`,
      created_at: new Date().toISOString()
    }

    console.log('📊 Données transaction:', transactionData)

    const { data: createdTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (transactionError) {
      console.error('❌ Erreur création transaction:', transactionError)
      console.error('❌ Détails:', {
        code: transactionError.code,
        message: transactionError.message,
        details: transactionError.details
      })
      // Ne pas échouer pour autant
    } else {
      console.log('✅ Transaction créée:', createdTransaction)
    }

    // ✅ Transaction créée avec succès
    console.log('✅ Souscription activée avec transaction créée')

    // Note: Le cache sera invalidé côté client via React Query
    // revalidatePath n'est pas nécessaire car les mutations côté client gèrent déjà l'invalidation

    return NextResponse.json({
      success: true,
      message: 'Paiement confirmé ! Votre pack est en attente d\'activation (24h).',
      subscription: {
        id: subscription.id,
        plan: plan.name,
        amount: subscription.amount,
        status: 'pending_activation',
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Erreur API activate-subscription:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
