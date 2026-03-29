import { useMemo } from 'react'
import { useResidents } from '@/hooks/useResidents'

interface AttendeeCheckListProps {
  selectedAttendees: string[]
  onChange: (attendees: string[]) => void
}

export function AttendeeCheckList({ selectedAttendees, onChange }: AttendeeCheckListProps) {
  const { data } = useResidents()

  const residents = useMemo(() => {
    const apts = data ?? []
    return apts.flatMap((a) =>
      (a.residents ?? []).map((r) => ({
        id: r.id,
        name: r.full_name ?? 'Nafn ótilgreint',
        apartment: a.name,
      })),
    )
  }, [data])

  return (
    <div className="grid gap-2">
      {residents.map((r) => {
        const checked = selectedAttendees.includes(r.id)
        return (
          <label key={r.id} className="flex items-center justify-between rounded-md border border-[#e6e8e9] bg-white px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-medium text-[#323232]">{r.name}</div>
              <div className="truncate text-[12px] text-[#666]">{r.apartment}</div>
            </div>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                if (e.target.checked) onChange([...selectedAttendees, r.id])
                else onChange(selectedAttendees.filter((id) => id !== r.id))
              }}
            />
          </label>
        )
      })}
    </div>
  )
}

