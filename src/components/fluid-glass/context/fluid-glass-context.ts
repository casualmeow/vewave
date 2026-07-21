import { createContext, useContext } from 'react'
import type { FluidGlassStore } from '../renderer/store'

export const FluidGlassContext = createContext<FluidGlassStore | null>(null)

export function useFluidGlassStore() {
  return useContext(FluidGlassContext)
}
