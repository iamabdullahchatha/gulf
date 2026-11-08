import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { collectRoutes, resolveSiteUrl, robotsTxt, sitemapXml } from './scripts/sitemap-core.ts'

/** Serves /sitemap.xml and /robots.txt on the dev server (the build writes real files via scripts/generate-sitemap.ts). */
function seoFiles(): Plugin {
  return {
    name: 'gulf-next-seo-files',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/sitemap.xml' && path !== '/robots.txt') return next()
        collectRoutes((id) => server.ssrLoadModule(id))
          .then(({ routes, fallbackUrl }) => {
            const siteUrl = resolveSiteUrl(loadEnv(server.config.mode, server.config.root, 'VITE_').VITE_SITE_URL, fallbackUrl)
            res.setHeader('Content-Type', path === '/sitemap.xml' ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8')
            res.end(path === '/sitemap.xml' ? sitemapXml(routes, siteUrl) : robotsTxt(siteUrl))
          })
          .catch((err: unknown) => next(err))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoFiles()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    target: 'es2022',
    // Tailwind v4 does not emit sourcemaps for generated CSS, so production
    // maps would be partly wrong. Enable locally when debugging a build.
    sourcemap: false,
    // three.js alone is ~700 kB minified; it ships as its own cached chunk.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks so a content deploy does not bust the 3D cache.
        codeSplitting: {
          groups: [
            { name: "vendor-three", test: /node_modules[\\/](three|three-stdlib|@react-three|maath|troika-|meshline|camera-controls|@monogrid|stats-gl|zustand|suspend-react|its-fine)/, priority: 30 },
            { name: "vendor-motion", test: /node_modules[\\/](gsap|@gsap|lenis)/, priority: 20 },
            { name: "vendor-react", test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/, priority: 10 },
          ],
        },
      },
    },
    // Videos are served from /public/media and must never be inlined.
    assetsInlineLimit: 4096,
  },
})
