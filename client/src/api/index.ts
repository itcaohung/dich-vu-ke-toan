import axios from 'axios'
import type { Post, Service, Category, Office, Banner, SiteSettings, PaginatedResponse, Testimonial, TeamMember, Page } from '../types'

const VITE_API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4001/api'
export const API_BASE = VITE_API_URL.replace(/\/api$/, '')

const api = axios.create({
  baseURL: VITE_API_URL,
})

export const fetchSettings = () =>
  api.get<SiteSettings>('/settings').then((r) => r.data)

export const fetchBanners = () =>
  api.get<Banner[]>('/banners').then((r) => r.data)

export const fetchServices = () =>
  api.get<Service[]>('/services').then((r) => r.data)

export const fetchService = (slug: string) =>
  api.get<Service>(`/services/${slug}`).then((r) => r.data)

export const fetchCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data)

export const fetchPosts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Post>>('/posts', { params }).then((r) => r.data)

export const fetchPost = (slug: string) =>
  api.get<Post & { related: Post[] }>(`/posts/${slug}`).then((r) => r.data)

export const fetchOffices = () =>
  api.get<Office[]>('/offices').then((r) => r.data)

export const fetchTestimonials = () =>
  api.get<Testimonial[]>('/testimonials').then((r) => r.data)

export const fetchTeamMembers = () =>
  api.get<TeamMember[]>('/team').then((r) => r.data)

export const fetchPage = (slug: string) =>
  api.get<Page>(`/pages/${slug}`).then((r) => r.data)

export const submitContact = (data: {
  name: string; phone: string; email?: string; service?: string; message?: string
}) => api.post('/contacts', data).then((r) => r.data)
