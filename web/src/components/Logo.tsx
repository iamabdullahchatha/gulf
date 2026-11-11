import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import logoSrc from '@/assets/brand/logo.webp'
import logo200 from '@/assets/brand/logo-200.webp'
import logo300 from '@/assets/brand/logo-300.webp'
import logo400 from '@/assets/brand/logo-400.webp'

/**
 * Resized copies of the unaltered artwork (same image, fewer pixels). The
 * browser picks the smallest one that is still sharp for the logo's displayed
 * width and the screen's pixel density; the 580px original stays the largest.
 */
export const LOGO_SRCSET = `${logo200} 200w, ${logo300} 300w, ${logo400} 400w, ${logoSrc} 580w`

/** Displayed width in CSS px for each size (height × 580/430). */
const SIZES = {
  sm: '49px',
  md: '(min-width: 768px) 65px, 59px',
  lg: '87px',
  xl: '(min-width: 768px) 130px, 108px',
  header: '(min-width: 1024px) 87px, (min-width: 768px) 71px, 65px',
  headerFloating: '(min-width: 1024px) 76px, (min-width: 768px) 59px, 54px',
} as const

interface Props {
  linked?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header' | 'headerFloating'
  /** White plate behind the logo (needed on dark backgrounds). Off on light surfaces. */
  plate?: boolean
  className?: string
  /** Extra click handler on the home link (e.g. to close the mobile menu). */
  onClick?: () => void
}

/**
 * The original GULF NEXT Oil and Gas logo, unaltered.
 *
 * Its navy lettering needs a light ground on dark pages, so it sits on a
 * white plate with a fine silver hairline (`plate`, default on). On light
 * surfaces such as the bright header it sits directly on white. The artwork itself is never
 * recoloured, cropped or redrawn.
 */
export function Logo({ linked = true, size = 'md', plate: withPlate = true, className, onClick }: Props) {
  const heights = { sm: 'h-9', md: 'h-11 md:h-12', lg: 'h-16', xl: 'h-20 md:h-24', header: 'h-12 md:h-[3.25rem] lg:h-16', headerFloating: 'h-10 md:h-11 lg:h-14' }
  const plate = (
    <span
      className={cn(
        'inline-flex items-center transition-[transform,height] duration-500 ease-[var(--ease-out-expo)]',
        withPlate &&
          'rounded-xl bg-white px-3 py-1.5 ring-1 ring-silver/60 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6),inset_0_-1px_0_rgb(197_206_216/0.6)]',
        className,
      )}
    >
      <img
        src={logoSrc}
        srcSet={LOGO_SRCSET}
        sizes={SIZES[size]}
        alt="GULF NEXT Oil and Gas"
        width={580}
        height={430}
        className={cn('block w-auto', heights[size])}
        style={{ aspectRatio: '580 / 430' }}
      />
    </span>
  )
  if (!linked) return plate
  return (
    <Link to="/" onClick={onClick} aria-label="GULF NEXT Oil and Gas, home" className="inline-flex shrink-0 hover:[&>span]:-translate-y-0.5">
      {plate}
    </Link>
  )
}
