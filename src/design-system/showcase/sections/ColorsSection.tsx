import { colors, describeSemanticColorSource } from '../../tokens'
import { DsCopyActions } from '../components/DsSwatch'
import { DsDisclosure } from '../components/DsDisclosure'
import { DsSectionHeader } from '../components/DsSectionHeader'
import { DsSwatch, DsSwatchCompact } from '../components/DsSwatch'
import { hexToRgbString } from '../lib/colorUtils'
import { ButtonColorSpecTables, ButtonSizeSpecTable } from '../panels/ButtonTokensPanel'

import { useDsCopy } from '../hooks/useDsCopy'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BLUE_ORDER = ['900', '800', '700', '600', '500', '400', '300', '200', '100', '50'] as const
const GRAY_ORDER = ['700', '600', '500', '400', '300', '200', '100'] as const

type SemanticGroupKey = keyof typeof colors.semanticColorTokens

const SEMANTIC_GROUPS: {
  group: SemanticGroupKey
  title: string
  rows: { key: string; label: string }[]
}[] = [
  {
    group: 'text',
    title: 'Text',
    rows: [
      { key: 'default', label: 'Default' },
      { key: 'placeholder', label: 'Placeholder' },
    ],
  },
  {
    group: 'border',
    title: 'Border',
    rows: [
      { key: 'default', label: 'default' },
      { key: 'dark', label: 'dark' },
    ],
  },
  {
    group: 'surface',
    title: 'Surface',
    rows: [
      { key: 'page', label: 'Page' },
      { key: 'card', label: 'Card' },
    ],
  },
  {
    group: 'cards',
    title: 'Cards',
    rows: [
      { key: 'default', label: 'Card' },
      { key: 'table', label: 'Table card' },
      { key: 'active', label: 'Active card' },
    ],
  },
  {
    group: 'tags',
    title: 'Tags',
    rows: [
      { key: 'light', label: 'Light' },
      { key: 'dark', label: 'dark' },
    ],
  },
  {
    group: 'icon',
    title: 'Icon',
    rows: [{ key: 'default', label: 'Default' }],
  },
]

const MERKINGAR = [
  {
    name: 'Staðfesting',
    hex: '#059669',
    token: 'emerald-600',
    desc: 'Jákvæð skilaboð og staðfesting aðgerða (hægt að nota Tailwind eða samsvarandi lit).',
  },
  {
    name: 'Viðvörun',
    hex: colors.brandColors.appelsinugulur,
    token: 'brandColors.appelsinugulur',
    desc: 'Athygli, biðstöður og viðvaranir — sami litur og „væntanlegur“ í kerfinu.',
  },
  {
    name: 'Villa',
    hex: '#DC2626',
    token: 'red-600 / destructive',
    desc: 'Villuskilaboð í formum og hættulegar aðgerðir.',
  },
] as const

