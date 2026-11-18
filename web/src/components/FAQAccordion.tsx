import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { FaqItem } from '@/data/faq'

interface Props {
  items: FaqItem[]
  tone?: 'dark' | 'light'
  className?: string
}

/** Numbered accordion with a smooth grid-rows height transition. */
export function FAQAccordion({ items, tone = 'dark', className }: Props) {
  const [open, setOpen] = useState<number | null>(0)
  const light = tone === 'light'
  return (
    <ul className={cn('border-t', light ? 'border-royal/10' : 'border-silver/10', className)}>
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `faq-panel-${i}`
        const buttonId = `faq-button-${i}`
        return (
          <li key={item.q} className={cn('border-b transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:[transform:perspective(900px)_rotateX(3deg)_translateZ(8px)]', light ? 'border-royal/10 hover:bg-paper hover:shadow-[0_18px_40px_-28px_rgb(9_38_75/0.4)]' : 'border-silver/10 hover:bg-white/[0.03]')}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start gap-6 px-2 py-7 text-left md:px-4"
              >
                <span className={cn('label-tech mt-1.5 transition', isOpen ? (light ? 'text-teal-600' : 'text-emerald') : light ? 'text-steel-400' : 'text-steel-500')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'flex-1 font-display text-xl font-semibold transition md:text-2xl',
                    light ? (isOpen ? 'text-midnight' : 'text-steel-700 group-hover:text-midnight') : isOpen ? 'text-white' : 'text-steel-200 group-hover:text-white',
                  )}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition duration-500',
                    isOpen
                      ? 'rotate-45 border-emerald bg-emerald text-white'
                      : light
                        ? 'border-royal/20 text-royal group-hover:border-royal/50'
                        : 'border-silver/25 text-silver group-hover:border-silver/60',
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn('grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className={cn('max-w-3xl pb-8 pl-[3.25rem] leading-relaxed', light ? 'text-steel-700' : 'text-steel-400')}>{item.a}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
