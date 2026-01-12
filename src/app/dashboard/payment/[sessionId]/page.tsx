'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts';
import { createClient } from '@/lib/supabase';
import { useTronWeb } from '@/hooks/useTronWeb';
import { toast } from 'sonner';
import Image from 'next/image';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PaymentSession {
  id: number;
  session_id: string;
  payment_address: string;
  amount: number;
  status: string;
  expires_at: string;
  created_at: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { checkPaymentStatus, monitorPayment, isTronWebLoaded, isTestMode } = useTronWeb();
  const supabase = createClient();

  const sessionId = searchParams.get('session');

  console.log('🔧 Page de paiement - searchParams:', Object.fromEntries(searchParams.entries()));
  console.log('🔧 Page de paiement - SessionId:', sessionId);
  console.log('🔧 TronWeb loaded:', isTronWebLoaded, 'Test mode:', isTestMode);

  // Fallback pour test: utiliser une session existante si aucune n'est fournie
  const [fallbackSessionId, setFallbackSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId && !fallbackSessionId) {
      // Essayer de récupérer la dernière session de paiement de l'utilisateur
      const loadFallbackSession = async () => {
        if (!user) return;

        try {
          const { data: sessions, error } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);

          if (sessions && sessions.length > 0) {
            console.log('🔄 Session de fallback trouvée:', sessions[0].session_id);
            setFallbackSessionId(sessions[0].session_id);
          }
        } catch (error) {
          console.error('Erreur chargement session fallback:', error);
        }
      };

      loadFallbackSession();
    }
  }, [sessionId, user, supabase, fallbackSessionId]);

  const effectiveSessionId = sessionId || fallbackSessionId;

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'expired'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);

  // Charger la session de paiement
  useEffect(() => {
    const loadSession = async () => {
      if (!effectiveSessionId || !user) return;

      try {
        const { data, error } = await supabase
          .from('payment_sessions')
          .select('*')
          .eq('session_id', effectiveSessionId)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          toast.error('Session de paiement introuvable');
          router.push('/dashboard/investissement');
          return;
        }

        setSession(data);
        setPaymentStatus(data.status);

        console.log('📋 Session de paiement chargée:', {
          sessionId: data.session_id,
          amount: data.amount,
          address: data.payment_address,
          status: data.status,
          expiresAt: data.expires_at
        });

        // Si le paiement est déjà complété, rediriger
        if (data.status === 'completed') {
          toast.success('Paiement déjà confirmé !');
          router.push('/dashboard');
          return;
        }

      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        toast.error('Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [effectiveSessionId, sessionId, user, supabase, router]);

  // Surveillance du paiement
  useEffect(() => {
    if (!effectiveSessionId || !hasStartedPayment || paymentStatus !== 'processing' || !isTronWebLoaded) return;

    const handlePaymentSuccess = async () => {
      setPaymentStatus('completed');

      // Activer la souscription (maintenant en pending_activation)
      try {
        const response = await fetch('/api/activate-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: effectiveSessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message || 'Paiement confirmé ! Pack en attente d\'activation.');
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          toast.error('Erreur lors de l\'activation de votre pack');
        }
      } catch (error) {
        console.error('Erreur d\'activation:', error);
        toast.error('Erreur lors de l\'activation de votre pack');
      }
    };

    const handlePaymentTimeout = () => {
      setPaymentStatus('expired');
      toast.error('Délai de paiement expiré');
    };

    monitorPayment(effectiveSessionId, handlePaymentSuccess, handlePaymentTimeout);
  }, [effectiveSessionId, paymentStatus, isTronWebLoaded, monitorPayment, router, hasStartedPayment]);

  // Démarrer la surveillance du paiement
  const startPaymentMonitoring = () => {
    if (!isTronWebLoaded) {
      toast.error('Veuillez connecter votre wallet TRON');
      return;
    }

    setHasStartedPayment(true);
    setPaymentStatus('processing');
    toast.success('Surveillance du paiement démarrée');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Session introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cette session de paiement n&apos;existe pas ou a expiré.
          </p>
          <button
            onClick={() => router.push('/dashboard/investissement')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Retour aux investissements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Paiement Sécurisé USDT
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Envoyez exactement {session.amount}€ en USDT (TRC20)
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {/* Status Indicator */}
            <div className="flex justify-center mb-6">
              {!hasStartedPayment && paymentStatus === 'pending' && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <ClockIcon className="w-6 h-6" />
                  <span className="font-medium">Prêt pour le paiement</span>
                </div>
              )}
              {hasStartedPayment && paymentStatus === 'processing' && (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  <span className="font-medium">Paiement en cours...</span>
                </div>
              )}
              {paymentStatus === 'completed' && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-6 h-6" />
                  <span className="font-medium">Paiement confirmé</span>
                </div>
              )}
              {paymentStatus === 'expired' && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <XCircleIcon className="w-6 h-6" />
                  <span className="font-medium">Paiement expiré</span>
                </div>
              )}
            </div>

            {/* Payment Amount */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {session.amount}€
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Montant à envoyer en USDT (TRC20)
                </p>
              </div>
            </div>

            {/* USDT Address */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Adresse USDT (TRC20) :
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border font-mono text-sm break-all">
                {session.payment_address}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(session.payment_address);
                  toast.success('Adresse copiée !');
                }}
                className="mt-3 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Copier l&apos;adresse
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Instructions de paiement :
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>1. Ouvrez votre wallet USDT (Trust Wallet, etc.)</li>
                <li>2. Sélectionnez le réseau TRC20</li>
                <li>3. Envoyez exactement <strong>{session.amount}€</strong> à l&apos;adresse ci-dessus</li>
                <li>4. Le paiement sera détecté automatiquement</li>
                <li>5. Votre pack sera activé immédiatement</li>
              </ol>
            </div>

            {/* Test Button - Only in development */}
            {process.env.NODE_ENV === 'development' && isTestMode && (
              <button
                onClick={async () => {
                  console.log('🎭 SIMULATION: Marquage du paiement comme réussi');
                  try {
                    await supabase
                      .from('payment_sessions')
                      .update({
                        status: 'completed',
                        blockchain_tx_hash: 'test_tx_' + Date.now(),
                        completed_at: new Date().toISOString()
                      })
                      .eq('session_id', sessionId);

                    toast.success('Paiement simulé avec succès !');
                    setTimeout(() => router.push('/dashboard'), 2000);
                  } catch (error) {
                    console.error('Erreur simulation:', error);
                    toast.error('Erreur lors de la simulation');
                  }
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors mb-4"
              >
                🎭 Simuler paiement réussi (Test)
              </button>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => router.push('/dashboard/investissement')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>

              {!hasStartedPayment && paymentStatus === 'pending' && (
                <button
                  onClick={startPaymentMonitoring}
                  disabled={!isTronWebLoaded}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {!isTronWebLoaded ? 'Connexion wallet...' : 'Démarrer le paiement'}
                </button>
              )}

              {paymentStatus === 'completed' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  Voir mon dashboard
                </button>
              )}
            </div>

          </div>

          {/* Security Notice */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              🔒 Paiement sécurisé • Détection automatique • Activation instantanée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
