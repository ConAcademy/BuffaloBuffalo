import { defineConfig } from 'vite'

export default defineConfig({
  base: '/BuffaloBuffalo/',
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
