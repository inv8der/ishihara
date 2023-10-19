import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'ishihara',
      fileName: 'ishihara',
    },
    sourcemap: true,
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled into your library
      external: ['colorjs.io', 'kd-tree-javascript'],
    },
    outDir: './dist',
  },
  plugins: [react(), dts({ entryRoot: './lib', rollupTypes: true })],
})
