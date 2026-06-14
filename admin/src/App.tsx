import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PostsPage from './pages/posts/PostsPage'
import PostFormPage from './pages/posts/PostFormPage'
import ImportWordPressPage from './pages/posts/ImportWordPressPage'
import TrashPage from './pages/trash/TrashPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import ServicesPage from './pages/services/ServicesPage'
import ServiceFormPage from './pages/services/ServiceFormPage'
import ContactsPage from './pages/contacts/ContactsPage'
import OfficesPage from './pages/offices/OfficesPage'
import BannersPage from './pages/banners/BannersPage'
import SettingsPage from './pages/settings/SettingsPage'
import MenuPage from './pages/menu/MenuPage'
import TestimonialsPage from './pages/testimonials/TestimonialsPage'
import TeamPage from './pages/team/TeamPage'
import PagesListPage from './pages/pages/PagesListPage'
import PageFormPage from './pages/pages/PageFormPage'
import MediaPage from './pages/media/MediaPage'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/new" element={<PostFormPage />} />
        <Route path="posts/import" element={<ImportWordPressPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="posts/:id" element={<PostFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/new" element={<ServiceFormPage />} />
        <Route path="services/:id" element={<ServiceFormPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="offices" element={<OfficesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="pages" element={<PagesListPage />} />
        <Route path="pages/new" element={<PageFormPage />} />
        <Route path="pages/:id" element={<PageFormPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="media" element={<MediaPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
