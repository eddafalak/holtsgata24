import { spacing } from '../../tokens'
import { DsCodeBlock } from '../components/DsCodeBlock'
import { DsSectionHeader } from '../components/DsSectionHeader'

import { useDsCopy } from '../hooks/useDsCopy'
import { Button } from '@/components/ui/button'

function SpacingTile({ px, label }: { px: number; label: string }) {
  const { copy, lastCopied } = useDsCopy()
  const id = `sp-${px}`
  const copied = lastCopied === id
  return (
    <button
      type="button"
      onClick={() => copy(`${px}px`, id)}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e8eaee] bg-white p-4 text-center transition-all duration-200 hover:border-[#18325a]/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18325a]/30"
    >
      <div
        className="rounded-md bg-[#18325a]/85 transition-transform duration-200 group-hover:scale-105"
        style={{ width: Math.max(px, 4), height: Math.max(px, 4) }}
        aria-hidden
      />
      <div>
        <p className="text-sm font-semibold text-[#323232]">{label}</p>
        <p className="text-xs text-[#666]">{px}px</p>
        {copied ? <p className="mt-1 text-xs text-emerald-700">Afritað</p> : null}
      </div>
    </button>
  )
}

const PATTERN_DESC: Record<string, string> = {
  mainPadding: 'Aðalpadding innihalds í AppLayout',
  cardPadding: 'Innri bil í kortum og gluggum',
  cardGap: 'Bil milli korta í röðum',
  sectionGap: 'Bil milli undirkafla',
  stackTight: 'Þétt staflað innihald',
  popoverOffset: 'Frávik popover miðað við takka',
}

export function SpacingSection() {
  return (
    <section id="bil" className="scroll-mt-24 space-y-12 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="📏"
        title="Bil"
        description="Bilskali og nefnd gildi fyrir margin, padding og gap — samræmt mynstri í kóðanum."
      />

      <div>
        <h3 className="mb-2 text-lg font-semibold text-[#323232]">Skali (píxlar)</h3>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Algeng gildi úr beitingum. Smelltu til að afrita gildið sem streng með „px“.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {spacing.arbitraryPx.map((px) => (
            <SpacingTile key={px} px={px} label={`${px}`} />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#e8eaee] bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-[#323232]">Nefnd bil (semantic)</h3>
        <p className="mt-2 max-w-2xl text-sm text-[#666]">
          Fastar úr <code className="rounded bg-[#f3f5f7] px-1">spacing.patterns</code> og{' '}
          <code className="rounded bg-[#f3f5f7] px-1">spacing.named</code>.
        </p>
        <ul className="mt-8 space-y-4">
          {Object.entries(spacing.patterns).map(([k, v]) => (
            <li
              key={k}
              className="flex flex-col gap-2 rounded-xl border border-[#f2f3f4] bg-[#fbfbfc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <code className="text-sm font-semibold text-[#18325a]">{k}</code>
                <p className="mt-1 text-sm text-[#666]">{PATTERN_DESC[k] ?? 'Mynstur úr hönnun'}</p>
              </div>
              <code className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm text-[#323232] ring-1 ring-[#e8eaee]">
                {v}
              </code>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Breiddir og hæðir (named)</h3>
        <div className="overflow-hidden rounded-2xl border border-[#e8eaee] bg-white">
          <ul className="divide-y divide-[#f2f3f4]">
            {Object.entries(spacing.named).map(([k, v]) => (
              <li key={k} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <code className="text-sm text-[#18325a]">{k}</code>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-[#323232]">{v}</span>
                  <CopyNamedValue value={v} name={k} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DsCodeBlock
        label="Dæmi"
        code={`// padding í aðalsvæði\nclassName="p-[32px]"  // spacing.patterns.mainPadding`}
      />
    </section>
  )
}

function CopyNamedValue({ value, name }: { value: string; name: string }) {
  const { copy, lastCopied } = useDsCopy()
  const copied = lastCopied === name
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 text-xs text-[#666]"
      onClick={() => copy(value, name)}
    >
      {copied ? 'Afritað' : 'Afrita'}
    </Button>
  )
}
