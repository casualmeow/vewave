;(function installLensSpikeInstrumentation() {
  if (typeof window === 'undefined') return
  if (window.__lensSpike) return

  const config = window.__lensSpikeConfig || {}
  const restores = []

  const state = {
    installedAt: Date.now(),
    source: 'init-script',
    config: config,
    getContextCalls: 0,
    getContextNull: 0,
    webglContextsCreated: 0,
    webglContextCreationMsTotal: 0,
    webglContextCreationMsMax: 0,
    webglContextLost: 0,
    webglContextRestored: 0,
    resizeObserversConstructed: 0,
    resizeObserversDisconnected: 0,
    rafScheduled: 0,
    rafCancelled: 0,
    rafFired: 0,
    forcedWebglFailure: 0,
    canvasesSeen: 0,
  }

  const liveResizeObservers = new Set()
  const pendingRaf = new Set()

  const originalGetContext = HTMLCanvasElement.prototype.getContext
  const seenCanvases = new WeakSet()

  HTMLCanvasElement.prototype.getContext = function patchedGetContext(contextId) {
    state.getContextCalls += 1

    const isWebgl =
      contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl'

    if (isWebgl && config.forceWebglFailure) {
      state.forcedWebglFailure += 1
      state.getContextNull += 1
      return null
    }

    const startedAt = performance.now()
    const context = originalGetContext.apply(this, arguments)
    const durationMs = performance.now() - startedAt

    if (!context) {
      state.getContextNull += 1
      return context
    }

    if (isWebgl) {
      state.webglContextsCreated += 1
      state.webglContextCreationMsTotal += durationMs
      if (durationMs > state.webglContextCreationMsMax) state.webglContextCreationMsMax = durationMs

      if (!seenCanvases.has(this)) {
        seenCanvases.add(this)
        state.canvasesSeen += 1

        this.addEventListener(
          'webglcontextlost',
          function () {
            state.webglContextLost += 1
          },
          true,
        )
        this.addEventListener(
          'webglcontextrestored',
          function () {
            state.webglContextRestored += 1
          },
          true,
        )
      }
    }

    return context
  }

  restores.push(function () {
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  const OriginalResizeObserver = window.ResizeObserver

  if (typeof OriginalResizeObserver === 'function') {
    function PatchedResizeObserver(callback) {
      const observer = new OriginalResizeObserver(callback)
      state.resizeObserversConstructed += 1
      liveResizeObservers.add(observer)

      const originalDisconnect = observer.disconnect.bind(observer)
      observer.disconnect = function patchedDisconnect() {
        if (liveResizeObservers.delete(observer)) state.resizeObserversDisconnected += 1
        return originalDisconnect()
      }

      return observer
    }

    PatchedResizeObserver.prototype = OriginalResizeObserver.prototype
    window.ResizeObserver = PatchedResizeObserver
    restores.push(function () {
      window.ResizeObserver = OriginalResizeObserver
    })
  }

  const originalRaf = window.requestAnimationFrame.bind(window)
  const originalCancelRaf = window.cancelAnimationFrame.bind(window)

  window.requestAnimationFrame = function patchedRaf(callback) {
    state.rafScheduled += 1
    const handle = originalRaf(function (timestamp) {
      pendingRaf.delete(handle)
      state.rafFired += 1
      return callback(timestamp)
    })
    pendingRaf.add(handle)
    return handle
  }

  window.cancelAnimationFrame = function patchedCancelRaf(handle) {
    if (pendingRaf.delete(handle)) state.rafCancelled += 1
    return originalCancelRaf(handle)
  }

  restores.push(function () {
    window.requestAnimationFrame = originalRaf
    window.cancelAnimationFrame = originalCancelRaf
  })

  if (typeof config.reducedTransparency === 'boolean') {
    const originalMatchMedia = window.matchMedia.bind(window)
    window.matchMedia = function patchedMatchMedia(query) {
      const result = originalMatchMedia(query)
      if (String(query).indexOf('prefers-reduced-transparency') === -1) return result
      return {
        media: result.media,
        matches: config.reducedTransparency,
        onchange: null,
        addEventListener: function () {},
        removeEventListener: function () {},
        addListener: function () {},
        removeListener: function () {},
        dispatchEvent: function () {
          return false
        },
      }
    }
    restores.push(function () {
      window.matchMedia = originalMatchMedia
    })
  }

  if (
    config.forceNativeSvgUnavailable &&
    typeof window.CSS !== 'undefined' &&
    window.CSS.supports
  ) {
    const originalSupports = window.CSS.supports.bind(window.CSS)
    window.CSS.supports = function patchedSupports(property, value) {
      const joined =
        arguments.length > 1 ? String(property) + ':' + String(value) : String(property)
      if (joined.indexOf('backdrop-filter') !== -1 && joined.indexOf('url(') !== -1) return false
      return originalSupports.apply(null, arguments)
    }
    restores.push(function () {
      window.CSS.supports = originalSupports
    })
  }

  function readMemory() {
    const memory = performance.memory
    if (!memory || typeof memory.usedJSHeapSize !== 'number') return null
    return memory.usedJSHeapSize
  }

  window.__lensSpike = {
    state: state,
    rawRequestAnimationFrame: originalRaf,
    rawCancelAnimationFrame: originalCancelRaf,
    liveResizeObserverCount: function () {
      return liveResizeObservers.size
    },
    pendingRafCount: function () {
      return pendingRaf.size
    },
    readMemory: readMemory,
    reset: function () {
      state.getContextCalls = 0
      state.getContextNull = 0
      state.webglContextsCreated = 0
      state.webglContextCreationMsTotal = 0
      state.webglContextCreationMsMax = 0
      state.webglContextLost = 0
      state.webglContextRestored = 0
      state.resizeObserversConstructed = 0
      state.resizeObserversDisconnected = 0
      state.rafScheduled = 0
      state.rafCancelled = 0
      state.rafFired = 0
      state.canvasesSeen = 0
    },
    snapshot: function () {
      return {
        instrumentationSource: state.source,
        getContextCalls: state.getContextCalls,
        getContextNull: state.getContextNull,
        webglContextsCreated: state.webglContextsCreated,
        webglContextCreationMsTotal: Number(state.webglContextCreationMsTotal.toFixed(3)),
        webglContextCreationMsMax: Number(state.webglContextCreationMsMax.toFixed(3)),
        webglContextLost: state.webglContextLost,
        webglContextRestored: state.webglContextRestored,
        resizeObserversConstructed: state.resizeObserversConstructed,
        resizeObserversDisconnected: state.resizeObserversDisconnected,
        resizeObserversLive: liveResizeObservers.size,
        rafScheduled: state.rafScheduled,
        rafCancelled: state.rafCancelled,
        rafFired: state.rafFired,
        rafPending: pendingRaf.size,
        forcedWebglFailure: state.forcedWebglFailure,
        usedJsHeapBytes: readMemory(),
      }
    },
    restore: function () {
      for (let index = restores.length - 1; index >= 0; index -= 1) restores[index]()
      delete window.__lensSpike
    },
  }
})()
