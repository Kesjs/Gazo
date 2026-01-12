'use client'

import { useState } from 'react'
import { X, CreditCard, Bitcoin, Coins, Building2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: number, method: string) => void
}

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onWithdraw: (amount: number, method: string) => void
  maxAmount: number
  minimumAmount?: number
}

export function DepositModal({ isOpen, onClose, onDeposit }: DepositModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'btc' | 'usdt'>('bank')
  const [amount, setAmount] = useState('')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const depositMethods = [
    {
      id: 'bank',
      name: 'Virement Bancaire',
      icon: Building2,
      description: 'Transfert bancaire sécurisé',
      color: 'bg-blue-500',
      details: {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'BNPAFRPP',
        beneficiary: 'Gazoduc Invest SAS'
      }
    },
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      icon: Bitcoin,
      description: 'Cryptomonnaie principale',
      color: 'bg-orange-500',
      details: {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        network: 'Bitcoin',
        minDeposit: '0.0001 BTC'
      }
    },
    {
      id: 'usdt',
      name: 'Tether (USDT)',
      icon: Coins,
      description: 'Stablecoin indexé sur le dollar',
      color: 'bg-green-500',
      details: {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        network: 'ERC-20',
        minDeposit: '10 USDT'
      }
    }
  ]

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(type)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (numAmount > 0) {
      onDeposit(numAmount, selectedMethod)
      setAmount('')
      onClose()
    }
  }

  if (!isOpen) return null

  const selectedMethodData = depositMethods.find(m => m.id === selectedMethod)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background avec flou */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Effectuer un Dépôt</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choisissez votre méthode de paiement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Méthodes de paiement */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-4 block">Méthode de paiement</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {depositMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as 'bank' | 'btc' | 'usdt')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{method.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Détails de la méthode sélectionnée - Seulement pour crypto */}
          {(selectedMethod === 'btc' || selectedMethod === 'usdt') && selectedMethodData && (
            <div className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <Label className="text-base font-semibold mb-4 block">Informations de paiement</Label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse {selectedMethod.toUpperCase()}:</span>
                  <div className="flex items-center gap-2 max-w-xs">
                    <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono break-all">
                      {selectedMethodData.details.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedMethodData.details.address ?? '', selectedMethod)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex-shrink-0"
                    >
                      {copiedAddress === selectedMethod ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Réseau:</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {selectedMethodData.details.network}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dépôt minimum:</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {selectedMethodData.details.minDeposit}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Les dépôts crypto sont confirmés automatiquement une fois la transaction validée sur la blockchain.
              </p>
            </div>
          )}

          {/* Instructions pour virement bancaire */}
          {selectedMethod === 'bank' && (
            <div className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <Label className="text-base font-semibold mb-4 block">Informations bancaires</Label>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-4">
                {/* Instructions */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Procédure de virement bancaire :</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Copiez les coordonnées bancaires ci-dessous</li>
                      <li>Effectuez le virement depuis votre compte bancaire</li>
                      <li>Indiquez votre nom complet en référence</li>
                      <li>Le traitement prend généralement 1-3 jours ouvrés</li>
                    </ol>
                  </div>
                </div>

                {/* Coordonnées bancaires */}
                <div className="border-t border-blue-200 dark:border-blue-700 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">IBAN:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                        FR76 1234 5678 9012 3456 7890 123
                      </code>
                      <button
                        onClick={() => copyToClipboard('FR76 1234 5678 9012 3456 7890 123', 'iban')}
                        className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded"
                      >
                        {copiedAddress === 'iban' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">BIC:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                        BNPAFRPP
                      </code>
                      <button
                        onClick={() => copyToClipboard('BNPAFRPP', 'bic')}
                        className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded"
                      >
                        {copiedAddress === 'bic' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Bénéficiaire:</span>
                    <span className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                      Gazoduc Invest SAS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Montant */}
          <div className="mb-6">
            <Label htmlFor="amount" className="text-base font-semibold mb-2 block">
              Montant à déposer
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirmer le dépôt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WithdrawModal({ isOpen, onClose, onWithdraw, maxAmount, minimumAmount }: WithdrawModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'btc' | 'usdt'>('bank')
  const [amount, setAmount] = useState('')

  const withdrawMethods = [
    {
      id: 'bank',
      name: 'Virement Bancaire',
      icon: Building2,
      description: 'Transfert vers votre compte bancaire',
      color: 'bg-blue-500',
      fees: 'Gratuit',
      processing: '1-3 jours'
    },
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      icon: Bitcoin,
      description: 'Retrait en cryptomonnaie',
      color: 'bg-orange-500',
      fees: '0.0001 BTC',
      processing: '10-60 min'
    },
    {
      id: 'usdt',
      name: 'Tether (USDT)',
      icon: Coins,
      description: 'Retrait en stablecoin',
      color: 'bg-green-500',
      fees: '1 USDT',
      processing: '5-30 min'
    }
  ]

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    const minAmount = minimumAmount || 0
    if (numAmount >= minAmount && numAmount <= maxAmount) {
      onWithdraw(numAmount, selectedMethod)
      setAmount('')
      onClose()
    }
  }

  if (!isOpen) return null

  const selectedMethodData = withdrawMethods.find(m => m.id === selectedMethod)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background avec flou */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Effectuer un Retrait</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choisissez votre méthode de retrait</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Solde disponible */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Solde disponible:</span>
              <span className="text-lg font-bold text-blue-800 dark:text-blue-200">${maxAmount.toFixed(2)}</span>
            </div>
            {minimumAmount && minimumAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Minimum retrait:</span>
                <span className="text-lg font-bold text-orange-800 dark:text-orange-200">${minimumAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Méthodes de retrait */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-4 block">Méthode de retrait</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {withdrawMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as 'bank' | 'btc' | 'usdt')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{method.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{method.description}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Frais: {method.fees}</div>
                      <div>Traitement: {method.processing}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Montant */}
          <div className="mb-6">
            <Label htmlFor="withdraw-amount" className="text-base font-semibold mb-2 block">
              Montant à retirer
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min={minimumAmount || 0}
                max={maxAmount}
                step="0.01"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              {minimumAmount && minimumAmount > 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Minimum: ${minimumAmount.toFixed(2)}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum: ${maxAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) < (minimumAmount || 0) || parseFloat(amount) > maxAmount}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Confirmer le retrait
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
