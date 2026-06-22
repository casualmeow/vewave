import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: [
        'src/**/__tests__/**/*.test.{ts,tsx}',
        'src/**/__tests__/*.test.{ts,tsx}',
        'src/**/?(*.)+(spec|test).[tj]s?(x)',
      ],
      exclude: ['node_modules', 'dist'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          '**/*.d.ts',
          'src/vitest.setup.ts',
          'src/**/*.stories.tsx',
          'node_modules/',
          'src/**/__tests__/**',
        ],
      },
    },
  }),
)
