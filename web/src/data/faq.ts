/**
 * Frequently asked questions. Rendered by FAQAccordion on the About page and
 * emitted as schema.org FAQPage JSON-LD for SEO.
 */
export interface FaqItem {
  q: string
  a: string
  topic?: string
}

export const COMPANY_FAQ: FaqItem[] = [
  {
    q: 'Where does GULF NEXT operate?',
    a: 'We work across the Gulf region, with teams mobilised to onshore fields, offshore platforms, refineries and gas plants wherever operators and EPC contractors need capable hands.',
  },
  {
    q: 'Can you take on a project end to end, or only parts of a scope?',
    a: 'Both. Each service can be delivered on its own, or combined into a single integrated scope with one point of accountability for engineering, construction and operations support.',
  },
  {
    q: 'How do you approach safety on live-plant work?',
    a: 'Safety planning starts before mobilisation. Every job is risk-assessed with the operator, permit-to-work is treated as sacred, and every team member carries stop-work authority. We measure outcomes, not just leading indicators.',
  },
  {
    q: 'What is the first step if we want to explore working together?',
    a: 'Send us the scope through the contact form. A member of our engineering team will come back to you with a practical view on feasibility, approach and mobilisation.',
  },
]

/** About page FAQ: the company questions plus a few more, grouped by topic. */
export const ABOUT_FAQ: FaqItem[] = [
  { ...COMPANY_FAQ[0]!, topic: 'Company' },
  {
    topic: 'Company',
    q: 'Which industries do you serve?',
    a: 'Oil and gas, petrochemical and processing, industrial construction and infrastructure, and mechanical engineering and equipment. Each industry page explains the services most relevant to that sector.',
  },
  { ...COMPANY_FAQ[1]!, topic: 'Projects' },
  {
    topic: 'Projects',
    q: 'Do you work for operators or for EPC contractors?',
    a: 'Both. We can work directly for asset owners and operators, or as part of a wider project team led by an EPC contractor.',
  },
  { ...COMPANY_FAQ[3]!, topic: 'Projects' },
  { ...COMPANY_FAQ[2]!, topic: 'Safety & quality' },
  {
    topic: 'Safety & quality',
    q: 'What quality records do you provide at handover?',
    a: 'We hand over the inspection records, test results and documentation specified for each scope, with punch lists closed out before we demobilise.',
  },
]

/**
 * Contact page FAQ. Answers restate what the site already says about how
 * enquiries are handled; no response times or commitments are invented.
 */
export const CONTACT_FAQ: FaqItem[] = [
  {
    topic: 'Your enquiry',
    q: 'What should I include in my enquiry?',
    a: 'The asset and its location, the scope of work, the window you are working to and any constraints we should know about. If you have drawings or specifications, mention them in your message.',
  },
  {
    topic: 'Your enquiry',
    q: 'Do I need a fully defined scope before getting in touch?',
    a: 'No. An early conversation can help shape the scope. Share what you know and our engineers will help you work out the rest.',
  },
  {
    topic: 'Your enquiry',
    q: 'How do I share drawings or specifications?',
    a: 'Note in your message what documents you have. Our team will reply and agree the best way for you to send them.',
  },
  { ...COMPANY_FAQ[3]!, topic: 'Your enquiry', q: 'What happens after I send the form?', a: 'A member of our engineering team reviews your scope and comes back to you with a practical view on feasibility, approach and mobilisation.' },
  {
    topic: 'Working with us',
    q: 'Can I enquire about a single service?',
    a: 'Yes. Each service can be delivered on its own, or combined with others into one integrated scope with a single point of accountability.',
  },
  {
    topic: 'Working with us',
    q: 'Can you plan around a shutdown or turnaround window?',
    a: 'Yes. Resources, permits and mobilisation are sequenced around your operating window, and planning starts before anyone arrives on site.',
  },
  {
    topic: 'Working with us',
    q: 'Do you work for operators or for EPC contractors?',
    a: 'Both. We can work directly for asset owners and operators, or as part of a wider project team led by an EPC contractor.',
  },
  { ...COMPANY_FAQ[0]!, topic: 'Working with us' },
]
