import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

/**
 * Notendur með approval_status = pending eða rejected — stjórnandi samþykkir í Supabase (profiles.approval_status).
 */
export function PendingApprovalPage() {
  const navigate = useNavigate()
  const { session, profile, loading, signOut } = useAuth()

  if (!isSupabaseConfigured()) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4 text-[14px] text-[#323232]">
        Sæki notanda…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/innskraning" replace />
  }

  if (profile?.approval_status === 'approved') {
    return <Navigate to="/" replace />
  }

  const rejected = profile?.approval_status === 'rejected'

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fbfbfb] px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-[#f2f3f4] bg-white p-8 shadow-[0px_0px_24px_-4px_rgba(0,0,0,0.05)]">
        <h1 className="text-[24px] font-bold leading-tight text-[#323232]">
          {rejected ? 'Aðgangur hafnaður' : 'Beðið eftir samþykki'}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[#666]">
          {rejected
            ? 'Stjórnandi hafnaði beiðni um aðgang. Hafðu samband ef þetta er mistök.'
            : 'Nýskráning þín hefur borist. Þegar stjórnandi hefur samþykkt aðganginn geturðu skráð þig inn og notað kerfið.'}
        </p>
        <p className="mt-4 text-[14px] leading-5 text-[#666]">
          (Stjórnandi uppfærir stöðuna í Supabase: töflan{' '}
          <code className="rounded bg-[#f3f5f7] px-1.5 py-0.5 text-[13px]">profiles</code>, dálkurinn{' '}
          <code className="rounded bg-[#f3f5f7] px-1.5 py-0.5 text-[13px]">approval_status</code> →{' '}
          <span className="font-medium text-[#323232]">approved</span>.)
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-[#e6e8e9] bg-white"
            onClick={() => signOut().then(() => navigate('/innskraning', { replace: true }))}
          >
            Skrá út
          </Button>
        </div>
      </div>
    </div>
  )
}
