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
      // make sure to externalize deps that shouldn't be bundled into your library
      external: ['react', 'react-dom'],
    },
    outDir: './dist',
  },
  plugins: [react(), dts({ entryRoot: './lib', rollupTypes: true })],
})
