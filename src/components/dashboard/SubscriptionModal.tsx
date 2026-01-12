import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { XMarkIcon, CurrencyEuroIcon, ShieldCheckIcon, LockClosedIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  daily_profit: number;
  duration_days: number;
  features: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
  badge?: string;
  gradient: string;
  hoverBg: string;
  iconColor: string;
}

interface SubscriptionModalProps {
  plan: Plan;
  onConfirm: (amount: number, paymentMethod: string) => void;
  onClose: () => void;
}

export function SubscriptionModal({ plan, onConfirm, onClose }: SubscriptionModalProps) {
  const [amount, setAmount] = useState<string>(plan.min_amount.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);

  const totalEarnings = (plan.min_amount * plan.daily_profit * plan.duration_days) / 100;
  const finalAmount = plan.min_amount + totalEarnings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      toast.error('Montant invalide', {
        description: 'Veuillez saisir un montant valide.'
      });
      return;
    }

    if (numAmount !== plan.min_amount) {
      toast.error('Montant incorrect', {
        description: `Pour souscrire au pack ${plan.name}, le montant doit être exactement de ${plan.min_amount}€.`
      });
      return;
    }

    setLoading(true);

    // Simuler un traitement de paiement
    await new Promise(resolve => setTimeout(resolve, 2000));

    onConfirm(numAmount, paymentMethod);
    setLoading(false);
  };

  const IconComponent = plan.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-4 max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${plan.color} shadow-lg`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Souscrire à {plan.name}</CardTitle>
                <p className="text-blue-100 mt-1">{plan.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Détails du pack */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Détails de votre investissement</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <CurrencyEuroIcon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-500 dark:text-gray-400">Investissement</p>
                  <p className="text-2xl font-bold text-blue-600">{plan.min_amount}€</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="h-6 w-6 mx-auto mb-2 text-green-500 font-bold text-lg">%</div>
                  <p className="text-gray-500 dark:text-gray-400">Rendement/jour</p>
                  <p className="text-2xl font-bold text-green-600">{plan.daily_profit}%</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="h-6 w-6 mx-auto mb-2 text-purple-500 font-bold text-lg">📅</div>
                  <p className="text-gray-500 dark:text-gray-400">Durée</p>
                  <p className="text-2xl font-bold text-purple-600">{plan.duration_days}j</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <CheckCircleIcon className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-gray-500 dark:text-gray-400">Gain total</p>
                  <p className="text-2xl font-bold text-orange-600">+{totalEarnings.toFixed(0)}€</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Montant final estimé après {plan.duration_days} jours :</span>
                  <span className="text-2xl font-bold text-green-600">{finalAmount.toFixed(0)}€</span>
                </div>
              </div>
            </div>

            {/* Avantages inclus */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                Avantages inclus dans votre pack
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire de paiement */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Informations de paiement
                </h4>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant à investir (€)
                    </label>
                    <div className="relative">
                      <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 text-lg font-semibold"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Montant fixe pour le pack {plan.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Mode de paiement
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <CreditCardIcon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <span className="text-sm font-medium">Carte bancaire</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">P</div>
                        <span className="text-sm font-medium">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crypto')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'crypto'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="h-6 w-6 mx-auto mb-2 text-orange-500 font-bold text-lg">₿</div>
                        <span className="text-sm font-medium">Crypto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sécurité et confidentialité */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Sécurité et confidentialité garanties
                    </h5>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="flex items-center">
                        <LockClosedIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Chiffrement SSL 256-bit pour toutes vos données</span>
                      </p>
                      <p className="flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Protection PCI DSS Level 1 pour les paiements</span>
                      </p>
                      <p className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Données bancaires jamais stockées sur nos serveurs</span>
                      </p>
                      <p className="flex items-center">
                        <LockClosedIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Authentification à deux facteurs disponible</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 text-white font-semibold text-lg ${plan.id === 'starter' ? 'bg-blue-600 hover:bg-blue-700' :
                    plan.id === 'premium' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    plan.id === 'elite' ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Traitement en cours...</span>
                    </div>
                  ) : (
                    `Souscrire à ${plan.name} - ${plan.min_amount}€`
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                En procédant au paiement, vous acceptez nos conditions générales d&apos;utilisation et notre politique de confidentialité.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
