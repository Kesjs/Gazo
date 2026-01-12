// src/app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Tester la connexion à Supabase
    const { data, error } = await supabase
      .from('plans')
      .select('id, name')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'API is working',
      user: { id: user.id, email: user.email },
      plans: data
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
