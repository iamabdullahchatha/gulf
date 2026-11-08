import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow?: string
  /** Section index shown in mono before the eyebrow, e.g. "02". */
  index?: string
  /** Use <em> for the editorial serif accent. */
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  size?: 'lg' | 'md'
  as?: 'h1' | 'h2' | 'h3'
  /** `dark` for navy/cinematic sections, `light` for paper/white sections. */
  tone?: 'dark' | 'light'
  className?: string
  /** Applies the `.reveal` hook so AnimatedSection can stagger it. */
  reveal?: boolean
}

/**
 * The one heading pattern every section uses: mono index, expanded eyebrow,
 * editorial display title, optional lead. Keeps rhythm identical sitewide.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  align = 'left',
  size = 'lg',
  as: Tag = 'h2',
  tone = 'dark',
  className,
  reveal = true,
}: Props) {
  const r = reveal ? 'reveal' : undefined
  const light = tone === 'light'
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl', className)}>
      {(eyebrow ?? index) && (
        <p className={cn('flex items-center gap-3', align === 'center' && 'justify-center', r)}>
          {index && <span className={cn('label-tech', light ? 'text-teal-500' : 'text-emerald')}>{index}</span>}
          {index && eyebrow && <span className="h-px w-8 bg-gradient-to-r from-emerald to-transparent" aria-hidden />}
          {eyebrow && (
            <span className={cn('font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.26em]', light ? 'text-royal' : 'text-silver')}>
              {eyebrow}
            </span>
          )}
        </p>
      )}
      <Tag className={cn('mt-5 font-bold', light ? 'text-midnight' : 'text-white', size === 'lg' ? 'text-display-lg' : 'text-display-md', r)}>{title}</Tag>
      {lead && (
        <p className={cn('mt-6 text-base leading-relaxed md:text-lg', light ? 'text-steel-700' : 'text-steel-400', align === 'center' && 'mx-auto max-w-2xl', r)}>
          {lead}
        </p>
      )}
    </div>
  )
}
