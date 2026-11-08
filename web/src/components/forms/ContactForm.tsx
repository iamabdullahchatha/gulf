import { useState } from 'react'
import { INDUSTRIES as INDUSTRY_LIST } from '@/data/industries'
import { SERVICES } from '@/data/services'
import { Check, CheckCircle2, Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/Button'

interface FormState {
  name: string
  company: string
  email: string
  phone: string
  industry: string
  message: string
}

const EMPTY: FormState = { name: '', company: '', email: '', phone: '', industry: '', message: '' }

const INDUSTRIES = [...INDUSTRY_LIST.map((i) => i.title), 'Other']

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Accessible contact form. Captures leads to a configurable endpoint set via
 * VITE_CONTACT_ENDPOINT. Without an endpoint, the form stays in demo mode and
 * logs the payload instead of posting — useful for the first deploy.
 */
interface ContactFormProps {
  tone?: 'dark' | 'light'
  rows?: number
  /** Optional enquiry types shown as a chip selector above the fields. */
  topics?: string[]
  /** Controlled enquiry type (lets the page preselect it). */
  topic?: string
  onTopicChange?: (topic: string) => void
  /** Shows "services of interest" toggle chips. */
  withServices?: boolean
}

export function ContactForm({ tone = 'dark', rows = 6, topics, topic: topicProp, onTopicChange, withServices = false }: ContactFormProps = {}) {
  const [values, setValues] = useState<FormState>(EMPTY)
  const [topicState, setTopicState] = useState(topics?.[0] ?? '')
  const topic = topicProp ?? topicState
  const setTopic = (t: string) => {
    setTopicState(t)
    onTopicChange?.(t)
  }
  const [services, setServices] = useState<string[]>([])
  const toggleService = (t: string) => setServices((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

  const set = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!values.name.trim()) next.name = 'Please share your name.'
    if (!values.email.trim()) next.email = 'An email address is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) next.email = 'This email looks incomplete.'
    if (!values.message.trim() || values.message.trim().length < 20)
      next.message = 'Tell us a bit about the project (at least 20 characters).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setError(null)
    const payload = { ...values, ...(topics ? { topic } : {}), ...(withServices ? { services } : {}) }
    try {
      if (!endpoint) {
        // Demo mode — no backend configured.
        console.info('[ContactForm] Demo mode (no VITE_CONTACT_ENDPOINT):', payload)
        await new Promise((r) => setTimeout(r, 800))
      } else {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      }
      setStatus('success')
      setValues(EMPTY)
      setServices([])
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('rounded-3xl p-10 text-center', tone === 'light' ? 'bg-paper ring-1 ring-royal/10' : 'glass')}>
        <CheckCircle2 className="mx-auto size-12 text-teal-400" aria-hidden />
        <h3 className={cn('mt-5 font-display text-2xl font-bold', tone === 'light' ? 'text-midnight' : 'text-white')}>Message received</h3>
        <p className={cn('mt-3', tone === 'light' ? 'text-steel-700' : 'text-steel-300')}>
          Thank you. Our team has your details and will be in touch.
        </p>
        <Button className="mt-6" variant="ghost" onClick={() => setStatus('idle')}>
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { void onSubmit(e) }} noValidate data-tone={tone} className="group/form grid gap-5">
      {topics && (
        <fieldset>
          <legend className="mb-2.5 block label-tech text-steel-400 group-data-[tone=light]/form:text-steel-500">Enquiry type</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Enquiry type">
            {topics.map((t) => {
              const on = t === topic
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTopic(t)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
                    on
                      ? 'bg-gradient-to-r from-emerald to-teal-500 text-midnight shadow-[0_10px_24px_-12px_rgb(0_185_154/0.9)]'
                      : 'border border-silver/15 text-steel-300 hover:border-emerald/50 hover:text-white',
                  )}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="name" label="Your name" required error={errors.name}>
          <input id="name" name="name" autoComplete="name" value={values.name} onChange={set('name')} className={inputClass(!!errors.name)} />
        </Field>
        <Field id="company" label="Company">
          <input id="company" name="company" autoComplete="organization" value={values.company} onChange={set('company')} className={inputClass(false)} />
        </Field>
        <Field id="email" label="Email" required error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} className={inputClass(!!errors.email)} />
        </Field>
        <Field id="phone" label="Phone">
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} className={inputClass(false)} />
        </Field>
      </div>
      <Field id="industry" label="Industry">
        <select id="industry" name="industry" value={values.industry} onChange={set('industry')} className={cn(inputClass(false), 'appearance-none pr-10')}>
          <option value="">Select an industry…</option>
          {INDUSTRIES.map((it) => (
            <option key={it} value={it}>{it}</option>
          ))}
        </select>
      </Field>
      {withServices && (
        <fieldset>
          <legend className="mb-2.5 block label-tech text-steel-400 group-data-[tone=light]/form:text-steel-500">
            Services of interest <span className="normal-case tracking-normal text-steel-500">(optional, choose any)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const on = services.includes(s.title)
              return (
                <button
                  key={s.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleService(s.title)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition duration-300',
                    on ? 'bg-electric/25 text-white ring-1 ring-electric/70' : 'bg-white/[0.04] text-steel-300 ring-1 ring-silver/15 hover:text-white hover:ring-silver/35',
                  )}
                >
                  {on && <Check className="size-3 text-emerald" aria-hidden />}
                  {s.title}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
      <Field id="message" label="Tell us about your project" required error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={rows}
          value={values.message}
          onChange={set('message')}
          placeholder="Asset and location, scope of work, the window you are working to, and any drawings or specifications you can share."
          className={cn(inputClass(!!errors.message), 'min-h-36 resize-y py-3')}
        />
        <p className="mt-1.5 text-right font-mono text-[0.7rem] text-steel-500" aria-live="polite">
          {values.message.trim().length < 20 ? `${Math.max(0, 20 - values.message.trim().length)} more characters needed` : `${values.message.trim().length} characters`}
        </p>
      </Field>

      {error && (
        <p role="alert" className="rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 group-data-[tone=light]/form:text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-6 pt-2">
        <p className="text-xs text-steel-400 group-data-[tone=light]/form:text-steel-500">
          Fields marked * are required.
          {!endpoint && <span className="ml-1 rounded-sm bg-amber-500/20 px-1.5 py-0.5 font-semibold text-amber-200">Demo</span>}
        </p>
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden /> Send message
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block label-tech text-steel-400 group-data-[tone=light]/form:text-steel-500">
        {label}
        {required && <span aria-hidden className="ml-1 text-teal-400">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-300 group-data-[tone=light]/form:text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

function inputClass(invalid: boolean): string {
  return cn(
    'block w-full rounded-xl border bg-midnight/50 px-4 py-3 text-sm text-white placeholder:text-steel-500 shadow-[inset_0_1px_2px_rgb(0_0_0/0.3)]',
    'transition focus:border-teal-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400/30',
    invalid ? 'border-red-400/60' : 'border-silver/15 hover:border-silver/30',
    // Light tone (white card): white fields, navy text, blue focus ring.
    'group-data-[tone=light]/form:bg-white group-data-[tone=light]/form:text-midnight group-data-[tone=light]/form:shadow-[inset_0_1px_2px_rgb(9_38_75/0.06)]',
    'group-data-[tone=light]/form:focus:bg-white group-data-[tone=light]/form:focus:border-electric group-data-[tone=light]/form:focus:ring-electric/20',
    !invalid && 'group-data-[tone=light]/form:border-royal/15 group-data-[tone=light]/form:hover:border-royal/30',
  )
}
