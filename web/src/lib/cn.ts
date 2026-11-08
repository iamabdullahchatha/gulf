/**
 * Tiny class-name joiner. Any falsy value is dropped. Prefer this over
 * installing clsx for a project with this few dependencies.
 *
 *   cn('base', isOpen && 'opacity-100', isDisabled ? 'cursor-not-allowed' : null)
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return
    if (Array.isArray(v)) v.forEach(walk)
    else out.push(String(v))
  }
  inputs.forEach(walk)
  return out.join(' ')
}
