import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { buttonStyles } from '@/lib/buttonStyles'
import { Texture } from '@/components/Texture'
import { Picture } from '@/components/Picture'
import { VideoBackground, type VideoBackgroundProps } from './VideoBackground'
import { resolveMedia } from '@/data/media'
import type { SectionKey } from '@/types/media'

type Align = 'left' | 'center' | 'right'
type Height = 'full' | 'tall' | 'medium'
type Overlay = 'light' | 'medium' | 'strong'

const OVERLAY_VALUES: Record<Overlay, number> = { light: 0.35, medium: 0.55, strong: 0.75 }
const HEIGHTS: Record<Height, string> = {
  full: 'min-h-[640px] h-[100svh] max-md:min-h-[580px]',
  tall: 'min-h-[600px] h-[88svh] max-md:min-h-[560px]',
  medium: 'min-h-[540px] h-[68svh] max-md:min-h-[500px]',
}
/** Midnight Navy as RGB, used for every overlay wash. */
const TINT = '6 23 47'

interface ButtonSpec {
  label: string
  href: string
}

export interface CinematicHeroProps {
  /** Media-map section key. Provides src/srcSd/poster unless overridden below. */
  section?: SectionKey
  src?: string
  srcSd?: string
  poster?: string
  posterSmall?: string

  eyebrow?: string
  /** Mono index before the eyebrow, e.g. "01 / 06". */
  index?: string
  /** Wrap a word in <em> for the editorial serif accent. */
  heading: ReactNode
  headingLevel?: 1 | 2
  description?: ReactNode
  primary?: ButtonSpec
  secondary?: ButtonSpec

  align?: Align
  overlay?: Overlay | number
  height?: Height
  loading?: VideoBackgroundProps['loading']
  focal?: string
  mobileFocal?: string
  mobileVideo?: boolean
  /** Show only the still poster image: no video is attached or downloaded. */
  still?: boolean
  mobileAlign?: Align
  /** Shows a "scroll" cue at the bottom edge. */
  scrollCue?: boolean
  /** Extra content under the CTAs (breadcrumbs, chips…). */
  footer?: ReactNode
  /** Content placed above the eyebrow (e.g. breadcrumbs). */
  header?: ReactNode
  id?: string
  className?: string
}

