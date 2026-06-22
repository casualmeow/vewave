import { VideoData } from '../constants'
import { VideoEditHeaderActions } from './video-edit-header-actions'
import EditPlayer from '@/shared/ui/edit-player'
import { AccessSelector } from '@/shared/ui/edit-access-selector'

interface VideoEditSidebarProps {
  onAccessChange: (value: 'Public' | 'Unlisted' | 'Private') => void
  isSubmitting: boolean
  onUndo: () => void
  onDownload: () => void
  onShare: () => void
}

export const VideoEditSidebar = ({
  onAccessChange,
  isSubmitting,
  onUndo,
  onDownload,
  onShare,
}: VideoEditSidebarProps) => {
  return (
    <aside className="flex w-full min-w-0 flex-col gap-5 xl:max-w-[24rem] xl:basis-1/4">
      <VideoEditHeaderActions
        isSubmitting={isSubmitting}
        onUndo={onUndo}
        onDownload={onDownload}
        onShare={onShare}
      />

      <EditPlayer src={VideoData.src} />

      <AccessSelector initialAccess={VideoData.access} onChange={onAccessChange} />
    </aside>
  )
}
