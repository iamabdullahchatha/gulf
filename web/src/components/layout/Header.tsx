import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import type { MegaKey } from '@/data/navigation'
import { cn } from '@/lib/cn'
import { buttonStyles } from '@/lib/buttonStyles'
import { MainNav } from './MainNav'
import { MegaMenu } from './MegaMenu'
import { MobileMenu } from './MobileMenu'

/**
 * Site header — bright theme.
 *
 *  - A navy information strip (tagline + quick links) sits above a crisp
 *    white navigation bar; the original logo sits directly on white.
 *  - After scrolling, the strip folds away and the bar becomes a floating
 *    white glass panel with a soft shadow and a brand-gradient hairline.
 *  - While the hero is on screen, scrolling down tucks the header away and
 *    scrolling up brings it back. As soon as the hero ends, the header
 *    reappears and stays. It never hides near the top or while a menu is open.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(() => (typeof window !== 'undefined' ? window.scrollY > 24 : false))
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mega, setMega] = useState<MegaKey | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const lastY = useRef(0)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)

  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMega(null)
    setHidden(false)
  }

  useEffect(() => {
    // At most one update per frame: the hero check reads layout, and doing that
    // on every raw scroll event competes with the scroll-driven video.
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      setScrolled(y > 24)
      const dy = y - lastY.current
      if (Math.abs(dy) > 6) {
        // Only tuck the header away while the hero is still on screen; once
        // the hero has scrolled past, the header stays visible.
        const hero = document.querySelector<HTMLElement>("[data-hero]")
        const inHero = hero ? hero.getBoundingClientRect().bottom > 96 : false
        setHidden(dy > 0 && y > 320 && inHero)
        lastY.current = y
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mega])

  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const closeSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setMega(null), 160)
  }, [])
  const open = (k: MegaKey) => {
    cancelClose()
    setMega(k)
  }
  const toggle = (k: MegaKey) => setMega((m) => (m === k ? null : k))

  const floating = scrolled
  const isHidden = hidden && mega === null && !mobileOpen

  return (
    <>
      <header
        onMouseEnter={cancelClose}
        onMouseLeave={closeSoon}
        className={cn('fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)]', isHidden && '-translate-y-[calc(100%+1rem)]')}
      >
        {/* Information strip */}
        <div
          className={cn(
            'hidden overflow-hidden bg-[linear-gradient(90deg,#06172f_0%,#09264b_55%,#073b75_100%)] transition-[height,opacity] duration-500 ease-[var(--ease-out-expo)] lg:block',
            floating ? 'h-0 opacity-0' : 'h-10 opacity-100',
          )}
        >
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 md:px-8 lg:px-12">
            <p className="flex items-center gap-2.5 text-[0.78rem] text-white/80">
              <span className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgb(0_185_154/0.9)] animate-[pulse-dot_2.4s_ease-in-out_infinite]" />
              Integrated Oil &amp; Gas Contracting · Industrial Engineering · Infrastructure Solutions
            </p>
            <nav aria-label="Quick links" className="flex items-center divide-x divide-white/15 text-[0.78rem]">
              <Link to="/about#hse" className="inline-flex items-center gap-1.5 px-4 text-white/75 transition hover:text-white">
                <ShieldCheck className="size-3.5 text-teal-300" aria-hidden /> HSE &amp; quality
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-1 pl-4 font-semibold text-teal-300 transition hover:text-white">
                Request a proposal <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </nav>
          </div>
        </div>

        {/* Main bar */}
        <div className={cn('transition-[padding] duration-500 ease-[var(--ease-out-expo)]', floating ? 'px-3 pt-3 md:px-6' : 'px-0 pt-0')}>
          <div
            className={cn(
              'relative mx-auto flex items-center justify-between gap-6 bg-white/[0.94] backdrop-blur-xl transition-all duration-500 ease-[var(--ease-out-expo)]',
              floating
                ? 'h-[4.25rem] max-w-7xl rounded-2xl px-3 ring-1 ring-royal/10 shadow-[0_24px_60px_-28px_rgb(9_38_75/0.55),0_2px_6px_-2px_rgb(9_38_75/0.08)] md:px-5'
                : 'h-20 max-w-none rounded-none px-4 shadow-[0_1px_0_rgb(9_38_75/0.08),0_14px_40px_-30px_rgb(9_38_75/0.6)] md:px-8 lg:px-[max(3rem,calc((100vw_-_80rem)/2_+_3rem))]',
            )}
          >
            {/* Brand-gradient hairline */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent,#00b99a_25%,#087edb_75%,transparent)] transition-all duration-500',
                floating ? 'inset-x-10 opacity-80' : 'inset-x-0 opacity-100',
              )}
            />

            <Logo plate={false} size={floating ? 'headerFloating' : 'header'} />

            <nav aria-label="Main">
              <MainNav active={mega} onOpen={open} onToggle={toggle} onCloseSoon={closeSoon} />
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/contact" className="hidden items-center gap-2 text-sm font-semibold text-royal transition hover:text-electric xl:inline-flex">
                Get in touch
              </Link>
              <span aria-hidden className="hidden h-6 w-px bg-royal/15 xl:block" />
              <div className="hidden lg:block">
                <Link to="/contact" className={buttonStyles({ size: "sm" })}>
                  Request a proposal <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <button
                type="button"
                className="group inline-flex size-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-royal/15 bg-paper transition hover:border-royal/30 hover:bg-white lg:hidden"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen(true)}
              >
                <span className="h-0.5 w-5 rounded-full bg-midnight transition-all group-hover:w-6" />
                <span className="h-0.5 w-3.5 self-center rounded-full bg-emerald transition-all group-hover:w-6" />
                <span className="h-0.5 w-5 rounded-full bg-midnight transition-all group-hover:w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <MegaMenu active={mega} onNavigate={() => setMega(null)} floating={floating} />
        </div>
      </header>
      <div id="mobile-menu">
        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </>
  )
}
