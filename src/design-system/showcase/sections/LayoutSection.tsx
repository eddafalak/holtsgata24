import { colors } from '../../tokens'
import { theme } from '../../theme/theme'
import { DsSectionHeader } from '../components/DsSectionHeader'
import { DsCodeBlock } from '../components/DsCodeBlock'

export function LayoutSection() {
  return (
    <section id="skipulag" className="scroll-mt-24 space-y-10 pb-16 sm:scroll-mt-8">
      <DsSectionHeader
        icon="📐"
        title="Skipulag"
        description="Yfirlit yfir síðuuppbyggingu og mynstur sem koma oft fyrir í Holtsgötu 24."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e8eaee] bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-base font-semibold text-[#323232]">AppLayout</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#666]">
            <li>
              <span className="font-medium text-[#323232]">Útvörpun: </span>
              {theme.layout.appChromePadding} utan um aðalinnihald, dökkur rammi í litnum{' '}
              <code className="rounded bg-[#f3f5f7] px-1 text-xs">{colors.primary.DEFAULT}</code>.
            </li>
            <li>
              <span className="font-medium text-[#323232]">Aðalsvæði: </span>
              <code className="rounded bg-[#f3f5f7] px-1 text-xs">{theme.layout.mainSurface}</code>
            </li>
            <li>
              <span className="font-medium text-[#323232]">Padding: </span>
              {theme.layout.mainPadding}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#e8eaee] bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-base font-semibold text-[#323232]">Almenn mynstur</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#666]">
            <li>
              <strong className="text-[#323232]">Kortaröð:</strong> grid með gap-4, oft{' '}
              <code className="rounded bg-[#f3f5f7] px-1 text-xs">md:grid-cols-3</code> á forsíðu og reikningum.
            </li>
            <li>
              <strong className="text-[#323232]">Tafla:</strong> sérsniðin dálknet í Fundum.
            </li>
            <li>
              <strong className="text-[#323232]">Leiðsögn:</strong> hliðarstika á stórum skjám, dulknað á farsíma.
            </li>
          </ul>
        </div>
      </div>

      <DsCodeBlock
        label="Dæmi — aðalgrid"
        code={`<div className="grid gap-4 md:grid-cols-3">
  {items.map(...)}
</div>`}
      />
    </section>
  )
}
