import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  buttonColorTable,
  buttonSizeTable,
  describeSemanticColorSource,
  figmaButtonTokens,
} from '../../tokens'

import { useDsCopy } from '../hooks/useDsCopy'

function CopyHexButton({ value, name }: { value: string; name: string }) {
  const { copy, lastCopied } = useDsCopy()
  const copied = lastCopied === name
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 px-2 text-xs text-[#666] hover:bg-[#f3f5f7] hover:text-[#323232]"
      onClick={() => copy(value, name)}
    >
      <Copy className="h-3.5 w-3.5" aria-hidden />
      {copied ? 'Afritað' : 'Afrita'}
    </Button>
  )
}

export function ButtonSizeSpecTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8eaee] bg-white shadow-sm">
      <div className="border-b border-[#f2f3f4] bg-[#fbfbfc] px-5 py-3 sm:px-6">
        <p className="text-sm font-semibold text-[#323232]">Hnappar — stærðir (hæð H í px)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#f2f3f4] text-left text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              <th className="px-4 py-3 sm:px-6">Hönnun</th>
              <th className="px-4 py-3">H</th>
              <th className="px-4 py-3">
                <code className="font-mono text-[11px] font-normal normal-case tracking-normal">size</code>
              </th>
              <th className="px-4 py-3">Padding</th>
              <th className="px-4 py-3 pr-6">Letur</th>
            </tr>
          </thead>
          <tbody>
            {buttonSizeTable.map((row) => (
              <tr key={row.id} className="border-b border-[#f2f3f4] last:border-0">
                <td className="px-4 py-3 font-medium text-[#323232] sm:px-6">{row.label}</td>
                <td className="px-4 py-3 tabular-nums text-[#323232]">{row.heightPx}</td>
                <td className="px-4 py-3">
                  <code className="rounded-md bg-[#f3f5f7] px-2 py-0.5 text-xs text-[#18325a]">
                    {row.buttonSize === 'default' ? '"default"' : `"${row.buttonSize}"`}
                  </code>
                </td>
                <td className="px-4 py-3 text-[#666]">
                  {row.paddingXPx} × {row.paddingYPx}px
                </td>
                <td className="px-4 py-3 pr-6 text-[#666]">
                  {row.fontSizePx}px
                  {'lineHeightPx' in row
                    ? ` · lína ${row.lineHeightPx}px`
                    : ` · lína ${row.lineHeight}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[#f2f3f4] bg-[#fbfbfc] px-5 py-3 text-xs text-[#666] sm:px-6">
        Í kóða:{' '}
        <code className="text-[#18325a]">h-[{figmaButtonTokens.sizes.large.heightPx}px]</code> /{' '}
        <code className="text-[#18325a]">h-[{figmaButtonTokens.sizes.medium.heightPx}px]</code> /{' '}
        <code className="text-[#18325a]">h-[{figmaButtonTokens.sizes.small.heightPx}px]</code> á{' '}
        <code className="text-[#18325a]">Button</code>.
      </p>
    </div>
  )
}

export function ButtonColorSpecTables() {
  return (
    <div className="space-y-5">
      {buttonColorTable.map((group) => (
        <div key={group.id} className="overflow-hidden rounded-2xl border border-[#e8eaee] bg-white shadow-sm">
          <div className="border-b border-[#f2f3f4] bg-[#fbfbfc] px-5 py-3 sm:px-6">
            <p className="text-sm font-semibold text-[#323232]">{group.title}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-[#f2f3f4] text-left text-[11px] font-semibold uppercase tracking-wide text-[#666]">
                  <th className="px-4 py-3 sm:px-6">Ástand</th>
                  <th className="px-4 py-3">Tákn</th>
                  <th className="px-4 py-3 pr-6">Gildi</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={`${group.id}-${row.name}`} className="border-b border-[#f2f3f4] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#323232] sm:px-6">{row.name}</td>
                    <td className="px-4 py-3 text-[#666]">{row.token}</td>
                    <td className="px-4 py-3 pr-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="h-10 w-10 shrink-0 rounded-lg border border-[#e6e8e9] shadow-inner"
                          style={{ background: row.value }}
                          aria-hidden
                        />
                        <code className="text-xs text-[#18325a]">{row.value}</code>
                        <span className="hidden text-xs text-[#666] sm:inline">
                          → {describeSemanticColorSource(row.value)}
                        </span>
                        <CopyHexButton value={row.value} name={`${group.id}.${row.name}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
