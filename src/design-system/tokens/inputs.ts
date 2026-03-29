/**
 * Inntaksreitir — Figma Textfield (295:10088) og Fundargerð gluggi (120:9250).
 * Ein-línu reitur: útlína #f3f5f7 (Outlined stroke), hover #f2f2f2 / #d1d6de.
 * Textarea (Umræða): útlína #e5e5e5, teljari #b3b3b3.
 */
/** Horn á öllum inntaksreitum — 8px, skilgreint sem `var(--radius-input)` í `src/index.css`. */
export const inputBorderRadiusClass = 'rounded-[var(--radius-input)]' as const

export const figmaInputTokens = {
  /** Staðfest horn á reit (px) — samræmist `--radius-input`. */
  cornerRadiusPx: 8,
  colors: {
    borderDefault: '#F3F5F7',
    borderHover: '#D1D6DE',
    backgroundDefault: '#FFFFFF',
    backgroundHover: '#F2F2F2',
    label: '#666666',
    text: '#1A1A1A',
    placeholder: '#666666',
    supportingText: '#4C4C4C',
    suffixBgDefault: '#EFF5F7',
    suffixBgHover: '#E5E5E5',
    suffixText: '#1A1A1A',
  },
  sizes: {
    large: {
      label: 'Large',
      heightPx: 56,
      paddingXOuterPx: 12,
      paddingXContentEndPx: 16,
      gapIconPx: 8,
      labelFontPx: 12,
      labelLinePx: 16,
      inputFontPx: 16,
      inputLinePx: 24,
      supportingFontPx: 14,
      supportingLinePx: 20,
      startIconPx: 24,
      adornmentIconPx: 16,
    },
    small: {
      label: 'Small',
      heightPx: 40,
      paddingXOuterPx: 8,
      paddingXContentEndPx: 8,
      gapIconPx: 8,
      labelFontPx: 10,
      labelLinePx: 12,
      inputFontPx: 12,
      inputLinePx: 16,
      supportingFontPx: 12,
      supportingLinePx: 16,
      startIconPx: 20,
      adornmentIconPx: 16,
    },
  },
} as const

export const inputSizeTable = [
  { id: 'large' as const, ...figmaInputTokens.sizes.large },
  { id: 'small' as const, ...figmaInputTokens.sizes.small },
] as const

/**
 * Einfaldur `<input />` án viðbyggðs labels — sömu litir og horn og Figma reiturinn.
 */
export const inputPatternClasses = {
  large:
    `h-[56px] w-full ${inputBorderRadiusClass} border border-[#f3f5f7] bg-white px-3 text-base leading-6 text-[#1a1a1a] outline-none transition-colors placeholder:text-[#666] hover:border-[#d1d6de] hover:bg-[#f2f2f2] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50`,
  small:
    `h-[40px] w-full ${inputBorderRadiusClass} border border-[#f3f5f7] bg-white px-2 text-xs leading-4 text-[#1a1a1a] outline-none transition-colors placeholder:text-[#666] hover:border-[#d1d6de] hover:bg-[#f2f2f2] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50`,
} as const

/** Figma „Umræða“ — rammi utan labels, 138px lágmarks hæð. */
export const figmaTextareaTokens = {
  cornerRadiusPx: 8,
  minHeightPx: 138,
  contentMinHeightPx: 48,
  bodyFontPx: 16,
  border: '#E5E5E5',
  counterColor: '#B3B3B3',
  labelSizePx: 14,
  labelLinePx: 16,
} as const

export const textareaPatternClasses = `min-h-[138px] w-full ${inputBorderRadiusClass} border border-[#e5e5e5] bg-white px-4 py-2 text-[16px] leading-[1.5] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#666] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50`

/** Rammi fyrir TextareaField með innri teljara (sama og Figma `Text-area`). */
export const textareaFieldShellClasses = `flex min-h-[138px] flex-col gap-1 ${inputBorderRadiusClass} border border-[#e5e5e5] bg-white px-4 py-2 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15`
