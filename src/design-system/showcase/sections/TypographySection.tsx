import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import { typography } from '../../tokens'
import { DsCodeBlock } from '../components/DsCodeBlock'
import { DsSectionHeader } from '../components/DsSectionHeader'

const ICE = 'Holtsgata 24 — húsfélag með íslensku viðmóti.'

const SIZE_USAGE: Record<number, string> = {
  36: 'Síðutitlar og stór fyrirsögn',
  32: 'Kafli og áberandi fyrirsögn',
  24: 'Kortatitlar og undirkaflar',
  20: 'Undirfyrirsögn og valmynd',
  18: 'Aðaltexti í sumum skjám',
  16: 'Meginmál og hnappatexti (miðstærð)',
  14: 'Lýsingar, reitir og töflur',
  12: 'Smáletur og fótspor',
  10: 'Örmerki og lágmarks texti',
}

export function TypographySection() {
  const [openCode, setOpenCode] = React.useState<number | null>(null)

  return (
    <section id="letur" className="scroll-mt-24 space-y-12 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="🔤"
        title="Letur"
        description="Leturgerð, stærðarskali og þyngdir — samræmt Geist og beitingum í verkefninu."
      />

      <div className="rounded-3xl border border-[#e8eaee] bg-white p-6 shadow-sm sm:p-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#666]">Leturgerð</h3>
        <p className="mt-2 text-2xl font-semibold text-[#323232]">Sans serif (Geist Variable)</p>
        <p className="mt-2 font-mono text-sm text-[#666]">{typography.fontFamily.sans}</p>
        <p className="mt-6 text-4xl font-normal text-[#323232]">Aa Bb Cc Ðð Þþ 1234567890</p>
        <p className="mt-2 text-sm text-[#666]">Íslensk stafagerð og tölustafir.</p>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold text-[#323232]">Stærðarskali (píxlar)</h3>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Beinar beitingar með <code className="rounded bg-[#f3f5f7] px-1">text-[Npx]</code> eins og á síðum verkefnisins.
        </p>
        <div className="space-y-4">
          {[...typography.fontSizePx]
            .sort((a, b) => b - a)
            .map((px) => (
              <div
                key={px}
                className="rounded-2xl border border-[#e8eaee] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#666]">{px}px</p>
                    <p className="mt-2 text-[#323232]" style={{ fontSize: `${px}px`, lineHeight: 1.3 }}>
                      {ICE}
                    </p>
                    <p className="mt-3 text-sm text-[#666]">{SIZE_USAGE[px] ?? 'Beiting í sérsniðnum hlutum'}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#e8eaee] bg-[#fbfbfc] px-3 py-1.5 text-xs font-medium text-[#18325a] transition-colors hover:bg-[#f3f5f7]"
                    onClick={() => setOpenCode((x) => (x === px ? null : px))}
                    aria-expanded={openCode === px}
                  >
                    Sýna kóða
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', openCode === px && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                </div>
                {openCode === px ? (
                  <div className="mt-4">
                    <DsCodeBlock label="Tailwind" code={`className="text-[${px}px] leading-snug"`} />
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Tailwind text-* í notkun</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {typography.fontSizeUtility.map((u) => (
            <div
              key={u}
              className="rounded-2xl border border-[#e8eaee] bg-white p-5 text-[#323232] shadow-sm"
            >
              <code className="text-xs text-[#18325a]">{u}</code>
              <p className={cn('mt-3', u)}>{ICE}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Þyngdir</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {typography.fontWeight.map((w) => (
            <div key={w} className="rounded-2xl border border-[#e8eaee] bg-white p-5 shadow-sm">
              <p
                className={cn(
                  'text-lg text-[#323232]',
                  w === 'normal' && 'font-normal',
                  w === 'medium' && 'font-medium',
                  w === 'semibold' && 'font-semibold',
                  w === 'bold' && 'font-bold',
                )}
              >
                {w === 'normal' && 'Venjuleg (400)'}
                {w === 'medium' && 'Miðlungs (500)'}
                {w === 'semibold' && 'Halffeitt (600)'}
                {w === 'bold' && 'Feitt (700)'}
              </p>
              <p className="mt-2 text-sm text-[#666]">font-{w}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6">
        <h3 className="text-sm font-semibold text-amber-950">Villuskilaboð í formum</h3>
        <p className={cn('mt-2 text-sm', typography.validationMessageClass)}>
          Dæmi um villutexta (Fundir o.fl.)
        </p>
        <code className="mt-2 inline-block text-xs text-amber-900/80">{typography.validationMessageClass}</code>
      </div>
    </section>
  )
}
