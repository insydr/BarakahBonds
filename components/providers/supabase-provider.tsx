'use client'

import { createContext, useContext, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type SupabaseContextType = SupabaseClient<Database>

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

interface SupabaseProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const client = useMemo(() => createClient(), [])

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase(): SupabaseClient<Database> {
  const context = useContext(SupabaseContext)

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }

  return context
}
