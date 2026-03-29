import { borders, colors, inputPatternClasses, shadows, spacing, typography } from '../tokens'

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
    /** Stór reitur — H 56px */
    figmaInput: inputPatternClasses.large,
    /** Lítill reitur — H 40px */
    figmaInputSm: inputPatternClasses.small,
    figmaLabel: 'text-[14px] font-medium leading-4 text-[#666]',
    /** Miðstærð — samsvarar Figma „Medium“ og `Button` size `default` */
    figmaPrimaryButton:
      'inline-flex h-[44px] items-center justify-center rounded-[8px] border-0 bg-[#18325a] px-6 text-base font-bold leading-tight text-white transition-colors hover:bg-[#2b4c75] active:bg-[#41628d] disabled:bg-[#e8eaee] disabled:text-[#b3b3b3]',
    figmaCard: 'rounded-lg border border-[#f2f3f4] bg-white p-6',
  },
} as const

export type Theme = typeof theme
