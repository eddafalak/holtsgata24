import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'

import { DsSidebarNav } from './components/DsSidebarNav'
import { DS_SECTIONS, sectionMatches } from './ds-nav'
import { BordersSection } from './sections/BordersSection'
import { ColorsSection } from './sections/ColorsSection'
import { ComponentsSection } from './sections/ComponentsSection'
import { LayoutSection } from './sections/LayoutSection'
import { SpacingSection } from './sections/SpacingSection'
import { TypographySection } from './sections/TypographySection'

function scrollToId(id: string, onDone?: () => void) {
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onDone?.()
  })
}

export function DesignSystemShowcase() {
  const [query, setQuery] = React.useState('')
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string>(DS_SECTIONS[0].id)

  const q = query.trim().toLowerCase()
  const visibleNav = React.useMemo(() => DS_SECTIONS.filter((s) => sectionMatches(s, q)), [q])

  const goTo = React.useCallback((id: string) => {
    setActiveId(id)
    scrollToId(id, () => setMobileNavOpen(false))
  }, [])

  const visibleSectionIds = React.useMemo(
    () => DS_SECTIONS.filter((s) => !q || sectionMatches(s, q)).map((s) => s.id),
    [q],
  )

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const id = visible[0]?.target.id
        if (id && DS_SECTIONS.some((s) => s.id === id)) setActiveId(id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.1, 0.25] },
    )
    visibleSectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [visibleSectionIds])

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-[#323232] antialiased">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#e8eaee] bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8eaee] bg-white text-[#323232] transition-colors hover:bg-[#f3f5f7]"
          aria-expanded={mobileNavOpen}
          aria-controls="ds-mobile-drawer"
          aria-label="Opna valmynd"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Leita…"
            className="h-10 w-full rounded-xl border border-[#e8eaee] bg-white py-2 pl-10 pr-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#18325a]/25"
            aria-label="Leita í hönnunarkerfi"
          />
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" id="ds-mobile-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            aria-label="Loka valmynd"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            className="animate-in slide-in-from-left-5 absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-r border-[#e8eaee] bg-white shadow-xl duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Yfirlit"
          >
            <div className="flex items-center justify-between border-b border-[#f2f3f4] px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#666]">Holtsgata 24</p>
                <p className="text-lg font-bold text-[#18325a]">Hönnunarkerfi</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#f3f5f7]"
                aria-label="Loka"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-[#f2f3f4] p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Leita í köflum…"
                  className="h-10 w-full rounded-xl border border-[#e8eaee] py-2 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#18325a]/25"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <DsSidebarNav sections={visibleNav} activeId={activeId} onSelect={goTo} />
            </div>
            <div className="border-t border-[#f2f3f4] p-4">
              <Link
                to="/"
                className="block rounded-xl bg-[#18325a] px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Til baka í forritið
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 flex-col border-r border-[#e8eaee] bg-white md:flex">
        <div className="border-b border-[#f2f3f4] px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#666]">Húsfélag</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#18325a]">Holtsgata 24</h1>
          <p className="mt-1 text-sm text-[#666]">Hönnunarkerfi</p>
        </div>
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Leita…"
              className="h-10 w-full rounded-xl border border-[#e8eaee] bg-[#fbfbfc] py-2 pl-10 pr-3 text-sm outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#18325a]/25"
              aria-label="Leita í hönnunarkerfi"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <DsSidebarNav sections={visibleNav} activeId={activeId} onSelect={goTo} />
        </div>
        <div className="border-t border-[#f2f3f4] p-4">
          <Link
            to="/"
            className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-[#18325a] transition-colors hover:bg-[#f3f5f7]"
          >
            ← Til baka í forritið
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 md:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
          <header className="mb-14 max-w-3xl border-b border-[#e8eaee] pb-10">
            <p className="text-sm font-medium uppercase tracking-wider text-[#18325a]">Handbók</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#323232] sm:text-4xl">
              Hönnunarkerfi
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#666]">
              Eitt yfirlit yfir liti, letur, bil, ramma og íhluti fyrir Holtsgötu 24. Allt er á íslensku og hægt er að
              afrita gildi beint úr síðunni.
            </p>
          </header>

          <div className="flex flex-col gap-20 sm:gap-24">
            {(!q || sectionMatches(DS_SECTIONS[0], q)) && <ColorsSection />}
            {(!q || sectionMatches(DS_SECTIONS[1], q)) && <TypographySection />}
            {(!q || sectionMatches(DS_SECTIONS[2], q)) && <SpacingSection />}
            {(!q || sectionMatches(DS_SECTIONS[3], q)) && <BordersSection />}
            {(!q || sectionMatches(DS_SECTIONS[4], q)) && (
              <ComponentsSection onNavigateToColors={() => goTo('litir')} />
            )}
            {(!q || sectionMatches(DS_SECTIONS[5], q)) && <LayoutSection />}
          </div>

          <footer className="mt-20 border-t border-[#e8eaee] pt-10 text-center text-xs text-[#666]">
            <code className="rounded-lg bg-[#f3f5f7] px-2 py-1 text-[#18325a]">/design-system</code>
            <span className="mx-2">·</span>
            <span>Holtsgata 24</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
