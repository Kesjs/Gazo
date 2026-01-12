import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    console.log('🔍 Debug: Checking user transactions for:', user.id)

    // Récupérer toutes les transactions de l'utilisateur
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching transactions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('📊 Found transactions:', transactions?.length || 0)

    // Récupérer aussi les sessions de paiement
    const { data: paymentSessions, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Récupérer les souscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      userId: user.id,
      debug: {
        timestamp: new Date().toISOString(),
        transactions: {
          count: transactions?.length || 0,
          data: transactions || []
        },
        paymentSessions: {
          count: paymentSessions?.length || 0,
          data: paymentSessions || []
        },
        subscriptions: {
          count: subscriptions?.length || 0,
          data: subscriptions || []
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in debug-transactions:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
