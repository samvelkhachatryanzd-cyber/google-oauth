import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The browser only ever talks to this dev server, which forwards /api to the backend.
    // Requests are therefore same-origin and the backend needs no CORS configuration.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
