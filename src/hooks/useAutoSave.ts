import { useEffect, useRef, useState } from 'react'

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  interval = 30_000,
  enabled = true,
) {
  const latestDataRef = useRef<T>(data)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(async () => {
      setIsSaving(true)
      setError(null)
      try {
        await onSave(latestDataRef.current)
        setLastSavedAt(new Date())
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        setIsSaving(false)
      }
    }, interval)

    return () => clearInterval(id)
  }, [enabled, interval, onSave])

  return {
    isSaving,
    lastSavedAt,
    error,
  }
}

