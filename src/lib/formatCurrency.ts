/** Sýnir upphæð í íslenskri tölu án brota + „kr“. */
export function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat('is-IS', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' kr'
  )
}
