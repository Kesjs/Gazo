import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { EarningsService } from '@/services/earningsService'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Vérifier que c'est appelé par un admin ou un système automatisé
  // Pour la sécurité, on peut utiliser une clé API secrète
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.CRON_SECRET_KEY

  if (!authHeader || !expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('⏰ Démarrage activation automatique des packs...')

    const earningsService = new EarningsService()

    // Activer les packs en attente depuis plus de 24h
    await earningsService.activatePendingSubscriptions()

    // Créditer les gains journaliers pour les packs actifs
    await earningsService.processDailyCredits()

    console.log('✅ Activation automatique et crédits journaliers terminés')

    return NextResponse.json({
      success: true,
      message: 'Activation automatique des packs et crédits journaliers traités avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur activation automatique:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
