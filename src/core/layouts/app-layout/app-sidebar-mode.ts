export type AppSidebarMode = 'expanded' | 'icon' | 'hidden'

const appSidebarModeSequence: Record<AppSidebarMode, AppSidebarMode> = {
  expanded: 'icon',
  icon: 'hidden',
  hidden: 'expanded',
}

export function getNextAppSidebarMode(mode: AppSidebarMode): AppSidebarMode {
  return appSidebarModeSequence[mode]
}
