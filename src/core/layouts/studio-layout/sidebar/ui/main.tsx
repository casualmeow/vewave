import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { Button } from '@/shared/ui'

export type SidebarLink = {
  label: string
  to: string
  icon: string
}

interface SidebarMainProps extends ComponentProps<'ul'> {
  links: Array<SidebarLink>
}

export const SidebarMain = ({ links, className, ...props }: SidebarMainProps) => {
  return (
    <>
      <ul className={`flex flex-col p-2 gap-2 ${className ?? ''}`} {...props}>
        {links.map((link) => (
          <li key={link.label}>
            <Button variant="ghost" asChild className="justify-start w-full">
              <Link to={link.to}>{link.label}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </>
  )
}
