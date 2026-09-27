import type { GetApiHealthDb200Database } from './getApiHealthDb200Database.ts'
import type { GetApiHealthDb200Service } from './getApiHealthDb200Service.ts'
import type { GetApiHealthDb200Status } from './getApiHealthDb200Status.ts'

export type GetApiHealthDb200 = {
  status: GetApiHealthDb200Status
  service: GetApiHealthDb200Service
  database: GetApiHealthDb200Database
}
