import { type ImgHTMLAttributes } from 'react'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** JPEG path. AVIF and WebP siblings with the same stem are served first. */
  src: string
  /** Optional smaller JPEG used at 768px and below. */
  small?: string
  media?: string
}

const as = (path: string, ext: string) => path.replace(/\.jpe?g$/i, `.${ext}`)

/** Responsive photo: AVIF, then WebP, then JPEG, with an optional mobile size. */
export function Picture({ src, small, media = '(max-width: 768px)', alt = '', loading = 'lazy', decoding = 'async', ...img }: Props) {
  if (!/\.jpe?g$/i.test(src)) return <img src={src} alt={alt} loading={loading} decoding={decoding} {...img} />
  return (
    <picture className="contents">
      {small && <source type="image/avif" media={media} srcSet={as(small, 'avif')} />}
      {small && <source type="image/webp" media={media} srcSet={as(small, 'webp')} />}
      {small && <source type="image/jpeg" media={media} srcSet={small} />}
      <source type="image/avif" srcSet={as(src, 'avif')} />
      <source type="image/webp" srcSet={as(src, 'webp')} />
      <img src={src} alt={alt} loading={loading} decoding={decoding} {...img} />
    </picture>
  )
}
