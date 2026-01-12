// src/app/api/payments/session/[sessionId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    const supabase = createAdminSupabaseClient()

    // Récupérer la session de paiement
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session de paiement introuvable' },
        { status: 404 }
      )
    }

    // Vérifier si la session a expiré
    const expiresAt = new Date(session.expires_at)
    const now = new Date()

    if (now > expiresAt && session.status !== 'completed') {
      // Marquer comme expirée
      await supabase
        .from('payment_sessions')
        .update({ status: 'expired' })
        .eq('session_id', sessionId)

      return NextResponse.json({
        status: 'expired',
        session
      })
    }

    // Retourner le statut actuel
    return NextResponse.json({
      status: session.status,
      session
    })

  } catch (error) {
    console.error('Erreur vérification statut session:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
