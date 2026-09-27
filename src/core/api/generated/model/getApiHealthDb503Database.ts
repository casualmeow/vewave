import type { GetApiHealthDb503DatabaseError } from './getApiHealthDb503DatabaseError.ts'

export type GetApiHealthDb503Database = {
  ok: boolean
  missingTables: string[]
  error?: GetApiHealthDb503DatabaseError
}
