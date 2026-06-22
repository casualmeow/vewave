import { useResizableCardShowcase } from '../hooks/use-resizable-card-showcase'
import {
  ResizableCardPreview,
  ResizableCardShowcaseHeader,
  ResizableCardShowcaseControls,
} from '../ui'

export function ResizableCardShowcaseSection() {
  const { state, expandedSize, updateAnimationFamily, updatePresentation, updateState } =
    useResizableCardShowcase()

  return (
    <section id="resizable-card" className="grid gap-6 rounded-lg border border-border bg-card p-5">
      <ResizableCardShowcaseHeader />

      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <ResizableCardShowcaseControls
          state={state}
          onAnimationFamilyChange={updateAnimationFamily}
          onPresentationChange={updatePresentation}
          onStateChange={updateState}
        />

        <ResizableCardPreview state={state} expandedSize={expandedSize} />
      </div>
    </section>
  )
}
