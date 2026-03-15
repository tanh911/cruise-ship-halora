import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,   // nếu port dùng rồi sẽ báo thay vì đổi
    host: true
  },

  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ]
  },

  build: {
    target: 'esnext',
    sourcemap: false,
  }
})