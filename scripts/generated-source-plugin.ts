import { resolve } from 'node:path'
import { cleanSourceComments } from './source-comments.mjs'
import type { Plugin } from 'vite'

export function generatedSourcePlugins(routerPlugins: Plugin | Array<Plugin>): Array<Plugin> {
  let root = process.cwd()
  const clean = () => {
    cleanSourceComments([resolve(root, 'src/routeTree.gen.ts')])
  }
  const plugins = Array.isArray(routerPlugins) ? routerPlugins : [routerPlugins]
  const wrapped = plugins.map((plugin): Plugin => {
    if (plugin.name !== 'tanstack:router-generator' || !plugin.watchChange) return plugin
    const original = plugin.watchChange
    const handler = typeof original === 'function' ? original : original.handler
    return {
      ...plugin,
      watchChange: {
        ...(typeof original === 'function' ? {} : original),
        async handler(id, change) {
          if (resolve(id) === resolve(root, 'src/routeTree.gen.ts')) return
          await handler.call(this, id, change)
        },
      },
    }
  })
  const cleanup: Plugin = {
    name: 'vewave-generated-source',
    enforce: 'post',
    configResolved(config) {
      root = config.root
    },
    buildStart: { sequential: true, handler: clean },
    watchChange: { sequential: true, handler: clean },
  }
  return [...wrapped, cleanup]
}
