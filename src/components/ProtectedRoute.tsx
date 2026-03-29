import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

export function ProtectedRoute({ children }: PropsWithChildren) {
  // Hooks must run unconditionally. We gate the behavior (protected vs. bypass) below.
  const { session, profile, loading } = useAuth()
  const configured = isSupabaseConfigured()

  if (!configured) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4 text-[14px] text-[#323232]">
        <p className="rounded-md border border-[#e6e8e9] bg-white px-4 py-3 shadow-sm">
          Sæki innskráningu…
        </p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/innskraning" replace />
  }

  const status = profile?.approval_status
  if (status === 'pending' || status === 'rejected') {
    return <Navigate to="/biða-eftir-samþykki" replace />
  }

  return <>{children}</>
}
