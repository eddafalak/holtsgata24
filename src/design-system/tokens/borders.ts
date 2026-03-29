/**
 * Hornradíus og rammalitir eins og þeir koma fram í þínum beitingum.
 */
export const borders = {
  /** `rounded-[…]` og fastar í className */
  radiusPx: {
    tabActive: '4px',
    segment: '6px',
    /** Hnappar — samsvarar `Button` og `rounded-[8px]` á CTA */
    button: '8px',
    dropdown: '8px',
    tabIdle: '14px',
  },

  /** Tailwind-flokkar sem koma við í síðum (md / lg / xl / hringur) */
  radiusUtility: ['rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'] as const,

  /** Rammlitir — sömu hex og í reitum / kortum */
  borderColor: {
    card: '#F2F3F4',
    input: '#E6E8E9',
    login: '#D0D0D0',
  },
} as const

export type Borders = typeof borders
