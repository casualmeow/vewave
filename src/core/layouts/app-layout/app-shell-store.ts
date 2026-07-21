import { create } from 'zustand'
import type { AppSidebarMode } from './app-sidebar-mode'

type AppShellState = {
  sidebarMode: AppSidebarMode
  setSidebarMode: (mode: AppSidebarMode) => void
}

/**
 * Shell chrome state shared beyond the layout tree. Rooms hide the shell
 * header and re-home the sidebar toggle inside the stage overlay, so the
 * mode lives in a store instead of layout-local state.
 */
export const useAppShellStore = create<AppShellState>((set) => ({
  sidebarMode: 'expanded',
  setSidebarMode: (sidebarMode) => set({ sidebarMode }),
}))
