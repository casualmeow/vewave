import { useCallback, useEffect, useRef } from 'react'

type CssVariableMap = Record<`--${string}`, string | number>

export function useRafCssVariables() {
  const frameRef = useRef<number | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const variablesRef = useRef<CssVariableMap>({})

  const flush = useCallback(() => {
    frameRef.current = null

    const target = targetRef.current
    if (!target) return

    Object.entries(variablesRef.current).forEach(([name, value]) => {
      target.style.setProperty(name, String(value))
    })

    variablesRef.current = {}
  }, [])

  const setCssVariables = useCallback(
    (target: HTMLElement, variables: CssVariableMap) => {
      targetRef.current = target
      variablesRef.current = {
        ...variablesRef.current,
        ...variables,
      }

      if (frameRef.current !== null) return

      frameRef.current = window.requestAnimationFrame(flush)
    },
    [flush],
  )

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return setCssVariables
}
