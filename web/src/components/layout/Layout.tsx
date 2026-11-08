import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { useLenis } from '@/hooks/useLenis'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { Header } from './Header'
import { Footer } from './Footer'
import { LoadingFallback } from '@/components/LoadingFallback'

/**
 * Site shell: fixed header, route outlet, footer. Owns the smooth-scroll
 * engine and the route-change scroll-to-top behaviour.
 */
export function Layout() {
  useLenis()
  useScrollToTop()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-900"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="relative">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
