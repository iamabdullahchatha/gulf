import { useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { PRIMARY_NAV, type MegaKey } from '@/data/navigation'
import { cn } from '@/lib/cn'

interface Props {
  active: MegaKey | null
  onOpen: (key: MegaKey) => void
  onToggle: (key: MegaKey) => void
  onCloseSoon: () => void
}

/**
 * Desktop navigation (bright header). A soft blue highlight glides between
 * items as the pointer moves; the current page carries a gradient underline. Services and Industries
 * open the full-width mega menu (state lives in Header).
 */
export function MainNav({ active, onOpen, onToggle, onCloseSoon }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const [hovering, setHovering] = useState(false)
  const { pathname } = useLocation()

  const movePill = (el: HTMLElement) => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return
    const a = el.getBoundingClientRect()
    const b = list.getBoundingClientRect()
    pill.style.width = `${a.width}px`
    pill.style.transform = `translateX(${a.left - b.left}px)`
  }

  return (
    <ul
      ref={listRef}
      className="relative hidden items-center gap-0.5 rounded-full lg:flex"
      onMouseLeave={() => setHovering(false)}
    >
      <span
        ref={pillRef}
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-0 top-0 h-full rounded-full bg-electric/[0.08] ring-1 ring-electric/15 transition-[transform,width,opacity] duration-300 ease-[var(--ease-out-expo)]',
          hovering ? 'opacity-100' : 'opacity-0',
        )}
      />
      {PRIMARY_NAV.map((entry) => {
        const mega = entry.mega
        const isOpen = mega !== undefined && active === mega
        const current = entry.href === '/' ? pathname === '/' : pathname.startsWith(entry.href)
        const enter = (e: React.MouseEvent<HTMLElement>) => {
          setHovering(true)
          movePill(e.currentTarget)
          if (mega) onOpen(mega)
          else onCloseSoon()
        }
        const base =
          'relative z-[1] inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition-colors duration-300'
        const dot = current && (
          <span aria-hidden className="absolute inset-x-4 -bottom-[0.55rem] h-[2px] rounded-full bg-gradient-to-r from-emerald to-electric" />
        )
        return (
          <li key={entry.label}>
            {mega ? (
              <button
                type="button"
                aria-expanded={isOpen}
                onMouseEnter={enter}
                onFocus={(e) => movePill(e.currentTarget)}
                onClick={() => onToggle(mega)}
                className={cn(base, isOpen || current ? 'text-royal' : 'text-steel-700 hover:text-midnight')}
              >
                {entry.label}
                <ChevronDown className={cn('size-3.5 transition-transform duration-300', isOpen && 'rotate-180 text-electric')} aria-hidden />
                {dot}
              </button>
            ) : (
              <NavLink
                to={entry.href}
                end={entry.href === '/'}
                onMouseEnter={enter}
                onFocus={(e) => movePill(e.currentTarget)}
                className={cn(base, current ? 'text-royal' : 'text-steel-700 hover:text-midnight')}
              >
                {entry.label}
                {dot}
              </NavLink>
            )}
          </li>
        )
      })}
    </ul>
  )
}
