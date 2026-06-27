import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite — projet React prêt à déployer sur Vercel
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // Pré-rendu statique (vite-react-ssg) : un DOM jsdom est simulé au build pour
  // que Recharts et tout accès incident à window ne plantent pas le rendu.
  ssgOptions: {
    mock: true,
    formatting: 'minify',
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Découpage des grosses dépendances pour le cache navigateur.
        // Désactivé au build SSR : react/react-dom y sont externalisés et ne
        // peuvent pas être forcés dans un chunk manuel.
        manualChunks: isSsrBuild
          ? undefined
          : {
              react: ['react', 'react-dom'],
              recharts: ['recharts'],
              icons: ['lucide-react'],
            },
      },
    },
  },
}))
