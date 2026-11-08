import { HardHat, Layers, MapPinned } from 'lucide-react'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { Texture } from '@/components/Texture'
import { Tilt3D } from '@/components/animations/Tilt3D'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { Picture } from '@/components/Picture'

const STEPS = [
  { t: 'Share your scope', d: 'Asset, location, scope and the window you are working to.' },
  { t: 'Technical review', d: 'Our engineers assess feasibility, risks and the right disciplines.' },
  { t: 'Practical proposal', d: 'An approach, resourcing plan and mobilisation outline.' },
]

const TRUST = [
  { icon: Layers, t: 'Integrated delivery' },
  { icon: HardHat, t: 'Safety-first culture' },
  { icon: MapPinned, t: 'Regional know-how' },
]

/**
 * 07 — Start a conversation. A brand-blue band over a plant photograph:
 * headline, a three-step "what happens next" and trust points on the left;
 * a white enquiry card with the working form on the right.
 */
export function ContactCTA() {
  return (
    <section id="contact" className="relative isolate overflow-hidden" aria-label="Start a conversation">
      <Picture small="/assets/images/sections/contact-sm.jpg" src="/assets/images/sections/contact.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgb(6_23_47/0.97)_0%,rgb(7_59_117/0.92)_45%,rgb(8_126_219/0.72)_100%)]" />
      <Texture variant="grid" className="opacity-50" />

      <Container className="relative grid items-center gap-14 py-24 md:py-32 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionHeading reveal={false} index="07" eyebrow="Start a conversation" title={<>Let&rsquo;s discuss your next <em>project</em>.</>} lead="Share the scope, location and window you are working to. Our engineering team will come back with a practical plan." />

          <ol className="mt-12 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <Tilt3D max={14} lift={20} className="h-full rounded-2xl">
                  <div className="flex h-full gap-4 rounded-2xl glass p-5 sm:block">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-electric font-mono text-xs text-white shadow-[0_10px_24px_-10px_rgb(0_185_154/0.8)] [transform:translateZ(30px)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white [transform:translateZ(20px)] sm:mt-4">{s.t}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/75">{s.d}</p>
                    </div>
                  </div>
                </Tilt3D>
              </li>
            ))}
          </ol>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-8">
            {TRUST.map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                <Icon className="size-4 text-teal-300" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <span aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(0_185_154/0.35),transparent)] blur-2xl" />
          <div className="rounded-[2rem] bg-[linear-gradient(140deg,rgb(255_255_255/0.75),rgb(0_185_154/0.7)_45%,rgb(8_126_219/0.8))] p-px shadow-[0_50px_100px_-30px_rgb(3_13_29/0.75)]">
          <div className="relative rounded-[calc(2rem-1px)] bg-white p-6 md:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="label-tech text-teal-500">Project enquiry</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-midnight md:text-3xl">Tell us about your scope.</h3>
            </div>
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-royal text-white shadow-[0_12px_24px_-10px_rgb(8_126_219/0.8)] sm:inline-flex">
              <Layers className="size-5" aria-hidden />
            </span>
          </div>
          <EnquiryForm />
          </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
