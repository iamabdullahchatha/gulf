import { cn } from '@/lib/cn'

interface Props {
  /**
   * - `rule`    metallic hairline with a centred emblem
   * - `glow`    soft electric glow line, for dark-to-dark transitions
   * - `angle`   slanted edge into the next section (set `to` colour)
   */
  variant?: 'rule' | 'glow' | 'angle'
  /** Background of the section below, for the `angle` variant. */
  to?: 'midnight' | 'deep' | 'abyss'
  label?: string
  className?: string
}

const TO_FILL = { midnight: '#06172f', deep: '#09264b', abyss: '#030d1d' }

export function SectionDivider({ variant = 'rule', to = 'midnight', label, className }: Props) {
  if (variant === 'angle') {
    return (
      <div aria-hidden className={cn('relative -mt-px h-16 md:h-24', className)}>
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0 96 L1440 0 L1440 96 Z" fill={TO_FILL[to]} />
          <path d="M0 96 L1440 0" stroke="url(#gn-angle)" strokeWidth="1.2" fill="none" />
          <defs>
            <linearGradient id="gn-angle" x1="0" x2="1">
              <stop offset="0" stopColor="#c5ced8" stopOpacity="0" />
              <stop offset="0.5" stopColor="#c5ced8" stopOpacity="0.55" />
              <stop offset="1" stopColor="#00b99a" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  if (variant === 'glow') {
    return (
      <div aria-hidden className={cn('relative h-px w-full', className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric/60 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-8 w-2/3 -translate-x-1/2 -translate-y-1/2 bg-electric/20 blur-2xl" />
      </div>
    )
  }

  return (
    <div className={cn('mx-auto flex max-w-7xl items-center gap-5 px-4 md:px-8 lg:px-12', className)} aria-hidden={!label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-silver/30" />
      <span className="flex items-center gap-3">
        <span className="size-1.5 rotate-45 bg-emerald" />
        {label && <span className="label-tech text-steel-500">{label}</span>}
        <span className="size-1.5 rotate-45 border border-silver/50" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-silver/30" />
    </div>
  )
}
