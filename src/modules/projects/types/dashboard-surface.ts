import type { ReactNode } from 'react'

export type RoomsDashboardSurfaceId =
  | 'hero'
  | 'create'
  | 'createIntro'
  | 'createFields'
  | 'createAction'
  | 'roomList'
  | 'roomMedia'
  | 'roomDetails'

export type RoomsDashboardSurfaceRenderer = (
  surface: RoomsDashboardSurfaceId,
  children: ReactNode,
) => ReactNode

export type ProjectsDashboardSurfaceId = RoomsDashboardSurfaceId
export type ProjectsDashboardSurfaceRenderer = RoomsDashboardSurfaceRenderer
