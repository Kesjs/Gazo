'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  amount: number;
}

export function PaymentModal({ isOpen, onClose, sessionId, amount }: PaymentModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Adresse copiée !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleStartPayment = () => {
    if (!sessionId) {
      toast.error('Session de paiement manquante');
      return;
    }

    // Fermer le modal et rediriger vers la page de paiement
    onClose();
    router.push(`/dashboard/payment/${sessionId}`);
  };

  if (!isOpen || !sessionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paiement USDT
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Montant */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {amount}€
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Montant à payer en USDT (TRC20)
            </p>
          </div>

          {/* Instructions rapides */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Instructions :
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Copiez l&apos;adresse ci-dessous</li>
              <li>2. Envoyez exactement {amount}€ en USDT</li>
              <li>3. Cliquez sur &quot;Démarrer le paiement&quot;</li>
            </ol>
          </div>

          {/* Adresse USDT */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Adresse USDT (TRC20) :
            </h3>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all mb-3">
              0x63eF5b765D8d408274172804D31fB0a2Ea5416c0
            </div>
            <Button
              onClick={() => handleCopyAddress('0x63eF5b765D8d408274172804D31fB0a2Ea5416c0')}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier l&apos;adresse
                </>
              )}
            </Button>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleStartPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Démarrer le paiement
            </Button>
          </div>

          {/* Note de sécurité */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            🔒 Paiement sécurisé • Détection automatique
          </div>
        </div>
      </motion.div>
    </div>
  );
}
