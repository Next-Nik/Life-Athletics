import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  // Pin the dev port so it always matches the Supabase Site URL /
  // Redirect URLs. strictPort makes Vite fail loudly instead of silently
  // jumping to 5174 (which would re-break the magic-link redirect).
  server: { port: 5173, strictPort: true },
})
