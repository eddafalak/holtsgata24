import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AttendeeCheckList } from '@/components/meetings/AttendeeCheckList'
import { AgendaItemEditor } from '@/components/meetings/AgendaItemEditor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useAuth } from '@/hooks/useAuth'
import { useMeetingMinutes } from '@/hooks/useMeetingMinutes'
import { useResidents } from '@/hooks/useResidents'
import { inputBorderRadiusClass } from '@/design-system/tokens/inputs'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { generateMeetingPDF } from '@/lib/generateMeetingPDF'
import type { Meeting } from '@/types'
import type { AgendaItem, MeetingMinutes } from '@/types/minutes'

export interface MeetingMinutesEditorProps {
  meetingId: string
  existingMinutes?: MeetingMinutes | null
  onSave: () => void
  onFinalize: () => void
}

function newAgendaItem(): AgendaItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: '',
    discussion: '',
    decision: '',
    vote_type: 'none',
    votes: null,
  }
}

export function MeetingMinutesEditor({
  meetingId,
  existingMinutes = null,
  onSave,
  onFinalize,
}: MeetingMinutesEditorProps) {
  const { profile } = useAuth()
  const { saveMinutes } = useMeetingMinutes(meetingId)
  const { data: apartmentsWithResidents } = useResidents()

  const initial = useMemo(
    () =>
      existingMinutes ?? {
        id: '',
        meeting_id: meetingId,
        attendees: [],
        agenda_items: [newAgendaItem()],
        other_notes: '',
        next_meeting_date: null,
        secretary_id: null,
        chair_id: null,
        is_finalized: false,
        is_draft: true,
        pdf_url: null,
        created_at: '',
        updated_at: '',
        finalized_at: null,
        created_by: profile?.id ?? null,
      },
    [existingMinutes, meetingId, profile?.id],
  )

  const [attendees, setAttendees] = useState<string[]>(
    initial.attendees.filter((a) => a.attended).map((a) => a.user_id),
  )
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(initial.agenda_items.length ? initial.agenda_items : [newAgendaItem()])
  const [otherNotes, setOtherNotes] = useState(initial.other_notes ?? '')
  const [nextMeetingDate, setNextMeetingDate] = useState(initial.next_meeting_date ?? '')
  const [secretaryId, setSecretaryId] = useState(initial.secretary_id ?? '')
  const [chairId, setChairId] = useState(initial.chair_id ?? '')
  const [finalizeChecked, setFinalizeChecked] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const residentOptions = useMemo(
    () =>
      (apartmentsWithResidents ?? []).flatMap((a) =>
        (a.residents ?? []).map((r) => ({
          id: r.id,
          label: `${r.full_name ?? 'Nafn ótilgreint'} (${a.name})`,
        })),
      ),
    [apartmentsWithResidents],
  )

  const autoSaveData = useMemo(
    () => ({ attendees, agendaItems, otherNotes, nextMeetingDate, secretaryId, chairId }),
    [attendees, agendaItems, otherNotes, nextMeetingDate, secretaryId, chairId],
  )

  const { isSaving, lastSavedAt } = useAutoSave(
    autoSaveData,
    async (d) => {
      if (!profile?.id) return
      await saveMinutes({
        created_by: profile.id,
        attendees: d.attendees.map((id) => ({ user_id: id, name: id, apartment: '', attended: true })),
        agenda_items: d.agendaItems,
        other_notes: d.otherNotes || null,
        next_meeting_date: d.nextMeetingDate || null,
        secretary_id: d.secretaryId || null,
        chair_id: d.chairId || null,
        is_draft: true,
        is_finalized: false,
      })
      onSave()
    },
    30_000,
    Boolean(profile?.id),
  )

  return (
    <div className="grid gap-4">
      <Card className="border-[#f2f3f4] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-bold text-[#323232]">Fundargerð</h3>
            <p className="text-[13px] text-[#666]">
              {isSaving
                ? 'Vista...'
                : lastSavedAt
                  ? `Síðast vistað ${lastSavedAt.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Ekki vistað'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-[#f2f3f4] p-6">
        <h4 className="mb-3 text-[16px] font-bold text-[#323232]">Mætingarlisti</h4>
        <AttendeeCheckList selectedAttendees={attendees} onChange={setAttendees} />
      </Card>

      <Card className="border-[#f2f3f4] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[16px] font-bold text-[#323232]">Dagskrá</h4>
          <Button
            type="button"
            className="bg-[#18325A] text-white"
            onClick={() => setAgendaItems((prev) => [...prev, newAgendaItem()])}
          >
            Bæta við dagskráratriði
          </Button>
        </div>
        <div className="grid gap-3">
          {agendaItems.map((item, idx) => (
            <AgendaItemEditor
              key={item.id}
              item={item}
              index={idx}
              onUpdate={(next) => setAgendaItems((prev) => prev.map((p) => (p.id === item.id ? next : p)))}
              onDelete={() => setAgendaItems((prev) => prev.filter((p) => p.id !== item.id))}
            />
          ))}
        </div>
      </Card>

      <Card className="border-[#f2f3f4] p-6">
        <div className="grid gap-3">
          <label className="text-[14px] text-[#323232]">Aðrar athugasemdir</label>
          <textarea
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            className={cn(
              'min-h-[120px] border border-[#e8eaee] px-3 py-2 outline-none',
              inputBorderRadiusClass
            )}
          />

          <label className="text-[14px] text-[#323232]">Næsti fundur</label>
          <input
            type="datetime-local"
            value={nextMeetingDate}
            onChange={(e) => setNextMeetingDate(e.target.value)}
            className={cn('h-10 border border-[#e8eaee] px-3 outline-none', inputBorderRadiusClass)}
          />

          <label className="text-[14px] text-[#323232]">Fundarritari</label>
          <select
            value={secretaryId}
            onChange={(e) => setSecretaryId(e.target.value)}
            className={cn('h-10 border border-[#e8eaee] px-3 outline-none', inputBorderRadiusClass)}
          >
            <option value="">Velja fundarritara</option>
            {residentOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <label className="text-[14px] text-[#323232]">Fundarstjóri</label>
          <select
            value={chairId}
            onChange={(e) => setChairId(e.target.value)}
            className={cn('h-10 border border-[#e8eaee] px-3 outline-none', inputBorderRadiusClass)}
          >
            <option value="">Velja fundarstjóra</option>
            {residentOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <label className="mt-2 flex items-center gap-2 text-[14px] text-[#323232]">
            <input
              type="checkbox"
              checked={finalizeChecked}
              onChange={(e) => setFinalizeChecked(e.target.checked)}
            />
            Fundi lokið
          </label>
        </div>
      </Card>

      {submitError ? <div className="text-[12px] text-red-600">{submitError}</div> : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (!profile?.id) return
            try {
              await saveMinutes({
                created_by: profile.id,
                attendees: attendees.map((id) => ({ user_id: id, name: id, apartment: '', attended: true })),
                agenda_items: agendaItems,
                other_notes: otherNotes || null,
                next_meeting_date: nextMeetingDate || null,
                secretary_id: secretaryId || null,
                chair_id: chairId || null,
                is_draft: true,
                is_finalized: false,
              })
              onSave()
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e)
              setSubmitError(msg)
            }
          }}
        >
          Vista drög
        </Button>

        <Button
          type="button"
          className="bg-[#18325A] text-white"
          onClick={async () => {
            if (!profile?.id) return
            if (!finalizeChecked) {
              setSubmitError('Merktu við "Fundi lokið" áður en þú lokar fundi.')
              return
            }
            try {
              const meetingForPdf: Meeting = {
                id: meetingId,
                title: 'Fundur',
                description: null,
                meeting_date: new Date().toISOString(),
                meeting_type: null,
                pdf_url: null,
                created_by: profile.id,
                created_at: new Date().toISOString(),
              }

              const draftForPdf: MeetingMinutes = {
                id: existingMinutes?.id ?? '',
                meeting_id: meetingId,
                attendees: attendees.map((id) => ({ user_id: id, name: id, apartment: '', attended: true })),
                agenda_items: agendaItems,
                other_notes: otherNotes || null,
                next_meeting_date: nextMeetingDate || null,
                secretary_id: secretaryId || null,
                chair_id: chairId || null,
                is_finalized: true,
                is_draft: false,
                pdf_url: null,
                created_at: existingMinutes?.created_at ?? new Date().toISOString(),
                updated_at: new Date().toISOString(),
                finalized_at: new Date().toISOString(),
                created_by: profile.id,
              }

              const pdfBlob = await generateMeetingPDF(draftForPdf, meetingForPdf)
              const pdfPath = `${meetingId}/minutes-${Date.now()}.pdf`
              const { error: pdfUploadErr } = await supabase.storage
                .from('meeting-minutes')
                .upload(pdfPath, pdfBlob, { contentType: 'application/pdf', upsert: false })
              if (pdfUploadErr) throw pdfUploadErr

              const { data: publicPdf } = supabase.storage
                .from('meeting-minutes')
                .getPublicUrl(pdfPath)

              await saveMinutes({
                created_by: profile.id,
                attendees: attendees.map((id) => ({ user_id: id, name: id, apartment: '', attended: true })),
                agenda_items: agendaItems,
                other_notes: otherNotes || null,
                next_meeting_date: nextMeetingDate || null,
                secretary_id: secretaryId || null,
                chair_id: chairId || null,
                is_draft: false,
                is_finalized: true,
                pdf_url: publicPdf.publicUrl,
                finalized_at: new Date().toISOString(),
              })
              onFinalize()
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e)
              setSubmitError(msg)
            }
          }}
        >
          Loka fundi & Vista
        </Button>
      </div>
    </div>
  )
}

