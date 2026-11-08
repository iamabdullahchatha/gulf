import { Link } from 'react-router'
import { buttonStyles } from '@/lib/buttonStyles'
import { Container } from '@/components/Container'
import { Texture } from '@/components/Texture'
import { Seo } from '@/lib/seo'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noIndex />
      <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden py-40">
        <Texture variant="grid" />
        <Texture variant="glow" />
        <Container className="relative text-center">
          <p className="font-display font-black leading-none text-metallic" style={{ fontSize: 'clamp(7rem, 22vw, 16rem)' }}>404</p>
          <h1 className="mt-6 text-display-md font-bold">Lost in the <em>pipeline</em>.</h1>
          <p className="mx-auto mt-6 max-w-xl text-steel-400">
            The page you were looking for has moved or does not exist.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/" className={buttonStyles({ size: 'lg' })}>Back to home</Link>
            <Link to="/services" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>Our services</Link>
          </div>
        </Container>
      </section>
    </>
  )
}
