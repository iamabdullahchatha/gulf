import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'ghost' | 'dark' | 'outline' | 'emerald'
export type ButtonSize = 'sm' | 'md' | 'lg'

/*
 * Buttons
 *  primary — electric-blue gradient with a metallic top highlight and sheen
 *  emerald — emerald gradient, for the single most important conversion
 *  ghost   — glass with silver hairline, for secondary actions on imagery
 *  dark    — midnight solid, for light surfaces
 *  outline — silver hairline, no fill
 */
const BASE =
  'sheen relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-[0.01em] ' +
  'transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[var(--ease-out-expo)] ' +
  'hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald ' +
  'disabled:pointer-events-none disabled:opacity-60 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-[linear-gradient(180deg,#2e96ea_0%,#087edb_55%,#0767b6_100%)] ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.35),var(--shadow-glow)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_22px_60px_-12px_rgb(8_126_219/0.7)]',
  emerald:
    'text-midnight bg-[linear-gradient(180deg,#4dd6bd_0%,#00b99a_60%,#009c82_100%)] ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.45),var(--shadow-glow-emerald)]',
  ghost:
    'text-white border border-silver/35 bg-white/[0.06] backdrop-blur-md hover:border-silver/70 hover:bg-white/[0.12]',
  dark: 'bg-midnight text-white hover:bg-deep',
  outline: 'border border-silver/30 text-white hover:border-emerald hover:text-teal-300',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-5 text-[0.8125rem]',
  md: 'min-h-12 px-7 text-sm',
  lg: 'min-h-14 px-8 text-[0.9375rem]',
}

/** Return the class string for the button look. Use on a Link or custom tag. */
export function buttonStyles(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  const { variant = 'primary', size = 'md', className } = opts
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}
