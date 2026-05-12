import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'

export const SidebarHeader = () => {
  return (
    <div className="flex flex-col items-center">
      <Avatar className="w-20 h-20">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <div className="pt-2 font-medium">Your channel</div>
      <div className="text-muted-foreground text-sm">Channel name</div>
    </div>
  )
}
