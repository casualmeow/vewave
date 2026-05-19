import { z } from 'zod'

export const createRoomSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Paste a video URL.')
    .max(2048, 'URL is too long.')
    .url('Enter a valid video URL.'),
  title: z.string().trim().max(180, 'Title must be 180 characters or fewer.').optional(),
})

export type CreateRoomFields = z.infer<typeof createRoomSchema>
