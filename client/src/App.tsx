import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import CompanyFormationPage from './pages/CompanyFormationPage'
import ThanhLapCongTyPage from './pages/ThanhLapCongTyPage'
import ThanhLapDongNaiPage from './pages/ThanhLapDongNaiPage'
import ThanhLapBinhDuongPage from './pages/ThanhLapBinhDuongPage'
import ThanhLapBaRiaVungTauPage from './pages/ThanhLapBaRiaVungTauPage'
import DynamicPage from './pages/DynamicPage'
import { fetchSettings, API_BASE } from './api'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
})

function SiteHead() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  useEffect(() => {
    if (!settings) return

    // Cập nhật title
    if (settings.site_name) {
      document.title = settings.site_name
    }

    // Cập nhật favicon
    if (settings.favicon) {
      const url = settings.favicon.startsWith('http')
        ? settings.favicon
        : `${API_BASE}${settings.favicon}`

      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = url
    }
  }, [settings])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <SiteHead />
        <Toaster position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/dich-vu" element={<ServicesPage />} />
            <Route path="/dich-vu/:slug" element={<ServiceDetailPage />} />
            <Route path="/tin-tuc" element={<BlogPage />} />
            <Route path="/tin-tuc/:slug" element={<BlogDetailPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/gioi-thieu" element={<AboutPage />} />
            <Route path="/thanh-lap-cong-ty" element={<ThanhLapCongTyPage />} />
            <Route path="/thanh-lap-cong-ty/dong-nai" element={<ThanhLapDongNaiPage />} />
            <Route path="/thanh-lap-cong-ty/binh-duong" element={<ThanhLapBinhDuongPage />} />
            <Route path="/thanh-lap-cong-ty/ba-ria-vung-tau" element={<ThanhLapBaRiaVungTauPage />} />
            <Route path="/trang/:slug" element={<DynamicPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
