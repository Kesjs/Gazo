import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from 'sonner'
import { FloatingScrollToTop } from '@/components/ui/FloatingScrollToTop'
import './globals.css'
import '@/styles/onboarding.css'
import { earningsCronService } from '@/services/earningsCronService'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gazoduc Invest - Investissement GNL',
  description: 'Plateforme d\'investissement dans le Gaz Naturel Liquéfié avec des rendements sécurisés et transparents.',
  icons: {
    icon: '/Gazoduc.png',
    shortcut: '/Gazoduc.png',
    apple: '/Gazoduc.png',
  },
}

// Démarrer le service cron automatique au démarrage de l'application
if (typeof window === 'undefined') { // Côté serveur uniquement
  try {
    earningsCronService.start()
    console.log('🚀 Service cron des gains démarré automatiquement')
  } catch (error) {
    console.error('❌ Erreur démarrage service cron:', error)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <FloatingScrollToTop />
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={5000}
              />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
