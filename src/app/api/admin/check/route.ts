import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  // Vérifier si l'utilisateur est dans la table admins
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id')
    .eq('email', user.email)
    .single()

  if (adminError || !adminData) {
    return NextResponse.json({
      isAdmin: false,
      message: 'Accès refusé. Vous n\'êtes pas autorisé à accéder à cette section.'
    }, { status: 403 })
  }

  return NextResponse.json({ isAdmin: true })
}
