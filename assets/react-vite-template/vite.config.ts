import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // CLI args --host/--port are forwarded by the runner; keep defaults permissive
    host: true,
    port: 5173,
  },
})
