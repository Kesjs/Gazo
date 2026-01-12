/**
 * Composant Pagination réutilisable et accessible
 * Supporte différents styles et configurations
 */

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showInfo?: boolean;
  showFirstLast?: boolean;
  maxButtons?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true,
  showFirstLast = true,
  maxButtons = 5,
  size = 'md',
  className,
}: PaginationProps) {
  // Calculer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxButtons) {
      // Afficher toutes les pages si peu de pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher un sous-ensemble avec ellipses
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const showLeftEllipsis = leftSiblingIndex > 2;
      const showRightEllipsis = rightSiblingIndex < totalPages - 1;
      
      if (!showLeftEllipsis && showRightEllipsis) {
        // Début : 1 2 3 4 5 ... 10
        for (let i = 1; i <= Math.min(maxButtons, totalPages); i++) {
          pages.push(i);
        }
        if (showRightEllipsis) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (showLeftEllipsis && !showRightEllipsis) {
        // Fin : 1 ... 6 7 8 9 10
        pages.push(1);
        pages.push('...');
        for (let i = Math.max(totalPages - maxButtons + 1, 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu : 1 ... 4 5 6 ... 10
        pages.push(1);
        if (showLeftEllipsis) pages.push('...');
        
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        
        if (showRightEllipsis) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculer les informations d'affichage
  const startItem = itemsPerPage && totalItems 
    ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
    : null;
  const endItem = itemsPerPage && totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  // Classes de taille
  const sizeClasses = {
    sm: 'h-8 min-w-8 text-sm',
    md: 'h-10 min-w-10 text-base',
    lg: 'h-12 min-w-12 text-lg',
  };

  const buttonClass = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size]
  );

  const activeButtonClass = cn(
    buttonClass,
    'bg-blue-600 text-white hover:bg-blue-700',
    'dark:bg-blue-500 dark:hover:bg-blue-600'
  );

  const inactiveButtonClass = cn(
    buttonClass,
    'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
    'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
  );

  const navButtonClass = cn(
    buttonClass,
    'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
    'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
  );

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Informations */}
      {showInfo && startItem && endItem && totalItems && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Affichage de <span className="font-semibold">{startItem}</span> à{' '}
          <span className="font-semibold">{endItem}</span> sur{' '}
          <span className="font-semibold">{totalItems}</span> résultats
        </div>
      )}

      {/* Pagination */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Bouton Première page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={navButtonClass}
            aria-label="Première page"
          >
            <span className="sr-only">Première page</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButtonClass}
          aria-label="Page précédente"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Numéros de page */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={isActive ? activeButtonClass : inactiveButtonClass}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButtonClass}
          aria-label="Page suivante"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Bouton Dernière page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={navButtonClass}
            aria-label="Dernière page"
          >
            <span className="sr-only">Dernière page</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </nav>
    </div>
  );
}

/**
 * Pagination simple (sans informations)
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: Pick<PaginationProps, 'currentPage' | 'totalPages' | 'onPageChange' | 'className'>) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showInfo={false}
      showFirstLast={false}
      maxButtons={3}
      size="sm"
      className={className}
    />
  );
}

/**
 * Hook pour gérer la pagination
 */
export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  // Calculer les indices de début et fin
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Fonction pour paginer un tableau
  const paginateArray = <T,>(array: T[]): T[] => {
    return array.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    paginateArray,
  };
}

// Import React pour le hook
import React from 'react';
