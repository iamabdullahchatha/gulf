import { LegalDocument } from '@/components/legal/LegalDocument'
import { TERMS_OF_SERVICE } from '@/data/legal'

export default function TermsOfServicePage() {
  return <LegalDocument doc={TERMS_OF_SERVICE} />
}
