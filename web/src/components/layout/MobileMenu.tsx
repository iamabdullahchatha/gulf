import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { ChevronDown, X } from 'lucide-react'
import { PRIMARY_NAV, type MegaKey } from '@/data/navigation'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'
import { cn } from '@/lib/cn'
import { useScrollLock } from '@/hooks/useScrollLock'
import { Logo } from '@/components/Logo'
import { Texture } from '@/components/Texture'

interface Props {
  open: boolean
  onClose: () => void
}

const CHILDREN: Record<MegaKey, { label: string; href: string; index: string }[]> = {
  services: SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}`, index: s.index })),
  industries: INDUSTRIES.map((i) => ({ label: i.title, href: `/industries/${i.slug}`, index: i.index })),
}

/** Full-screen glass navigation for < lg screens. */
export function MobileMenu({ open, onClose }: Props) {
  const [expanded, setExpanded] = useState<MegaKey | null>(null)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'theme-light fixed inset-0 z-[60] overflow-y-auto bg-white/[0.97] backdrop-blur-2xl transition-opacity duration-300 lg:hidden',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      data-lenis-prevent
    >
      <Texture variant="grid-light" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald via-electric to-royal" />
      <div className="relative flex min-h-full flex-col px-5 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <Logo size="headerFloating" linked={false} plate={false} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-royal/15 bg-paper text-midnight transition hover:bg-white"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-10">
          <ul className="divide-y divide-royal/10 border-y border-royal/10">
            {PRIMARY_NAV.map((entry, n) => {
              const mega = entry.mega
              const isExpanded = mega !== undefined && expanded === mega
              return (
                <li key={entry.label}>
                  <div className="flex items-center">
                    <NavLink
                      to={entry.href}
                      end={entry.href === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn('flex flex-1 items-baseline gap-4 py-4 font-display text-3xl font-bold text-midnight', isActive && 'text-royal')
                      }
                    >
                      <span className="label-tech text-teal-500">{String(n + 1).padStart(2, '0')}</span>
                      {entry.label}
                    </NavLink>
                    {mega && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : mega)}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${entry.label}`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-royal/15 bg-paper text-royal"
                      >
                        <ChevronDown className={cn('size-5 transition-transform', isExpanded && 'rotate-180 text-electric')} aria-hidden />
                      </button>
                    )}
                  </div>
                  {mega && isExpanded && (
                    <ul className="grid gap-1 pb-4 pl-9">
                      {CHILDREN[mega].map((c) => (
                        <li key={c.href}>
                          <NavLink to={c.href} onClick={onClose} className="flex items-center gap-3 py-2 text-base text-steel-700 hover:text-royal">
                            <span className="label-tech text-teal-500">{c.index}</span>
                            {c.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-10">
          <NavLink
            to="/contact"
            onClick={onClose}
            className="sheen inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#2e96ea,#087edb)] px-6 py-4 font-semibold text-white shadow-[var(--shadow-glow)]"
          >
            Start a conversation
          </NavLink>
        </div>
      </div>
    </div>
  )
}
