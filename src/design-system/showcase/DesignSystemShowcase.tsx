import * as React from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Copy, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import {
  borders,
  colors,
  describeSemanticColorSource,
  shadows,
  spacing,
  typography,
} from '../tokens'
import { theme } from '../theme/theme'

const ICE_SAMPLE =
  'Ísland — Holtsgata 24. Húsfélagið notar íslenskt viðmót og aðallitinn #18325A fyrir aðgerðir.'

type SectionDef = { id: string; label: string; search: string }

/** Röðun eins og á litakvarða (dökkt → ljós). */
const GRAY_PALETTE_ORDER = ['700', '600', '500', '400', '300', '200', '100'] as const

const BLUE_PALETTE_ORDER = ['900', '800', '700', '600', '500', '400', '300', '200', '100', '50'] as const

const SECTIONS: SectionDef[] = [
  {
    id: 'litir',
    label: 'Litir',
    search:
      'litir primary vörumerki brand texti textalitir blár gulur appelsínugulur grár gráskali',
  },
  {
    id: 'color-tokens',
    label: 'Litatákn',
    search:
      'color tokens litatákn litatoken semantísk tákn text placeholder default border surface cards tags icon rammi flatur kort merki',
  },
  { id: 'letur', label: 'Letur', search: 'letur typography font stærð þyngd' },
  { id: 'bil', label: 'Bil', search: 'bil spacing padding margin gap' },
  { id: 'vidmot', label: 'Viðmótshlutar', search: 'hnappur kort dialog popover calendar' },
  { id: 'rammar', label: 'Rammar og skuggar', search: 'radius skuggar border shadow' },
  { id: 'uppsetning', label: 'Uppsetning', search: 'layout grid flex sidebar' },
]

function useCopyFeedback() {
  const [label, setLabel] = React.useState<string | null>(null)
  const copy = React.useCallback(async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLabel(name)
      window.setTimeout(() => setLabel(null), 1600)
    } catch {
      setLabel('Villa við afritun')
    }
  }, [])
  return { copy, feedback: label }
}

function CopyValueButton({ value, name }: { value: string; name: string }) {
  const { copy, feedback } = useCopyFeedback()
  return (
    <button
      type="button"
      onClick={() => copy(value, name)}
      className="inline-flex items-center gap-1 rounded-md border border-[#e6e8e9] bg-white px-2 py-1 text-xs text-[#323232] hover:bg-[#f7f8f9]"
      title="Afrita gildi"
    >
      <Copy className="h-3.5 w-3.5" />
      {feedback === name ? 'Afritað!' : 'Afrita'}
    </button>
  )
}

function ColorSwatch({
  name,
  value,
  description,
}: {
  name: string
  value: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#f2f3f4] bg-white p-3">
      <div
        className="h-16 w-full rounded-md border border-[#e6e8e9]"
        style={{ background: value }}
      />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#323232]">{name}</p>
        <code className="block text-xs text-[#666]">{value}</code>
        {description ? <p className="text-xs text-[#666]">{description}</p> : null}
      </div>
      <CopyValueButton value={value} name={name} />
    </div>
  )
}

function flattenColorRecord(
  prefix: string,
  record: Record<string, string>,
): { name: string; value: string }[] {
  return Object.entries(record).map(([k, v]) => ({
    name: `${prefix}.${k}`,
    value: v,
  }))
}

type SemanticTokenGroupKey = keyof typeof colors.semanticColorTokens

