export interface User {
  id: number
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  createdAt: string
  _count?: { posts: number }
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnail?: string
  views: number
  status: 'DRAFT' | 'PUBLISHED'
  categoryId?: number
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: number
  title: string
  slug: string
  description: string
  content?: string
  price?: string
  icon?: string
  image?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  name: string
  phone: string
  email?: string
  service?: string
  message?: string
  source?: string
  status: 'NEW' | 'CONTACTED' | 'DONE' | 'CANCELLED'
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Office {
  id: number
  name: string
  address: string
  phone?: string
  email?: string
  zalo?: string
  mapUrl?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Banner {
  id: number
  title?: string
  subtitle?: string
  image: string
  link?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Setting {
  key: string
  value: string
}

export interface Stats {
  overview: {
    totalPosts: number
    publishedPosts: number
    totalServices: number
    totalContacts: number
    newContacts: number
    contactsThisMonth: number
    contactGrowth: number
  }
  recentContacts: Array<{ id: number; name: string; phone: string; service?: string; status: string; createdAt: string }>
  topPosts: Array<{ id: number; title: string; slug: string; views: number; publishedAt?: string }>
  contactsByStatus: Record<string, number>
}

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  text: string
  avatar?: string
  rating: number
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: number
  name: string
  title: string
  bio?: string
  avatar?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status: 'DRAFT' | 'PUBLISHED'
  seoTitle?: string
  seoDescription?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}
