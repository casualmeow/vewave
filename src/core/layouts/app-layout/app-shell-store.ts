import { create } from 'zustand'
import type { AppSidebarMode } from './app-sidebar-mode'

type AppShellState = {
  sidebarMode: AppSidebarMode
  setSidebarMode: (mode: AppSidebarMode) => void
}

export const useAppShellStore = create<AppShellState>((set) => ({
  sidebarMode: 'expanded',
  setSidebarMode: (sidebarMode) => set({ sidebarMode }),
}))
