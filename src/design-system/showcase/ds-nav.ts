/**
 * Yfirlit yfir köflur í hönnunarkerfinu — leitarorð í `search` (lágstafir).
 */
export const DS_SECTIONS = [
  {
    id: 'litir',
    label: 'Litir',
    icon: '🎨',
    description: 'Vörumerki, skalar, litatákn og leiðbeiningar',
    search:
      'litir color primary blár grár blue gray semantic tákn brand placeholder border surface',
  },
  {
    id: 'letur',
    label: 'Letur',
    icon: '🔤',
    description: 'Leturgerð, stærðir og þyngdir',
    search: 'letur typography font geist stærð text heading',
  },
  {
    id: 'bil',
    label: 'Bil',
    icon: '📏',
    description: 'Padding, margin og gap',
    search: 'bil spacing padding margin gap grid',
  },
  {
    id: 'rammar',
    label: 'Rammar og skuggar',
    icon: '🔲',
    description: 'Hornradíus, rammlitir og skuggar',
    search: 'rammar radius skuggar shadow border horn',
  },
  {
    id: 'ihlutir',
    label: 'Íhlutir',
    icon: '🧩',
    description: 'shadcn-hlutar og hnappatöflur',
    search:
      'íhlutir hnappur button card dialog popover calendar input reitur figma hnappar lit',
  },
  {
    id: 'skipulag',
    label: 'Skipulag',
    icon: '📐',
    description: 'Síðuuppbygging og mynstur',
    search: 'skipulag layout app grid sidebar uppsetning',
  },
] as const

export type DsSection = (typeof DS_SECTIONS)[number]

export type DsSectionId = DsSection['id']

export function sectionMatches(section: DsSection, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = `${section.label} ${section.description} ${section.search}`.toLowerCase()
  return hay.includes(q) || section.id.includes(q)
}
