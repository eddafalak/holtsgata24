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
  },
})

export function isSupabaseConfigured(): boolean {
  return configured
}
