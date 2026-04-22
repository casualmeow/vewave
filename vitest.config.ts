import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
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
      exclude: ['**/*.d.ts', 'src/vitest.setup.ts', 'src/**/*.stories.tsx', 'src/**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
