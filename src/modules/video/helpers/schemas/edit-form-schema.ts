import { z } from 'zod'

export const videoEditFormSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  playlists: z.string().optional(),
  thumbnail: z.instanceof(FileList).optional(),
  video: z.instanceof(FileList),
  access: z.enum(['Public', 'Unlisted', 'Private']),
})

export type VideoEditFormFields = z.infer<typeof videoEditFormSchema>
