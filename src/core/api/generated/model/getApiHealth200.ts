import type { GetApiHealth200Service } from './getApiHealth200Service.ts'
import type { GetApiHealth200Status } from './getApiHealth200Status.ts'

export type GetApiHealth200 = {
  status: GetApiHealth200Status
  service: GetApiHealth200Service
}
