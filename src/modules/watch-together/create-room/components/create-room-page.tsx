import { CreateRoomForm } from './create-room-form'

export function CreateRoomPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Watch together</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Create a synchronized video room
          </h1>
          <p className="mt-4 text-muted-foreground">
            Vewave turns a public video link into a room with shared playback state and realtime
            host controls.
          </p>
        </section>
        <CreateRoomForm />
      </div>
    </main>
  )
}
