export type Role = 'formadur' | 'gjaldkeri' | 'ritari' | 'eigandi'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role | null
  apartment_id: string | null
  avatar_url: string | null
  created_at: string
}

export interface Apartment {
  id: string
  name: string
  property_number: string
  size: number
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  description: string | null
  meeting_date: string
  meeting_type: string | null
  pdf_url: string | null
  created_by: string
  created_at: string
}

export interface Contract {
  id: string
  name: string
  type: string | null
  file_url: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export type BillCategory = 'vatn' | 'hiti' | 'rafmagn' | 'vidhald' | 'annad'

export interface Bill {
  id: string
  name: string
  category: BillCategory
  amount: number
  date: string
  file_url: string | null
  description: string | null
  uploaded_by: string
  created_at: string
}

export interface Message {
  id: string
  content: string
  sender_id: string
  is_private: boolean
  recipient_id: string | null
  read: boolean
  created_at: string
}

