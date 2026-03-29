import { borders, shadows } from '../../tokens'
import { DsSectionHeader } from '../components/DsSectionHeader'
import { DsSwatch } from '../components/DsSwatch'

import { useDsCopy } from '../hooks/useDsCopy'
import { Button } from '@/components/ui/button'

export function BordersSection() {
  return (
    <section id="rammar" className="scroll-mt-24 space-y-12 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="🔲"
        title="Rammar og skuggar"
        description="Hornradíus, rammlitir og skuggar eins og þeir koma fram í kerfinu."
      />

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Horn (fastar)</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(borders.radiusPx).map(([k, v]) => (
            <div
              key={k}
              className="flex flex-col gap-3 rounded-2xl border border-[#e8eaee] bg-white p-6 shadow-sm"
              style={{ borderRadius: v }}
            >
              <div className="h-16 rounded-[inherit] bg-[#f3f5f7]" />
              <div>
                <p className="font-semibold text-[#323232]">radiusPx.{k}</p>
                <code className="text-sm text-[#666]">{v}</code>
              </div>
              <CopyShadow value={v} label={`radiusPx.${k}`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Tailwind rounded-*</h3>
        <div className="flex flex-wrap gap-3">
          {borders.radiusUtility.map((c) => (
            <code
              key={c}
              className="rounded-xl border border-[#e8eaee] bg-white px-4 py-2 text-sm text-[#18325a] shadow-sm"
            >
              {c}
            </code>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Rammlitir</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          {Object.entries(borders.borderColor).map(([k, v]) => (
            <DsSwatch
              key={k}
              name={`borderColor.${k}`}
              hex={v}
              size="md"
              description="Notaður í kortum, reitum eða innskráningu."
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Skuggar</h3>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Box-shadow strengir úr <code className="rounded bg-[#f3f5f7] px-1">shadows.*</code> — smelltu til að afrita.
        </p>
        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-3">
          {Object.entries(shadows).map(([k, v]) => (
            <div
              key={k}
              className="rounded-2xl border border-[#e8eaee] bg-white p-8 transition-shadow duration-200"
              style={{ boxShadow: v }}
            >
              <p className="text-base font-semibold text-[#323232]">shadows.{k}</p>
              <p className="mt-3 break-all text-xs leading-relaxed text-[#666]">{v}</p>
              <div className="mt-4">
                <CopyShadow value={v} label={k} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CopyShadow({ value, label }: { value: string; label: string }) {
  const { copy, lastCopied } = useDsCopy()
  const copied = lastCopied === label
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-[#e8eaee] text-[#323232]"
      onClick={() => copy(value, label)}
    >
      {copied ? 'Afritað' : 'Afrita gildi'}
    </Button>
  )
}
