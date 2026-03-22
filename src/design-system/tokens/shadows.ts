/**
 * Aðeins box-shadow-strengir sem þú hefur skilgreint í kóðanum (inline eða Tailwind arbitrary).
 */
export const shadows = {
  /** MeetingsPage kort, SettingsPage yfirskriftarkort — `cardBoxShadow` / sama gildi */
  cardSoft: '0px 0px 24px -4px rgba(0, 0, 0, 0.05)',

  /**
   * Popover (`popover.tsx`) og virkur flipi í Fundum — sama tvílags skuggi.
   */
  layeredSoft:
    '0px 2px 6px 0px rgba(0, 0, 0, 0.06), 0px 1px 2px 0px rgba(0, 0, 0, 0.04)',

  /** Notendaval í AppLayout */
  dropdownMenu: '0px 0px 24px 0px rgba(0, 0, 0, 0.05)',
} as const

export type Shadows = typeof shadows

export type ShadowToken = keyof typeof shadows
