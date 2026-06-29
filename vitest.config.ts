import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/__tests__/unit/**/*.{spec,test}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'src/__tests__/e2e/**'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          '**/*.d.ts',
          'src/vitest.setup.ts',
          'src/**/*.stories.tsx',
          'node_modules/',
          'src/__tests__/**',
        ],
      },
    },
  }),
)
