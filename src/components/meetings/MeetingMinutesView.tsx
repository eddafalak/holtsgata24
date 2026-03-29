import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMeetingMinutesList } from '@/hooks/useMeetingMinutes'

interface MeetingMinutesViewProps {
  minutesId: string
}

export function MeetingMinutesView({ minutesId }: MeetingMinutesViewProps) {
  const { data } = useMeetingMinutesList()
  const minutes = useMemo(() => (data ?? []).find((m) => m.id === minutesId) ?? null, [data, minutesId])

  if (!minutes) {
    return <div className="text-[14px] text-[#666]">Fundargerð fannst ekki.</div>
  }

  return (
    <div className="grid gap-4">
      <Card className="border-[#f2f3f4] p-6">
        <h3 className="text-[18px] font-bold text-[#323232]">Fundargerð</h3>
        <div className="mt-2 text-[14px] text-[#666]">Síðast uppfært: {new Date(minutes.updated_at).toLocaleString('is-IS')}</div>
      </Card>

      <Card className="border-[#f2f3f4] p-6">
        <h4 className="mb-3 text-[16px] font-bold text-[#323232]">Mætingarlisti</h4>
        <div className="grid gap-2">
          {minutes.attendees.map((a) => (
            <div key={a.user_id} className="text-[14px] text-[#323232]">
              {a.attended ? '✓' : '◻'} {a.name} ({a.apartment})
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#f2f3f4] p-6">
        <h4 className="mb-3 text-[16px] font-bold text-[#323232]">Dagskrá</h4>
        <div className="grid gap-4">
          {minutes.agenda_items.map((item, idx) => (
            <div key={item.id} className="rounded-md border border-[#e8eaee] p-3">
              <div className="text-[14px] font-bold text-[#323232]">
                {idx + 1}. {item.title}
              </div>
              <div className="mt-1 text-[13px] text-[#666]">Ákvörðun: {item.decision || '—'}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        {minutes.pdf_url ? (
          <Button type="button" asChild className="bg-[#18325A] text-white">
            <a href={minutes.pdf_url} target="_blank" rel="noreferrer">
              Sækja fundargerð
            </a>
          </Button>
        ) : (
          <div className="text-[13px] text-[#666]">PDF hefur ekki verið búið til enn.</div>
        )}
      </div>
    </div>
  )
}

