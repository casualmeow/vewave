export const blockingEvidence = {
  'B-1': 'Arbitrary-DOM native/blur/approximation comparison',
  'B-2': 'Controlled-image rendering across engines',
  'B-3': 'Observable fallback edges and unavailable forcing seams',
  'B-4': 'Transformed-target geometry observations',
  'B-5': 'Teardown and retained-resource observations',
  'B-6': 'Context loss and current recovery behavior',
  'B-7': '1/2/4/8 group steady-state observations',
  'B-8': 'Cold creation and memory observations',
  'B-9': 'Visual captures and completeness manifest',
}

export const engines = ['chromium', 'firefox', 'webkit']

export const lensSpikeMatrix = []

function addCell(cell) {
  lensSpikeMatrix.push({ amount: 1, config: undefined, ...cell })
}

for (const variant of ['native-svg', 'backdrop-blur', 'css-approximation', 'solid']) {
  addCell({
    scenarioId: 'arbitrary-dom',
    variant,
    mode: 'measure',
    visual: true,
    blocking: ['B-1'],
  })
  addCell({
    scenarioId: 'arbitrary-dom',
    variant,
    mode: 'capture',
    visual: true,
    blocking: ['B-1', 'B-9'],
  })
}

for (const variant of ['sdf', 'transmission', 'css-approximation', 'solid']) {
  addCell({
    scenarioId: 'controlled-image',
    variant,
    mode: 'measure',
    visual: true,
    blocking: ['B-2'],
  })
  addCell({
    scenarioId: 'controlled-image',
    variant,
    mode: 'capture',
    visual: true,
    blocking: ['B-2', 'B-9'],
  })
}

const fallbackConfig = {
  'webgl-creation-failure': { forceWebglFailure: true },
  'reduced-transparency': { reducedTransparency: true },
  'native-displacement-unavailable': { forceNativeSvgUnavailable: true },
}
for (const variant of [
  'webgl-creation-failure',
  'image-load-failure',
  'source-readability-failure',
  'reduced-transparency',
  'advanced-effects-disabled',
  'native-displacement-unavailable',
]) {
  const config = fallbackConfig[variant]
  addCell({
    scenarioId: 'fallback-edges',
    variant,
    mode: 'measure',
    visual: true,
    blocking: ['B-3'],
    config,
  })
  addCell({
    scenarioId: 'fallback-edges',
    variant,
    mode: 'capture',
    visual: true,
    blocking: ['B-3', 'B-9'],
    config,
  })
}

for (const variant of ['coupled', 'stationary', 'coupled-sdf']) {
  addCell({
    scenarioId: 'transformed-target',
    variant,
    mode: 'measure',
    visual: true,
    blocking: ['B-4'],
  })
  addCell({
    scenarioId: 'transformed-target',
    variant,
    mode: 'capture',
    visual: true,
    blocking: ['B-4', 'B-9'],
  })
}
for (const variant of ['vertical-scroll', 'horizontal-scroll', 'portal']) {
  addCell({
    scenarioId: 'scroll-and-portal',
    variant,
    mode: 'measure',
    visual: true,
    blocking: ['B-4'],
  })
  addCell({
    scenarioId: 'scroll-and-portal',
    variant,
    mode: 'capture',
    visual: true,
    blocking: ['B-4', 'B-9'],
  })
}

for (const variant of ['sdf', 'css']) {
  for (const amount of [1, 10, 50]) {
    addCell({
      scenarioId: 'teardown',
      variant,
      mode: 'measure',
      amount,
      visual: false,
      blocking: ['B-5'],
    })
  }
}

addCell({
  scenarioId: 'context-loss',
  variant: 'default',
  mode: 'measure',
  visual: false,
  blocking: ['B-6'],
})

for (const variant of ['sdf', 'css']) {
  for (const amount of [1, 2, 4, 8]) {
    addCell({
      scenarioId: 'scope-sweep',
      variant,
      mode: 'measure',
      amount,
      visual: true,
      blocking: ['B-7', 'B-8'],
    })
  }
  addCell({
    scenarioId: 'scope-sweep',
    variant,
    mode: 'capture',
    amount: 4,
    visual: true,
    blocking: ['B-7', 'B-9'],
  })
}

export function cellId(cell) {
  const amountPart = cell.amount > 1 ? `-x${cell.amount}` : ''
  return `${cell.scenarioId}-${cell.variant}${amountPart}-${cell.mode}`
}

export function cellTitle(cell) {
  const amountPart = cell.amount > 1 ? ` ×${cell.amount}` : ''
  return `${cell.scenarioId} · ${cell.variant}${amountPart} · ${cell.mode}`
}
