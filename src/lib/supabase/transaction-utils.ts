// Fonctions utilitaires pour créer des transactions automatiquement
// À utiliser dans les autres parties de l'application

import { createClient } from '@/lib/supabase';

const supabase = createClient();

export const createTransaction = async (
  userId: string,
  type: 'deposit' | 'withdrawal' | 'profit' | 'subscription',
  amount: number,
  description: string,
  reference?: string
) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        type,
        amount,
        description,
        status: 'completed',
        reference,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de transaction:', error);
    throw error;
  }
};

// Exemples d'utilisation dans les packs
export const createPackPurchaseTransaction = async (
  userId: string,
  packName: string,
  amount: number,
  packId: string
) => {
  return createTransaction(
    userId,
    'subscription',
    -amount, // négatif pour les achats
    `Souscription ${packName}`,
    packId
  );
};

// Pour les gains quotidiens
export const createProfitTransaction = async (
  userId: string,
  amount: number,
  packName: string,
  packId: string
) => {
  return createTransaction(
    userId,
    'profit',
    amount,
    `Gains quotidiens - ${packName}`,
    packId
  );
};

// Pour les dépôts
export const createDepositTransaction = async (
  userId: string,
  amount: number,
  description = 'Dépôt bancaire'
) => {
  return createTransaction(
    userId,
    'deposit',
    amount,
    description
  );
};

// Pour les retraits
export const createWithdrawalTransaction = async (
  userId: string,
  amount: number,
  description = 'Retrait vers compte bancaire'
) => {
  return createTransaction(
    userId,
    'withdrawal',
    -amount, // négatif pour les retraits
    description
  );
};
