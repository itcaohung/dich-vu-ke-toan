import api from './client'
import type {
  Post, Category, Service, Contact, Office, Banner, Stats, PaginatedResponse,
  Testimonial, TeamMember, Page,
} from '../types'

// ── Stats ──────────────────────────────────────────────────
export const fetchStats = () => api.get<Stats>('/admin/stats').then((r) => r.data)

// ── Posts ──────────────────────────────────────────────────
export const fetchPosts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Post>>('/admin/posts', { params }).then((r) => r.data)

export const fetchPost = (id: number) =>
  api.get<Post>(`/admin/posts/${id}`).then((r) => r.data)

export const createPost = (data: Partial<Post>) =>
  api.post<Post>('/admin/posts', data).then((r) => r.data)

export const updatePost = (id: number, data: Partial<Post>) =>
  api.put<Post>(`/admin/posts/${id}`, data).then((r) => r.data)

export const deletePost = (id: number) =>
  api.delete(`/admin/posts/${id}`).then((r) => r.data)

export const bulkDeletePosts = (ids: number[]) =>
  api.delete<{ deleted: number }>('/admin/posts/bulk', { data: { ids } }).then((r) => r.data)

// ── Trash ──────────────────────────────────────────────────
export type TrashType = 'post' | 'page' | 'service' | 'team' | 'testimonial' | 'office' | 'banner'

export interface TrashItem {
  id: number
  label: string
  subtitle: string | null
  meta: string | null
  deletedAt: string
}

export interface TrashCountResult {
  total: number
  byType: Record<TrashType, number>
}

export const fetchTrashCount = () =>
  api.get<TrashCountResult>('/admin/trash/count').then((r) => r.data)

export const fetchTrashItems = (type: TrashType, params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<TrashItem>>(`/admin/trash/${type}`, { params }).then((r) => r.data)

export const restoreTrashItem = (type: TrashType, id: number) =>
  api.post<{ message: string }>(`/admin/trash/${type}/restore/${id}`).then((r) => r.data)

export const bulkRestoreTrashItems = (type: TrashType, ids: number[]) =>
  api.post<{ restored: number }>(`/admin/trash/${type}/restore/bulk`, { ids }).then((r) => r.data)

export const permanentDeleteTrashItem = (type: TrashType, id: number) =>
  api.delete<{ message: string }>(`/admin/trash/${type}/${id}`).then((r) => r.data)

export const bulkPermanentDeleteTrashItems = (type: TrashType, ids: number[]) =>
  api.delete<{ deleted: number }>(`/admin/trash/${type}/bulk`, { data: { ids } }).then((r) => r.data)

export const emptyTrashType = (type: TrashType) =>
  api.delete<{ deleted: number }>(`/admin/trash/${type}/empty`).then((r) => r.data)

// ── Categories ─────────────────────────────────────────────
export const fetchCategories = () =>
  api.get<Category[]>('/admin/categories').then((r) => r.data)

export const createCategory = (data: Partial<Category>) =>
  api.post<Category>('/admin/categories', data).then((r) => r.data)

export const updateCategory = (id: number, data: Partial<Category>) =>
  api.put<Category>(`/admin/categories/${id}`, data).then((r) => r.data)

export const deleteCategory = (id: number) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data)

// ── Services ───────────────────────────────────────────────
export const fetchServices = () =>
  api.get<Service[]>('/admin/services').then((r) => r.data)

export const fetchService = (id: number) =>
  api.get<Service>(`/admin/services/${id}`).then((r) => r.data)

export const createService = (data: Partial<Service>) =>
  api.post<Service>('/admin/services', data).then((r) => r.data)

export const updateService = (id: number, data: Partial<Service>) =>
  api.put<Service>(`/admin/services/${id}`, data).then((r) => r.data)

export const deleteService = (id: number) =>
  api.delete(`/admin/services/${id}`).then((r) => r.data)

// ── Contacts ───────────────────────────────────────────────
export const fetchContacts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Contact>>('/admin/contacts', { params }).then((r) => r.data)

export const updateContact = (id: number, data: Partial<Contact>) =>
  api.put<Contact>(`/admin/contacts/${id}`, data).then((r) => r.data)

export const deleteContact = (id: number) =>
  api.delete(`/admin/contacts/${id}`).then((r) => r.data)

// ── Offices ────────────────────────────────────────────────
export const fetchOffices = () =>
  api.get<Office[]>('/admin/offices').then((r) => r.data)

export const createOffice = (data: Partial<Office>) =>
  api.post<Office>('/admin/offices', data).then((r) => r.data)

