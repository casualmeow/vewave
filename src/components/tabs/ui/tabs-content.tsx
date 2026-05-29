import * as TabsPrimitive from '@radix-ui/react-tabs'
import { tabsContentVariants } from '../constants'
import type { TabsContentProps } from '../types'
import { cn } from '@/shared/lib/utils'

export function TabsContent({ ref, className, inset = false, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="liquid-tabs-content"
      className={cn(tabsContentVariants({ inset }), className)}
      {...props}
    />
  )
}
