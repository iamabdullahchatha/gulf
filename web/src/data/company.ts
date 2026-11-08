/**
 * Company facts — VERIFIED DATA ONLY.
 * ----------------------------------------------------------------------------
 * Every field here is rendered on the public site (footer, contact page,
 * structured data). Leave a field `null` until it has been confirmed from the
 * company's registration documents. Components render nothing for `null`
 * fields — they never fall back to sample or placeholder values.
 *
 * Status (2026-11-08): no registration document has been supplied, so no
 * contact details are verified yet.
 */
export interface CompanyContact {
  email: string | null
  phone: string | null
  /** One line per address line. */
  address: string[] | null
  /** e.g. "Sun–Thu, 08:00–17:00 GST" */
  hours: string | null
}

export interface Company {
  legalName: string
  tradingName: string
  /** Commercial registration number, once verified. */
  registrationNumber: string | null
  contact: CompanyContact
}

export const COMPANY: Company = {
  legalName: 'GULF NEXT Oil and Gas',
  tradingName: 'GULF NEXT',
  registrationNumber: null,
  contact: {
    email: null,
    phone: null,
    address: null,
    hours: null,
  },
}

/** True when at least one public contact channel is verified. */
export function hasVerifiedContact(c: CompanyContact = COMPANY.contact): boolean {
  return Boolean(c.email ?? c.phone ?? c.address?.length)
}
