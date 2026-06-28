export interface Category {
  id: number
  name: string
  slug: string
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
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  publishedAt?: string
  createdAt: string
  related?: Pick<Post, 'id' | 'title' | 'slug' | 'thumbnail' | 'publishedAt'>[]
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
}

export interface Banner {
  id: number
  title?: string
  subtitle?: string
  image: string
  link?: string
  order: number
  isActive: boolean
}

export interface SiteSettings {
  site_name?: string
  site_description?: string
  hotline?: string
  email?: string
  facebook?: string
  youtube?: string
  zalo?: string
  address?: string
  logo?: string
  favicon?: string
  home_show_quick_services?: string
  home_show_stats?: string
  home_show_services?: string
  home_show_why_us?: string
  home_show_team?: string
  home_show_blog?: string
  home_show_testimonials?: string
  home_show_contact?: string
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
}

export interface TeamMember {
  id: number
  name: string
  title: string
  bio?: string
  avatar?: string
  order: number
  isActive: boolean
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
