import { borders, colors, shadows, spacing, typography } from '../tokens'

/**
 * Sameinað þema — aðeins gildi sem liggja í `tokens/` (úr þinni hönnun í kóðanum).
 */
export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,

  layout: {
    appChromePadding: '16px',
    mainSurface: 'rounded-xl bg-[#fbfbfb]',
    mainPadding: spacing.patterns.mainPadding,
  },

  componentPatterns: {
    figmaInput:
      'h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10',
    figmaLabel: 'text-[14px] font-medium leading-4 text-[#666]',
    figmaPrimaryButton:
      'h-11 rounded-md bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#162b47] border-0',
    figmaCard: 'rounded-lg border border-[#f2f3f4] bg-white p-6',
  },
} as const

export type Theme = typeof theme
