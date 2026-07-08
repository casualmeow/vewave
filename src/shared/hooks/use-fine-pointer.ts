import { useEffect, useState } from 'react'

const finePointerQuery = '(hover: hover) and (pointer: fine)'

export function useFinePointer() {
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(finePointerQuery)

    setFinePointer(query.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setFinePointer(event.matches)
    }

    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return finePointer
}
