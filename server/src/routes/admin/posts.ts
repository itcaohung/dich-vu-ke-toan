import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import { uniqueSlug } from '../../lib/slugify'

const router = Router()

const postSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được trống').max(500),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Nội dung không được trống'),
  thumbnail: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categoryId: z.number().int().positive().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
})

// GET /api/admin/posts
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1))
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 15)))
    const skip = (page - 1) * limit
    const search = String(req.query.search ?? '').trim()
    const status = req.query.status as string | undefined
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined

    const where: Record<string, unknown> = { deletedAt: null }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
    if (status) where.status = status
    if (categoryId) where.categoryId = categoryId

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, title: true, slug: true, status: true, views: true,
          thumbnail: true, publishedAt: true, createdAt: true, updatedAt: true,
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    res.json({ data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/posts/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
      include: { category: true },
    })
    if (!post) { res.status(404).json({ message: 'Không tìm thấy bài viết' }); return }
    res.json(post)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/posts
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = postSchema.parse(req.body)

    const slug = await uniqueSlug(
      data.slug ?? data.title,
      async (s) => !!(await prisma.post.findUnique({ where: { slug: s } })),
    )

    const post = await prisma.post.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === 'PUBLISHED' ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
      },
    })
    res.status(201).json(post)
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/posts/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.post.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy bài viết' }); return }

    const data = postSchema.parse(req.body)

    let slug = data.slug ?? exists.slug
    if (slug !== exists.slug) {
      slug = await uniqueSlug(
        slug,
        async (s) => !!(await prisma.post.findFirst({ where: { slug: s, id: { not: id } } })),
      )
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        slug,
        publishedAt: data.status === 'PUBLISHED' ? exists.publishedAt ?? new Date() : null,
      },
    })
    res.json(post)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/posts/bulk  →  soft delete
router.delete('/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200) }).parse(req.body)
    const { count } = await prisma.post.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    res.json({ deleted: count })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/posts/:id  →  soft delete
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.post.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy bài viết' }); return }
    await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) {
    next(err)
  }
})

export default router
