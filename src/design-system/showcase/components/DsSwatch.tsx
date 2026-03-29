import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useDsCopy } from '../hooks/useDsCopy'

const sizeClass: Record<'sm' | 'md' | 'lg' | 'hero', string> = {
  sm: 'h-14 w-full min-w-[3.5rem] sm:w-16',
  md: 'h-20 w-full min-w-[5rem] sm:h-24 sm:w-24',
  lg: 'h-28 w-full min-w-[7rem] sm:h-32 sm:w-32',
  hero: 'h-44 w-full max-w-[200px] sm:h-[200px] sm:w-[200px] sm:max-w-none',
}

export type DsSwatchProps = {
  name: string
  hex: string
  description?: string
  size?: keyof typeof sizeClass
  tokenPath?: string
  className?: string
}

export function DsSwatch({
  name,
  hex,
  description,
  size = 'md',
  tokenPath,
  className,
}: DsSwatchProps) {
  const { copy, lastCopied } = useDsCopy()
  const id = tokenPath ?? name
  const copied = lastCopied === id

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border border-[#e8eaee] bg-white p-4 transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => copy(hex, id)}
        className={cn(
          'relative mb-3 overflow-hidden rounded-xl border border-black/5 ring-1 ring-black/5 transition-transform duration-200 active:scale-[0.98]',
          sizeClass[size],
        )}
        style={{ backgroundColor: hex }}
        aria-label={`Afrita lit ${hex}`}
      >
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#18325a] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          </span>
        </span>
      </button>
      <p className="font-semibold text-[#323232]">{name}</p>
      <code className="mt-1 text-xs font-mono text-[#666]">{hex}</code>
      {tokenPath ? (
        <code className="mt-0.5 truncate text-[11px] text-[#18325a]/80" title={tokenPath}>
          {tokenPath}
        </code>
      ) : null}
      {description ? <p className="mt-2 text-sm leading-snug text-[#666]">{description}</p> : null}
      {copied ? (
        <p className="mt-2 text-xs font-medium text-emerald-700" role="status">
          Afritað
        </p>
      ) : null}
    </div>
  )
}

type DsSwatchCompactProps = {
  label: string
  hex: string
  sublabel?: string
}

/** Minni kafli — hex birtist í hover, smellt afritar. */
export function DsSwatchCompact({ label, hex, sublabel }: DsSwatchCompactProps) {
  const { copy, lastCopied } = useDsCopy()
  const id = `compact-${label}-${hex}`
  const copied = lastCopied === id

  return (
    <button
      type="button"
      onClick={() => copy(hex, id)}
      className="group flex w-full flex-col items-stretch rounded-xl border border-[#e8eaee] bg-white text-left transition-all duration-200 hover:border-[#18325a]/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18325a]/30"
    >
      <div
        className="relative h-24 w-full rounded-t-[11px] border-b border-black/5 sm:h-28"
        style={{ backgroundColor: hex }}
      >
        <span className="absolute inset-x-0 bottom-0 flex justify-center pb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] text-white">{hex}</span>
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[#323232]">{label}</p>
        {sublabel ? <p className="text-xs text-[#666]">{sublabel}</p> : null}
        {copied ? <p className="mt-1 text-xs text-emerald-700">Afritað</p> : null}
      </div>
    </button>
  )
}

type DsCopyActionsProps = {
  hex: string
  rgb?: string
  id: string
}

export function DsCopyActions({ hex, rgb, id }: DsCopyActionsProps) {
  const { copy, lastCopied } = useDsCopy()
  const copiedHex = lastCopied === `${id}-hex`
  const copiedRgb = lastCopied === `${id}-rgb`

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-[#e8eaee] bg-white text-[#323232] hover:bg-[#f3f5f7]"
        onClick={() => copy(hex, `${id}-hex`)}
      >
        {copiedHex ? 'Afritað hex' : 'Afrita hex'}
      </Button>
      {rgb ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[#e8eaee] bg-white text-[#323232] hover:bg-[#f3f5f7]"
          onClick={() => copy(rgb, `${id}-rgb`)}
        >
          {copiedRgb ? 'Afritað RGB' : 'Afrita RGB'}
        </Button>
      ) : null}
    </div>
  )
}
