'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { queryKeys } from '@/lib/react-query';
import { toast } from 'sonner';

// Dynamic import for TronWeb to avoid webpack issues
let TronWeb: any = null;

interface PaymentSession {
  id: number;
  session_id: string;
  payment_address: string;
  amount: number;
  status: string;
  expires_at: string;
  blockchain_tx_hash?: string;
}

interface TronWebHookReturn {
  isTronWebLoaded: boolean;
  isTestMode: boolean;
  checkPaymentStatus: (sessionId: string) => Promise<boolean>;
  monitorPayment: (sessionId: string, onSuccess: () => void, onTimeout: () => void) => void;
}

// Hook pour charger TronWeb dynamiquement
export function useTronWeb(): TronWebHookReturn {
  const [isTronWebLoaded, setIsTronWebLoaded] = useState(false);
  const [tronWebInstance, setTronWebInstance] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const supabase = createClient();

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Charger TronWeb dynamiquement - only on client side
  useEffect(() => {
    if (!isClient) return;

    const loadTronWeb = async () => {
      try {
        console.log('🔄 Initialisation de TronWeb...');

        // Check if TronWeb is already loaded globally
        if ((globalThis as any).TronWeb) {
          TronWeb = (globalThis as any).TronWeb;
        } else {
          // Wait for TronWeb to be loaded via script tag
          await new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="tronweb"]')) {
              // Script already exists, wait for it to load
              const checkTronWeb = () => {
                if ((globalThis as any).TronWeb) {
                  TronWeb = (globalThis as any).TronWeb;
                  resolve(void 0);
                } else {
                  setTimeout(checkTronWeb, 100);
                }
              };
              checkTronWeb();
            } else {
              // Inject script tag to load TronWeb
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/tronweb@latest/dist/TronWeb.js';
              script.onload = () => {
                TronWeb = (globalThis as any).TronWeb;
                resolve(void 0);
              };
              script.onerror = reject;
              document.head.appendChild(script);
            }
          });
        }

        // Initialiser TronWeb avec les paramètres de mainnet
        const tronWeb = new TronWeb({
          fullHost: 'https://api.trongrid.io', // Mainnet
          headers: { "TRON-PRO-API-KEY": process.env.NEXT_PUBLIC_TRONGRID_API_KEY },
          // fullHost: 'https://api.shasta.trongrid.io', // Testnet si nécessaire
        });

        setTronWebInstance(tronWeb);

        console.log('✅ TronWeb initialisé:', tronWeb);

        // Tester la connexion
        const isConnected = await tronWeb.isConnected();
        console.log('🔗 TronWeb connecté:', isConnected);

        setIsTronWebLoaded(true);
        console.log('🎉 TronWeb chargé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de TronWeb:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Détails:', errorMessage);
        console.error('Stack:', errorStack);

        // Fallback: mode test pour permettre les tests sans TronWeb
        console.log('🔄 Activation du mode test (sans TronWeb)');
        setTronWebInstance(null); // Mode test
        setIsTronWebLoaded(true);
        toast.warning('Mode test activé - TronWeb non disponible');
      }
    };

    loadTronWeb();
  }, [isClient]);

  // Fonction pour vérifier le statut d'un paiement
  const checkPaymentStatus = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!isTronWebLoaded) {
      throw new Error('Système de paiement non chargé');
    }

    try {
      console.log('🔍 Vérification du paiement pour session:', sessionId);

      // Récupérer la session de paiement
      const { data: session, error } = await supabase
        .from('payment_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !session) {
        console.error('❌ Session introuvable:', error);
        throw new Error('Session de paiement introuvable');
      }

      console.log('📋 Session trouvée:', session);

      // Vérifier si le paiement a déjà été confirmé
      if (session.status === 'completed') {
        console.log('✅ Paiement déjà confirmé');
        return true;
      }

      // MODE TEST: Simuler un paiement réussi après 30 secondes
      if (!tronWebInstance) {
        console.log('🎭 MODE TEST: Simulation de paiement');

        // Marquer automatiquement comme complété après 30 secondes
        setTimeout(async () => {
          console.log('🎭 MODE TEST: Simulation de paiement réussi');
          await supabase
            .from('payment_sessions')
            .update({
              status: 'completed',
              blockchain_tx_hash: 'test_tx_' + Date.now(),
              completed_at: new Date().toISOString()
            })
            .eq('session_id', sessionId);
        }, 30000); // 30 secondes

        return false; // Pas encore payé
      }

      // MODE RÉEL: Vérifier les transactions réelles
      const address = session.payment_address;
      const amount = session.amount;

      console.log('🔍 Recherche de transactions pour:', address, 'montant:', amount);

      // Obtenir les transactions récentes
      const transactions = await tronWebInstance.trx.getTransactionsRelated(address, 'from', 10, 0);
      console.log('📊 Transactions trouvées:', transactions.length);

      // Vérifier si une transaction correspond au montant attendu
      for (const tx of transactions) {
        const txAmount = tx.raw_data.contract[0]?.parameter?.value?.amount;
        const expectedAmount = amount * 1000000; // USDT a 6 décimales

        console.log('💰 Transaction:', tx.txID, 'montant:', txAmount, 'attendu:', expectedAmount);

        if (txAmount === expectedAmount) {
          console.log('✅ Transaction trouvée !');

          // Marquer le paiement comme complété
          await supabase
            .from('payment_sessions')
            .update({
              status: 'completed',
              blockchain_tx_hash: tx.txID,
              completed_at: new Date().toISOString()
            })
            .eq('session_id', sessionId);

          console.log('✅ Paiement marqué comme complété');
          return true;
        }
      }

      console.log('⏳ Aucune transaction correspondante trouvée');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du paiement:', error);
      return false;
    }
  }, [isTronWebLoaded, supabase, tronWebInstance]);

  // Fonction pour surveiller un paiement en continu
  const monitorPayment = useCallback((
    sessionId: string,
    onSuccess: () => void,
    onTimeout: () => void
  ) => {
    if (!isTronWebLoaded) {
      toast.error('Système de paiement non disponible');
      return;
    }

    const checkInterval = setInterval(async () => {
      try {
        const isPaid = await checkPaymentStatus(sessionId);
        if (isPaid) {
          clearInterval(checkInterval);
          onSuccess();
        }
      } catch (error) {
        console.error('Erreur lors de la surveillance:', error);
      }
    }, 10000); // Vérifier toutes les 10 secondes

    // Timeout après 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      onTimeout();
    }, 5 * 60 * 1000); // 5 minutes
  }, [isTronWebLoaded, checkPaymentStatus]);

  return {
    isTronWebLoaded,
    isTestMode: !tronWebInstance,
    checkPaymentStatus,
    monitorPayment,
  };
}

// Export a safe version that doesn't cause SSR issues
export function useTronWebSafe(): TronWebHookReturn {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return safe defaults when not on client
  if (!isClient) {
    return {
      isTronWebLoaded: false,
      isTestMode: true,
      checkPaymentStatus: async () => false,
      monitorPayment: () => {},
    };
  }

  return useTronWeb();
}
