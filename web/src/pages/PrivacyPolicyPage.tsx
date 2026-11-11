import { LegalDocument } from '@/components/legal/LegalDocument'
import { PRIVACY_POLICY } from '@/data/legal'

export default function PrivacyPolicyPage() {
  return <LegalDocument doc={PRIVACY_POLICY} />
}
