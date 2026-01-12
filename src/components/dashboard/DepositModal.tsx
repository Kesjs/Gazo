import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XMarkIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface DepositModalProps {
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

const quickAmounts = [1000, 2500, 5000, 10000];

const paymentMethods = [
  {
    id: 'btc',
    name: 'Bitcoin (BTC)',
    icon: 'https://logos-world.net/wp-content/uploads/2020/08/Bitcoin-Logo-700x394.png',
    description: 'Paiement en Bitcoin'
  },
  {
    id: 'tron',
    name: 'Tron (TRX)',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    description: 'Paiement en Tron'
  },
  {
    id: 'usdt',
    name: 'Tether (USDT)',
    icon: 'https://th.bing.com/th/id/R.6cd272d6637fa8f3d2e59d7dba789e69?rik=1ff2pq%2b9yfPodQ&riu=http%3a%2f%2fusdtpiggybank.com%2fimages%2fusdt_logo.png&ehk=PTFeI45LUsBAzaWI8EYmS8RyN8%2bbCoEuGWtJ9qz3q%2bM%3d&risl=&pid=ImgRaw&r=0',
    description: 'Paiement en USDT'
  }
];

export function DepositModal({ onConfirm, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('btc');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      toast.error('Montant invalide', {
        description: 'Veuillez saisir un montant valide.'
      });
      return;
    }

    if (numAmount < 100) {
      toast.error('Montant insuffisant', {
        description: 'Le montant minimum de dépôt est de 100 €.'
      });
      return;
    }

    setLoading(true);

    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));

    onConfirm(numAmount);
    setLoading(false);
  };

  const selectQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <CardTitle className="text-xl flex items-center">
              <CurrencyEuroIcon className="h-6 w-6 mr-2 text-green-500" />
              Effectuer un dépôt
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Méthodes de paiement */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Méthode de paiement :
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3 border rounded-lg transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative w-12 h-12">
                          <Image
                            src={method.icon}
                            alt={method.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-xs font-medium text-center">{method.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Montants rapides */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Montants rapides :
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => selectQuickAmount(quickAmount)}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
                    >
                      <div className="font-semibold">{quickAmount.toLocaleString()} €</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant personnalisé */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Montant personnalisé (€) :
                </label>
                <div className="relative">
                  <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="amount"
                    type="number"
                    min="100"
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Entrez le montant"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Montant minimum : 100 €
                </p>
              </div>

              {/* Informations de sécurité */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Transaction sécurisée
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Paiement via {paymentMethods.find(m => m.id === selectedMethod)?.name}. 
                      Vos fonds sont protégés par la blockchain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !amount || parseFloat(amount) < 100}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Traitement...' : 'Déposer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