function SemanticTokenRow({
  label,
  path,
  value,
}: {
  label: string
  path: string
  value: string
}) {
  const { copy, lastCopied } = useDsCopy()
  const copied = lastCopied === path
  return (
    <li className="flex flex-col gap-3 border-b border-[#f2f3f4] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span
          className="h-12 w-12 shrink-0 rounded-xl border border-[#e6e8e9] shadow-sm"
          style={{ background: value }}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-medium text-[#323232]">{label}</p>
          <code className="mt-0.5 block truncate text-xs text-[#18325a]">{path}</code>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <code className="rounded-lg bg-[#f3f5f7] px-2 py-1 text-xs text-[#323232]">{value}</code>
        <span className="text-xs text-[#666]">→ {describeSemanticColorSource(value)}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-[#666]"
          onClick={() => copy(value, path)}
        >
          <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
          {copied ? 'Afritað' : 'Afrita'}
        </Button>
      </div>
    </li>
  )
}

export function ColorsSection() {
  const primary = colors.brandColors.blar
  const rgb = hexToRgbString(primary)

  return (
    <section id="litir" className="scroll-mt-24 space-y-12 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="🎨"
        title="Litir"
        description="Tákn og skalar fyrir Holtsgötu 24 — aðallitur, grár og blár skali, merkingar og leiðbeiningar."
      />

      {/* Primary hero */}
      <div className="rounded-3xl border border-[#e8eaee] bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div
            className="mx-auto flex h-44 w-full max-w-[200px] shrink-0 items-center justify-center rounded-2xl border border-black/10 shadow-inner sm:mx-0 sm:h-[200px] sm:w-[200px]"
            style={{ backgroundColor: primary }}
          >
            <span className="sr-only">Aðallitur</span>
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-[#666]">Aðallitur</p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-[#323232]">{primary}</p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-[#666]">
                Aðallitur húsfélagsins. Notaður fyrir aðalhnappa, virka val í leiðsögn og áherslu. Í kóða:{' '}
                <code className="rounded-md bg-[#f3f5f7] px-1.5 py-0.5 text-sm text-[#18325a]">
                  colors.brandColors.blar
                </code>{' '}
                eða CSS-breytan <code className="rounded-md bg-[#f3f5f7] px-1.5 py-0.5 text-sm">--primary</code>.
              </p>
            </div>
            <DsCopyActions hex={primary} rgb={rgb} id="primary-hero" />
          </div>
        </div>
      </div>

      {/* Brand secondary */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Vörumerkjalitir</h3>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Auk litanna við hinn bláa — gulur fyrir virkni og appelsínugulur fyrir stöðu og athygli.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <DsSwatch
            size="lg"
            name="Gulur — áhersla"
            hex={colors.brandColors.gulur}
            tokenPath="colors.brandColors.gulur"
            description="Virkir flipar, áhersla á innskráningu og samspil við dökkbláan."
          />
          <DsSwatch
            size="lg"
            name="Appelsínugulur"
            hex={colors.brandColors.appelsinugulur}
            tokenPath="colors.brandColors.appelsinugulur"
            description="Ástand, tilkynningar og „væntanlegur“ — sami og semantic.upcoming."
          />
        </div>
      </div>

      {/* Merkingar */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Merkingar í viðmóti</h3>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Algeng merking — samræmdu við texta og ikon svo notendur skilji stöðu strax.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {MERKINGAR.map((m) => (
            <div
              key={m.name}
              className="flex flex-col rounded-2xl border border-[#e8eaee] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div
                className="mb-4 h-24 w-full rounded-xl border border-black/5"
                style={{ backgroundColor: m.hex }}
                aria-hidden
              />
              <p className="text-base font-semibold text-[#323232]">{m.name}</p>
              <code className="mt-1 text-sm font-mono text-[#18325a]">{m.hex}</code>
              <code className="mt-0.5 text-xs text-[#666]">{m.token}</code>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#666]">{m.desc}</p>
              <div className="mt-4">
                <DsCopyActions hex={m.hex} id={`merking-${m.name}`} rgb={hexToRgbString(m.hex)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text / gray semantic quick ref */}
      <div className="rounded-2xl border border-[#e8eaee] bg-[#fbfbfc] p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-[#323232]">Texti og grár í UI</h3>
        <p className="mt-2 max-w-2xl text-sm text-[#666]">
          Algengir litir úr <code className="rounded bg-white px-1">colors.gray.*</code> sem koma oft við í síðum.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li className="flex items-center gap-3 rounded-xl border border-[#e8eaee] bg-white px-4 py-3">
            <span className="h-4 w-4 rounded-full ring-2 ring-[#e8eaee]" style={{ background: colors.gray.heading }} />
            <div>
              <p className="text-sm font-medium text-[#323232]">Aðaltexti</p>
              <code className="text-xs text-[#666]">gray.heading · {colors.gray.heading}</code>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-[#e8eaee] bg-white px-4 py-3">
            <span className="h-4 w-4 rounded-full ring-2 ring-[#e8eaee]" style={{ background: colors.gray.muted }} />
            <div>
              <p className="text-sm font-medium text-[#323232]">Aukatexti</p>
              <code className="text-xs text-[#666]">gray.muted · {colors.gray.muted}</code>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-[#e8eaee] bg-white px-4 py-3">
            <span className="h-4 w-4 rounded-full ring-2 ring-[#e8eaee]" style={{ background: colors.gray.canvas }} />
            <div>
              <p className="text-sm font-medium text-[#323232]">Bakgrunnur síðu</p>
              <code className="text-xs text-[#666]">gray.canvas · {colors.gray.canvas}</code>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-[#e8eaee] bg-white px-4 py-3">
            <span className="h-4 w-4 rounded-full ring-2 ring-[#e8eaee]" style={{ background: colors.gray.inputBorder }} />
            <div>
              <p className="text-sm font-medium text-[#323232]">Rammi reita</p>
              <code className="text-xs text-[#666]">gray.inputBorder · {colors.gray.inputBorder}</code>
            </div>
          </li>
        </ul>
      </div>

      {/* Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Gott að gera</h3>
          <ul className="mt-4 space-y-2 text-sm text-emerald-950/90">
            <li>• Nota aðallit fyrir aðal-CTA og mikilvægar leiðir.</li>
            <li>• Halda miklum mun á texta og bakgrunni (WCAG AA þar sem við á).</li>
            <li>• Nota merkingarlit samviskusamlega með skýrum texta.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-900">Forðast</h3>
          <ul className="mt-4 space-y-2 text-sm text-red-950/90">
            <li>• Nota aðallitann fyrir langan meginmálstexta.</li>
            <li>• Blanda of mörgum „háum“ litum í einn skjá án hvíts rýmis.</li>
            <li>• Treysta einungis á lit án texta eða ikons fyrir stöðu.</li>
          </ul>
        </div>
      </div>

      <DsDisclosure title="Bláir litir (skali)" summaryHint="Elleft tónar — smelltu til að opna. Dökkt → ljósast." defaultOpen={false}>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Notið <code className="rounded bg-[#f3f5f7] px-1">colors.blueColors.50</code>–
          <code className="rounded bg-[#f3f5f7] px-1">900</code>. Smelltu á reit til að afrita hex.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {BLUE_ORDER.map((w) => (
            <DsSwatchCompact
              key={w}
              label={`blueColors.${w}`}
              hex={colors.blueColors[w]}
              sublabel={`Vigt ${w}`}
            />
          ))}
        </div>
      </DsDisclosure>

      <DsDisclosure title="Gráir litir (skali)" summaryHint="Sjö stig — texti, flatir og rammar." defaultOpen={false}>
        <p className="mb-6 max-w-2xl text-sm text-[#666]">
          Köldur grár með bláum undirtón. <code className="rounded bg-[#f3f5f7] px-1">colors.grayColors.100</code>–
          <code className="rounded bg-[#f3f5f7] px-1">700</code>.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {GRAY_ORDER.map((w) => (
            <DsSwatchCompact
              key={w}
              label={`grayColors.${w}`}
              hex={colors.grayColors[w]}
              sublabel={`Vigt ${w}`}
            />
          ))}
        </div>
      </DsDisclosure>

      <DsDisclosure title="Litatákn (semantic)" summaryHint="Nöfn sem vísa í grunnliti — fyrir skipulagðan kóða." defaultOpen={false}>
        <p className="mb-6 text-sm text-[#666]">
          Notið t.d. <code className="rounded bg-[#f3f5f7] px-1">colors.semanticColorTokens.border.default</code>.
        </p>
        <div className="space-y-6">
          {SEMANTIC_GROUPS.map(({ group, title, rows }) => {
            const bucket = colors.semanticColorTokens[group] as Record<string, string>
            return (
              <div key={group} className="rounded-2xl border border-[#e8eaee] bg-white px-4 sm:px-6">
                <p className="border-b border-[#f2f3f4] py-3 text-sm font-semibold text-[#323232]">{title}</p>
                <ul>
                  {rows.map((r) => (
                    <SemanticTokenRow
                      key={r.key}
                      label={r.label}
                      path={`semanticColorTokens.${group}.${r.key}`}
                      value={bucket[r.key]}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </DsDisclosure>

      <DsDisclosure title="Hnappar — litir og stærðir" summaryHint="Figma Button MS og kóðasamsvörun." defaultOpen={false}>
        <p className="mb-6 text-sm text-[#666]">
          Filled → <code className="rounded bg-[#f3f5f7] px-1">variant=&quot;default&quot;</code>, ghost, outline, light →{' '}
          <code className="rounded bg-[#f3f5f7] px-1">secondary</code>. Skilgreint í{' '}
          <code className="rounded bg-[#f3f5f7] px-1">tokens/buttons.ts</code>.
        </p>
        <div className="space-y-8">
          <ButtonSizeSpecTable />
          <ButtonColorSpecTables />
        </div>
      </DsDisclosure>

      {/* Text litir from textColors */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#323232]">Textalitir (tokens)</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <DsSwatch
            name="textColors.black"
            hex={colors.textColors.black}
            tokenPath="colors.textColors.black"
            description="Aðaltexti samkvæmt hönnun."
            size="md"
          />
          <DsSwatch
            name="textColors.placeholder"
            hex={colors.textColors.placeholder}
            tokenPath="colors.textColors.placeholder"
            description="Placeholder og hjálpartexti."
            size="md"
          />
          <DsSwatch
            name="textColors.light"
            hex={colors.textColors.light}
            tokenPath="colors.textColors.light"
            description="Ljós texti á dökkum bakgrunni."
            size="md"
          />
        </div>
      </div>
    </section>
  )
}
