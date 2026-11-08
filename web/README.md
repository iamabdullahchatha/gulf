# GULF NEXT — React website

Cinematic React + three.js site for GULF NEXT Oil and Gas.

## Quick start

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle + sitemap
npm run preview    # serve the built dist/
```

The canonical site origin defaults to `https://www.gulfnext.ae`. Set
`VITE_SITE_URL` in `.env` only if you need to override it. The build uses this
origin for SEO metadata, `sitemap.xml` and `robots.txt`; see `.env.example`.

## Stack

- **React 19** + **TypeScript 6** with strict mode and `noUncheckedIndexedAccess`.
- **Vite 8** with `@vitejs/plugin-react` (Fast Refresh) and vendor chunk
  groups for three.js, GSAP/Lenis and React.
- **React Router 8** with nested routes and lazy pages.
- **Tailwind CSS v4** via `@tailwindcss/vite`, CSS-first (`@theme` in
  `src/index.css`). No `tailwind.config.js`, no PostCSS config.
- **Three.js r187**, **@react-three/fiber 9**, **@react-three/drei 10**.
- **GSAP 3** with **ScrollTrigger** and **@gsap/react** (`useGSAP`).
- **Lenis** smooth scrolling, tied to GSAP's ticker.
- **lucide-react** icons.
- **SEO** via React 19 native metadata hoisting plus a build-time sitemap.
- **ESLint 10** flat config (type-aware).

## Project layout

```
web/
├── eslint.config.js
├── vite.config.ts
├── tsconfig.{json,app,node}.json
├── scripts/generate-sitemap.ts
├── public/
│   └── assets/
│       ├── logos/gulf-next.webp      (copy of ../../logo.webp)
│       ├── videos/{1080,720}/        → symlinks to ../../assets/media/video/*
│       └── posters/                   → symlink to ../../assets/media/posters
└── src/
    ├── main.tsx                       Entry
    ├── App.tsx                        Router + nested routes + lazy pages
    ├── index.css                      Tailwind + @theme tokens + base styles
    ├── assets/brand/logo.webp         Logo (byte-identical to ../../logo.webp)
    ├── config/site.ts                 Site constants + sitemap route table
    ├── types/media.ts                 Shared media types
    ├── data/
    │   ├── media.ts                   Catalogue + section → asset resolver
    │   ├── navigation.ts              Nav + footer link structure
    │   ├── services.ts                Services content
    │   ├── industries.ts              Industries content
    │   └── faq.ts                     Frequently asked questions
    ├── hooks/
    │   ├── useLenis.ts                Global smooth scroll
    │   ├── useMediaQuery.ts
    │   ├── usePrefersReducedMotion.ts
    │   ├── useScrollLock.ts           Mobile menu body lock
    │   └── useScrollToTop.ts          Route-change scroll reset
    ├── lib/
    │   ├── cn.ts                      Tiny classname joiner
    │   ├── network.ts                 Save-Data / connection tier helpers
    │   ├── buttonStyles.ts            Button class factory
    │   └── seo/                       <Seo />, absoluteUrl, JSON-LD builders
    ├── components/
    │   ├── Button.tsx                 Button / LinkButton / AnchorButton
    │   ├── Container.tsx              Page gutter wrapper
    │   ├── Logo.tsx
    │   ├── Breadcrumbs.tsx
    │   ├── CTASection.tsx
    │   ├── FAQAccordion.tsx
    │   ├── LoadingFallback.tsx
    │   ├── 3d/
    │   │   └── EnergyField.tsx        R3F flame + sparks (About page)
    │   ├── animations/
    │   │   ├── AnimatedSection.tsx    Scroll-trigger reveal
    │   │   └── ScrollScene.tsx        Pin & parallax
    │   ├── cards/
    │   │   ├── ServiceCard.tsx
    │   │   └── IndustryCard.tsx
    │   ├── forms/
    │   │   └── ContactForm.tsx
    │   ├── hero/
    │   │   ├── VideoBackground.tsx    Cinematic background video
    │   │   └── CinematicHero.tsx      Composition: video + content + CTA
    │   └── layout/
    │       ├── Header.tsx
    │       ├── MainNav.tsx            Desktop nav with mega menu
    │       ├── MegaMenu.tsx
    │       ├── MobileMenu.tsx
    │       ├── Footer.tsx
    │       └── Layout.tsx             Root shell (Lenis + Suspense + Outlet)
    └── pages/
        ├── HomePage.tsx               Six-scene cinematic reel
        ├── AboutPage.tsx
        ├── ServicesPage.tsx
        ├── services/ServiceDetailPage.tsx    /services/:slug
        ├── IndustriesPage.tsx
        ├── industries/IndustryDetailPage.tsx  /industries/:slug
        ├── ContactPage.tsx
        └── NotFoundPage.tsx
```

## Media

All original scenes live in the project root at `../`; their web-optimised
copies live at `../assets/media/`. The React app references them through
`public/assets/` which is a set of symlinks — no files are duplicated.

### How to add Scene 11 (or replace a scene)

1. Save the render in the project root, e.g. `Scene 11 — Services.mp4`.
2. From the project root: `zsh tools/build-media.sh`.
3. In `src/data/media.ts`, set `available: true` on the matching asset
   and fill in `original`, `sourceResolution`, `duration`.
4. `npm run build`.

## Design

Colours are sampled from the GULF NEXT Oil and Gas logo:

| Token | Value | Use |
|---|---|---|
| `navy-950` | #040c1c | Page base, deep shadows |
| `navy-900/800/700` | | Surfaces and panels |
| `signal-500/400/300` | #1f6fd1 → | Primary actions |
| `teal-400/300` | #22c3a0 → | Accents, highlights, focus |
| `steel-100 → 700` | | Neutrals |

Typography: Archivo (display) + Inter (body), via Google Fonts (preconnected).

## Preserved reference

The earlier HTML/CSS/JS implementation lives at the project root
(`../index.html`, `../about.html`, `../services.html`, `../industries.html`
plus `../assets/`, `../tools/`). It is not loaded by the React app and is
kept purely as reference material. You can delete it once the React app is
confirmed in production.
