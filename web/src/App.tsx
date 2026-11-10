import { lazy, type ComponentType } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout/Layout'

/**
 * Routes are lazy-loaded so each page lands in its own cached chunk. The
 * route-level Suspense sits inside `Layout` so the header and footer stay
 * mounted during navigation.
 *
 * The build-time pre-renderer (entry-server.tsx) passes the same pages
 * imported eagerly, so every route renders to complete HTML. In the browser
 * the lazy chunk still loads on demand; React keeps the pre-rendered markup on
 * screen and hydrates that boundary once the chunk arrives.
 */
export interface Pages {
  HomePage: ComponentType
  AboutPage: ComponentType
  ServicesPage: ComponentType
  ServiceDetailPage: ComponentType
  IndustriesPage: ComponentType
  IndustryDetailPage: ComponentType
  ContactPage: ComponentType
  FaqPage: ComponentType
  PrivacyPolicyPage: ComponentType
  TermsOfServicePage: ComponentType
  NotFoundPage: ComponentType
}

const LAZY_PAGES: Pages = {
  HomePage: lazy(() => import('@/pages/HomePage')),
  AboutPage: lazy(() => import('@/pages/AboutPage')),
  ServicesPage: lazy(() => import('@/pages/ServicesPage')),
  ServiceDetailPage: lazy(() => import('@/pages/services/ServiceDetailPage')),
  IndustriesPage: lazy(() => import('@/pages/IndustriesPage')),
  IndustryDetailPage: lazy(() => import('@/pages/industries/IndustryDetailPage')),
  ContactPage: lazy(() => import('@/pages/ContactPage')),
  FaqPage: lazy(() => import('@/pages/FaqPage')),
  PrivacyPolicyPage: lazy(() => import('@/pages/PrivacyPolicyPage')),
  TermsOfServicePage: lazy(() => import('@/pages/TermsOfServicePage')),
  NotFoundPage: lazy(() => import('@/pages/NotFoundPage')),
}

/** The route tree, shared by the browser (BrowserRouter) and the pre-renderer (StaticRouter). */
export function AppRoutes({ pages = LAZY_PAGES }: { pages?: Pages }) {
  const P = pages
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<P.HomePage />} />
        <Route path="about" element={<P.AboutPage />} />
        <Route path="services">
          <Route index element={<P.ServicesPage />} />
          <Route path=":slug" element={<P.ServiceDetailPage />} />
        </Route>
        <Route path="industries">
          <Route index element={<P.IndustriesPage />} />
          <Route path=":slug" element={<P.IndustryDetailPage />} />
        </Route>
        <Route path="contact" element={<P.ContactPage />} />
        <Route path="faqs" element={<P.FaqPage />} />
        <Route path="privacy-policy" element={<P.PrivacyPolicyPage />} />
        <Route path="terms-of-service" element={<P.TermsOfServicePage />} />
        <Route path="*" element={<P.NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
