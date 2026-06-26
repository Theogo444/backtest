import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite — projet React prêt à déployer sur Vercel
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Sépare les grosses dépendances pour un meilleur cache navigateur
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
