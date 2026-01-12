'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts';
import { createClient } from '@/lib/supabase';
import { useBalance, useCreateWithdrawal } from '@/hooks/useDashboardData';
import { toast } from 'sonner';
import { ArrowDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WithdrawalAddress {
  id: number;
  address: string;
  blockchain: string;
  label?: string;
  is_default: boolean;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: number;
  minAmount: number;
}

export function WithdrawalModal({ isOpen, onClose, maxAmount, minAmount }: WithdrawalModalProps) {
  const { user } = useAuth();
  const { data: currentBalance = 0 } = useBalance(user?.id);
  const createWithdrawal = useCreateWithdrawal();
  const supabase = createClient();

  const [withdrawalAddresses, setWithdrawalAddresses] = useState<WithdrawalAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les adresses de retrait
  useEffect(() => {
    if (isOpen && user) {
      loadWithdrawalAddresses();
    }
  }, [isOpen, user]);

  const loadWithdrawalAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWithdrawalAddresses(data || []);

      // Sélectionner l'adresse par défaut si elle existe
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Erreur chargement adresses:', error);
      toast.error('Erreur lors du chargement des adresses');
    }
  };

  const addWithdrawalAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Adresse requise');
      return;
    }

    // Validation basique de l'adresse TRC20 (commence par T et fait 34 caractères)
    if (!newAddress.startsWith('T') || newAddress.length !== 34) {
      toast.error('Adresse TRC20 invalide (doit commencer par T et faire 34 caractères)');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('withdrawal_addresses')
        .insert({
          user_id: user!.id,
          address: newAddress.trim(),
          blockchain: 'TRC20',
          label: newLabel.trim() || null,
          is_default: withdrawalAddresses.length === 0 // Première adresse devient défaut
        })
        .select()
        .single();

      if (error) throw error;

      setWithdrawalAddresses(prev => [data, ...prev]);
      setNewAddress('');
      setNewLabel('');
      setShowAddAddress(false);
      setSelectedAddressId(data.id);
      toast.success('Adresse ajoutée avec succès');
    } catch (error) {
      console.error('Erreur ajout adresse:', error);
      toast.error('Erreur lors de l\'ajout de l\'adresse');
    }
  };

  const deleteWithdrawalAddress = async (addressId: number) => {
    try {
      const { error } = await supabase
        .from('withdrawal_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user!.id);

      if (error) throw error;

      setWithdrawalAddresses(prev => prev.filter(addr => addr.id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      toast.success('Adresse supprimée');
    } catch (error) {
      console.error('Erreur suppression adresse:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);

    if (!selectedAddressId) {
      toast.error('Sélectionnez une adresse de retrait');
      return;
    }

    if (isNaN(withdrawalAmount) || withdrawalAmount < minAmount) {
      toast.error(`Montant minimum: ${minAmount}€`);
      return;
    }

    if (withdrawalAmount > maxAmount) {
      toast.error(`Montant maximum disponible: ${maxAmount.toFixed(2)}€`);
      return;
    }

    const selectedAddress = withdrawalAddresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Adresse invalide');
      return;
    }

    setIsLoading(true);
    try {
      await createWithdrawal.mutateAsync({
        amount: withdrawalAmount,
        method: `TRC20:${selectedAddress.address}`
      });

      setAmount('');
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Retirer des fonds
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Solde disponible */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-green-800 dark:text-green-200 font-medium">Solde disponible</span>
              <span className="text-green-800 dark:text-green-200 font-bold text-lg">
                {maxAmount.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Montant */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Montant à retirer (€)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum ${minAmount}€`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={minAmount}
              max={maxAmount}
              step="0.01"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum: {minAmount}€ • Maximum: {maxAmount.toFixed(2)}€
            </p>
          </div>

          {/* Adresses de retrait */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse de retrait USDT (TRC20)
              </label>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {/* Formulaire ajout adresse */}
            {showAddAddress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4"
              >
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Adresse USDT (commence par T...)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label optionnel (ex: Mon Wallet)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addWithdrawalAddress}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddAddress(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des adresses */}
            <div className="space-y-2">
              {withdrawalAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {addr.label || 'Sans label'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {addr.address.slice(0, 6)}...{addr.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {addr.is_default && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Défaut
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWithdrawalAddress(addr.id);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {withdrawalAddresses.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune adresse enregistrée. Ajoutez-en une pour retirer vos fonds.
                </p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleWithdrawal}
              disabled={isLoading || !selectedAddressId || !amount || parseFloat(amount) < minAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <ArrowDownIcon className="w-4 h-4" />
                  Retirer
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
