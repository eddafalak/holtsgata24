import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Temporarily skip real auth and go straight to dashboard
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-start">
      {/* Innihald er takmarkað við 1440px en fyllir samt skjáinn */}
      <div className="flex w-full max-w-[1440px] min-h-screen text-[#323232]">
        {/* Vinstri helmingur – dökkblár flötur */}
        <div className="hidden md:block flex-1 basis-1/2 bg-[#18325a]" />

        {/* Hægri helmingur – innihald */}
        <div className="flex-1 basis-1/2 flex items-center justify-start px-6 py-16 md:px-24 lg:px-32">
          <div className="w-full max-w-[720px] space-y-16 text-left">
          {/* Titill */}
          <div className="space-y-1">
            <h1 className="text-[32px] md:text-[36px] font-bold leading-snug">
              Innskráning
            </h1>
            <p className="text-[20px] leading-snug text-[#323232]">
              hjá Holtsgötu 24
            </p>
          </div>

          {/* Texti + form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-[20px] font-bold leading-tight">Auðkenning</h2>
              <p className="text-[16px] md:text-[18px] leading-relaxed text-[#323232]">
                Sláðu inn netfangið þitt (aðeins til sýnis eins og er).
              </p>
            </div>

            <div className="space-y-3 max-w-sm">
              <label className="block text-sm font-medium text-[#323232]">
                Netfang
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#d0d0d0] px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-[#18325a] focus:border-[#18325a]"
                placeholder="thitt@netfang.is"
              />
            </div>

            <div className="space-y-3 max-w-sm">
              <button
                type="submit"
                className="w-full bg-[#dfffb4] hover:bg-[#cdf28c] text-black rounded-md py-3.5 px-6 text-[16px] font-semibold transition-colors"
              >
                Fara á stjórnborð
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}

