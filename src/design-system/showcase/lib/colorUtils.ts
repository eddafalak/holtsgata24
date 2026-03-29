/** Hex #RRGGBB → "rgb(r, g, b)" fyrir afritun. */
export function hexToRgbString(hex: string): string {
  const n = hex.replace('#', '')
  if (n.length !== 6) return hex
  const r = Number.parseInt(n.slice(0, 2), 16)
  const g = Number.parseInt(n.slice(2, 4), 16)
  const b = Number.parseInt(n.slice(4, 6), 16)
  if (Number.isNaN(r + g + b)) return hex
  return `rgb(${r}, ${g}, ${b})`
}
