import { cn } from '@/lib/utils'

import type { DsSection } from '../ds-nav'

type DsSidebarNavProps = {
  sections: readonly DsSection[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export function DsSidebarNav({ sections, activeId, onSelect, className }: DsSidebarNavProps) {
  return (
    <nav className={cn('flex flex-col gap-0.5', className)} aria-label="Köflur hönnunarkerfis">
      {sections.length === 0 ? (
        <p className="px-3 py-2 text-sm text-[#666]">Ekkert fannst.</p>
      ) : (
        sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200',
              activeId === s.id
                ? 'bg-[#18325a]/10 font-semibold text-[#18325a]'
                : 'font-medium text-[#323232] hover:bg-[#f3f5f7]',
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              {s.icon}
            </span>
            <span className="min-w-0">
              <span className="block">{s.label}</span>
              <span className="mt-0.5 block text-xs font-normal text-[#666]">{s.description}</span>
            </span>
          </button>
        ))
      )}
    </nav>
  )
}
