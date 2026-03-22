import { theme, type Theme } from './theme/theme'

/**
 * Aðgangur að hönnunarkerfinu í React.
 * Skilar sama hlutnum — engin þema-skipting á keyrslutíma ennþá.
 */
export function useTheme(): Theme {
  return theme
}

export type { Theme }
