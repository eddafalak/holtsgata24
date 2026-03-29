/* eslint react-refresh/only-export-components: "off" */
import { createContext, useContext, useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirm: boolean }>
  signOut: () => Promise<void>
  /** Endurlesa prófíl úr gagnagrunni (t.d. eftir að vista í Stillingum). */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    let t: ReturnType<typeof setTimeout> | null = null
    const timeout = new Promise<T>((_, reject) => {
      t = setTimeout(() => reject(new Error(`[auth] ${label} timeout after ${ms}ms`)), ms)
    })

    try {
      return await Promise.race([p, timeout])
    } finally {
      if (t) clearTimeout(t)
    }
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(supabase.auth.getSession(), 8000, 'getSession')
        if (error) {
          console.warn('[auth] getSession:', error.message)
        }
        if (cancelled) return

        setSession(session ?? null)
        setUser(session?.user ?? null)

        if (session?.user) {
          await withTimeout(loadProfile(session.user.id), 8000, 'loadProfile')
        }
      } catch (e) {
        console.error('[auth] init failed:', e)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession ?? null)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await withTimeout(loadProfile(newSession.user.id), 8000, 'loadProfile')
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data as Profile)
    } else {
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    const uid = s?.user?.id
    if (!uid) return
    await withTimeout(loadProfile(uid), 8000, 'loadProfile')
  }

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/innskraning`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      const needsEmailConfirm = Boolean(data.user && !data.session)
      return { needsEmailConfirm }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,
    signInWithPassword,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
