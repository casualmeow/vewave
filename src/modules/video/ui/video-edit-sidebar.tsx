import { VideoData } from '../constants'
import { VideoEditHeaderActions } from './video-edit-header-actions'
import EditPlayer from '@/shared/ui/edit-player'
import { AccessSelector } from '@/shared/ui/edit-acess-selector'

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
    <aside className="order-first flex min-w-0 flex-col gap-4 xl:sticky xl:top-6 xl:order-none xl:self-start">
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
