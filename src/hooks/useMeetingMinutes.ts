import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { MeetingMinutes } from '@/types/minutes'

type DbMeetingMinutesRow = {
  id: string
  meeting_id: string
  attendees: unknown
  agenda_items: unknown
  other_notes: string | null
  next_meeting_date: string | null
  secretary_id: string | null
  chair_id: string | null
  is_finalized: boolean
  is_draft: boolean
  pdf_url: string | null
  created_at: string
  updated_at: string
  finalized_at: string | null
  created_by: string | null
}

function toMinutes(row: DbMeetingMinutesRow): MeetingMinutes {
  return {
    id: row.id,
    meeting_id: row.meeting_id,
    attendees: Array.isArray(row.attendees) ? (row.attendees as MeetingMinutes['attendees']) : [],
    agenda_items: Array.isArray(row.agenda_items) ? (row.agenda_items as MeetingMinutes['agenda_items']) : [],
    other_notes: row.other_notes,
    next_meeting_date: row.next_meeting_date,
    secretary_id: row.secretary_id,
    chair_id: row.chair_id,
    is_finalized: row.is_finalized,
    is_draft: row.is_draft,
    pdf_url: row.pdf_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    finalized_at: row.finalized_at,
    created_by: row.created_by,
  }
}

export function useMeetingMinutes(meetingId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    enabled: isSupabaseConfigured() && Boolean(meetingId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle()
      if (error) throw error
      return data ? toMinutes(data as DbMeetingMinutesRow) : null
    },
  })

  const upsertMutation = useMutation({
    mutationFn: async (payload: Partial<MeetingMinutes> & { created_by: string }) => {
      // Ensure meeting row exists for FK
      const { error: meetingErr } = await supabase
        .from('meetings')
        .upsert({ id: meetingId, title: 'Fundur', meeting_date: new Date().toISOString() })
      if (meetingErr) throw meetingErr

      const row: Database['public']['Tables']['meeting_minutes']['Insert'] = {
        meeting_id: meetingId,
        attendees: (payload.attendees ?? []) as unknown as Database['public']['Tables']['meeting_minutes']['Insert']['attendees'],
        agenda_items: (payload.agenda_items ?? []) as unknown as Database['public']['Tables']['meeting_minutes']['Insert']['agenda_items'],
        other_notes: payload.other_notes ?? null,
        next_meeting_date: payload.next_meeting_date ?? null,
        secretary_id: payload.secretary_id ?? null,
        chair_id: payload.chair_id ?? null,
        is_finalized: payload.is_finalized ?? false,
        is_draft: payload.is_draft ?? true,
        pdf_url: payload.pdf_url ?? null,
        finalized_at: payload.finalized_at ?? null,
        created_by: payload.created_by,
      }

      const { data, error } = await supabase
        .from('meeting_minutes')
        .upsert(row, { onConflict: 'meeting_id' })
        .select('*')
        .single()
      if (error) throw error
      return toMinutes(data as DbMeetingMinutesRow)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['meeting-minutes', meetingId], data)
      void queryClient.invalidateQueries({ queryKey: ['meeting-minutes-list'] })
    },
  })

  const deleteDraftMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('meeting_minutes')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('is_finalized', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(['meeting-minutes', meetingId], null)
      void queryClient.invalidateQueries({ queryKey: ['meeting-minutes-list'] })
    },
  })

  return {
    minutes: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    saveMinutes: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
    deleteDraft: deleteDraftMutation.mutateAsync,
    isDeletingDraft: deleteDraftMutation.isPending,
  }
}

export function useMeetingMinutesList() {
  return useQuery({
    queryKey: ['meeting-minutes-list'],
    enabled: isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await supabase.from('meeting_minutes').select('*')
      if (error) throw error
      return (data ?? []).map((row) => toMinutes(row as DbMeetingMinutesRow))
    },
  })
}

