'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type CoupleStatus = 'none' | 'pending' | 'active' | 'inactive'
type Couple = Database['public']['Tables']['couples']['Row']

interface UseCoupleStatusReturn {
  hasPartner: boolean
  partnerId: string | null
  coupleStatus: CoupleStatus
  couple: Couple | null
  loading: boolean
  error: PostgrestError | null
  refresh: () => Promise<void>
}

export function useCoupleStatus(): UseCoupleStatusReturn {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null)

  const fetchCouple = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCouple(null)
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('couples')
      .select('*')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError)
      setLoading(false)
      return
    }

    setCouple(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCouple()

    return () => {
      // Cleanup real-time subscription on unmount
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [fetchCouple])

  // Set up real-time subscription when couple is active
  useEffect(() => {
    if (!couple || couple.status !== 'active') {
      // Clean up any existing subscription
      if (subscription) {
        subscription.unsubscribe()
        setSubscription(null)
      }
      return
    }

    const supabase = createClient()

    // Subscribe to changes on couples table
    const channel = supabase
      .channel(`couple:${couple.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couples',
          filter: `id=eq.${couple.id}`,
        },
        (payload) => {
          setCouple(payload.new as Couple)
        }
      )
      .subscribe()

    setSubscription(channel)

    return () => {
      channel.unsubscribe()
    }
  }, [couple?.id, couple?.status])

  // Compute derived state
  const coupleStatus: CoupleStatus = couple?.status ?? 'none'
  const hasPartner = couple?.status === 'active'
  const partnerId =
    couple?.status === 'active'
      ? couple.partner_1_id === couple.partner_1_id // This will always be true if there's an active couple
        ? couple.partner_2_id // We need to determine which is the partner
        : couple.partner_1_id
      : null

  return {
    hasPartner,
    partnerId,
    coupleStatus,
    couple,
    loading,
    error,
    refresh: fetchCouple,
  }
}
