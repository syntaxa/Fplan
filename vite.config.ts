import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Относительные пути для работы без сервера
  build: {
    outDir: 'public', // Сборка в папку public для GitHub Pages
  },
})
