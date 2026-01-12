import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { earningsCronService } from '@/services/earningsCronService'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Vérifier l'authentification
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

  const { action } = await request.json()

  try {
    switch (action) {
      case 'start_cron':
        earningsCronService.start()
        return NextResponse.json({
          success: true,
          message: 'Service cron démarré',
          isActive: earningsCronService.isActive()
        })

      case 'stop_cron':
        earningsCronService.stop()
        return NextResponse.json({
          success: true,
          message: 'Service cron arrêté',
          isActive: earningsCronService.isActive()
        })

      case 'force_process':
        await earningsCronService.forceProcessEarnings()
        return NextResponse.json({
          success: true,
          message: 'Traitement forcé des gains exécuté'
        })

      case 'status':
        return NextResponse.json({
          success: true,
          cronActive: earningsCronService.isActive(),
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur API admin earnings:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
