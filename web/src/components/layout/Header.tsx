import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import type { MegaKey } from '@/data/navigation'
import { cn } from '@/lib/cn'
import { buttonStyles } from '@/lib/buttonStyles'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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
 *  - Below `lg` the bar carries the logo, a compact enquiry button and a
 *    Menu toggle. The mobile menu opens *beneath* the bar, so the logo stays
 *    put and the toggle morphs into a close button in the same spot.
 */
export function Header() {
  // Starts false to match the pre-rendered HTML; the first scroll frame (or a
  // restored scroll position, below) sets the real value.
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mega, setMega] = useState<MegaKey | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const lastY = useRef(0)
  const menuOpenRef = useRef(false)
  const resyncRef = useRef(false)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMega(null)
    setHidden(false)
    setMobileOpen(false)
  }
  // The mobile menu only exists below lg; never leave it (and its scroll lock)
  // open after the viewport grows past that, e.g. on tablet rotation.
  if (isDesktop && mobileOpen) setMobileOpen(false)

  useEffect(() => {
    // While the menu is open the page is scroll-locked (its scroll position
    // jumps to 0 and back), so those jumps must not read as user scrolling.
    menuOpenRef.current = mobileOpen
    if (!mobileOpen) resyncRef.current = true
  }, [mobileOpen])

  useEffect(() => {
    // At most one update per frame: the hero check reads layout, and doing that
    // on every raw scroll event competes with the scroll-driven video.
    let frame = 0
    const update = () => {
      frame = 0
      if (menuOpenRef.current) return
      const y = window.scrollY
      setScrolled(y > 24)
      if (resyncRef.current) {
        // First event after the menu closed: the page was restored to where it
        // was. Take that as the new baseline instead of a downward scroll.
        resyncRef.current = false
        lastY.current = y
        return
      }
      const dy = y - lastY.current
      if (Math.abs(dy) > 6) {
        // Only tuck the header away while the hero is still on screen; once
        // the hero has scrolled past, the header stays visible.
        const hero = document.querySelector<HTMLElement>('[data-hero]')
        const inHero = hero ? hero.getBoundingClientRect().bottom > 96 : false
        setHidden(dy > 0 && y > 320 && inHero)
        lastY.current = y
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // A reload mid-page restores the scroll position without a scroll event.
    onScroll()
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
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // With the menu open the bar docks flat to the top so it reads as the
  // menu's own title bar.
  const floating = scrolled && !mobileOpen
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
        <div
          className={cn(
            'transition-[padding] duration-500 ease-[var(--ease-out-expo)]',
            floating ? 'gutter-safe pt-2.5 [--gutter:0.625rem] md:pt-3 md:[--gutter:1.5rem]' : 'px-0 pt-0',
          )}
        >
          <div
            className={cn(
              'relative mx-auto flex items-center justify-between gap-3 bg-white/[0.94] backdrop-blur-xl transition-all duration-500 ease-[var(--ease-out-expo)] lg:gap-6',
              floating
                ? 'h-14 max-w-7xl rounded-2xl pl-3.5 pr-1.5 ring-1 ring-royal/10 shadow-[0_24px_60px_-28px_rgb(9_38_75/0.55),0_2px_6px_-2px_rgb(9_38_75/0.08)] md:h-16 md:pl-5 md:pr-2.5 lg:h-[4.25rem] lg:px-5'
                : 'gutter-safe h-16 max-w-none rounded-none shadow-[0_1px_0_rgb(9_38_75/0.08),0_14px_40px_-30px_rgb(9_38_75/0.6)] [--gutter:1rem] md:h-[4.5rem] md:[--gutter:2rem] lg:h-20 lg:px-[max(3rem,calc((100vw_-_80rem)/2_+_3rem))]',
            )}
          >
            {/* Brand-gradient hairline */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent,#00b99a_25%,#087edb_75%,transparent)] transition-all duration-500',
                floating ? 'inset-x-8 opacity-80 lg:inset-x-10' : 'inset-x-0 opacity-100',
              )}
            />

            <Logo plate={false} size={floating ? 'headerFloating' : 'header'} onClick={closeMobile} />

            <nav aria-label="Main" className="hidden lg:block">
              <MainNav active={mega} onOpen={open} onToggle={toggle} onCloseSoon={closeSoon} />
            </nav>

            <div className="flex items-center gap-2 lg:gap-3">
              <Link to="/contact" className="hidden items-center gap-2 text-sm font-semibold text-royal transition hover:text-electric xl:inline-flex">
                Get in touch
              </Link>
              <span aria-hidden className="hidden h-6 w-px bg-royal/15 xl:block" />
              <div className="hidden lg:block">
                <Link to="/contact" className={buttonStyles({ size: 'sm' })}>
                  Request a proposal <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>

              {/* Mobile: compact enquiry button (the open menu carries its own CTA). */}
              <Link
                to="/contact"
                tabIndex={mobileOpen ? -1 : undefined}
                aria-hidden={mobileOpen || undefined}
                className={cn(
                  'group hidden h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#2e96ea_0%,#087edb_55%,#0767b6_100%)] pl-4 pr-3 text-[0.8125rem] font-semibold tracking-[0.01em] text-white',
                  'shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_24px_-12px_rgb(8_126_219/0.8)] transition-[opacity,transform,visibility] duration-300 active:scale-[0.97]',
                  'min-[360px]:inline-flex lg:hidden',
                  mobileOpen && 'pointer-events-none invisible scale-95 opacity-0',
                )}
              >
                Enquire
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
              </Link>

              {/* Mobile: Menu toggle — two bars that morph into a cross. */}
              <button
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((o) => !o)}
                className={cn(
                  'inline-flex h-11 min-w-11 items-center justify-center gap-2.5 rounded-full border pl-4 pr-3.5 text-[0.8125rem] font-semibold tracking-[0.01em] transition-colors duration-300 active:scale-[0.97] lg:hidden',
                  mobileOpen
                    ? 'border-midnight bg-midnight text-white'
                    : 'border-royal/15 bg-white text-midnight hover:border-royal/30 hover:bg-paper',
                )}
              >
                <span aria-hidden className="relative block h-4 overflow-hidden">
                  <span className={cn('block transition-transform duration-300 ease-[var(--ease-out-expo)]', mobileOpen && '-translate-y-4')}>
                    <span className="block h-4 leading-4">Menu</span>
                    <span className="block h-4 leading-4">Close</span>
                  </span>
                </span>
                <span aria-hidden className="relative block size-4">
                  <span
                    className={cn(
                      'absolute right-0 top-[4px] h-[2px] w-4 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)]',
                      mobileOpen && 'translate-y-[3px] rotate-45',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute bottom-[4px] right-0 h-[2px] rounded-full transition-[transform,width,background-color] duration-300 ease-[var(--ease-out-expo)]',
                      mobileOpen ? 'w-4 -translate-y-[3px] -rotate-45 bg-current' : 'w-2.5 bg-emerald',
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <MegaMenu active={mega} onNavigate={() => setMega(null)} floating={floating} />
        </div>
      </header>
      <MobileMenu open={mobileOpen} onClose={closeMobile} />
    </>
  )
}
