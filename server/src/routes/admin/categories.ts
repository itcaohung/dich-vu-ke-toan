import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import { uniqueSlug } from '../../lib/slugify'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được trống').max(200),
  slug: z.string().optional(),
})

// GET /api/admin/categories
router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/categories
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body)
    const slug = await uniqueSlug(
      data.slug ?? data.name,
      async (s) => !!(await prisma.category.findUnique({ where: { slug: s } })),
    )
    const category = await prisma.category.create({ data: { name: data.name, slug } })
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/categories/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.category.findUnique({ where: { id } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy danh mục' }); return }

    const data = categorySchema.parse(req.body)
    let slug = data.slug ?? exists.slug
    if (slug !== exists.slug) {
      slug = await uniqueSlug(
        slug,
        async (s) => !!(await prisma.category.findFirst({ where: { slug: s, id: { not: id } } })),
      )
    }
    const category = await prisma.category.update({ where: { id }, data: { name: data.name, slug } })
    res.json(category)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy danh mục' }); return }
    if (exists._count.posts > 0) {
      res.status(400).json({ message: `Không thể xóa: danh mục đang có ${exists._count.posts} bài viết` })
      return
    }
    await prisma.category.delete({ where: { id } })
    res.json({ message: 'Xóa danh mục thành công' })
  } catch (err) {
    next(err)
  }
})

export default router
