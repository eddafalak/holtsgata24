import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

export function ProtectedRoute({ children }: PropsWithChildren) {
  if (!isSupabaseConfigured()) {
    return <>{children}</>
  }

  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] text-[14px] text-[#666]">
        Sæki innskráningu…
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
