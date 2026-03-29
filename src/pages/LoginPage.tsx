import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

type Mode = 'login' | 'register'

function BorderedField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex h-[58px] flex-col justify-center rounded-[var(--radius-input)] border border-[#ccc] px-[16px] py-2 transition-shadow focus-within:border-[#18325a] focus-within:ring-2 focus-within:ring-[#18325a]">
      <label htmlFor={id} className="text-xs font-medium text-[#666]">
        {label}
      </label>
      {children}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { session, profile, loading, signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [infoNotice, setInfoNotice] = useState<string | null>(null)
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

  const inputInnerClass =
    'w-full border-0 bg-transparent p-0 text-base leading-6 text-[#323232] outline-none ring-0 placeholder:text-[#999]'

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setRegisterNotice(null)
    setInfoNotice(null)

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
    setInfoNotice(null)

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

  async function handleForgotPassword() {
    setError(null)
    setInfoNotice(null)
    if (!isSupabaseConfigured()) {
      setError('Endurstilling krefst Supabase stillinga.')
      return
    }
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Sláðu inn netfang til að fá endurstillingarpóst.')
      return
    }
    setSubmitting(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/innskraning`,
      })
      if (resetErr) throw resetErr
      setInfoNotice('Ef netfangið er skráð hjá okkur færðu tölvupóst með leiðbeiningum.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tókst ekki að senda endurstillingarpóst.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] p-4 text-[#323232]">
      <div className="flex min-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-white md:flex-row">
        <div
          className="m-2 h-24 shrink-0 rounded-[8px] bg-[#18325a] md:hidden"
          aria-hidden
        />

        <div className="flex flex-1 flex-col justify-center p-4 md:w-1/2">
          <div className="mx-auto w-full max-w-[360px] space-y-8">
            <h1 className="text-center text-[32px] font-medium leading-tight tracking-tight">
              {mode === 'login' ? 'Innskráning' : 'Nýskráning'}
            </h1>

            {loading ? (
              <p className="rounded-lg border border-[#e6e8e9] bg-[#fbfbfb] px-3 py-2 text-[13px] text-[#323232]">
                Athuga innskráningu…
              </p>
            ) : null}

            {mode === 'login' ? (
              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <BorderedField id="login-email" label="Notandanafn eða netfang">
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputInnerClass}
                      placeholder=""
                      autoComplete="email"
                    />
                  </BorderedField>

                  <div className="space-y-2">
                    <BorderedField id="login-password" label="Lykilorð">
                      <input
                        id="login-password"
                        type="password"
                        required={isSupabaseConfigured()}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputInnerClass}
                        autoComplete="current-password"
                      />
                    </BorderedField>
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading || submitting || !isSupabaseConfigured()}
                        className="text-xs font-medium text-[#18325a] underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                      >
                        Gleymt lykilorð?
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <p className="text-[14px] text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  {infoNotice ? (
                    <p className="text-[14px] leading-relaxed text-[#323232]" role="status">
                      {infoNotice}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading || submitting}
                    className="h-11 w-full rounded-[8px] bg-[#18325a] text-[15px] font-medium text-white transition-colors hover:bg-[#162b47] disabled:opacity-60"
                  >
                    {submitting ? 'Skrái inn…' : isSupabaseConfigured() ? 'Skrá inn' : 'Fara á stjórnborð'}
                  </button>
                </form>

                <div className="flex flex-col gap-[16px] border-t border-[#e8eaee] pt-6 text-center">
                  <p className="m-0 text-[15px] text-[#666]">Ekki með aðgang?</p>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-[8px] border border-[#18325a] bg-white px-4 py-3 text-[15px] font-medium text-[#18325a] transition-colors hover:bg-[#18325a]/5"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setRegisterNotice(null)
                      setInfoNotice(null)
                    }}
                  >
                    Skráðu þig hér
                  </button>
                  {!isSupabaseConfigured() ? (
                    <p className="text-left text-[13px] leading-relaxed text-[#666]">
                      Til raunverulegrar nýskráningar þarftu að setja{' '}
                      <code className="rounded bg-[#f3f5f7] px-1">VITE_SUPABASE_URL</code> og{' '}
                      <code className="rounded bg-[#f3f5f7] px-1">VITE_SUPABASE_ANON_KEY</code> í .env.local.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-center text-[15px] leading-relaxed text-[#666]">
                  Fylltu út reitina. Stjórnandi samþykkir aðgang áður en þú getur notað kerfið að fullu.
                </p>

                <BorderedField id="reg-name" label="Fullt nafn">
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputInnerClass}
                    autoComplete="name"
                  />
                </BorderedField>

                <BorderedField id="reg-email" label="Netfang">
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputInnerClass}
                    autoComplete="email"
                  />
                </BorderedField>

                <BorderedField id="reg-password" label="Lykilorð">
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputInnerClass}
                    autoComplete="new-password"
                  />
                </BorderedField>

                <BorderedField id="reg-confirm" label="Staðfesta lykilorð">
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputInnerClass}
                    autoComplete="new-password"
                  />
                </BorderedField>

                {error ? (
                  <p className="text-[14px] text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                {registerNotice ? (
                  <p className="rounded-lg border border-[#e6e8e9] bg-[#fbfbfb] px-3 py-2 text-[14px] leading-relaxed text-[#323232]">
                    {registerNotice}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || submitting}
                  className="h-11 w-full rounded-[8px] bg-[#18325a] text-[15px] font-medium text-white transition-colors hover:bg-[#162b47] disabled:opacity-60"
                >
                  {submitting ? 'Sendi skráningu…' : 'Senda beiðni um aðgang'}
                </button>

                <p className="text-center text-[15px] text-[#666]">
                  Þegar með aðgang?{' '}
                  <button
                    type="button"
                    className="font-medium text-[#18325a] underline underline-offset-2 hover:text-[#162b47]"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setRegisterNotice(null)
                      setInfoNotice(null)
                    }}
                  >
                    Skráðu þig inn
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <div
          className="hidden min-h-0 flex-1 rounded-[8px] bg-[#18325a] md:m-2 md:block"
          aria-hidden
        />
      </div>
    </div>
  )
}
