import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base = Unterpfad auf GitHub Pages (https://<user>.github.io/lenas-stundenzettel/)
export default defineConfig({
  base: '/lenas-stundenzettel/',
  plugins: [react(), tailwindcss()],
})
