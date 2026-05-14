export function ResizableCardShowcaseHeader() {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        Component playground
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">ResizableCard</h2>
      <p className="mt-3 text-base leading-7 text-zinc-600">
        A reusable expandable card list with shared-layout animation, a portal dialog, and an
        optional resize handle. Click any card, resize the expanded surface, then close with Escape
        or the close button.
      </p>
    </div>
  )
}
