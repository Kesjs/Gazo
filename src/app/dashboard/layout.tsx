'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // Aucune session, rediriger vers la page de connexion
        router.push('/auth/signin');
        return;
      }

      // Vérifier si l'utilisateur a des abonnements actifs
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('id, status, end_date')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString()); // Non expiré (strictement supérieur à maintenant)

      if (subError) {
        console.error('Erreur de vérification des abonnements:', subError);
        // En cas d'erreur, on autorise l'accès pour ne pas bloquer les utilisateurs
        setIsAuthenticating(false);
        return;
      }

      // ✅ CORRECTION : Permettre l'accès au dashboard même sans souscription
      // Les utilisateurs peuvent explorer le dashboard avant d'investir
      
      // L'utilisateur est authentifié et peut accéder à n'importe quelle page du tableau de bord
      setIsAuthenticating(false);
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      router.push('/auth/signin');
    }
  }, [router, supabase]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        toast.error('Erreur de déconnexion', {
          description: 'Impossible de vous déconnecter. Veuillez réessayer.'
        });
        return;
      }
      
      // Déconnexion réussie
      toast.success('Déconnexion réussie', {
        description: 'À bientôt !'
      });
      router.push('/');
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      toast.error('Erreur de déconnexion', {
        description: 'Une erreur inattendue est survenue.'
      });
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Function to get page title based on current route
  const getPageTitle = (path: string) => {
    const routeTitles: Record<string, string> = {
      '/dashboard': 'Tableau de bord',
      '/dashboard/investissement': 'Investissement',
      '/dashboard/transactions': 'Transactions',
      '/dashboard/rapports': 'Rapports',
      '/dashboard/documents': 'Documents',
      '/dashboard/parrainage': 'Parrainage',
      '/dashboard/profile': 'Profil',
      '/dashboard/settings': 'Paramètres',
      '/dashboard/support': 'Support',
    };

    return routeTitles[path] || 'Tableau de bord';
  };

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3 // Reduced from 0.8 to 0.3 seconds for faster transitions
  };

  // Show loading while checking authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l&apos;accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
        onLogout={handleLogout}
      />
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <Header onMobileMenuClick={toggleMobileSidebar} onLogout={handleLogout} pageTitle={getPageTitle(pathname)} />
        <NavigationLoader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 px-4 py-6 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
