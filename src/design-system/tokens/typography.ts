/**
 * Letur eins og það birtist í þínum síðum: píxlastærðir (`text-[14px]` o.fl.),
 * Tailwind-stærðir (text-sm, text-2xl, …) og Geist sem sjálfgefinn fontur.
 */
export const typography = {
  fontFamily: {
    sans: "'Geist Variable', sans-serif",
  },

  /** Píxlastærðir úr `text-[Npx]` beitingum */
  fontSizePx: [10, 12, 14, 16, 18, 20, 24, 32, 36] as const,

  /** Tailwind text-* sem koma fyrir í síðum (Home, Bills, Messages, …) */
  fontSizeUtility: ['text-xs', 'text-sm', 'text-2xl'] as const,

  /** Villuskilaboð í Fundum */
  validationMessageClass: 'text-red-600',

  fontWeight: ['normal', 'medium', 'semibold', 'bold'] as const,

  /** `leading-*` og hlutföll sem koma fyrir í className */
  lineHeight: {
    tight: 'leading-tight',
    snug: 'leading-snug',
    relaxed: 'leading-relaxed',
    /** Fastar í Fundum / AppLayout */
    px16: 'leading-[16px]',
    ratio1222: 'leading-[1.222]',
    ratio12: 'leading-[1.2]',
    ratio125: 'leading-[1.25]',
  },
} as const

export type Typography = typeof typography
