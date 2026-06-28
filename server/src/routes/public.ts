import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

// ── Posts ─────────────────────────────────────────────────

// GET /api/posts?page=1&limit=10&category=&search=
router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1))
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)))
    const skip = (page - 1) * limit
    const search = String(req.query.search ?? '').trim()
    const categorySlug = String(req.query.category ?? '').trim()

    const where: Record<string, unknown> = { status: 'PUBLISHED', deletedAt: null }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
    if (categorySlug) where.category = { slug: categorySlug }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          thumbnail: true, views: true, publishedAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    res.json({ data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

// GET /api/posts/:slug
router.get('/posts/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED', deletedAt: null },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    if (!post) { res.status(404).json({ message: 'Bài viết không tồn tại' }); return }

    // Tăng lượt xem
    await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })

    // Bài viết liên quan cùng danh mục
    const related = await prisma.post.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, categoryId: post.categoryId, id: { not: post.id } },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, thumbnail: true, publishedAt: true },
    })

    res.json({ ...post, related })
  } catch (err) {
    next(err)
  }
})

// ── Services ──────────────────────────────────────────────

// GET /api/services
router.get('/services', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(services)
  } catch (err) {
    next(err)
  }
})

// GET /api/services/:slug
router.get('/services/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.findFirst({
      where: { slug: req.params.slug, isActive: true, deletedAt: null },
    })
    if (!service) { res.status(404).json({ message: 'Dịch vụ không tồn tại' }); return }
    res.json(service)
  } catch (err) {
    next(err)
  }
})

// ── Categories ────────────────────────────────────────────

// GET /api/categories
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
    })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

// ── Offices ───────────────────────────────────────────────

// GET /api/offices
router.get('/offices', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const offices = await prisma.office.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(offices)
  } catch (err) {
    next(err)
  }
})

// ── Banners ───────────────────────────────────────────────

// GET /api/banners
router.get('/banners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(banners)
  } catch (err) {
    next(err)
  }
})

// ── Settings ──────────────────────────────────────────────

// GET /api/settings (public keys only)
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const PUBLIC_KEYS = [
      'site_name', 'site_description', 'hotline', 'email',
      'facebook', 'youtube', 'zalo', 'address', 'logo', 'favicon',
      'home_show_quick_services', 'home_show_stats', 'home_show_services',
      'home_show_why_us', 'home_show_team', 'home_show_blog',
      'home_show_testimonials', 'home_show_contact',
    ]
    const settings = await prisma.setting.findMany({ where: { key: { in: PUBLIC_KEYS } } })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    res.json(map)
  } catch (err) {
    next(err)
  }
})

// ── Contacts (Submit form) ────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên').max(100),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ').max(15),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  service: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
})

// POST /api/contacts
router.post('/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = contactSchema.parse(req.body)
    const contact = await prisma.contact.create({
      data: {
        ...data,
        email: data.email || null,
        source: req.headers.referer ?? null,
      },
    })
    res.status(201).json({ message: 'Cảm ơn! Chúng tôi sẽ liên hệ bạn sớm nhất.', id: contact.id })
  } catch (err) {
    next(err)
  }
})

// ── Menu (public) ─────────────────────────────────────────

// GET /api/menu
router.get('/menu', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// ── Testimonials (public) ─────────────────────────────────
router.get('/testimonials', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.testimonial.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(items)
  } catch (err) { next(err) }
})

// ── Team (public) ─────────────────────────────────────────
router.get('/team', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.teamMember.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(items)
  } catch (err) { next(err) }
})

// ── Pages (public) ────────────────────────────────────────
router.get('/pages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await prisma.page.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, slug: true, excerpt: true, thumbnail: true },
    })
    res.json(pages)
  } catch (err) { next(err) }
})

router.get('/pages/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED', deletedAt: null },
    })
    if (!page) { res.status(404).json({ message: 'Trang không tồn tại' }); return }
    res.json(page)
  } catch (err) { next(err) }
})

// ── Visitor counter ───────────────────────────────────────

// GET /api/visits — lấy số liệu lượt truy cập
router.get('/visits', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, todayCount, todayDate] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'visitor_total' } }),
      prisma.setting.findUnique({ where: { key: 'visitor_today' } }),
      prisma.setting.findUnique({ where: { key: 'visitor_today_date' } }),
    ])
    const today = new Date().toISOString().slice(0, 10)
    const isToday = todayDate?.value === today
    res.json({
      total: Number(total?.value ?? 0),
      today: isToday ? Number(todayCount?.value ?? 0) : 0,
    })
  } catch (err) { next(err) }
})

// POST /api/visits — ghi nhận 1 lượt truy cập
router.post('/visits', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().slice(0, 10)

    // Ensure records exist, then increment atomically
    await prisma.setting.upsert({
      where: { key: 'visitor_total' },
      update: {},
      create: { key: 'visitor_total', value: '0', updatedAt: new Date() },
    })
    await prisma.$executeRaw`
      UPDATE "Setting" SET value = (CAST(value AS INTEGER) + 1)::TEXT, "updatedAt" = NOW()
      WHERE key = 'visitor_total'
    `

    const todayDate = await prisma.setting.findUnique({ where: { key: 'visitor_today_date' } })
    if (todayDate?.value === today) {
      await prisma.$executeRaw`
        UPDATE "Setting" SET value = (CAST(value AS INTEGER) + 1)::TEXT, "updatedAt" = NOW()
        WHERE key = 'visitor_today'
      `
    } else {
      await prisma.setting.upsert({
        where: { key: 'visitor_today_date' },
        update: { value: today, updatedAt: new Date() },
        create: { key: 'visitor_today_date', value: today, updatedAt: new Date() },
      })
      await prisma.setting.upsert({
        where: { key: 'visitor_today' },
        update: { value: '1', updatedAt: new Date() },
        create: { key: 'visitor_today', value: '1', updatedAt: new Date() },
      })
    }

    const [newTotal, newToday] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'visitor_total' } }),
      prisma.setting.findUnique({ where: { key: 'visitor_today' } }),
    ])
    res.json({ total: Number(newTotal?.value ?? 1), today: Number(newToday?.value ?? 1) })
  } catch (err) { next(err) }
})

void (async () => {
  // Khởi tạo counter nếu chưa có
  await prisma.setting.upsert({
    where: { key: 'visitor_total' },
    update: {},
    create: { key: 'visitor_total', value: '0', updatedAt: new Date() },
  }).catch(() => {})
})()

export default router
