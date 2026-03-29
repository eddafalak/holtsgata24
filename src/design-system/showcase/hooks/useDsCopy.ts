import * as React from 'react'

export function useDsCopy() {
  const [lastCopied, setLastCopied] = React.useState<string | null>(null)

  const copy = React.useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLastCopied(id)
      window.setTimeout(() => {
        setLastCopied((x) => (x === id ? null : x))
      }, 2000)
    } catch {
      /* ignore */
    }
  }, [])

  return { copy, lastCopied }
}
