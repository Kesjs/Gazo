// src/app/api/payments/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    // Use server client to get user from cookies
    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    // Récupère l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupère les détails du plan
    const { data: plan, error: planError } = await adminSupabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan non trouvé' },
        { status: 404 }
      )
    }

    // Génère un ID de session unique
    const sessionId = `${user.id}_${planId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Adresse de paiement fixe
    const paymentAddress = '0x63eF5b765D8d408274172804D31fB0a2Ea5416c0'

    // Durée d'expiration : 2 heures
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000)

    // Crée la session de paiement
    const { error: sessionError } = await adminSupabase
      .from('payment_sessions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        plan_id: planId,
        payment_address: paymentAddress,
        amount: plan.min_amount,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })

    if (sessionError) {
      console.error('Erreur création session:', sessionError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      paymentAddress,
      amount: plan.min_amount,
      planName: plan.name,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Erreur API session de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
