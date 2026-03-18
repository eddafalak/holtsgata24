import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// While Supabase is "paused" in this project, fall back to a dummy but valid URL
// so that createClient does not throw and the UI can still render.
const supabaseUrl =
  rawUrl && rawUrl.startsWith('http') ? rawUrl : 'https://example.com'
const supabaseAnonKey = rawKey || 'public-anon-key'

if (!rawUrl || !rawKey) {
  console.warn(
    'Supabase env vars are not set. Using a dummy Supabase client for UI development only.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
