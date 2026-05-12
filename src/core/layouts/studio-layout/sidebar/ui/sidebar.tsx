import { SidebarHeader } from './header'
import { SidebarFooter } from './footer'
import { SidebarMain } from './main'
import type { SidebarLink } from './main'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

const mainLinks: Array<SidebarLink> = [
  { label: 'Home', to: '/', icon: '#' },
  { label: 'Channel Settings', to: '/channel-settings', icon: '#' },
  { label: 'Analytics', to: '/analytics', icon: '#' },
  { label: 'Content manager', to: '/content-manager', icon: '#' },
  { label: 'Community', to: '/community', icon: '#' },
]

export const Sidebar = ({ className, ...props }: ComponentProps<'nav'>) => {
  return (
    <nav
      className={cn('flex flex-col justify-between min-h-[calc(100vh-2rem)]', className)}
      {...props}
    >
      <div className="flex flex-col">
        <SidebarHeader />
        <SidebarMain links={mainLinks} />
      </div>
      <SidebarFooter />
    </nav>
  )
}
