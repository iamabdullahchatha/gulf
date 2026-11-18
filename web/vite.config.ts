import { existsSync, readFileSync } from 'node:fs'
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

/**
 * The Content-Security-Policy in vercel.json only lets the site send data to
 * its own origin. If VITE_CONTACT_ENDPOINT points at a form service, that
 * service's origin must be listed in `connect-src`, or every enquiry would be
 * blocked by the browser. Fail the build with instructions instead.
 */
function cspGuard(): Plugin {
  return {
    name: 'gulf-next-csp-guard',
    apply: 'build',
    configResolved(config) {
      const endpoint = loadEnv(config.mode, config.root, 'VITE_').VITE_CONTACT_ENDPOINT
      if (!endpoint || endpoint.startsWith('/')) return
      const origin = new URL(endpoint).origin
      for (const file of ['../vercel.json', 'vercel.json']) {
        const path = fileURLToPath(new URL(file, import.meta.url))
        if (!existsSync(path)) continue
        const conf = JSON.parse(readFileSync(path, 'utf8')) as { headers?: { headers: { key: string; value: string }[] }[] }
        const csp = conf.headers?.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? ''
        const connect = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('connect-src')) ?? ''
        if (!connect.split(/\s+/).includes(origin)) {
          throw new Error(`[csp] VITE_CONTACT_ENDPOINT is ${origin}, but ${file.replace('../', 'the root ')} does not allow it. Add "${origin}" to connect-src in the Content-Security-Policy of both vercel.json files.`)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoFiles(), cspGuard()],
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
    // Videos are served from /public/media and must never be inlined. Fonts
    // are never inlined either: the Content-Security-Policy allows fonts from
    // this origin only (no data: URLs).
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/i.test(file) ? false : undefined),
  },
})
