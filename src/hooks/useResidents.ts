import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Apartment, Profile } from '@/types'

export interface ApartmentWithResidents extends Apartment {
  residents: Profile[]
}

async function fetchApartmentsAndResidents(): Promise<ApartmentWithResidents[]> {
  const [{ data: apartments, error: apartmentsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase.from('apartments').select('*').order('name', { ascending: true }),
      supabase.from('profiles').select('*'),
    ])

  if (apartmentsError) throw apartmentsError
  if (profilesError) throw profilesError

  const profileList = (profiles ?? []) as Profile[]
  const apartmentList = (apartments ?? []) as Apartment[]

  return apartmentList.map((apt) => ({
    ...apt,
    residents: profileList.filter((p) => p.apartment_id === apt.id),
  }))
}

export function useResidents() {
  return useQuery({
    queryKey: ['apartments-with-residents'],
    queryFn: fetchApartmentsAndResidents,
  })
}