/** Röð og birtingarnöfn eins og í Figma (hópar + raðir). */
const COLOR_TOKEN_GROUPS: {
  group: SemanticTokenGroupKey
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

function ColorTokenGroupTable({
  title,
  rows,
}: {
  title: string
  rows: { label: string; path: string; value: string }[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#f2f3f4] bg-white">
      <div className="border-b border-[#f2f3f4] bg-[#fbfbfc] px-4 py-2.5 text-sm font-bold tracking-tight text-[#323232]">
        {title}
      </div>
      <ul className="divide-y divide-[#f2f3f4]">
        {rows.map((row) => (
          <li
            key={row.path}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className="h-9 w-9 shrink-0 rounded-md border border-[#e6e8e9]"
                style={{ background: row.value }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#323232]">{row.label}</p>
                <code className="mt-0.5 block truncate text-xs text-[#18325a]">{row.path}</code>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <code className="rounded bg-[#f2f3f4] px-2 py-0.5 text-xs text-[#323232]">{row.value}</code>
              <span className="text-xs text-[#666]">→ {describeSemanticColorSource(row.value)}</span>
              <CopyValueButton value={row.value} name={row.path} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DesignSystemShowcase() {
  const [query, setQuery] = React.useState('')
  const q = query.trim().toLowerCase()

  const visibleSections = React.useMemo(() => {
    if (!q) return SECTIONS
    return SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.search.toLowerCase().includes(q) ||
        s.id.includes(q),
    )
  }, [q])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const textColorsFlat = flattenColorRecord('textColors', colors.textColors as Record<string, string>)
  return (
    <div className="flex min-h-screen bg-[#fbfbfb] text-[#323232]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#f2f3f4] bg-white p-4 md:flex">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#666]">Hönnunarkerfi</p>
        <h1 className="mt-1 text-lg font-bold text-[#18325a]">Holtsgata 24</h1>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Leita…"
            className="w-full rounded-md border border-[#e6e8e9] py-2 pl-8 pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#18325a]/30"
            aria-label="Leita í köflum"
          />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
          {visibleSections.length === 0 ? (
            <p className="text-xs text-[#666]">Ekkert fannst.</p>
          ) : (
            visibleSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className="rounded-md px-3 py-2 text-left font-medium text-[#323232] hover:bg-[#f7f8f9]"
              >
                {s.label}
              </button>
            ))
          )}
        </nav>
        <Link
          to="/"
          className="mt-4 text-sm font-medium text-[#18325a] underline-offset-4 hover:underline"
        >
          ← Til baka á forsíðu
        </Link>
      </aside>

      <main className="min-w-0 flex-1 space-y-16 p-6 md:p-10">
        <header className="max-w-4xl space-y-2 border-b border-[#f2f3f4] pb-8">
          <h1 className="text-3xl font-bold text-[#18325a]">Hönnunarkerfi</h1>
          <p className="text-sm leading-relaxed text-[#666]">
            Vörumerkjalitir: blár, gulur og appelsínugulur — sjá köfluna hér að neðan. Aðeins annað sem
            kemur fram í kóðanum og skölunum.
          </p>
        </header>

        {(!q || visibleSections.some((s) => s.id === 'litir')) && (
          <section id="litir" className="scroll-mt-8 space-y-6">
            <h2 className="text-xl font-bold text-[#18325a]">Litir</h2>
            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Vörumerkjalitir</h3>
              <p className="mb-3 text-sm text-[#666]">
                Opinber þrenning — notið <code className="rounded bg-[#f2f3f4] px-1">colors.brandColors.blar</code>,{' '}
                <code className="rounded bg-[#f2f3f4] px-1">.gulur</code>,{' '}
                <code className="rounded bg-[#f2f3f4] px-1">.appelsinugulur</code>.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorSwatch
                  name="brandColors.blar"
                  value={colors.brandColors.blar}
                  description="Blár — aðallitur"
                />
                <ColorSwatch
                  name="brandColors.gulur"
                  value={colors.brandColors.gulur}
                  description="Gulur — áhersla"
                />
                <ColorSwatch
                  name="brandColors.appelsinugulur"
                  value={colors.brandColors.appelsinugulur}
                  description="Appelsínugulur — ástand / athygli"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Textalitir</h3>
              <p className="mb-3 text-sm text-[#666]">
                Notið <code className="rounded bg-[#f2f3f4] px-1">colors.textColors.*</code> eða{' '}
                <code className="rounded bg-[#f2f3f4] px-1">semanticColorTokens.text.*</code> fyrir hlutverk. Fyrir
                bláan texta notið <code className="rounded bg-[#f2f3f4] px-1">brandColors.blar</code>.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {textColorsFlat.map((c) => (
                  <ColorSwatch
                    key={c.name}
                    name={c.name}
                    value={c.value}
                    description={
                      c.name === 'textColors.black'
                        ? 'black — aðal svartur texti'
                        : c.name === 'textColors.placeholder'
                          ? 'placeholder — sami og grayColors.600 (sjá Litatákn → Text)'
                          : 'light — ljós texti á dökkum flat'
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Bláir litir (skali)</h3>
              <p className="mb-3 text-sm text-[#666]">
                Tíu stig frá dökkum (900) til næst hvítum (50). Notið{' '}
                <code className="rounded bg-[#f2f3f4] px-1">colors.blueColors.50</code>–
                <code className="rounded bg-[#f2f3f4] px-1">900</code>. Vörumerkjablár er{' '}
                <code className="rounded bg-[#f2f3f4] px-1">brandColors.blar</code> (#18325A); hover í
                kóða er oft <code className="rounded bg-[#f2f3f4] px-1">primary.hover</code>.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
                {BLUE_PALETTE_ORDER.map((w) => (
                  <ColorSwatch
                    key={w}
                    name={`blueColors.${w}`}
                    value={colors.blueColors[w]}
                    description={`Vigt ${w}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Gráir litir (skali)</h3>
              <p className="mb-3 text-sm text-[#666]">
                Köldur grár með bláum undirtón — samræmist aðallitnum. Notið{' '}
                <code className="rounded bg-[#f2f3f4] px-1">colors.grayColors.100</code>–
                <code className="rounded bg-[#f2f3f4] px-1">700</code>.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {GRAY_PALETTE_ORDER.map((w) => (
                  <ColorSwatch
                    key={w}
                    name={`grayColors.${w}`}
                    value={colors.grayColors[w]}
                    description={`Vigt ${w}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'color-tokens')) && (
          <section id="color-tokens" className="scroll-mt-8 space-y-6">
            <h2 className="text-xl font-bold text-[#18325a]">Litatákn</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-[#666]">
              Semantísk nöfn sem vísa í grunnliti (<code className="rounded bg-[#f2f3f4] px-1">grayColors</code>,{' '}
              <code className="rounded bg-[#f2f3f4] px-1">blueColors</code>) eða fasta hex — sama uppsetning og í
              Figma. Notið í kóða með{' '}
              <code className="rounded bg-[#f2f3f4] px-1">colors.semanticColorTokens.border.default</code> o.s.frv.
            </p>
            <div className="mx-auto max-w-3xl space-y-6">
              {COLOR_TOKEN_GROUPS.map(({ group, title, rows }) => {
                const bucket = colors.semanticColorTokens[group] as Record<string, string>
                return (
                  <ColorTokenGroupTable
                    key={group}
                    title={title}
                    rows={rows.map((r) => ({
                      label: r.label,
                      path: `semanticColorTokens.${group}.${r.key}`,
                      value: bucket[r.key],
                    }))}
                  />
                )
              })}
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'letur')) && (
          <section id="letur" className="scroll-mt-8 space-y-6">
            <h2 className="text-xl font-bold text-[#18325a]">Letur</h2>
            <p className="text-sm text-[#666]">
              {typography.fontFamily.sans} — sjá <code className="rounded bg-[#f2f3f4] px-1">index.css</code>{' '}
              @theme.
            </p>
            <div className="space-y-4 rounded-xl border border-[#f2f3f4] bg-white p-6">
              {typography.fontSizePx.map((px) => (
                <div key={px} className="border-b border-[#f2f3f4] pb-4 last:border-0 last:pb-0">
                  <p style={{ fontSize: `${px}px` }} className="font-medium text-[#323232]">
                    {ICE_SAMPLE}
                  </p>
                  <p className="mt-1 text-xs text-[#666]">
                    <code>text-[{px}px]</code> í síðum
                  </p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#323232]">Tailwind text-* í síðum</h3>
              <div className="flex flex-wrap gap-3">
                {typography.fontSizeUtility.map((u) => (
                  <span
                    key={u}
                    className={cn('rounded-md border border-[#f2f3f4] bg-white px-3 py-2 text-[#323232]', u)}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-[#666]">
              Villuskilaboð í formum:{' '}
              <code className="rounded bg-[#f2f3f4] px-1">{typography.validationMessageClass}</code>{' '}
              (Fundir).
            </p>
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#323232]">Línuhæðir (className)</h3>
              <ul className="space-y-2 text-sm text-[#666]">
                {Object.entries(typography.lineHeight).map(([k, v]) => (
                  <li key={k}>
                    <code className="text-[#323232]">{v}</code> — typography.lineHeight.{k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {typography.fontWeight.map((w) => (
                <div key={w} className="rounded-lg border border-[#f2f3f4] bg-white p-4">
                  <p
                    className={cn(
                      'text-base text-[#323232]',
                      w === 'normal' && 'font-normal',
                      w === 'medium' && 'font-medium',
                      w === 'semibold' && 'font-semibold',
                      w === 'bold' && 'font-bold',
                    )}
                  >
                    Þyngd: {w}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'bil')) && (
          <section id="bil" className="scroll-mt-8 space-y-6">
            <h2 className="text-xl font-bold text-[#18325a]">Bil</h2>
            <div className="flex flex-wrap gap-4">
              {spacing.arbitraryPx.map((v) => (
                <div key={v} className="flex flex-col items-center gap-2">
                  <div
                    className="rounded-sm bg-[#18325a]/80"
                    style={{ width: v, height: v, minWidth: 4, minHeight: 4 }}
                  />
                  <span className="text-xs text-[#666]">{v}px</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#f2f3f4] bg-white p-4">
              <h3 className="text-sm font-bold text-[#323232]">Fastar (width/height)</h3>
              <ul className="mt-2 space-y-2 text-sm text-[#666]">
                {Object.entries(spacing.named).map(([k, v]) => (
                  <li key={k} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f2f3f4] py-2">
                    <code className="text-[#18325a]">{k}</code>
                    <span>{v}</span>
                    <CopyValueButton value={v} name={k} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#f2f3f4] bg-white p-4">
              <h3 className="text-sm font-bold text-[#323232]">Mynstur (padding/gap)</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-[#666]">
                {Object.entries(spacing.patterns).map(([k, v]) => (
                  <li key={k}>
                    <code>{k}</code>: {v}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'vidmot')) && (
          <section id="vidmot" className="scroll-mt-8 space-y-8">
            <h2 className="text-xl font-bold text-[#18325a]">Viðmótshlutar</h2>
            <p className="text-sm text-[#666]">shadcn-hlutar sem eru í verkefninu: hnappur, kort, dialog, popover, calendar.</p>

            <div className="flex flex-wrap gap-3">
              <Button>sjálfgefið</Button>
              <Button variant="secondary">secondary</Button>
              <Button variant="outline">útlínur</Button>
              <Button variant="ghost">draugur</Button>
              <Button variant="destructive">eyðing</Button>
              <Button variant="link">tengill</Button>
              <Button size="xs">xs</Button>
              <Button size="sm">sm</Button>
              <Button size="lg">lg</Button>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#323232]">Reitur (Fundir / Stillingar)</p>
              <label className={theme.componentPatterns.figmaLabel}>Dæmi</label>
              <input
                className={cn('mt-1 w-full max-w-md', theme.componentPatterns.figmaInput)}
                placeholder="Sláðu inn texta…"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#323232]">Aðalhnappur</p>
              <button type="button" className={theme.componentPatterns.figmaPrimaryButton}>
                Vista breytingar
              </button>
            </div>

            <Card className="max-w-md border-[#f2f3f4]">
              <CardHeader>
                <CardTitle>Kort</CardTitle>
                <CardDescription>Úr `@/components/ui/card`.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Eins og á HomePage.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Aðgerð</Button>
              </CardFooter>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Opna glugga</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                    <DialogDescription>Úr `@/components/ui/dialog`.</DialogDescription>
                  </DialogHeader>
                  <Button type="button">Í lagi</Button>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Dagatal
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'rammar')) && (
          <section id="rammar" className="scroll-mt-8 space-y-8">
            <h2 className="text-xl font-bold text-[#18325a]">Rammar og skuggar</h2>

            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Horn (píxlar)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(borders.radiusPx).map(([k, v]) => (
                  <div
                    key={k}
                    className="border border-[#e6e8e9] bg-white p-4"
                    style={{ borderRadius: v }}
                  >
                    <p className="text-sm font-medium text-[#323232]">radiusPx.{k}</p>
                    <code className="text-xs text-[#666]">{v}</code>
                    <CopyValueButton value={v} name={`radiusPx.${k}`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Tailwind rounded-*</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {borders.radiusUtility.map((c) => (
                  <li key={c} className="rounded-md border border-[#f2f3f4] bg-white px-3 py-1">
                    <code>{c}</code>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Rammlitir</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(borders.borderColor).map(([k, v]) => (
                  <ColorSwatch key={k} name={`borderColor.${k}`} value={v} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-[#323232]">Skuggar (inline í kóða)</h3>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {Object.entries(shadows).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-[#f2f3f4] bg-white p-6"
                    style={{ boxShadow: v }}
                  >
                    <p className="text-sm font-semibold text-[#323232]">shadows.{k}</p>
                    <p className="mt-2 break-all text-xs text-[#666]">{v}</p>
                    <CopyValueButton value={v} name={`shadow.${k}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(!q || visibleSections.some((s) => s.id === 'uppsetning')) && (
          <section id="uppsetning" className="scroll-mt-8 space-y-4">
            <h2 className="text-xl font-bold text-[#18325a]">Uppsetning</h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-[#666]">
              <li>
                <strong className="text-[#323232]">AppLayout:</strong> {theme.layout.appChromePadding}{' '}
                utan um dúk, {colors.primary.DEFAULT}, aðalsvæði {theme.layout.mainSurface}.
              </li>
              <li>
                <strong className="text-[#323232]">Kortaröð:</strong> grid, gap-4, md:grid-cols-3 (t.d.
                HomePage, BillsPage).
              </li>
              <li>
                <strong className="text-[#323232]">Tafla:</strong> Fundir — sérsniðið dálknet.
              </li>
            </ul>
          </section>
        )}

        <footer className="border-t border-[#f2f3f4] pt-8 text-center text-xs text-[#666]">
          <code className="rounded bg-[#f2f3f4] px-1">/design-system</code>
        </footer>
      </main>

      <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-2 md:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leita í köflum…"
          className="min-w-0 flex-1 rounded-lg border border-[#e6e8e9] bg-white px-3 py-2 text-sm"
          style={{ boxShadow: shadows.cardSoft }}
        />
        <Link
          to="/"
          className="shrink-0 rounded-lg bg-[#18325a] px-3 py-2 text-sm font-medium text-white"
        >
          Heim
        </Link>
      </div>
    </div>
  )
}
