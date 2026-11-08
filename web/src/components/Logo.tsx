import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import logoSrc from '@/assets/brand/logo.webp'

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
