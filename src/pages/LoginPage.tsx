import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

type Mode = 'login' | 'register'

export function LoginPage() {
  const navigate = useNavigate()
  const { session, profile, loading, signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registerNotice, setRegisterNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session && isSupabaseConfigured()) {
      const s = profile?.approval_status
      if (s === 'approved' || s === undefined) {
        navigate('/', { replace: true })
      } else if (s === 'pending' || s === 'rejected') {
        navigate('/biða-eftir-samþykki', { replace: true })
      }
    }
    if (!loading && session && !isSupabaseConfigured()) {
      navigate('/', { replace: true })
    }
  }, [loading, session, profile, navigate])

  const inputClass =
    'w-full rounded-md border border-[#d0d0d0] px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-[#18325a] focus:border-[#18325a]'

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setRegisterNotice(null)

    if (!isSupabaseConfigured()) {
      navigate('/', { replace: true })
      return
    }

    setSubmitting(true)
    try {
      await signInWithPassword(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Innskráning mistókst.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setRegisterNotice(null)

    if (!isSupabaseConfigured()) {
      navigate('/', { replace: true })
      return
    }

    if (password !== confirmPassword) {
      setError('Lykilorðin stemma ekki.')
      return
    }
    if (password.length < 6) {
      setError('Lykilorð verður að vera að minnsta kosti 6 stafir.')
      return
    }

    setSubmitting(true)
    try {
      const { needsEmailConfirm } = await signUp(email.trim(), password, fullName.trim())
      if (needsEmailConfirm) {
        setRegisterNotice(
          'Skráning tókst. Staðfestu netfang í tölvupósti áður en þú skráir þig inn. Þegar stjórnandi hefur samþykkt aðganginn geturðu notað kerfið.',
        )
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      } else {
        navigate('/biða-eftir-samþykki', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nýskráning mistókst.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#666]">
        Sæki…
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-start">
      <div className="flex w-full max-w-[1440px] min-h-screen text-[#323232]">
        <div className="hidden md:block flex-1 basis-1/2 bg-[#18325a]" />

        <div className="flex-1 basis-1/2 flex items-center justify-start px-6 py-16 md:px-24 lg:px-32">
          <div className="w-full max-w-[720px] space-y-10 text-left">
            <div className="space-y-1">
              <h1 className="text-[32px] md:text-[36px] font-bold leading-snug">
                {mode === 'login' ? 'Innskráning' : 'Nýskráning'}
              </h1>
              <p className="text-[20px] leading-snug text-[#323232]">hjá Holtsgötu 24</p>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6 max-w-sm">
                <div className="space-y-2">
                  <h2 className="text-[20px] font-bold leading-tight">Auðkenning</h2>
                  <p className="text-[16px] leading-relaxed text-[#323232]">
                    {isSupabaseConfigured()
                      ? 'Skráðu þig inn með netfangi og lykilorði.'
                      : 'Án Supabase stillinga ferðu beint inn (aðeins til prófunar).'}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Netfang</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="thitt@netfang.is"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Lykilorð</label>
                  <input
                    type="password"
                    required={isSupabaseConfigured()}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="current-password"
                  />
                </div>

                {error ? (
                  <p className="text-[14px] text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#dfffb4] hover:bg-[#cdf28c] disabled:opacity-60 text-black rounded-md py-3.5 px-6 text-[16px] font-semibold transition-colors"
                >
                  {submitting ? 'Skrái inn…' : isSupabaseConfigured() ? 'Skrá inn' : 'Fara á stjórnborð'}
                </button>

                <div className="mt-6 border-t border-[#e8eaee] pt-6 text-center">
                  <p className="text-[15px] text-[#323232]">Don&apos;t have an account?</p>
                  <button
                    type="button"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-[#18325a] bg-white px-4 py-3 text-[15px] font-semibold text-[#18325a] transition-colors hover:bg-[#18325a]/5"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setRegisterNotice(null)
                    }}
                  >
                    Skráðu þig hér
                  </button>
                  {!isSupabaseConfigured() ? (
                    <p className="mt-3 text-left text-[13px] leading-relaxed text-[#666]">
                      Til raunverulegrar nýskráningar þarftu að setja{' '}
                      <code className="rounded bg-[#f3f5f7] px-1">VITE_SUPABASE_URL</code> og{' '}
                      <code className="rounded bg-[#f3f5f7] px-1">VITE_SUPABASE_ANON_KEY</code> í .env.local.
                    </p>
                  ) : null}
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5 max-w-sm">
                <div className="space-y-2">
                  <h2 className="text-[20px] font-bold leading-tight">Búa til aðgang</h2>
                  <p className="text-[16px] leading-relaxed text-[#323232]">
                    Fylltu út reitina. Stjórnandi samþykkir aðgang áður en þú getur notað kerfið að fullu.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Fullt nafn</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Jón Jónsson"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Netfang</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="thitt@netfang.is"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Lykilorð</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#323232]">Staðfesta lykilorð</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>

                {error ? (
                  <p className="text-[14px] text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                {registerNotice ? (
                  <p className="rounded-md border border-[#e6e8e9] bg-[#fbfbfb] px-3 py-2 text-[14px] leading-relaxed text-[#323232]">
                    {registerNotice}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#18325a] hover:bg-[#162b47] disabled:opacity-60 text-white rounded-md py-3.5 px-6 text-[16px] font-semibold transition-colors"
                >
                  {submitting ? 'Sendi skráningu…' : 'Senda beiðni um aðgang'}
                </button>

                <p className="text-center text-[15px] text-[#666]">
                  Þegar með aðgang?{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#18325a] underline underline-offset-2 hover:text-[#162b47]"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setRegisterNotice(null)
                    }}
                  >
                    Skráðu þig inn
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
