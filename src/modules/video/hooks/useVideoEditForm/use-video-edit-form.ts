import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { videoEditFormSchema, type VideoEditFormFields } from '../../helpers'
import { VideoData } from '../../constants'

export const useVideoEditForm = () => {
  const form = useForm<VideoEditFormFields>({
    resolver: zodResolver(videoEditFormSchema),
    defaultValues: {
      name: VideoData.name,
      description: VideoData.description,
      access: VideoData.access,
    },
  })

  const {
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form

  const onSubmit = (data: VideoEditFormFields) => {
    console.log('Form data:', data)
  }

  const handleDownloadVideo = () => {
    const a = document.createElement('a')
    a.href = VideoData.src
    a.download = 'video.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShareVideo = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  const handleAccessChange = (newAccess: 'Public' | 'Unlisted' | 'Private') => {
    setValue('access', newAccess, { shouldValidate: true })
  }

  const handleUndoChanges = () => {
    reset({
      name: VideoData.name,
      description: VideoData.description,
      access: VideoData.access,
    })
  }

  return {
    form,
    control,
    handleSubmit,
    isSubmitting,
    onSubmit,
    handleDownloadVideo,
    handleShareVideo,
    handleAccessChange,
    handleUndoChanges,
  }
}
