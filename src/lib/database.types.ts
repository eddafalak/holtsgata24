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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
