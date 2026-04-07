import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  initialize: async () => {
    set({ loading: true })
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: profile ?? null, loading: false })
      } else {
        set({ user: null, loading: false })
      }
    } catch {
      set({ user: null, loading: false })
    }
  },
}))
