export interface AgendaItem {
  id: string
  title: string
  discussion: string
  decision: string
  vote_type: 'none' | 'unanimous' | 'counted'
  votes: {
    for: number
    against: number
    abstain: number
  } | null
}

export interface Attendee {
  user_id: string
  name: string
  apartment: string
  attended: boolean
}

export interface MeetingMinutes {
  id: string
  meeting_id: string
  attendees: Attendee[]
  agenda_items: AgendaItem[]
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

