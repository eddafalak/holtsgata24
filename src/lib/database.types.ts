export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/** Uppfærðu með `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts` eftir breytingum á gagnagrunn. */
export type Database = {
  public: {
    Tables: {
      apartments: {
        Row: {
          id: string
          name: string
          property_number: string
          size: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          property_number: string
          size: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          property_number?: string
          size?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          role: string | null
          apartment_id: string | null
          avatar_url: string | null
          approval_status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
          apartment_id?: string | null
          avatar_url?: string | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
          apartment_id?: string | null
          avatar_url?: string | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_apartment_id_fkey'
            columns: ['apartment_id']
            isOneToOne: false
            referencedRelation: 'apartments'
            referencedColumns: ['id']
          },
        ]
      }
      ,
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          meeting_date: string
          meeting_type: string | null
          pdf_url: string | null
          location: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          description?: string | null
          meeting_date?: string
          meeting_type?: string | null
          pdf_url?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          meeting_date?: string
          meeting_type?: string | null
          pdf_url?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meetings_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ,
      meeting_minutes: {
        Row: {
          id: string
          meeting_id: string
          attendees: Json
          agenda_items: Json
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
        Insert: {
          id?: string
          meeting_id: string
          attendees?: Json
          agenda_items?: Json
          other_notes?: string | null
          next_meeting_date?: string | null
          secretary_id?: string | null
          chair_id?: string | null
          is_finalized?: boolean
          is_draft?: boolean
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          finalized_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          meeting_id?: string
          attendees?: Json
          agenda_items?: Json
          other_notes?: string | null
          next_meeting_date?: string | null
          secretary_id?: string | null
          chair_id?: string | null
          is_finalized?: boolean
          is_draft?: boolean
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          finalized_at?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'meeting_minutes_meeting_id_fkey'
            columns: ['meeting_id']
            isOneToOne: true
            referencedRelation: 'meetings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meeting_minutes_secretary_id_fkey'
            columns: ['secretary_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meeting_minutes_chair_id_fkey'
            columns: ['chair_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meeting_minutes_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ,
      bills: {
        Row: {
          id: string
          kind: 'reikningur' | 'skjal'
          name: string
          category: 'vatn' | 'hiti' | 'rafmagn' | 'vidhald' | 'annad'
          amount: number | null
          date: string
          due_date: string | null
          status: 'ogreitt' | 'greitt'
          file_url: string | null
          description: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          kind: 'reikningur' | 'skjal'
          name: string
          category?: 'vatn' | 'hiti' | 'rafmagn' | 'vidhald' | 'annad'
          amount?: number | null
          date: string
          due_date?: string | null
          status?: 'ogreitt' | 'greitt'
          file_url?: string | null
          description?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          kind?: 'reikningur' | 'skjal'
          name?: string
          category?: 'vatn' | 'hiti' | 'rafmagn' | 'vidhald' | 'annad'
          amount?: number | null
          date?: string
          due_date?: string | null
          status?: 'ogreitt' | 'greitt'
          file_url?: string | null
          description?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bills_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'auth.users'
            referencedColumns: ['id']
          },
        ]
      }
      fund_balance: {
        Row: {
          id: string
          balance: number
          month: string
          income: number
          expenses: number
          notes: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          balance: number
          month: string
          income?: number
          expenses?: number
          notes?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          balance?: number
          month?: string
          income?: number
          expenses?: number
          notes?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fund_balance_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          is_private: boolean
          recipient_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          is_private?: boolean
          recipient_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          is_private?: boolean
          recipient_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
