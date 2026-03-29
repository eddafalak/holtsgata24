import { format, formatDistanceToNow } from 'date-fns'
import { is as isLocale } from 'date-fns/locale'

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Íslensk dagsetning.
 * short: „15. mars“
 * long: „laugardagur, 28. mars 2026“
 * relative: „fyrir 2 dögum“ (date-fns is)
 */
export function formatDate(
  date: string | Date,
  kind: 'short' | 'long' | 'relative',
): string {
  const d = toDate(date)
  if (Number.isNaN(d.getTime())) return '—'

  if (kind === 'short') {
    return format(d, 'd. MMMM', { locale: isLocale })
  }
  if (kind === 'long') {
    return format(d, 'EEEE, d. MMMM yyyy', { locale: isLocale })
  }
  return formatDistanceToNow(d, { addSuffix: true, locale: isLocale })
}
