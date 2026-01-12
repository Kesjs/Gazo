'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, ChartBarIcon, CurrencyDollarIcon, UserCircleIcon, Cog6ToothIcon, LifebuoyIcon, ArrowRightOnRectangleIcon, DocumentTextIcon, DocumentChartBarIcon, UserPlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Investissement', href: '/dashboard/investissement', icon: ChartBarIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CurrencyDollarIcon },
  { name: 'Rapport', href: '/dashboard/rapports', icon: DocumentChartBarIcon },
  { name: 'Document', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Parrainage', href: '/dashboard/parrainage', icon: UserPlusIcon },
];

const accountNavigation = [
  { name: 'Profil', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const helpNavigation = [
  { name: 'Support Client', href: '/dashboard/support', icon: LifebuoyIcon },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut || !onLogout) return;
    
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = async (href: string, itemName: string) => {
    if (pathname === href) return; // Already on this page

    // Set loading state first
    setNavigatingTo(href);

    // On mobile, close sidebar after showing loading feedback
    // On desktop, close immediately since there's no overlay
    if (isMobileOpen && onClose) {
      setTimeout(() => {
        onClose();
      }, 200); // Close after 200ms to show loading feedback
    }

    // Small delay to show the loading feedback
    setTimeout(() => {
      router.push(href);
    }, 80); // 80ms delay - plus rapide mais garde l'effet

    // Clear loading state after navigation starts
    setTimeout(() => {
      setNavigatingTo(null);
    }, 300);
  };

  const renderNavItems = (items: typeof mainNavigation, sectionName: string) => {
    return items.map((item, index) => {
      const isActive = pathname === item.href;
      const isNavigating = navigatingTo === item.href;

      return (
        <motion.div
          key={item.name}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <button
            onClick={() => handleNavigation(item.href, item.name)}
            disabled={isNavigating}
            className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-sm'
                : isNavigating
                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 shadow-sm animate-pulse'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-sm'
            }`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Naviguer vers ${item.name}`}
            role="menuitem"
          >
            <div className="relative mr-4 flex-shrink-0 h-5 w-5">
              {isNavigating ? (
                <motion.div
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                  aria-hidden="true"
                >
                  <ArrowPathIcon className="h-5 w-5 text-blue-500" />
                </motion.div>
              ) : (
                <item.icon
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className="font-medium">{item.name}</span>
            {isNavigating && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 20 }}
                className="ml-auto h-1 bg-blue-500 rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        </motion.div>
      );
    });
  };
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'block fixed inset-y-0 left-0 z-50 overflow-y-auto' : 'hidden md:block md:fixed md:inset-y-0 md:left-0 md:z-40'} 
        h-full
      `}>
        <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl md:shadow-none">
          <div className="flex flex-col h-full overflow-y-auto pb-20">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-6 pb-5 md:hidden">
              <Link href="/" className="flex items-center space-x-3" aria-label="Gazoduc Invest">
                <Image
                  src="/Gazoduc.png"
                  alt="Logo Gazoduc Invest"
                  width={28}
                  height={36}
                  className="w-7 h-9"
                  priority
                  unoptimized
                />
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Gazoduc Invest
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Fermer le menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center flex-shrink-0 px-6 py-6 pb-5">
              <Link href="/" className="flex items-center space-x-3" aria-label="Gazoduc Invest">
                <Image
                  src="/Gazoduc.png"
                  alt="Logo Gazoduc Invest"
                  width={28}
                  height={36}
                  className="w-7 h-9"
                  priority
                  unoptimized
                />
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Gazoduc Invest
                </span>
              </Link>
            </div>

            {/* Séparateur sous le titre */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

            {/* All Navigation Items Together */}
            <div className="px-4 pt-6 pb-6">
              <nav className="space-y-1" role="navigation">
                {/* Main Navigation */}
                {renderNavItems(mainNavigation, 'main')}
                
                {/* Account Navigation */}
                {renderNavItems(accountNavigation, 'account')}
                
                {/* Help Navigation */}
                {renderNavItems(helpNavigation, 'help')}
              </nav>
            </div>
          </div>

          {/* Logout Button - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isLoggingOut ? 'Déconnexion en cours' : 'Se déconnecter du tableau de bord'}
              role="menuitem"
            >
              {isLoggingOut ? (
                <>
                  <ArrowPathIcon className="mr-4 h-5 w-5 animate-spin" />
                  <span className="font-medium">Déconnexion...</span>
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="mr-4 h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}