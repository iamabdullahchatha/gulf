import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Page gutter wrapper. Keeps content within the brand's maximum reading width
 * and applies a responsive horizontal padding.
 *
 *   <Container>...</Container>
 *   <Container as="section" className="py-24">...</Container>
 */
type Props = HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main' }

export function Container({ as = 'div', className, ...rest }: Props) {
  const Tag = as
  return <Tag {...rest} className={cn('mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12', className)} />
}
