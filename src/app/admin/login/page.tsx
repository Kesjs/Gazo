'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Vérifier si l'utilisateur est un admin dans la table admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (adminError || !adminData) {
      toast.error('Accès refusé', {
        description: 'Vous n\'êtes pas un administrateur.'
      })
      setLoading(false)
      return
    }

    // Si c'est un admin, procéder à l'authentification Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('Erreur de connexion', {
        description: error.message
      })
    } else {
      // Stocker le statut admin dans localStorage (pour vérifications côté client rapides)
      localStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion Administrateur</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Accès réservé aux administrateurs uniquement
        </p>
        <input
          type="email"
          placeholder="Email administrateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white p-3 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
