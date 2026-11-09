import {
  Ban,
  Cookie,
  FilePenLine,
  Gavel,
  Info,
  Lock,
  Scale,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react'
import { COMPANY } from '@/data/company'

/**
 * Privacy Policy and Terms of Service content.
 * ----------------------------------------------------------------------------
 * Both documents render through `components/legal/LegalDocument.tsx`. Copy is
 * plain strings with two inline marks, parsed at render time:
 *   [label](/path)   internal link (or https://… / mailto: for external)
 *   **text**         bold
 *
 * What the Privacy Policy says about data must stay true to the code: the
 * site sets no cookies and runs no analytics, the enquiry forms post to
 * VITE_CONTACT_ENDPOINT, fonts load from Google Fonts and the site is hosted
 * on Vercel. Update the policy (and `updated`) before adding any tracking.
 *
 * Have both documents reviewed by a qualified UAE lawyer before relying on
 * them; they are a sound professional baseline, not legal advice.
 */

export type LegalBlock =
  | string
  | { list: string[] }
  | { subheading: string }
  | { note: string }
  | { defs: { term: string; text: string }[] }

export interface LegalSection {
  id: string
  title: string
  /** Plain-language summary shown above the section ("In short"). */
  summary?: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  path: '/privacy-policy' | '/terms-of-service'
  /** Short name used in navigation and the document switcher. */
  name: string
  /** Heading words before the emphasised word. */
  heading: string
  /** Emphasised last word of the heading (serif italic). */
  headingEm: string
  icon: LucideIcon
  intro: string
  /** ISO dates. */
  effective: string
  updated: string
  version: string
  glance: { icon: LucideIcon; title: string; text: string }[]
  sections: LegalSection[]
}

const { contact, legalName } = COMPANY

/** How to reach us, built only from verified contact details. */
const CONTACT_BLOCKS: LegalBlock[] = [
  ...(contact.email
    ? [`Email: [${contact.email}](mailto:${contact.email})`]
    : ['The quickest way to reach us is through our [contact page](/contact). Please choose “General enquiry” and mention the policy your question relates to.']),
  ...(contact.phone ? [`Telephone: ${contact.phone}`] : []),
  ...(contact.address ? [`Post: ${legalName}, ${contact.address.join(', ')}`] : []),
]

/* ============================================================================
 * Privacy Policy
 * ========================================================================== */

export const PRIVACY_POLICY: LegalDoc = {
  path: '/privacy-policy',
  name: 'Privacy Policy',
  heading: 'Privacy',
  headingEm: 'Policy',
  icon: ShieldCheck,
  intro:
    'How GULF NEXT collects, uses and protects personal information when you visit our website or send us an enquiry. Written to be read, not skimmed past.',
  effective: '2026-11-09',
  updated: '2026-11-09',
  version: '1.0',
  glance: [
    { icon: Ban, title: 'We never sell your data', text: 'Your details are used to answer your enquiry and run our business, and nothing else.' },
    { icon: Cookie, title: 'No tracking cookies', text: 'This website sets no advertising or analytics cookies and does not profile visitors.' },
    { icon: Lock, title: 'Protected in transit and at rest', text: 'Encrypted connections, restricted access and trusted providers.' },
    { icon: UserRoundCheck, title: 'You stay in control', text: 'Ask to see, correct or delete your information at any time.' },
  ],
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are',
      summary: 'GULF NEXT runs this website and is responsible for the personal information you share through it.',
      blocks: [
        `This Privacy Policy explains how **${legalName}** (“GULF NEXT”, “we”, “us” or “our”) handles personal information collected through www.gulfnext.ae (the “website”) and through the enquiries and correspondence that follow from it.`,
        'For the purposes of applicable data protection law, including the United Arab Emirates Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (the “PDPL”), GULF NEXT is the controller of that information. Where the EU or UK General Data Protection Regulation applies to you, we handle your information in line with it as well.',
        'This policy does not cover information we process under a signed contract with a client, such as site, personnel or project data. That information is governed by the confidentiality and data terms of the contract concerned.',
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information we collect',
      summary: 'Mainly what you type into our enquiry forms, plus the basic technical data every website receives.',
      blocks: [
        { subheading: 'Information you give us' },
        'When you send an enquiry, request a proposal or write to us, we collect the details you choose to share:',
        {
          defs: [
            { term: 'Identity and contact', text: 'Your name, company or organisation, email address and telephone number.' },
            { term: 'Enquiry details', text: 'The enquiry type, your industry, the services you are interested in and the project information in your message.' },
            { term: 'Correspondence', text: 'Emails, calls and documents exchanged with our team as we respond to you.' },
            { term: 'Business relationship', text: 'Records of proposals, meetings and contracts if we go on to work together.' },
          ],
        },
        { subheading: 'Information collected automatically' },
        'Like any website, our hosting provider receives technical information when your browser requests a page. This can include your IP address, browser and device type, operating system, the pages requested, the referring address and the date and time of the request. It is used to deliver the website, keep it secure and diagnose faults, and is not used to identify you personally.',
        { subheading: 'Information from other sources' },
        'We may receive business contact details from clients, partners and referrers, or from publicly available sources such as company websites and professional networks, where this is relevant to an existing or prospective business relationship.',
        { note: 'Please do not include sensitive personal information (such as health, religious or biometric data) in an enquiry. We do not need it to respond.' },
      ],
    },
    {
      id: 'how-we-use-information',
      title: 'How we use your information',
      summary: 'To answer you, prepare proposals, look after the business relationship and keep the website running safely.',
      blocks: [
        'We use personal information only for clear, specific purposes:',
        {
          list: [
            'To respond to your enquiry and understand your scope, site and schedule.',
            'To prepare proposals, quotations and resourcing plans you have asked for.',
            'To enter into and manage contracts, including mobilisation, invoicing and record-keeping.',
            'To operate, secure and improve the website, and to detect and prevent misuse.',
            'To comply with our legal, regulatory, tax and HSE obligations.',
            'To establish, exercise or defend legal claims.',
          ],
        },
        'We do not use your information for automated decision-making or profiling that produces legal or similarly significant effects for you. We will only send you news or marketing if you have asked us to, and every such message will let you opt out.',
      ],
    },
    {
      id: 'legal-bases',
      title: 'Legal bases for processing',
      blocks: [
        'We rely on one or more of the following lawful bases, depending on the purpose:',
        {
          defs: [
            { term: 'Contract', text: 'Processing needed to take steps at your request before entering into a contract, or to perform one.' },
            { term: 'Legitimate interests', text: 'Responding to business enquiries, developing client relationships and securing our systems, balanced against your rights.' },
            { term: 'Legal obligation', text: 'Keeping records and disclosing information where the law requires it.' },
            { term: 'Consent', text: 'Where you have opted in, for example to receive updates. You can withdraw consent at any time.' },
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and similar technologies',
      summary: 'We do not use tracking cookies. Our fonts load from Google, which sees your IP address.',
      blocks: [
        'This website does not set advertising, analytics or social media cookies, and it does not use tracking pixels or fingerprinting. You will not see a cookie banner because there is nothing to consent to.',
        'To display our typefaces, your browser loads fonts from Google Fonts. When it does, Google receives your IP address and standard browser information. Google states that it does not use this data to profile visitors; you can read more in [Google’s Privacy Policy](https://policies.google.com/privacy).',
        'If we introduce analytics or other non-essential technologies in future, we will update this policy first and ask for your consent where the law requires it.',
      ],
    },
    {
      id: 'sharing',
      title: 'How we share information',
      summary: 'Only with people who help us serve you, and never for sale.',
      blocks: [
        '**We do not sell, rent or trade personal information.** We share it only where necessary, with:',
        {
          list: [
            '**Service providers** who host the website, deliver email and provide IT, document and communication services, under contracts that require them to protect your information and use it only on our instructions.',
            '**Project partners and subcontractors** where they are needed to assess or deliver the scope you have enquired about, and only with your knowledge.',
            '**Professional advisers** such as lawyers, auditors and insurers, under a duty of confidentiality.',
            '**Authorities and regulators** where we are legally required to, or to protect the rights, property or safety of GULF NEXT, our clients or others.',
            '**A successor business** if GULF NEXT is involved in a merger, acquisition or reorganisation, subject to this policy.',
          ],
        },
      ],
    },
    {
      id: 'international-transfers',
      title: 'International transfers',
      blocks: [
        'Some of our service providers, including our website host, operate infrastructure outside the United Arab Emirates. Where personal information is transferred abroad, we make sure it receives an adequate level of protection, for example by using providers in jurisdictions with adequate data protection laws or by relying on contractual safeguards recognised under the PDPL and, where relevant, the GDPR.',
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep information',
      summary: 'No longer than we need it, then it is deleted or anonymised.',
      blocks: [
        {
          defs: [
            { term: 'Enquiries', text: 'Up to 24 months after our last contact, if no business relationship follows.' },
            { term: 'Clients and contracts', text: 'For the life of the relationship and afterwards for the period required by UAE commercial and tax law.' },
            { term: 'Technical logs', text: 'For short periods set by our hosting provider, typically a few weeks, for security and diagnostics.' },
            { term: 'Marketing preferences', text: 'Until you unsubscribe, after which we keep only a record that you opted out.' },
          ],
        },
        'When information is no longer needed, we securely delete it or anonymise it so it can no longer be linked to you.',
      ],
    },
    {
      id: 'security',
      title: 'How we protect information',
      blocks: [
        'We apply technical and organisational measures proportionate to the risk, including encrypted HTTPS connections for every page and form, access restricted to staff who need it, reputable providers that meet recognised security standards, and regular review of our practices.',
        'No method of transmission over the internet is entirely secure, so we cannot guarantee absolute security. If we become aware of a breach that affects your information, we will notify you and the relevant authority where the law requires it.',
        { note: 'If your enquiry involves confidential drawings, specifications or site information, tell us first. We are glad to put a non-disclosure agreement in place before you share it.' },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      summary: 'You can ask what we hold, have it corrected or deleted, and object to how we use it.',
      blocks: [
        'Subject to the conditions and exceptions in applicable law, you have the right to:',
        {
          defs: [
            { term: 'Access', text: 'Ask for a copy of the personal information we hold about you.' },
            { term: 'Rectification', text: 'Have inaccurate or incomplete information corrected.' },
            { term: 'Erasure', text: 'Ask us to delete your information where there is no good reason to keep it.' },
            { term: 'Restriction and objection', text: 'Limit how we use your information, or object to processing based on legitimate interests or for marketing.' },
            { term: 'Portability', text: 'Receive information you gave us in a structured, machine-readable format.' },
            { term: 'Withdraw consent', text: 'Where we rely on consent, withdraw it at any time without affecting earlier processing.' },
          ],
        },
        'To exercise any of these rights, contact us using the details in the [Contact us](#contact-us) section. We may ask you to confirm your identity, and we aim to respond within 30 days. If you are not satisfied with our response, you may complain to the UAE Data Office or the data protection authority where you live.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      blocks: [
        'Our website and services are intended for businesses and professionals. They are not directed at anyone under 18, and we do not knowingly collect personal information from children. If you believe a child has sent us information, please contact us and we will delete it.',
      ],
    },
    {
      id: 'third-party-links',
      title: 'Links to other websites',
      blocks: [
        'Our website may link to websites operated by others, such as professional networks or industry bodies. We are not responsible for their content or privacy practices, and we encourage you to read their policies before sharing information with them.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      blocks: [
        'We may update this policy to reflect changes in our practices, our services or the law. The “Last updated” date at the top shows when it was last revised. If we make a material change, we will highlight it on this page and, where appropriate, notify you directly.',
      ],
    },
    {
      id: 'contact-us',
      title: 'Contact us',
      blocks: [
        'If you have a question about this policy or how we handle your information, or would like to exercise your rights, please get in touch.',
        ...CONTACT_BLOCKS,
      ],
    },
  ],
}

/* ============================================================================
 * Terms of Service
 * ========================================================================== */

export const TERMS_OF_SERVICE: LegalDoc = {
  path: '/terms-of-service',
  name: 'Terms of Service',
  heading: 'Terms of',
  headingEm: 'Service',
  icon: Scale,
  intro:
    'The terms that apply when you use the GULF NEXT website. They set out what you can expect from us, what we expect from you, and how enquiries become engagements.',
  effective: '2026-11-09',
  updated: '2026-11-09',
  version: '1.0',
  glance: [
    { icon: Info, title: 'Information, not advice', text: 'Website content is general. Engineering decisions need a formal, site-specific assessment.' },
    { icon: FilePenLine, title: 'Enquiries are not contracts', text: 'Work proceeds only under a separate written agreement signed by both parties.' },
    { icon: ShieldCheck, title: 'Our content is protected', text: 'Text, imagery, film and the GULF NEXT brand belong to us or our licensors.' },
    { icon: Gavel, title: 'UAE law applies', text: 'These terms are governed by the laws of the United Arab Emirates.' },
  ],
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of these terms',
      summary: 'By using this website, you agree to these terms. If you do not agree, please do not use it.',
      blocks: [
        `These Terms of Service (the “Terms”) govern your access to and use of www.gulfnext.ae (the “website”), operated by **${legalName}** (“GULF NEXT”, “we”, “us” or “our”).`,
        'By accessing or using the website, you confirm that you accept these Terms and agree to comply with them. If you use the website on behalf of a company or other organisation, you confirm that you have authority to accept these Terms on its behalf.',
        'Please also read our [Privacy Policy](/privacy-policy), which explains how we handle personal information and forms part of these Terms.',
      ],
    },
    {
      id: 'about-the-website',
      title: 'About this website',
      blocks: [
        'The website presents GULF NEXT, our service lines and the sectors we support, and lets prospective clients and partners send us enquiries. It is intended for business and professional users.',
        'Nothing on the website constitutes an offer to supply services, a binding quotation or a commitment to any price, programme or resource level.',
      ],
    },
    {
      id: 'using-the-website',
      title: 'Using the website',
      summary: 'Use it lawfully and do not interfere with it, copy it at scale or misuse its forms.',
      blocks: [
        'You may use the website for lawful purposes only. You agree not to:',
        {
          list: [
            'Use the website in any way that breaches applicable law or regulation, including UAE cybercrime laws.',
            'Attempt to gain unauthorised access to the website, its servers or any connected system or network.',
            'Introduce viruses, malware or other harmful material, or carry out any attack that disrupts the website.',
            'Use automated tools to scrape, harvest or copy content or data from the website in bulk.',
            'Submit false, misleading or unsolicited commercial information through our enquiry forms.',
            'Impersonate any person or organisation, or misrepresent your affiliation with them.',
            'Frame or mirror the website, or present its content as your own.',
          ],
        },
        'We may suspend or restrict access to the website for anyone who breaches these Terms.',
      ],
    },
    {
      id: 'information-on-the-website',
      title: 'Information on the website',
      summary: 'Our content is general information. It is not engineering, safety or commercial advice.',
      blocks: [
        'Content on the website, including descriptions of services, capabilities, processes, sectors and projects, is provided for general information only. It does not constitute engineering, technical, safety, legal or commercial advice, and it should not be relied on for any specific project or decision.',
        'Any engineering or operational decision requires a formal assessment by qualified personnel that takes into account the specific asset, site conditions, codes and standards. Imagery, film and illustrations on the website may be representative and do not necessarily depict our own projects, equipment or personnel.',
        'We work to keep the website accurate and current, but we do not guarantee that its content is complete, accurate or up to date at all times.',
      ],
    },
    {
      id: 'enquiries-and-proposals',
      title: 'Enquiries and proposals',
      summary: 'Sending an enquiry does not create a contract. Work proceeds only under a signed agreement.',
      blocks: [
        'Submitting an enquiry or a request for proposal through the website does not create a contract or any obligation on either party. We may decline any enquiry at our discretion.',
        'Any proposal, estimate or quotation we provide is subject to its own stated terms and validity period, and becomes binding only when incorporated into a written agreement signed by authorised representatives of both parties. Where such an agreement exists, its terms take precedence over these Terms in relation to the services concerned.',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual property',
      blocks: [
        'The website and its content, including text, graphics, photographs, video, 3D models, software, page design and the selection and arrangement of material, together with the GULF NEXT name, logo and other marks, are owned by or licensed to GULF NEXT and are protected by intellectual property laws in the United Arab Emirates and internationally.',
        'You may view the website and print or download extracts for your own reference or for internal evaluation of our services, provided you do not modify them and you keep any copyright and proprietary notices intact. Any other use, including reproduction, distribution, publication or commercial use, requires our prior written permission.',
        'Nothing in these Terms grants you any right to use the GULF NEXT name, logo or marks.',
      ],
    },
    {
      id: 'your-submissions',
      title: 'Information you send us',
      blocks: [
        'When you send us information through the website, you confirm that you are entitled to share it and that it is accurate to the best of your knowledge. You grant us permission to use it to assess and respond to your enquiry and to manage any resulting business relationship, in line with our [Privacy Policy](/privacy-policy).',
        { note: 'Please do not send confidential or proprietary technical information through the website forms. If your enquiry requires it, ask us to arrange a non-disclosure agreement first.' },
      ],
    },
    {
      id: 'third-party-links',
      title: 'Third-party websites',
      blocks: [
        'The website may contain links to websites and resources provided by third parties. These links are provided for convenience only. We have no control over their content or availability, do not endorse them, and accept no responsibility for any loss or damage that may arise from your use of them.',
      ],
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      blocks: [
        'The website is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we make no representations or warranties of any kind, express or implied, about the website or its content, including warranties of accuracy, fitness for a particular purpose or non-infringement.',
        'We do not guarantee that the website will be uninterrupted, timely, secure or free from errors, viruses or other harmful components. You are responsible for using appropriate security measures on your own devices.',
      ],
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of liability',
      summary: 'We are not liable for losses arising from use of the website, except where the law does not allow us to exclude it.',
      blocks: [
        'To the fullest extent permitted by law, GULF NEXT, its directors, employees and agents will not be liable for any loss or damage, whether in contract, tort (including negligence), breach of statutory duty or otherwise, arising from or in connection with your use of, or inability to use, the website or your reliance on any of its content. This includes, without limitation, loss of profit, revenue, business, contracts, goodwill or data, and any indirect or consequential loss.',
        'Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable law, including liability for fraud, or for death or personal injury caused by negligence.',
      ],
    },
    {
      id: 'indemnity',
      title: 'Indemnity',
      blocks: [
        'You agree to indemnify GULF NEXT against any claims, losses, liabilities, costs and expenses (including reasonable legal fees) arising from your breach of these Terms or your misuse of the website.',
      ],
    },
    {
      id: 'changes-to-the-website',
      title: 'Changes and availability',
      blocks: [
        'We may update, change, suspend or withdraw all or any part of the website at any time without notice, for example for maintenance or to reflect changes in our services. We will not be liable if the website is unavailable at any time or for any period.',
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing law and jurisdiction',
      blocks: [
        'These Terms, and any dispute or claim arising out of or in connection with them or the website (including non-contractual disputes or claims), are governed by the federal laws of the United Arab Emirates and, where applicable, the laws of the relevant Emirate.',
        'The competent courts of the United Arab Emirates have exclusive jurisdiction to settle any such dispute or claim, unless a signed agreement between you and GULF NEXT provides otherwise.',
      ],
    },
    {
      id: 'general',
      title: 'General',
      blocks: [
        {
          defs: [
            { term: 'Severability', text: 'If any provision is found invalid or unenforceable, the remaining provisions continue in full force.' },
            { term: 'No waiver', text: 'A failure or delay in enforcing any provision does not waive our right to enforce it later.' },
            { term: 'Assignment', text: 'We may transfer our rights and obligations under these Terms. You may not without our written consent.' },
            { term: 'Language', text: 'These Terms are written in English. If they are translated, the English version prevails.' },
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      blocks: [
        'We may revise these Terms from time to time. The “Last updated” date at the top of this page shows when they were last changed. The version in force when you use the website applies, so please check this page periodically. Continued use of the website after changes are published means you accept them.',
      ],
    },
    {
      id: 'contact-us',
      title: 'Contact us',
      blocks: ['If you have any questions about these Terms, please get in touch.', ...CONTACT_BLOCKS],
    },
  ],
}

export const LEGAL_DOCS = [PRIVACY_POLICY, TERMS_OF_SERVICE] as const
