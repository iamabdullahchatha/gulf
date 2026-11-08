import { cn } from '@/lib/cn'

/** Slow, infinite capability ticker. Duplicated track for a seamless loop. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display font-expanded text-sm font-semibold uppercase tracking-[0.24em] text-silver/80">{t}</span>
          <span className="size-1.5 rotate-45 bg-emerald" aria-hidden />
        </li>
      ))}
    </ul>
  )
  return (
    <div
      className={cn('relative flex overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]', className)}
    >
      <div className="flex w-max animate-[marquee_48s_linear_infinite] hover:[animation-play-state:paused]">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
