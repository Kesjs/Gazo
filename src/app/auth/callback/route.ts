import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  try {
    if (code) {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Erreur lors de l\'échange du code:', error)
        // Rediriger vers la page de connexion avec un message d'erreur
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=email_verification_failed`)
      }

      console.log('Session créée avec succès:', data.session ? 'Oui' : 'Non')
      
      // Toujours rediriger vers la page de confirmation d'email
      return NextResponse.redirect(`${requestUrl.origin}/auth/email-verified`)
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?verified=true`)
  } catch (error) {
    console.error('Erreur inattendue dans le callback:', error)
    // Rediriger vers la page de connexion avec un message d'erreur
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`)
  }
}
