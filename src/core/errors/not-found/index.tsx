import { Link } from '@tanstack/react-router'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Button } from '@/shared/ui'

export const NotFound = () => {
  return (
    <div className="relative flex items-center justify-center p-4 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="relative">
          <div className="select-none text-[12rem] font-bold leading-none text-muted md:text-[16rem]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-32 items-center justify-center rounded-full border border-border bg-card shadow-[0_28px_90px_color-mix(in_srgb,var(--foreground)_12%,transparent)] md:size-40">
              <Compass className="size-16 animate-spin text-primary duration-[3s] md:size-20" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Page Not Found</h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            The page you're looking for seems to have wandered off into the digital wilderness.
            Don't worry, we'll help you find your way back!
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="." className="flex items-center gap-2">
              <Home className="size-5" />
              Go Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-full bg-card px-8">
            <Link to="." className="flex items-center gap-2">
              <ArrowLeft className="size-5" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
