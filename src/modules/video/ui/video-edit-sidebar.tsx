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
    <div className="rightside flex flex-col gap-5 flex-1/4">
      <VideoEditHeaderActions
        isSubmitting={isSubmitting}
        onUndo={onUndo}
        onDownload={onDownload}
        onShare={onShare}
      />

      <EditPlayer src={VideoData.src} />

      <AccessSelector initialAccess={VideoData.access} onChange={onAccessChange} />
    </div>
  )
}
