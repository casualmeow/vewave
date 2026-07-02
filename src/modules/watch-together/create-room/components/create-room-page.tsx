import { CreateRoomForm } from './create-room-form'

export function CreateRoomPage() {
  return (
    <div className="px-6 py-10">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Start room</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Start a room
          </h1>
          <p className="mt-4 text-muted-foreground">
            Paste a public video link, invite viewers, and keep playback synchronized.
          </p>
        </section>
        <CreateRoomForm />
      </div>
    </div>
  )
}
