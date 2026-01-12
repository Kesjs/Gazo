import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const PLANS_CACHE_KEY = 'investment_plans_cache'
const PLANS_CACHE_DURATION = 1000 * 60 * 60 // 1 heure

export interface Plan {
  id: number
  name: string
  description: string
  min_amount: number
  duration_days: number
  daily_profit: number
  created_at: string
}

export function useCachedPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Vérifier le cache local
        const cached = localStorage.getItem(PLANS_CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const isExpired = Date.now() - timestamp > PLANS_CACHE_DURATION

          if (!isExpired) {
            setPlans(data)
            setLoading(false)
            return
          }
        }

        // Récupérer depuis Supabase
        const supabase = createClient()
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('id')

        if (error) throw error

        // Mettre en cache
        localStorage.setItem(PLANS_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }))

        setPlans(data || [])
      } catch (err) {
        setError('Erreur lors du chargement des plans')
        console.error('Plans fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}
