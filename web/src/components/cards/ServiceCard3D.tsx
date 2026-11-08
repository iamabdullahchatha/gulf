import { useCallback, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Check } from 'lucide-react'
import type { Service } from '@/data/services'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Picture } from '@/components/Picture'

/**
 * Service card built in true 3D.
 *
 * The card keeps `transform-style: preserve-3d` (no clipping on the 3D root),
 * and its layers sit at different depths:
 *   photo plane ......... translateZ(0)
 *   copy ................ translateZ(55px)
 *   index / arrow chips . translateZ(45px)
 *   icon ................ translateZ(95px) — pops out of the card
 *   floor shadow ........ translateZ(-70px)
 * As the card tilts toward the pointer the layers separate with real
 * parallax. On hover it lifts, the glare tracks the cursor, and the service
 * highlights slide in. Touch / reduced motion: a still card.
 */
export function ServiceCard3D({ service, className }: { service: Service; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const raf = useRef<number | undefined>(undefined)
  const reduced = usePrefersReducedMotion()
  const Icon = service.icon

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (reduced || e.pointerType !== 'mouse') return
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg) translateZ(30px)`
        el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
      })
    },
    [reduced],
  )

  const onLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <div className={cn('[perspective:1100px]', className)}>
      <Link
        ref={ref}
        to={`/services/${service.slug}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative block aspect-[4/5] rounded-[1.75rem] transition-transform duration-700 ease-[var(--ease-out-expo)] will-change-transform [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric"
      >
        {/* Floor shadow, far behind the card */}
        <span
          aria-hidden
          className="absolute inset-x-6 -bottom-2 h-16 rounded-full bg-midnight/45 blur-2xl transition-all duration-700 [transform:translateZ(-70px)] group-hover:inset-x-2 group-hover:bg-electric/40"
        />

        {/* Photo plane */}
        <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-deep ring-1 ring-royal/10 shadow-[0_30px_60px_-30px_rgb(9_38_75/0.55)]">
          <Picture small={service.imageSmall}
              src={service.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
            />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 via-40% to-transparent to-75% transition-opacity duration-700 group-hover:opacity-95" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-royal/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / 0.7), transparent 45%)' }}
          />
        </div>

        {/* Metallic rim */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.75rem] border-metallic opacity-60 transition-opacity group-hover:opacity-100" />

        {/* Chips */}
        <div className="absolute inset-x-6 top-6 flex items-start justify-between [transform:translateZ(45px)]">
          <span className="rounded-full bg-midnight/55 px-3 py-1.5 label-tech text-white ring-1 ring-white/20 backdrop-blur-md">{service.index}</span>
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-midnight/55 text-white ring-1 ring-white/20 backdrop-blur-md transition duration-500 group-hover:rotate-45 group-hover:bg-emerald group-hover:text-midnight">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>

        {/* Icon — floats furthest forward */}
        <span className="absolute left-6 top-[23%] inline-flex size-16 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-electric to-royal text-white shadow-[0_20px_40px_-12px_rgb(8_126_219/0.8),inset_0_1px_0_rgb(255_255_255/0.35)] transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:translateZ(95px)] group-hover:[transform:translateZ(110px)_rotate(-6deg)]">
          <Icon className="size-7" aria-hidden />
        </span>

        {/* Copy */}
        <div className="absolute inset-x-6 bottom-6 [transform:translateZ(55px)]">
          <h3 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgb(3_13_29/0.6)]">{service.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{service.short}</p>
          <ul className="grid max-h-0 gap-1.5 overflow-hidden opacity-0 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:mt-4 group-hover:max-h-40 group-hover:opacity-100 group-focus-visible:mt-4 group-focus-visible:max-h-40 group-focus-visible:opacity-100">
            {service.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex items-start gap-2 text-[0.8125rem] text-white/90">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
          <span className="mt-5 flex items-center gap-3 text-sm font-semibold text-white">
            <span className="h-px w-8 bg-emerald transition-all duration-500 group-hover:w-14" />
            Explore capability
          </span>
        </div>
      </Link>
    </div>
  )
}
