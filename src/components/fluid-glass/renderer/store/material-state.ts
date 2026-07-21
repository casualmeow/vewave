import type {
  FluidGlassMaterial,
  FluidGlassTargetState,
  FluidTransmissionMaterial,
} from '../../types'

export type LensMaterialResponse = {
  highlight: number
  interactionEnergy: number
  opacity: number
  refraction: number
  shadow: number
}

export class MaterialState {
  private fluidMaterial: FluidGlassMaterial | null = null
  private transmissionMaterial: FluidTransmissionMaterial | null = null

  setResolvedMaterials(
    fluidMaterial: FluidGlassMaterial,
    transmissionMaterial: FluidTransmissionMaterial,
  ) {
    this.fluidMaterial = fluidMaterial
    this.transmissionMaterial = transmissionMaterial
  }

  get fluid() {
    return this.fluidMaterial
  }

  get transmission() {
    return this.transmissionMaterial
  }

  resolveInteraction(target: FluidGlassTargetState, dragEnergy: number): LensMaterialResponse {
    return {
      opacity: 1,
      refraction: target.dragged
        ? 1.24 + dragEnergy * 0.26
        : target.pressed
          ? 1.18
          : target.hovered
            ? 1.1
            : 1,
      highlight: target.dragged
        ? 1 + dragEnergy * 0.22
        : target.pressed
          ? 1.02
          : target.hovered
            ? 1
            : 0.9,
      shadow: target.pressed ? 0.55 : target.dragged ? 0.74 : target.hovered ? 0.96 : 0.86,
      interactionEnergy: target.dragged
        ? 0.72 + dragEnergy * 0.28
        : target.pressed
          ? 0.64
          : target.hovered
            ? 0.48
            : 0.18,
    }
  }
}
