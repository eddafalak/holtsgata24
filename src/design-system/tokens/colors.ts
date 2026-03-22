/**
 * Aðeins litir sem birtast í hönnun þinni (bein beiting í .tsx-síðum og viðmótshlutum).
 * Ekki innifalið: sjálfgefin shadcn oklch-breytur né eldra :root-safn nema það sé í þessum skrám.
 *
 * Vörumerkjalitir — sjá `brandColors` (samsvarar `primary.DEFAULT`, `accent.lime`, `semantic.upcoming`).
 */

/** Gráskali — einn uppruni fyrir `grayColors` og vísanir í `semanticColorTokens`. */
const grayScale = {
  100: '#FBFBFC',
  200: '#F3F5F7',
  300: '#E8EAEE',
  400: '#D1D6DE',
  500: '#A3ADBD',
  600: '#74849C',
  700: '#465B7B',
} as const

/** Aðaltexti og ljós texti — sameinað við `textColors` og `neutral`. */
const textBlack = '#000000' as const
const textLight = '#FFFFFF' as const

/** Blár skali — einn uppruni fyrir `blueColors` og vísanir í `semanticColorTokens`. */
const blueScale = {
  50: '#F8FAFD',
  100: '#F2F5FA',
  200: '#E4ECF5',
  300: '#D7E2F1',
  400: '#BCCFE7',
  500: '#89A4C5',
  600: '#6F8CB0',
  700: '#537298',
  800: '#41628D',
  900: '#2B4C75',
} as const

/**
 * Semantísk UI-tákn — sama hex og í grunnlitum (grayColors / blueColors) þegar við á.
 * Notið t.d. `colors.semanticColorTokens.border.default` í stað beins `grayColors.300` þegar hlutverk er lýst.
 */
export const semanticColorTokens = {
  border: {
    default: grayScale[300],
    dark: grayScale[400],
  },
  surface: {
    page: '#FBFBFB',
    card: '#FFFFFF',
  },
  cards: {
    default: '#FFFFFF',
    table: grayScale[100],
    active: grayScale[200],
  },
  tags: {
    light: grayScale[300],
    dark: grayScale[400],
  },
  icon: {
    default: blueScale[900],
  },
  /**
   * Texti — samsvarar Figma „Text“: Default → text/black, Placeholder → grár/600.
   */
  text: {
    default: textBlack,
    placeholder: grayScale[600],
  },
} as const

/** Fyrir skjái / skjöl: segir til um hvaða grunnlitur tákn gildið er dregið af. */
export function describeSemanticColorSource(value: string): string {
  if (value === textBlack) return 'textColors.black'
  if (value === textLight) return 'textColors.light / neutral.white'
  const grayHit = (Object.entries(grayScale) as [string, string][]).find(([, v]) => v === value)
  if (grayHit) return `grayColors.${grayHit[0]}`
  const blueHit = (Object.entries(blueScale) as [string, string][]).find(([, v]) => v === value)
  if (blueHit) return `blueColors.${blueHit[0]}`
  return `fastur ${value}`
}

export const colors = {
  /**
   * Þrír vörumerkjalitir (opinber skilgreining).
   * Lyklar án séríslenskra stafa fyrir auðvelda notkun í kóða.
   */
  brandColors: {
    /** Blár — aðallitur, sidebar, aðalhnappar */
    blar: '#18325A',
    /** Gulur — áhersla, virkir flipar, CTA á innskráningu */
    gulur: '#DFFFB4',
    /** Appelsínugulur — ástand, athygli (t.d. „væntanlegur“) */
    appelsinugulur: '#F18F01',
  },

  /**
   * Textalitir — black, placeholder og light. Blár texti: notið `brandColors.blar`.
   */
  textColors: {
    black: textBlack,
    /** Placeholder / hjálpartexti — sami og `semanticColorTokens.text.placeholder` (grár 600). */
    placeholder: grayScale[600],
    /** Ljós texti (t.d. á dökkum bakgrunni) */
    light: textLight,
  },

  primary: {
    DEFAULT: '#18325A',
    hover: '#162B47',
  },

  /**
   * Opinber blár skali — notaður með vörumerki og UI. Vigt 50 = næst hvítur, 900 = dökkast.
   * Aðalliturinn `primary.DEFAULT` (#18325A) er í sama fjölskyldu en ekki eitt af þessum skrefum.
   */
  blueColors: blueScale,

  accent: {
    lime: '#DFFFB4',
    limeHover: '#CDF28C',
  },

  /**
   * Opinber gráskali — köld, bláleit tónn sem passar við aðallitinn #18325A.
   * Vigt 100 = ljósast, 700 = dökkast.
   */
  grayColors: grayScale,

  gray: {
    heading: '#323232',
    muted: '#666666',
    subtle: '#A2A4A8',
    borderLight: '#F2F3F4',
    pillTrack: '#F3F5F7',
    pillTrackAlt: '#F0F1F3',
    inputBorder: '#E6E8E9',
    separator: '#E8EFEF',
    rowHover: '#F7F8F9',
    rowHoverAlt: '#F7F8FA',
    canvas: '#FBFBFB',
    tableTint: 'rgba(242, 243, 244, 0.3)',
    tableTintHover: 'rgba(242, 243, 244, 0.45)',
    loginBorder: '#D0D0D0',
  },

  neutral: {
    white: textLight,
    black: textBlack,
  },

  semantic: {
    upcoming: '#F18F01',
    notification: '#F4743B',
  },

  semanticColorTokens,
} as const

export type Colors = typeof colors

export type SemanticColorTokenPath = {
  [G in keyof typeof semanticColorTokens]: {
    [K in keyof (typeof semanticColorTokens)[G]]: `semanticColorTokens.${G & string}.${K & string}`
  }[keyof (typeof semanticColorTokens)[G]]
}[keyof typeof semanticColorTokens]

export type ColorPath =
  | `brandColors.${keyof typeof colors.brandColors}`
  | `textColors.${keyof typeof colors.textColors}`
  | `primary.${keyof typeof colors.primary}`
  | `accent.${keyof typeof colors.accent}`
  | `blueColors.${keyof typeof colors.blueColors}`
  | `grayColors.${keyof typeof colors.grayColors}`
  | `gray.${keyof typeof colors.gray}`
  | `neutral.${keyof typeof colors.neutral}`
  | `semantic.${keyof typeof colors.semantic}`
  | SemanticColorTokenPath
