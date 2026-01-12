'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);

    // Simuler un délai de chargement pour l'effet visuel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Réduit à 600ms pour être moins intrusif

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Spinner amélioré */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            {/* Texte de chargement */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Navigation...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
