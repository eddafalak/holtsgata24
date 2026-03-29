import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type DsDisclosureProps = {
  title: string
  summaryHint?: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function DsDisclosure({
  title,
  summaryHint,
  defaultOpen = false,
  children,
  className,
}: DsDisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        'group rounded-2xl border border-[#e8eaee] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6',
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <div>
          <p className="text-base font-semibold tracking-tight text-[#323232]">{title}</p>
          {summaryHint ? <p className="mt-0.5 text-sm text-[#666]">{summaryHint}</p> : null}
        </div>
        <ChevronDown
          aria-hidden
          className="h-5 w-5 shrink-0 text-[#666] transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-[#f2f3f4] px-5 py-6 sm:px-6">{children}</div>
    </details>
  )
}
