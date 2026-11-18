import { cn } from '@/lib/cn'
import logoSrc from '@/assets/brand/logo.webp'
import { LOGO_SRCSET } from '@/components/Logo'

interface Props {
  /** When true, fills the full viewport (used by Suspense in Layout). */
  fullScreen?: boolean
  label?: string
  className?: string
}

/**
 * Brand-aware placeholder shown while a route chunk loads. Gives Suspense a
 * calm, on-brand surface instead of the default blank frame.
 */
export function LoadingFallback({ fullScreen = true, label = 'Loading', className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden bg-navy-950 text-white',
        fullScreen ? 'grid min-h-screen place-items-center' : 'grid min-h-[40vh] place-items-center',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.navy.800)_0%,transparent_60%)]"
      />
      <div className="relative flex flex-col items-center gap-6">
        <span className="inline-flex items-center rounded-xl bg-white/95 px-4 py-2 shadow-lg shadow-navy-950/40">
          <img
            src={logoSrc}
            srcSet={LOGO_SRCSET}
            sizes="76px"
            alt=""
            width={580}
            height={430}
            className="h-14 w-auto"
            style={{ aspectRatio: '580 / 430' }}
          />
        </span>
        <div className="relative h-0.5 w-40 overflow-hidden rounded bg-white/10">
          <span className="absolute inset-y-0 w-1/3 animate-[sweep_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
