import type { PostApiServersBodyOneVisibility } from './postApiServersBodyOneVisibility.ts'

export type PostApiServersBodyOne = {
  name: string
  description?: string
  visibility?: PostApiServersBodyOneVisibility
}
