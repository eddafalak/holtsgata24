/**
 * Íbúðir í Holtsgötu 24 — gögn úr HMS fasteignaskrá (staðfang STF1008784).
 * Heimild: https://hms.is/fasteignaskra/100369/1008784
 *
 * Ath: Mat (brunabótamat / fasteignamat) getur breyst — aðeins til viðmiðunar í UI.
 */
export const HOLTSGATA24_HMS_REGISTRY_URL =
  'https://hms.is/fasteignaskra/100369/1008784' as const

export type Holtsgata24Apartment = {
  /** Stöðugt auðkenni fyrir mock / framenda */
  id: string
  /** Birtingarnafn í lista */
  name: string
  /** Fasteignanúmer (HMS), t.d. F2001089 */
  property_number: string
  /** Merking eftir skrá */
  merking: string
  /** Stærð í m² */
  size: number
  /** Brunabótamat í kr. (viðmiðun) */
  brunabotamatKr: number
  /** Fasteignamat í kr. (viðmiðun) */
  fasteignamatKr: number
}

export const HOLTSGATA24_APARTMENTS: Holtsgata24Apartment[] = [
  {
    id: 'hms-f2001089',
    name: 'Holtsgata 24 — íbúð 0201',
    property_number: 'F2001089',
    merking: '01-0201',
    size: 58.6,
    brunabotamatKr: 30_000_000,
    fasteignamatKr: 55_200_000,
  },
  {
    id: 'hms-f2001090',
    name: 'Holtsgata 24 — íbúð 0202',
    property_number: 'F2001090',
    merking: '01-0202',
    size: 101.4,
    brunabotamatKr: 50_900_000,
    fasteignamatKr: 86_550_000,
  },
  {
    id: 'hms-f2001091',
    name: 'Holtsgata 24 — íbúð 0301',
    property_number: 'F2001091',
    merking: '01-0301',
    size: 58.6,
    brunabotamatKr: 30_050_000,
    fasteignamatKr: 55_150_000,
  },
  {
    id: 'hms-f2001092',
    name: 'Holtsgata 24 — íbúð 0302',
    property_number: 'F2001092',
    merking: '01-0302',
    size: 100.3,
    brunabotamatKr: 51_600_000,
    fasteignamatKr: 86_100_000,
  },
  {
    id: 'hms-f2001093',
    name: 'Holtsgata 24 — íbúð 0401',
    property_number: 'F2001093',
    merking: '01-0401',
    size: 76,
    brunabotamatKr: 40_900_000,
    fasteignamatKr: 60_600_000,
  },
  {
    id: 'hms-f2001094',
    name: 'Holtsgata 24 — íbúð 0402',
    property_number: 'F2001094',
    merking: '01-0402',
    size: 133.7,
    brunabotamatKr: 66_900_000,
    fasteignamatKr: 92_250_000,
  },
]