/** Reusable cinematic hero: background video + brand overlay + real HTML content. */
export function CinematicHero(props: CinematicHeroProps) {
  const {
    section,
    eyebrow,
    index,
    heading,
    headingLevel = 1,
    description,
    primary,
    secondary,
    align = 'left',
    overlay = 'medium',
    height = 'full',
    loading = 'lazy',
    focal,
    mobileFocal,
    mobileVideo,
    still = false,
    mobileAlign,
    scrollCue,
    footer,
    header,
    id,
    className,
  } = props

  const resolved = section ? resolveMedia(section) : null
  const src = props.src ?? resolved?.asset.sources.hd
  const srcSd = props.srcSd ?? resolved?.asset.sources.sd
  const poster = props.poster ?? resolved?.asset.poster
  const posterSmall = props.posterSmall ?? resolved?.asset.posterSmall
  const o = typeof overlay === 'number' ? overlay : OVERLAY_VALUES[overlay]
  const Heading = headingLevel === 2 ? 'h2' : 'h1'

  return (
    <section
      id={id}
      className={cn('relative isolate flex overflow-hidden text-white', HEIGHTS[height], className)}
      data-hero
      data-align={align}
      data-mobile-align={mobileAlign ?? align}
      data-interim={resolved?.isFallback ? 'true' : undefined}
    >
      {still && poster && (
        <div aria-hidden className="absolute inset-0 overflow-hidden bg-navy-900">
          <Picture
            src={poster}
            small={posterSmall}
            loading={loading === 'eager' ? 'eager' : 'lazy'}
            fetchPriority={loading === 'eager' ? 'high' : undefined}
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: (focal ?? '50% 50%') }}
          />
        </div>
      )}
      {!still && src && poster && (
        <VideoBackground
          src={src}
          srcSd={srcSd}
          poster={poster}
          posterSmall={posterSmall}
          loading={loading}
          focal={focal}
          mobileFocal={mobileFocal}
          mobileVideo={mobileVideo}
        />
      )}

      {/* Overlay stack above the media: top scrim, bottom scrim, alignment wash, vignette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `linear-gradient(180deg, rgb(${TINT} / ${f(o * 0.85)}) 0%, transparent 32%)`,
            `linear-gradient(0deg, rgb(${TINT} / ${f(Math.min(1, o + 0.25))}) 0%, rgb(${TINT} / ${f(o * 0.4)}) 30%, transparent 55%)`,
            sideWash(align, o),
            `radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, rgb(3 13 29 / 0.55) 100%)`,
          ].join(','),
        }}
      />
      <Texture variant="noise" />

      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-24 pt-32 md:px-8 md:pb-28 md:pt-40 lg:px-12',
          align === 'center' && 'items-center text-center',
          align === 'right' && 'items-end text-right max-md:items-start max-md:text-left',
        )}
      >
        <div className={cn('mt-auto w-full', align === 'center' ? 'mx-auto max-w-4xl' : 'max-w-3xl')}>
          {header && <div className="mb-8">{header}</div>}
          {(eyebrow ?? index) && (
            <p className={cn('flex items-center gap-3', align === 'center' && 'justify-center', align === 'right' && 'justify-end max-md:justify-start')}>
              {index && <span className="label-tech text-teal-300">{index}</span>}
              <span className="h-px w-10 bg-gradient-to-r from-emerald to-silver/0" aria-hidden />
              {eyebrow && (
                <span className="font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-silver">
                  {eyebrow}
                </span>
              )}
            </p>
          )}
          <Heading
            className={cn(
              'mt-6 font-bold drop-shadow-[0_4px_30px_rgb(3_13_29/0.45)]',
              headingLevel === 1 ? 'text-display-xl' : 'text-display-lg',
            )}
          >
            {heading}
          </Heading>
          {description && (
            <p
              className={cn(
                'mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg',
                align === 'center' && 'mx-auto',
                align === 'right' && 'ml-auto max-md:ml-0',
              )}
            >
              {description}
            </p>
          )}

          {(primary ?? secondary) && (
            <div
              className={cn(
                'mt-10 flex flex-wrap gap-3',
                align === 'center' && 'justify-center',
                align === 'right' && 'justify-end max-md:justify-start',
              )}
            >
              {primary && (
                <Link to={primary.href} className={buttonStyles({ variant: 'primary', size: 'lg' })}>
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link to={secondary.href} className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
                  {secondary.label}
                </Link>
              )}
            </div>
          )}

          {footer && <div className="mt-12">{footer}</div>}
        </div>
      </div>

      {scrollCue && (
        <div aria-hidden className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="label-tech text-silver/70">Scroll</span>
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-silver/40 p-1.5">
            <ArrowDown className="size-3 animate-bounce text-emerald" />
          </span>
        </div>
      )}
    </section>
  )
}

function f(n: number): string {
  return Math.min(1, Math.max(0, n)).toFixed(3)
}

function sideWash(align: Align, o: number): string {
  if (align === 'center') {
    return `radial-gradient(ellipse 70% 60% at 50% 58%, rgb(${TINT} / ${f(o + 0.05)}) 0%, rgb(${TINT} / ${f(o * 0.45)}) 100%)`
  }
  const deg = align === 'right' ? 270 : 90
  return `linear-gradient(${deg}deg, rgb(${TINT} / ${f(o + 0.15)}) 0%, rgb(${TINT} / ${f(o * 0.55)}) 45%, rgb(${TINT} / ${f(o * 0.1)}) 100%)`
}
