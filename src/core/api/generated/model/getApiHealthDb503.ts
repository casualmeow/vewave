import type { GetApiHealthDb503Database } from './getApiHealthDb503Database.ts'
import type { GetApiHealthDb503Service } from './getApiHealthDb503Service.ts'
import type { GetApiHealthDb503Status } from './getApiHealthDb503Status.ts'

export type GetApiHealthDb503 = {
  status: GetApiHealthDb503Status
  service: GetApiHealthDb503Service
  database: GetApiHealthDb503Database
}
