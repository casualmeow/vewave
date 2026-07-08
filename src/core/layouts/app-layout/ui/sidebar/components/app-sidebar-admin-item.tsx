import { Link } from '@tanstack/react-router'
import { appAdminItem } from '../../../app-sidebar-items'
import {
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'

export function AppSidebarAdminItem({ pathname }: { pathname: string }) {
  const AdminIcon = appAdminItem.icon
  const active = pathname === appAdminItem.to || pathname.startsWith('/admin/')

  return (
    <SidebarSection title="Admin">
      <SidebarItem asChild active={active} value={appAdminItem.to}>
        <Link to={appAdminItem.to}>
          <SidebarItemIcon>
            <AdminIcon />
          </SidebarItemIcon>
          <SidebarItemLabel>{appAdminItem.label}</SidebarItemLabel>
        </Link>
      </SidebarItem>
    </SidebarSection>
  )
}
