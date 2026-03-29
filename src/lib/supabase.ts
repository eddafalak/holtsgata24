import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const configured = Boolean(rawUrl && rawKey && rawUrl.startsWith('http'))

const supabaseUrl = configured ? rawUrl! : 'https://example.com'
const supabaseAnonKey = configured ? rawKey! : 'public-anon-key'

if (!configured && import.meta.env.DEV) {
  console.warn(
    '[supabase] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (sjá .env.example).',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Cursor's webview/preview can block `localStorage`. If that happens,
    // Supabase auth can fail silently and the app looks "connected but nothing works".
    // We provide an in-memory fallback storage that never throws.
    storage:
      typeof window === 'undefined'
        ? undefined
        : (() => {
            const memory = new Map<string, string>()
            return {
              async getItem(key: string) {
                try {
                  return window.localStorage.getItem(key)
                } catch {
                  return memory.get(key) ?? null
                }
              },
              async setItem(key: string, value: string) {
                try {
                  window.localStorage.setItem(key, value)
                } catch {
                  memory.set(key, value)
                }
              },
              async removeItem(key: string) {
                try {
                  window.localStorage.removeItem(key)
                } catch {
                  memory.delete(key)
                }
              },
            }
          })(),
  },
})

export function isSupabaseConfigured(): boolean {
  return configured
}
