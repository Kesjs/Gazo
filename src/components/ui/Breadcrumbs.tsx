'use client'

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts';
import { useBalance } from '@/hooks/useDashboardData';

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: userBalance = 0, isLoading: balanceLoading } = useBalance(user?.id)

  // Fonction pour générer les breadcrumbs selon la route
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Toujours commencer par l'accueil
    breadcrumbs.push({
      label: 'Tableau de bord',
      href: '/dashboard',
      current: segments.length === 1
    })

    if (segments.length > 1) {
      const subRoute = segments[1]

      switch (subRoute) {
        case 'investissement':
          breadcrumbs.push({
            label: 'Investissement',
            href: '/dashboard/investissement',
            current: segments.length === 2
          })
          break
        case 'packs':
          breadcrumbs.push({
            label: 'Packs',
            href: '/dashboard/packs',
            current: segments.length === 2
          })
          break
        case 'transactions':
          breadcrumbs.push({
            label: 'Transactions',
            href: '/dashboard/transactions',
            current: segments.length === 2
          })
          break
        case 'profile':
          breadcrumbs.push({
            label: 'Profil',
            href: '/dashboard/profile',
            current: segments.length === 2
          })
          break
        case 'settings':
          breadcrumbs.push({
            label: 'Paramètres',
            href: '/dashboard/settings',
            current: segments.length === 2
          })
          break
        case 'support':
          breadcrumbs.push({
            label: 'Support',
            href: '/dashboard/support',
            current: segments.length === 2
          })
          break
        case 'rapports':
          breadcrumbs.push({
            label: 'Rapports',
            href: '/dashboard/rapports',
            current: segments.length === 2
          })
          break
        case 'documents':
          breadcrumbs.push({
            label: 'Documents',
            href: '/dashboard/documents',
            current: segments.length === 2
          })
          break
        case 'parrainage':
          breadcrumbs.push({
            label: 'Parrainage',
            href: '/dashboard/parrainage',
            current: segments.length === 2
          })
          break
        default:
          breadcrumbs.push({
            label: subRoute.charAt(0).toUpperCase() + subRoute.slice(1),
            href: `/dashboard/${subRoute}`,
            current: true
          })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Ne pas afficher si on est sur la page d'accueil du dashboard
  if (pathname === '/dashboard') {
    return null
  }

  return (
    <nav aria-label="Fil d'Ariane" className="flex justify-between items-center mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="Retour au tableau de bord"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Accueil</span>
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => (
          <motion.li
            key={crumb.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" aria-hidden="true" />

            {crumb.current ? (
              <span
                className="text-gray-900 dark:text-white font-medium"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                {crumb.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>

      {/* Affichage du solde */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Solde</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {balanceLoading ? '...' : `${userBalance.toFixed(2)}€`}
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}
