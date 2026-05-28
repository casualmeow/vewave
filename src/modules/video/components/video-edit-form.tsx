import { useVideoEditForm } from '../hooks/useVideoEditForm'
import { VideoEditDetailsSection, VideoEditSidebar } from '../ui'
import { Form } from '@/shared/ui'

export function VideoEditForm() {
  const {
    form,
    control,
    handleSubmit,
    isSubmitting,
    onSubmit,
    handleAccessChange,
    handleUndoChanges,
    handleDownloadVideo,
    handleShareVideo,
  } = useVideoEditForm()

  return (
    <div className="h-full w-full min-w-0">
      <Form {...form}>
        <form
          className="flex h-full min-w-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VideoEditDetailsSection control={control} />

          <VideoEditSidebar
            isSubmitting={isSubmitting}
            onAccessChange={handleAccessChange}
            onUndo={handleUndoChanges}
            onDownload={handleDownloadVideo}
            onShare={handleShareVideo}
          />
        </form>
      </Form>
    </div>
  )
}
