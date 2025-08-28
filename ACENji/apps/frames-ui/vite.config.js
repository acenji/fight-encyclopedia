import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@frames': path.resolve(__dirname, '../../tools/fight-export/frames'),
    },
  },
})
