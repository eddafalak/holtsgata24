import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Ensure pdf.js uses the correct worker file in Vite builds.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export async function extractPdfText(file: File, maxPages = 10): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pagesToRead = Math.min(pdf.numPages, maxPages)
  const parts: string[] = []

  for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const text = content.items.map((i) => ('str' in i ? i.str : '')).join(' ')
    parts.push(text)
  }

  return parts.join('\n')
}

export function parseAmountIskFromText(text: string): number | null {
  // Common patterns in bills:
  // - "37,334 kr"
  // - "37.334 kr."
  // - "12.345 ISK"
  const normalized = text.replace(/\s+/g, ' ')

  const amountRegexes = [
    /([0-9][0-9.,\s]*)\s*(?:kr\.?|ISK|ISK\.?)/i,
    /verð\s*([0-9][0-9.,\s]*)/i,
  ]

  for (const re of amountRegexes) {
    const m = normalized.match(re)
    if (!m) continue

    const raw = (m[1] ?? '').trim()
    if (!raw) continue

    // Convert common Icelandic/European number formats:
    // - thousands: "," or "."
    // - decimals: "," or "."
    // We infer decimal vs thousands based on digit count after the last separator.
    let s = raw.replace(/\s+/g, '').trim()

    const hasComma = s.includes(',')
    const hasDot = s.includes('.')

    if (hasComma && hasDot) {
      // Assume thousands are '.' and decimals are ',' -> "1.234,56"
      s = s.replace(/\./g, '').replace(',', '.')
    } else if (hasComma && !hasDot) {
      // Either thousands (e.g. "37,334") or decimal (e.g. "12,34")
      const parts = s.split(',')
      if (parts.length === 2) {
        const decimals = parts[1]
        if (decimals.length === 2) {
          // Decimal comma -> "12,34"
          s = `${parts[0]}.${decimals}`
        } else {
          // Thousands comma -> "37,334" (or any non-2-digit suffix)
          s = parts[0] + parts[1]
        }
      } else {
        // Multiple commas -> treat as thousands separators
        s = s.replace(/,/g, '')
      }
    } else if (hasDot && !hasComma) {
      // Either thousands (e.g. "37.334") or decimal (e.g. "12.34")
      const parts = s.split('.')
      if (parts.length === 2) {
        const decimals = parts[1]
        if (decimals.length === 2) {
          // Decimal dot -> "12.34"
          s = `${parts[0]}.${decimals}`
        } else {
          // Thousands dot -> "37.334"
          s = parts[0] + decimals
        }
      } else {
        // Multiple dots -> treat as thousands separators
        s = s.replace(/\./g, '')
      }
    }

    const num = Number(s)
    if (Number.isFinite(num)) return Math.round(num)
  }

  return null
}

export function parseDueDateIsoFromText(text: string): string | null {
  // Look for dd.mm.yyyy or yyyy-mm-dd
  const normalized = text.replace(/\s+/g, ' ')

  const ddmmyyyy = normalized.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy
    return `${yyyy}-${mm}-${dd}`
  }

  const yyyy_mm_dd = normalized.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (yyyy_mm_dd) return `${yyyy_mm_dd[1]}-${yyyy_mm_dd[2]}-${yyyy_mm_dd[3]}`

  return null
}

export function parseFirstDateIsoFromText(text: string): string | null {
  // Returns first date-like occurrence as ISO (YYYY-MM-DD).
  // Tries dd.mm.yyyy first, then yyyy-mm-dd.
  const normalized = text.replace(/\s+/g, ' ')

  const ddmmyyyy = normalized.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy
    return `${yyyy}-${mm}-${dd}`
  }

  const yyyy_mm_dd = normalized.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (yyyy_mm_dd) return `${yyyy_mm_dd[1]}-${yyyy_mm_dd[2]}-${yyyy_mm_dd[3]}`

  return null
}

export function parseBillStatusFromText(text: string): 'ogreitt' | 'greitt' | null {
  const t = text.toLowerCase()
  if (t.includes('greitt') || t.includes('paid')) return 'greitt'
  if (
    t.includes('ógreitt') ||
    t.includes('ogreitt') ||
    t.includes('ógreidd') ||
    t.includes('unpaid') ||
    t.includes('pending') ||
    t.includes('ógreið') ||
    t.includes('ogreið')
  )
    return 'ogreitt'
  return null
}

