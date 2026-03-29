import { Button } from '@/components/ui/button'
import { inputBorderRadiusClass } from '@/design-system/tokens/inputs'
import { cn } from '@/lib/utils'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import type { AgendaItem } from '@/types/minutes'

interface AgendaItemEditorProps {
  item: AgendaItem
  index: number
  onUpdate: (item: AgendaItem) => void
  onDelete: () => void
}

export function AgendaItemEditor({ item, index, onUpdate, onDelete }: AgendaItemEditorProps) {
  return (
    <div className="rounded-lg border border-[#e6e8e9] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[14px] font-bold text-[#323232]">Dagskrárliður {index + 1}</div>
        <Button type="button" variant="outline" size="xs" onClick={onDelete}>
          Eyða
        </Button>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1">
          <label className="text-[13px] text-[#666]">Titill</label>
          <input
            value={item.title}
            onChange={(e) => onUpdate({ ...item, title: e.target.value })}
            className="h-10 rounded border border-[#e8eaee] bg-white px-3 text-[14px] outline-none"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-[13px] text-[#666]">Umræða</label>
          <RichTextEditor
            value={item.discussion}
            onChange={(html) => onUpdate({ ...item, discussion: html })}
            placeholder="Skrifaðu umræðu..."
          />
        </div>

        <div className="grid gap-1">
          <label className="text-[13px] text-[#666]">Ákvörðun</label>
          <textarea
            value={item.decision}
            onChange={(e) => onUpdate({ ...item, decision: e.target.value })}
            className={cn(
              'min-h-[84px] border border-[#e8eaee] bg-white px-3 py-2 text-[14px] outline-none',
              inputBorderRadiusClass
            )}
          />
        </div>

        <div className="grid gap-2">
          <div className="text-[13px] text-[#666]">Atkvæðagreiðsla</div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'none', label: 'Engin' },
              { id: 'unanimous', label: 'Samþykkt samhljóða' },
              { id: 'counted', label: 'Talning' },
            ].map((opt) => (
              <Button
                key={opt.id}
                type="button"
                variant="outline"
                size="xs"
                className={item.vote_type === opt.id ? 'border-[#18325A] text-[#18325A]' : ''}
                onClick={() =>
                  onUpdate({
                    ...item,
                    vote_type: opt.id as AgendaItem['vote_type'],
                    votes: opt.id === 'counted' ? item.votes ?? { for: 0, against: 0, abstain: 0 } : null,
                  })
                }
              >
                {opt.label}
              </Button>
            ))}
          </div>
          {item.vote_type === 'counted' ? (
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={item.votes?.for ?? 0}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    votes: { ...(item.votes ?? { for: 0, against: 0, abstain: 0 }), for: Number(e.target.value) },
                  })
                }
                className="h-10 rounded border border-[#e8eaee] px-3 text-[14px] outline-none"
                placeholder="Með"
              />
              <input
                type="number"
                value={item.votes?.against ?? 0}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    votes: { ...(item.votes ?? { for: 0, against: 0, abstain: 0 }), against: Number(e.target.value) },
                  })
                }
                className="h-10 rounded border border-[#e8eaee] px-3 text-[14px] outline-none"
                placeholder="Á móti"
              />
              <input
                type="number"
                value={item.votes?.abstain ?? 0}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    votes: { ...(item.votes ?? { for: 0, against: 0, abstain: 0 }), abstain: Number(e.target.value) },
                  })
                }
                className="h-10 rounded border border-[#e8eaee] px-3 text-[14px] outline-none"
                placeholder="Sitja hjá"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

