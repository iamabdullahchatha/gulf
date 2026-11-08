import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { buttonStyles } from '@/lib/buttonStyles'
import { Container } from '@/components/Container'
import { Texture } from '@/components/Texture'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow?: string
  /** Use <em> for the editorial accent. */
  heading: ReactNode
  description?: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  className?: string
}

/** Brushed-metal call-to-action panel with a metallic hairline frame. */
export function CTASection({ eyebrow = 'Next step', heading, description, primary, secondary, className }: Props) {
  return (
    <section className={cn('relative py-20 md:py-28', className)}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] border-metallic surface-metal px-7 py-14 md:px-14 md:py-20">
          <Texture variant="lines" />
          <Texture variant="glow" />
          <div aria-hidden className="absolute -right-10 top-1/2 -z-10 size-80 -translate-y-1/2 rounded-full border border-silver/10" />
          <div aria-hidden className="absolute -right-24 top-1/2 -z-10 size-[28rem] -translate-y-1/2 rounded-full border border-silver/[0.06]" />
          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="label-tech text-emerald">{eyebrow}</p>
              <h2 className="mt-5 text-display-md font-bold text-white">{heading}</h2>
              {description && <p className="mt-5 max-w-xl text-steel-300 md:text-lg">{description}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={primary.href} className={buttonStyles({ variant: 'emerald', size: 'lg' })}>
                {primary.label} <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              {secondary && (
                <Link to={secondary.href} className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
