import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://mirajmahmudul.github.io/Bably_Dream/ — asset URLs
// need this base path, otherwise the built index.html references
// root-absolute paths like /assets/... which 404 under a project subpath.
export default defineConfig({
  base: '/Bably_Dream/',
  plugins: [react()],
})
