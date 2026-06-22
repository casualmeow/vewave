import { CircleDashed, LockKeyhole, type LucideIcon } from 'lucide-react'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

type AdminPlaceholderOperation = {
  description: string
  label: string
}

type AdminPlaceholderPageProps = {
  description: string
  icon: LucideIcon
  operations: Array<AdminPlaceholderOperation>
  title: string
}

export function AdminPlaceholderPage({
  description,
  icon: Icon,
  operations,
  title,
}: AdminPlaceholderPageProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <section>
        <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700">
          <LockKeyhole className="size-4 text-teal-700" />
          Admin-only operations
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p>
          </div>
          <div className="grid size-12 place-items-center rounded-lg bg-zinc-950 text-white shadow-sm">
            <Icon className="size-6" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {operations.map((operation) => (
          <Card key={operation.label} className="rounded-lg border-zinc-200 bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <CircleDashed className="size-4 text-amber-600" />
                Planned
              </div>
              <CardTitle>{operation.label}</CardTitle>
              <CardDescription>{operation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Not wired yet
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
