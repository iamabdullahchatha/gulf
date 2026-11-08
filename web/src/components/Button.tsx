import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/lib/buttonStyles'

interface Common {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...rest} />
}

export function LinkButton({ variant, size, className, ...rest }: Common & LinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...rest} />
}

export function AnchorButton({ variant, size, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={buttonStyles({ variant, size, className })} {...rest} />
}
