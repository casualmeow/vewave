import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react'

type StudioSidebarContextValue = {
  desktopOpen: boolean
  setDesktopOpen: (open: boolean) => void
  toggleDesktop: () => void
}

export const StudioSidebarContext = createContext<StudioSidebarContextValue | null>(null)

type StudioSidebarProviderProps = {
  children: ReactNode
  defaultDesktopOpen?: boolean
}

export function StudioSidebarProvider({
  children,
  defaultDesktopOpen = true,
}: StudioSidebarProviderProps) {
  const [desktopOpen, setDesktopOpen] = useState(defaultDesktopOpen)

  const toggleDesktop = useCallback(() => {
    setDesktopOpen((open) => !open)
  }, [])

  const value = useMemo<StudioSidebarContextValue>(
    () => ({
      desktopOpen,
      setDesktopOpen,
      toggleDesktop,
    }),
    [desktopOpen, toggleDesktop],
  )

  return <StudioSidebarContext.Provider value={value}>{children}</StudioSidebarContext.Provider>
}
