import { useCallback, useState } from 'react'
import { useLocation } from 'react-router'
import { Container } from '@/components/Container'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Texture } from '@/components/Texture'
import { FaqBrowser, QuestionCarousel, SearchBox, StillHaveQuestion, TopicTiles } from '@/components/faq/FaqSections'
import { PAGE_META } from '@/config/site'
import { Seo } from '@/lib/seo'
import { scrollToElement } from '@/lib/lenis'
import { FAQ_CATALOG, FAQ_CATEGORIES, FEATURED_FAQ } from '@/data/faqCatalog'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'

/**
 * FAQs: every question published across the site in one place. A 3D carousel
 * of featured questions and a search in the hero, topic tiles, and a
 * searchable answer browser with a sticky topic rail. Each answer has its own
 * link (/faqs#<id>), which opens it on arrival.
 */
export default function FaqPage() {
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Set<string>>(() => new Set())

  // Open the answer named in the URL (the scroll itself is handled globally).
  const [seenHash, setSeenHash] = useState('')
  if (hash !== seenHash) {
    setSeenHash(hash)
    const id = decodeURIComponent(hash.slice(1))
    if (FAQ_CATALOG.some((f) => f.id === id)) setOpen((s) => new Set(s).add(id))
  }

  const toggle = useCallback((id: string) => {
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const goTo = (id: string, offset = -150) => {
    window.setTimeout(() => {
      const el = document.getElementById(id)
      if (el) scrollToElement(el, offset)
    }, 30)
  }

  const pick = (id: string) => {
    setQuery('')
    setOpen((s) => new Set(s).add(id))
    goTo(id)
  }

  return (
    <>
      <Seo
        title={PAGE_META['/faqs'].title}
        description={PAGE_META['/faqs'].description}
        path="/faqs"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_CATALOG.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-midnight pb-40 pt-36 md:pb-48 md:pt-40" aria-label="Frequently asked questions">
        <Texture variant="grid" className="-z-10" />
        <div aria-hidden className="absolute -left-40 top-10 -z-10 size-[40rem] rounded-full bg-electric/15 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-0 -z-10 size-[36rem] rounded-full bg-emerald/10 blur-3xl" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-deep" />

        <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-6">
          <div className="animate-[rise_.9s_var(--ease-out-expo)]">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]} />
            <p className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-emerald to-silver/0" aria-hidden />
              <span className="font-display font-expanded text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-silver">Frequently asked questions</span>
            </p>
            <h1 className="mt-6 text-display-xl font-bold text-white">
              Questions, answered <em>clearly</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              What we are most often asked about working with GULF NEXT, our service lines and the sectors we support, gathered in one place.
            </p>
            <div className="mt-9 max-w-xl">
              <SearchBox large query={query} setQuery={setQuery} onSubmit={() => goTo('answers', -110)} />
            </div>
            <dl className="mt-9 grid max-w-xl grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-4 backdrop-blur-md">
              {[
                [FAQ_CATALOG.length, 'Answers'],
                [FAQ_CATEGORIES.length, 'Topics'],
                [SERVICES.length, 'Services'],
                [INDUSTRIES.length, 'Sectors'],
              ].map(([v, l]) => (
                <div key={l} className="px-4 text-center">
                  <dt className="label-tech text-steel-500">{l}</dt>
                  <dd className="mt-1 font-display text-2xl font-black text-white">{String(v).padStart(2, '0')}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-[rise_1.2s_var(--ease-out-expo)]">
            <p className="mb-2 text-center label-tech text-steel-500 lg:mb-0">Most asked · pick a card</p>
            <QuestionCarousel items={FEATURED_FAQ} onPick={pick} />
          </div>
        </Container>
      </section>

      {/* Topics, lifted over the hero edge */}
      <AnimatedSection className="relative flow-root bg-deep pb-24 md:pb-28">
        <Container className="relative z-10 -mt-28 md:-mt-36">
          <TopicTiles onPick={(key) => goTo(`topic-${key}`, -110)} />
        </Container>
      </AnimatedSection>

      {/* Answers */}
      <AnimatedSection id="answers" className="relative scroll-mt-24 overflow-x-clip bg-deep pb-28 md:pb-36">
        <Texture variant="grid" />
        <div aria-hidden className="absolute -right-48 top-1/4 size-[34rem] rounded-full bg-electric/10 blur-3xl" />
        <div aria-hidden className="absolute -left-48 top-2/3 size-[30rem] rounded-full bg-emerald/10 blur-3xl" />
        <Container className="relative">
          <FaqBrowser query={query} setQuery={setQuery} open={open} toggle={toggle} setAll={(ids) => setOpen(new Set(ids))} />
        </Container>
      </AnimatedSection>

      <section className="relative bg-deep pb-24 md:pb-32">
        <StillHaveQuestion />
      </section>
    </>
  )
}
