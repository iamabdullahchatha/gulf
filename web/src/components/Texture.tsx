import { cn } from '@/lib/cn'

/**
 * Decorative industrial textures, rendered as an absolutely-positioned layer.
 * Parent must be `relative` (and usually `overflow-hidden`).
 *
 * - `grid`   blueprint grid, faded towards the edges
 * - `lines`  fine diagonal hatching, like brushed steel
 * - `noise`  film grain
 * - `glow`   two soft brand-colour light pools
 */
type Variant = 'grid' | 'grid-light' | 'lines' | 'noise' | 'glow' | 'glow-light'

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Texture({ variant, className }: { variant: Variant; className?: string }) {
  if (variant === 'grid-light') {
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', className)}
        style={{
          backgroundImage:
            'linear-gradient(rgb(7 59 117 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(7 59 117 / 0.06) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 80%)',
        }}
      />
    )
  }
  if (variant === 'glow-light') {
    return (
      <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
        <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-electric/10 blur-[120px]" />
        <div className="absolute -bottom-48 -right-32 size-[30rem] rounded-full bg-emerald/10 blur-[120px]" />
      </div>
    )
  }
  if (variant === 'grid') {
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', className)}
        style={{
          backgroundImage:
            'linear-gradient(rgb(197 206 216 / 0.055) 1px, transparent 1px), linear-gradient(90deg, rgb(197 206 216 / 0.055) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 85%)',
        }}
      />
    )
  }
  if (variant === 'lines') {
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 opacity-60', className)}
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgb(197 206 216 / 0.035) 0 1px, transparent 1px 9px)',
        }}
      />
    )
  }
  if (variant === 'noise') {
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay', className)}
        style={{ backgroundImage: NOISE }}
      />
    )
  }
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-electric/15 blur-[120px]" />
      <div className="absolute -bottom-48 -right-32 size-[30rem] rounded-full bg-emerald/12 blur-[120px]" />
    </div>
  )
}
