import { useId, useState, type ComponentType } from 'react'
import { INDUSTRIES as INDUSTRY_LIST } from '@/data/industries'
import { ArrowRight, Building2, CheckCircle2, Loader2, Mail, MessageSquareText, Phone, User } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Values {
  name: string
  company: string
  email: string
  phone: string
  industry: string
  message: string
}

const EMPTY: Values = { name: '', company: '', email: '', phone: '', industry: '', message: '' }
const INDUSTRIES = [...INDUSTRY_LIST.map((i) => i.title), 'Other']
const MIN_MESSAGE = 20

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Homepage project-enquiry form (light card).
 *
 * Floating labels with field icons, industry chips instead of a dropdown,
 * inline validation and an animated success state. Posts JSON to
 * VITE_CONTACT_ENDPOINT; without one it stays in clearly-labelled demo mode
 * and does not send anything.
 */
export function EnquiryForm() {
  const [v, setV] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<keyof Values, string>> = {}
    if (!v.name.trim()) next.name = 'Please share your name.'
    if (!v.email.trim()) next.email = 'An email address is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) next.email = 'This email looks incomplete.'
    if (v.message.trim().length < MIN_MESSAGE) next.message = `Please add a little more detail (at least ${MIN_MESSAGE} characters).`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setError(null)
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
        if (!res.ok) throw new Error(`The server responded with ${res.status}.`)
      } else {
        await new Promise((r) => setTimeout(r, 900))
      }
      setStatus('success')
      setV(EMPTY)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
        <span className="relative inline-flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald/25" />
          <span className="relative inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-electric text-white shadow-[0_20px_40px_-16px_rgb(0_185_154/0.8)]">
            <CheckCircle2 className="size-9" aria-hidden />
          </span>
        </span>
        <h3 className="mt-8 font-display text-2xl font-bold text-midnight">Enquiry received</h3>
        <p className="mt-3 max-w-sm text-steel-700">
          {endpoint ? 'Thank you. Our engineering team has your details and will be in touch.' : 'Demo mode: nothing was sent. Connect a form endpoint to receive enquiries.'}
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-8 text-sm font-semibold text-royal underline-offset-4 hover:underline">
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FloatField icon={User} label="Your name" required value={v.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <FloatField icon={Building2} label="Company" value={v.company} onChange={set('company')} autoComplete="organization" />
        <FloatField icon={Mail} label="Email" type="email" required value={v.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        <FloatField icon={Phone} label="Phone" type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" />
      </div>

      <fieldset>
        <legend className="mb-2.5 label-tech text-steel-500">Industry</legend>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => {
            const on = v.industry === ind
            return (
              <button
                key={ind}
                type="button"
                aria-pressed={on}
                onClick={() => setV((s) => ({ ...s, industry: on ? '' : ind }))}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-300',
                  on
                    ? 'border-transparent bg-gradient-to-r from-electric to-royal text-white shadow-[0_8px_20px_-10px_rgb(8_126_219/0.9)]'
                    : 'border-royal/15 bg-white text-steel-700 hover:-translate-y-0.5 hover:border-electric/50 hover:text-midnight',
                )}
              >
                {ind}
              </button>
            )
          })}
        </div>
      </fieldset>

      <FloatField
        icon={MessageSquareText}
        label="Tell us about your project"
        required
        multiline
        value={v.message}
        onChange={set('message')}
        error={errors.message}
        hint={`${v.message.trim().length}/${MIN_MESSAGE}+`}
        hintOk={v.message.trim().length >= MIN_MESSAGE}
      />

      {error && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="sheen group mt-1 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(110deg,#087edb_0%,#073b75_60%,#06172f_100%)] px-6 font-semibold uppercase tracking-[0.08em] text-white shadow-[0_20px_40px_-18px_rgb(8_126_219/0.8)] transition hover:-translate-y-0.5 disabled:opacity-70"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
          </>
        ) : (
          <>
            Send enquiry
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-1 group-hover:bg-emerald">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </>
        )}
      </button>
      <p className="flex items-center justify-center gap-2 text-xs text-steel-500">
        Fields marked * are required.
        {!endpoint && <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">Demo mode</span>}
      </p>
    </form>
  )
}

interface FieldProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  required?: boolean
  type?: string
  error?: string
  autoComplete?: string
  multiline?: boolean
  hint?: string
  hintOk?: boolean
}

/** Input with a floating label, leading icon and inline error. */
function FloatField({ icon: Icon, label, value, onChange, required, type = 'text', error, autoComplete, multiline, hint, hintOk }: FieldProps) {
  const id = useId()
  const box = cn(
    'peer block w-full rounded-2xl border bg-paper/70 pl-12 pr-4 text-[0.95rem] text-midnight placeholder-transparent outline-none transition',
    'focus:border-electric focus:bg-white focus:ring-4 focus:ring-electric/10',
    error ? 'border-red-400 bg-red-50/40' : 'border-royal/10 hover:border-royal/25',
    multiline ? 'min-h-32 resize-y pb-3 pt-7' : 'h-14 pt-5',
  )
  return (
    <div>
      <div className="relative">
        <Icon className={cn('pointer-events-none absolute left-4 size-[1.1rem] text-steel-400 transition peer-focus:text-electric', multiline ? 'top-5' : 'top-1/2 -translate-y-1/2')} aria-hidden />
        {multiline ? (
          <textarea id={id} value={value} onChange={onChange} placeholder={label} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={box} />
        ) : (
          <input id={id} type={type} value={value} onChange={onChange} placeholder={label} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={box} />
        )}
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-12 text-steel-500 transition-all duration-200',
            'top-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em]',
            multiline
              ? 'peer-placeholder-shown:top-4 peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal'
              : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal',
            'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[0.7rem] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-electric',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-teal-600">*</span>}
        </label>
        {hint && <span className={cn('absolute bottom-3 right-4 font-mono text-[0.7rem]', hintOk ? 'text-teal-600' : 'text-steel-400')}>{hint}</span>}
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 pl-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
