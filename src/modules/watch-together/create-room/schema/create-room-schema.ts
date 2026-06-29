import { z } from 'zod'

const maxVideoLinks = 20
const maxVideoLinkLength = 2048

export function getCreateRoomVideoLinks(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  )
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const createRoomSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Paste a video link.')
    .superRefine((value, context) => {
      const urls = getCreateRoomVideoLinks(value)

      if (urls.length > maxVideoLinks) {
        context.addIssue({
          code: 'custom',
          message: `Add ${maxVideoLinks} video links or fewer.`,
        })
      }

      urls.forEach((url) => {
        if (url.length > maxVideoLinkLength) {
          context.addIssue({
            code: 'custom',
            message: 'One of the video links is too long.',
          })
          return
        }

        if (!isValidUrl(url)) {
          context.addIssue({
            code: 'custom',
            message: 'Enter valid video links, one per line.',
          })
        }
      })
    }),
  title: z.string().trim().max(180, 'Room name must be 180 characters or fewer.').optional(),
})

export type CreateRoomFields = z.infer<typeof createRoomSchema>
