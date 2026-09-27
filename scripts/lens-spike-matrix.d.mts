export type LensSpikeCell = {
  scenarioId: string
  variant: string
  mode: 'measure' | 'capture'
  amount: number
  visual: boolean
  blocking: Array<string>
  config?: Record<string, boolean>
}

export declare const blockingEvidence: Record<string, string>
export declare const engines: Array<string>
export declare const lensSpikeMatrix: Array<LensSpikeCell>
export declare function cellId(cell: LensSpikeCell): string
export declare function cellTitle(cell: LensSpikeCell): string