export const updateOffice = (id: number, data: Partial<Office>) =>
  api.put<Office>(`/admin/offices/${id}`, data).then((r) => r.data)

export const deleteOffice = (id: number) =>
  api.delete(`/admin/offices/${id}`).then((r) => r.data)

// ── Banners ────────────────────────────────────────────────
export const fetchBanners = () =>
  api.get<Banner[]>('/admin/banners').then((r) => r.data)

export const createBanner = (data: Partial<Banner>) =>
  api.post<Banner>('/admin/banners', data).then((r) => r.data)

export const updateBanner = (id: number, data: Partial<Banner>) =>
  api.put<Banner>(`/admin/banners/${id}`, data).then((r) => r.data)

export const deleteBanner = (id: number) =>
  api.delete(`/admin/banners/${id}`).then((r) => r.data)

// ── Settings ───────────────────────────────────────────────
export const fetchAdminSettings = () =>
  api.get<Record<string, string>>('/admin/settings').then((r) => r.data)

export const saveSettings = (data: Record<string, string>) =>
  api.put('/admin/settings', data).then((r) => r.data)

// ── Testimonials ───────────────────────────────────────────
export const fetchTestimonials = () =>
  api.get<Testimonial[]>('/admin/testimonials').then((r) => r.data)

export const createTestimonial = (data: Partial<Testimonial>) =>
  api.post<Testimonial>('/admin/testimonials', data).then((r) => r.data)

export const updateTestimonial = (id: number, data: Partial<Testimonial>) =>
  api.put<Testimonial>(`/admin/testimonials/${id}`, data).then((r) => r.data)

export const deleteTestimonial = (id: number) =>
  api.delete(`/admin/testimonials/${id}`).then((r) => r.data)

// ── Team ───────────────────────────────────────────────────
export const fetchTeamMembers = () =>
  api.get<TeamMember[]>('/admin/team').then((r) => r.data)

export const createTeamMember = (data: Partial<TeamMember>) =>
  api.post<TeamMember>('/admin/team', data).then((r) => r.data)

export const updateTeamMember = (id: number, data: Partial<TeamMember>) =>
  api.put<TeamMember>(`/admin/team/${id}`, data).then((r) => r.data)

export const deleteTeamMember = (id: number) =>
  api.delete(`/admin/team/${id}`).then((r) => r.data)

// ── Pages ──────────────────────────────────────────────────
export const fetchPages = () =>
  api.get<Page[]>('/admin/pages').then((r) => r.data)

export const fetchPage = (id: number) =>
  api.get<Page>(`/admin/pages/${id}`).then((r) => r.data)

export const createPage = (data: Partial<Page>) =>
  api.post<Page>('/admin/pages', data).then((r) => r.data)

export const updatePage = (id: number, data: Partial<Page>) =>
  api.put<Page>(`/admin/pages/${id}`, data).then((r) => r.data)

export const deletePage = (id: number) =>
  api.delete(`/admin/pages/${id}`).then((r) => r.data)

// ── Import ─────────────────────────────────────────────────
export interface ImportPostItem {
  title: string
  slug?: string
  excerpt?: string
  content: string
  publishedAt?: string
  thumbnailUrl?: string
}

export interface ImportWordPressPayload {
  posts: ImportPostItem[]
  categoryId: number | null
  status: 'PUBLISHED' | 'DRAFT'
}

export interface ImportWordPressResult {
  imported: number
  skipped: number
  errors: string[]
}

export const importWordPress = (data: ImportWordPressPayload) =>
  api.post<ImportWordPressResult>('/admin/import/wordpress', data).then((r) => r.data)

// ── Upload ─────────────────────────────────────────────────
export const uploadImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<{ url: string }>('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.url)
}

// ── Media ──────────────────────────────────────────────────
export interface MediaFile {
  url: string
  filename: string
  folder: string
  size: number
  createdAt: string
}

export interface MediaResult {
  folders: string[]
  files: MediaFile[]
  total: number
}

export const fetchMedia = (params?: { folder?: string; search?: string }) =>
  api.get<MediaResult>('/admin/upload', { params }).then((r) => r.data)

export const deleteMedia = (filePath: string) =>
  api.delete('/admin/upload', { params: { path: filePath } }).then((r) => r.data)

export const uploadImages = (files: File[], onProgress?: (pct: number) => void) => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  return api.post<{ url: string; filename: string; size: number }[]>('/admin/upload/multiple', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  }).then((r) => r.data)
}
