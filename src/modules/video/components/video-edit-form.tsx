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
    <div className="h-full w-full flex">
      <Form {...form}>
        <form
          className="w-full h-full flex flex-row justify-between"
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
