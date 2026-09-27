import type { GetApiHealthDb200DatabaseError } from './getApiHealthDb200DatabaseError.ts'

export type GetApiHealthDb200Database = {
  ok: boolean
  missingTables: string[]
  error?: GetApiHealthDb200DatabaseError
}
