import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base = './' → relative Pfade, läuft unter jeder Adresse
// (Vercel/Netlify im Hauptverzeichnis genauso wie in einem Unterordner).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
