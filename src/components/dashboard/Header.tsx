'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';

interface HeaderProps {
  onMobileMenuClick?: () => void;
  onLogout?: () => void;
  pageTitle?: string;
}

export function Header({ onMobileMenuClick, onLogout, pageTitle }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur'

    // Try to get display name from user metadata first
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }

    // Fallback to email username part
    if (user.email) {
      return user.email.split('@')[0]
    }

    return 'Utilisateur'
  }

  // Fermer les menus lors des clics à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };

    if (isProfileOpen || isThemeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isThemeOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  };

  const setThemeDirect = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-blue-400" />;
      case 'system':
        return (
          <div className="relative">
            <Monitor className="w-5 h-5 text-purple-400" />
            <Sun className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
          </div>
        );
      default:
        return <Monitor className="w-5 h-5 text-gray-400" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Clair';
      case 'dark':
        return 'Sombre';
      case 'system':
        return 'Système';
      default:
        return 'Thème';
    }
  };

  const getThemeTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Passer en mode sombre';
      case 'dark':
        return 'Suivre les préférences système';
      case 'system':
        return 'Passer en mode clair';
      default:
        return 'Changer de thème';
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || !onLogout) return;
    
    setIsLoggingOut(true);
    setIsProfileOpen(false); // Close the menu
    
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800 border-b border-red-200 dark:border-red-700">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center">
          {/* <Link href="/" className="flex items-center mr-4" aria-label="Gazoduc Invest">
            <Image
              src="/Gazoduc.png"
              alt="Logo Gazoduc Invest"
              width={32}
              height={40}
              className="w-8 h-10 mr-3"
              priority
              unoptimized
            />
            <span className="text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Gazoduc Invest
            </span>
          </Link> */}
          <h2 className="text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            {pageTitle || 'Tableau de bord'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200"
            onClick={onMobileMenuClick}
            title="Ouvrir le menu"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Theme Dropdown */}
          <div className="relative ml-4" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className={`relative p-2 rounded-lg transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-yellow-100/20 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/30 dark:hover:bg-yellow-900/50'
                  : theme === 'dark'
                  ? 'bg-blue-100/20 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/30 dark:hover:bg-blue-900/50'
                  : 'bg-purple-100/20 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100/30 dark:hover:bg-purple-900/50'
              } hover:scale-110 active:scale-95 shadow-sm`}
              title={getThemeTooltip()}
            >
              <div className="flex items-center space-x-2">
                <div className="transition-transform duration-200 hover:rotate-12">
                  {getThemeIcon()}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {getThemeLabel()}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Animated background glow */}
              <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                theme === 'light'
                  ? 'bg-yellow-400/20 shadow-yellow-500/20'
                  : theme === 'dark'
                  ? 'bg-blue-400/20 shadow-blue-500/20'
                  : 'bg-purple-400/20 shadow-purple-500/20'
              } opacity-0 hover:opacity-100 shadow-lg -z-10`} />
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50">
                <button
                  onClick={() => setThemeDirect('light')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Mode Clair</div>
                    <div className="text-xs opacity-70">Thème lumineux</div>
                  </div>
                  {theme === 'light' && (
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setThemeDirect('dark')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Mode Sombre</div>
                    <div className="text-xs opacity-70">Thème sombre</div>
                  </div>
                  {theme === 'dark' && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setThemeDirect('system')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-200 ${
                    theme === 'system'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    <Sun className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <div className="font-medium">Mode Système</div>
                    <div className="text-xs opacity-70">Suit vos préférences</div>
                  </div>
                  {theme === 'system' && (
                    <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Panel */}
          <div className="ml-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <NotificationsPanel userId={user?.id || ''} />
          </div>
          <div className="relative ml-3" ref={profileMenuRef}>
            <div>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                id="user-menu"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="Ouvrir le menu utilisateur"
              >
                <span className="sr-only">Ouvrir le menu utilisateur</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-medium shadow-sm hover:shadow-md transition-shadow">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            
            {isProfileOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-2 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10" role="menu">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Votre profil</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Paramètres</span>
                    </div>
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                      </svg>
                      <span>Support</span>
                    </div>
                  </Link>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                    role="menuitem"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="w-4 h-4 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Déconnexion...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
