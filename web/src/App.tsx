import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout/Layout'

/**
 * Routes are lazy-loaded so each page lands in its own cached chunk. The
 * route-level Suspense sits inside `Layout` so the header and footer stay
 * mounted during navigation.
 */
const HomePage = lazy(() => import('@/pages/HomePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/services/ServiceDetailPage'))
const IndustriesPage = lazy(() => import('@/pages/IndustriesPage'))
const IndustryDetailPage = lazy(() => import('@/pages/industries/IndustryDetailPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services">
            <Route index element={<ServicesPage />} />
            <Route path=":slug" element={<ServiceDetailPage />} />
          </Route>
          <Route path="industries">
            <Route index element={<IndustriesPage />} />
            <Route path=":slug" element={<IndustryDetailPage />} />
          </Route>
          <Route path="contact" element={<ContactPage />} />
          <Route path="faqs" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
