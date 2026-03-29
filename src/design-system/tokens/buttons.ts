/**
 * Hnappar — litatöfla hönnunar (filled / ghost / outlined / light) + stærðir úr Button MS.
 * Tákn: text/Blue, dökkblár/* → `blueColors`; grár/* → `grayColors`.
 */
export const figmaButtonTokens = {
  radius: '8px',
  gapIconPx: 6,
  iconPx: 16,
  /**
   * Þrjár stærðir — hæð H í hönnun (px). Í kóða: `Button` prop `size` → lg / default / sm.
   */
  sizes: {
    large: {
      label: 'Big',
      heightPx: 52,
      buttonSize: 'lg',
      paddingXPx: 32,
      paddingYPx: 16,
      fontSizePx: 16,
      lineHeight: 1.25,
    },
    medium: {
      label: 'Medium',
      heightPx: 44,
      buttonSize: 'default',
      paddingXPx: 24,
      paddingYPx: 12,
      fontSizePx: 16,
      lineHeight: 1.25,
    },
    small: {
      label: 'Small',
      heightPx: 36,
      buttonSize: 'sm',
      paddingXPx: 16,
      paddingYPx: 8,
      fontSizePx: 14,
      lineHeightPx: 16,
    },
  },
  /** Filled — default = text/Blue */
  primary: {
    default: '#18325A',
    hover: '#2B4C75',
    pressed: '#41628D',
    disabledBackground: '#E8EAEE',
    disabledText: '#B3B3B3',
  },
  ghost: {
    hoverBackground: '#E8EAEE',
    pressedBackground: '#F3F5F7',
  },
  outline: {
    defaultBorder: '#F3F5F7',
    hoverBorder: '#D1D6DE',
    hoverBackground: '#E8EAEE',
    pressedBorder: '#E8EAEE',
    pressedBackground: '#F3F5F7',
    disabledBorder: '#E5E5E5',
  },
  light: {
    defaultBackground: '#F3F5F7',
    hoverBackground: '#D1D6DE',
    pressedBackground: '#E8EAEE',
  },
  text: {
    primary: '#323232',
    inverse: '#FFFFFF',
    disabled: '#B3B3B3',
  },
} as const

/** Röðuð birting: Big / Medium / Small → `Button` `size` og H (px). */
export const buttonSizeTable = [
  { id: 'large' as const, ...figmaButtonTokens.sizes.large },
  { id: 'medium' as const, ...figmaButtonTokens.sizes.medium },
  { id: 'small' as const, ...figmaButtonTokens.sizes.small },
] as const

/** Birting í hönnunarkerfi — hver röð samsvarar töflu úr Figma (nafn + tákn + hex). */
export const buttonColorTable = [
  {
    id: 'filled',
    title: 'Button / filled',
    rows: [
      { name: 'default', token: 'text/Blue', value: figmaButtonTokens.primary.default },
      { name: 'Hover', token: 'dökkblár/900', value: figmaButtonTokens.primary.hover },
      { name: 'Pressed', token: 'dökkblár/800', value: figmaButtonTokens.primary.pressed },
      { name: 'disable', token: 'grár/300', value: figmaButtonTokens.primary.disabledBackground },
    ],
  },
  {
    id: 'ghost',
    title: 'Button / ghost',
    rows: [
      { name: 'Hover', token: 'grár/300', value: figmaButtonTokens.ghost.hoverBackground },
      { name: 'Pressed', token: 'grár/200', value: figmaButtonTokens.ghost.pressedBackground },
    ],
  },
  {
    id: 'outlined',
    title: 'Button / outlined',
    rows: [
      { name: 'stroke', token: 'grár/200', value: figmaButtonTokens.outline.defaultBorder },
      { name: 'stroke hover', token: 'grár/400', value: figmaButtonTokens.outline.hoverBorder },
      { name: 'filled hover', token: 'grár/300', value: figmaButtonTokens.outline.hoverBackground },
      { name: 'stroke pressed', token: 'grár/300', value: figmaButtonTokens.outline.pressedBorder },
      { name: 'filled pressed', token: 'grár/200', value: figmaButtonTokens.outline.pressedBackground },
    ],
  },
  {
    id: 'light',
    title: 'Button / light',
    rows: [
      { name: 'default', token: 'grár/200', value: figmaButtonTokens.light.defaultBackground },
      { name: 'Hover', token: 'grár/400', value: figmaButtonTokens.light.hoverBackground },
      { name: 'Pressed', token: 'grár/300', value: figmaButtonTokens.light.pressedBackground },
    ],
  },
] as const
