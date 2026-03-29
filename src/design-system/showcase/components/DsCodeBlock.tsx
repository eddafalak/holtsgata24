import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useDsCopy } from '../hooks/useDsCopy'

type DsCodeBlockProps = {
  code: string
  label?: string
  className?: string
}

export function DsCodeBlock({ code, label, className }: DsCodeBlockProps) {
  const { copy, lastCopied } = useDsCopy()
  const id = `code-${code.slice(0, 24)}`
  const copied = lastCopied === id

  return (
    <div className={cn('relative rounded-xl border border-[#e8eaee] bg-[#1e2939] text-left', className)}>
      {label ? (
        <div className="border-b border-white/10 px-4 py-2 text-xs font-medium text-white/60">{label}</div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="absolute right-2 top-2 h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => copy(code, id)}
        aria-label="Afrita kóða"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
