import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import { changelogPlugin } from './scripts/changelog-plugin'
import { generatedSourcePlugins } from './scripts/generated-source-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    generatedSourcePlugins(tanstackRouter({ autoCodeSplitting: true, routeTreeFileHeader: [] })),
    viteReact(),
    tailwindcss(),
    changelogPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
