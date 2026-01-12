'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      setError('')
      setLoading(true)

      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*')
      if (profilesError) {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }

      const { data: subs, error: subsError } = await supabase.from('subscriptions').select('*')
      if (subsError) {
        throw new Error('Erreur lors du chargement des souscriptions')
      }

      const { data: trans, error: transError } = await supabase.from('transactions').select('*')
      if (transError) {
        throw new Error('Erreur lors du chargement des transactions')
      }

      setUsers(profiles || [])
      setStats({
        totalUsers: profiles?.length || 0,
        activeSubs: subs?.filter((s: any) => s.status === 'active').length || 0,
        totalInvested: trans?.filter((t: any) => t.type === 'deposit').reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
        totalEarnings: trans?.filter((t: any) => t.type === 'earnings').reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
      })

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données administrateur')
      console.error('Admin dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()

        if (!data.isAdmin) {
          toast.error('Accès refusé', {
            description: data.message || 'Vous n\'êtes pas autorisé à accéder à cette section.'
          })
          router.push('/dashboard')
          return
        }

        // Si c'est un admin, marquer dans localStorage pour les vérifications futures
        localStorage.setItem('isAdmin', 'true')
        fetchStats()
      } catch (error) {
        console.error('Error checking admin access:', error)
        toast.error('Erreur de vérification', {
          description: 'Impossible de vérifier vos droits administrateur.'
        })
        router.push('/dashboard')
      }
    }

    checkAdminAccess()
  }, [fetchStats, router])

  const handleLogout = async () => {
    localStorage.removeItem('isAdmin')
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données administrateur...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Erreur Administrateur</h3>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchStats}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Déconnexion
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Utilisateurs</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Souscriptions Actives</h3>
          <p className="text-2xl font-bold">{stats.activeSubs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Investi</h3>
          <p className="text-2xl font-bold">${stats.totalInvested?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Gains Totaux</h3>
          <p className="text-2xl font-bold">${stats.totalEarnings?.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Utilisateurs</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Email</th>
              <th className="text-left">Nom</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td><button className="text-red-600">Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
