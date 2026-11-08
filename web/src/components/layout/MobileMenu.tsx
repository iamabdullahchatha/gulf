import { useEffect, useState, type CSSProperties } from 'react'
import { Link, NavLink } from 'react-router'
import { ArrowRight, ArrowUpRight, ChevronDown, Mail, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PRIMARY_NAV, type MegaKey } from '@/data/navigation'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { cn } from '@/lib/cn'
import { buttonStyles } from '@/lib/buttonStyles'
import { useScrollLock } from '@/hooks/useScrollLock'
import { Texture } from '@/components/Texture'

interface Props {
  open: boolean
  onClose: () => void
}

interface Child {
  label: string
  href: string
  icon: LucideIcon
}

const CHILDREN: Record<MegaKey, Child[]> = {
  services: SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}`, icon: s.icon })),
  industries: INDUSTRIES.map((i) => ({ label: i.title, href: `/industries/${i.slug}`, icon: i.icon })),
}

const VIEW_ALL: Record<MegaKey, string> = {
  services: 'View all services',
  industries: 'View all industries',
}

/**
 * Mobile navigation (< lg). A bright sheet that opens beneath the header bar,
 * so the logo and the Menu/Close toggle stay in place. Rows rise in with a
 * short stagger; Services and Industries expand smoothly in place.
 *
 * While open, the page behind is scroll-locked and made `inert`, so neither
 * touch nor keyboard can reach it. While closed, the sheet itself is inert.
 */
export function MobileMenu({ open, onClose }: Props) {
  const [expanded, setExpanded] = useState<MegaKey | null>(null)
  const [wasOpen, setWasOpen] = useState(open)
  useScrollLock(open)

  // Start collapsed each time the menu opens.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setExpanded(null)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]')?.focus()
    }
    const behind = Array.from(document.querySelectorAll<HTMLElement>('#main, footer, a[href="#main"]'))
    behind.forEach((el) => (el.inert = true))
    document.addEventListener('keydown', onKey)
    return () => {
      behind.forEach((el) => (el.inert = false))
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // Staggered entrance; on close everything fades together.
  const rise = (step: number): { className: string; style: CSSProperties } => ({
    className: cn(
      'transition-[opacity,transform] ease-[var(--ease-out-expo)]',
      open ? 'translate-y-0 opacity-100 duration-500' : 'translate-y-3 opacity-0 duration-200',
    ),
    style: { transitionDelay: open ? `${90 + step * 45}ms` : '0ms' },
  })

  const intro = rise(0)
  const panel = rise(PRIMARY_NAV.length + 1)

  return (
    <div
      id="mobile-menu"
      inert={!open}
      className={cn(
        'theme-light fixed inset-0 z-40 flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fa_55%,#eef2f6_100%)] transition-[opacity,visibility] duration-300 lg:hidden',
        open ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <Texture variant="grid-light" />
      <Texture variant="glow-light" />

      <div className="relative flex-1 overflow-y-auto overscroll-contain pt-16 md:pt-[4.5rem]" data-lenis-prevent>
        <div className="gutter-safe mx-auto flex min-h-full w-full max-w-2xl flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 [--gutter:1.25rem] md:pt-10 md:[--gutter:2rem]">
          <p style={intro.style} className={cn(intro.className, 'label-tech flex items-center gap-2 text-steel-500')}>
            <span className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgb(0_185_154/0.8)]" aria-hidden />
            Navigation
          </p>

          <nav aria-label="Mobile" className="mt-4">
            <ul className="border-t border-royal/10">
              {PRIMARY_NAV.map((entry, n) => {
                const mega = entry.mega
                const isExpanded = mega !== undefined && expanded === mega
                const r = rise(n + 1)
                return (
                  <li key={entry.label} style={r.style} className={cn(r.className, 'border-b border-royal/10')}>
                    <div className="flex items-center gap-3">
                      <NavLink
                        to={entry.href}
                        end={entry.href === '/'}
                        onClick={onClose}
                        className="group flex min-h-[4.25rem] flex-1 items-center gap-4 py-3"
                      >
                        {({ isActive }) => (
                          <>
                            <span className={cn('label-tech w-6 shrink-0 transition-colors', isActive ? 'text-electric' : 'text-teal-500')}>
                              {String(n + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={cn(
                                'font-display text-[1.75rem] font-bold leading-none tracking-tight transition-colors',
                                isActive ? 'text-royal' : 'text-midnight group-hover:text-royal',
                              )}
                            >
                              {entry.label}
                            </span>
                            {isActive && (
                              <span className="rounded-full bg-emerald/10 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-teal-500">
                                Current
                              </span>
                            )}
                            {!mega && (
                              <ArrowUpRight
                                className="ml-auto size-5 shrink-0 text-royal/30 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric"
                                aria-hidden
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                      {mega && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : mega)}
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-sub-${mega}`}
                          aria-label={`${isExpanded ? 'Hide' : 'Show'} ${entry.label.toLowerCase()}`}
                          className={cn(
                            'inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                            isExpanded ? 'border-royal bg-royal text-white' : 'border-royal/15 bg-white text-royal hover:border-royal/30',
                          )}
                        >
                          <ChevronDown className={cn('size-5 transition-transform duration-300', isExpanded && 'rotate-180')} aria-hidden />
                        </button>
                      )}
                    </div>

                    {mega && (
                      <div
                        id={`mobile-sub-${mega}`}
                        className={cn(
                          'grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]',
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                        )}
                      >
                        <div className="min-h-0 overflow-hidden" inert={!isExpanded}>
                          <ul className="grid gap-1 pb-5 min-[400px]:pl-10">
                            {CHILDREN[mega].map(({ label, href, icon: Icon }) => (
                              <li key={href}>
                                <NavLink
                                  to={href}
                                  onClick={onClose}
                                  className={({ isActive }) =>
                                    cn(
                                      'group flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 transition-colors',
                                      isActive ? 'bg-white text-royal ring-1 ring-royal/10' : 'text-steel-700 hover:bg-white hover:text-royal',
                                    )
                                  }
                                >
                                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-electric ring-1 ring-royal/10 shadow-[0_4px_12px_-8px_rgb(9_38_75/0.5)]">
                                    <Icon className="size-4" aria-hidden />
                                  </span>
                                  <span className="text-[0.9375rem] font-medium leading-snug">{label}</span>
                                </NavLink>
                              </li>
                            ))}
                            <li>
                              <Link
                                to={entry.href}
                                onClick={onClose}
                                className="group mt-1 inline-flex min-h-11 items-center gap-2 px-2.5 text-sm font-semibold text-electric"
                              >
                                {VIEW_ALL[mega]}
                                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Closing panel: positioning line + conversion actions */}
          <div style={panel.style} className={cn(panel.className, 'mt-auto pt-10')}>
            <div className="surface-metal relative overflow-hidden rounded-3xl p-5 text-white ring-1 ring-white/10 shadow-[0_30px_60px_-30px_rgb(6_23_47/0.7)] md:p-6">
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#00b99a,#087edb)]" />
              <p className="label-tech flex items-center gap-2 text-teal-300">
                <span className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgb(0_185_154/0.9)] animate-[pulse-dot_2.4s_ease-in-out_infinite]" aria-hidden />
                Integrated oil &amp; gas contracting
              </p>
              <p className="mt-3 text-sm leading-relaxed text-silver/85">Industrial engineering and infrastructure solutions.</p>
              <Link to="/contact" onClick={onClose} className={buttonStyles({ className: 'mt-5 w-full' })}>
                Request a proposal <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/about#hse"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 text-[0.8125rem] font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <ShieldCheck className="size-4 text-teal-300" aria-hidden /> HSE &amp; quality
                </Link>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 text-[0.8125rem] font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <Mail className="size-4 text-teal-300" aria-hidden /> Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
