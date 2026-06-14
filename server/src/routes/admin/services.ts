import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import { uniqueSlug } from '../../lib/slugify'

const router = Router()

const serviceSchema = z.object({
  title: z.string().min(1, 'Tên dịch vụ không được trống').max(300),
  slug: z.string().optional(),
  description: z.string().min(1, 'Mô tả không được trống'),
  content: z.string().optional(),
  price: z.string().max(100).optional(),
  icon: z.string().max(100).optional(),
  image: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

// GET /api/admin/services
router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(services)
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/services/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
    })
    if (!service) { res.status(404).json({ message: 'Không tìm thấy dịch vụ' }); return }
    res.json(service)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/services
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = serviceSchema.parse(req.body)
    const slug = await uniqueSlug(
      data.slug ?? data.title,
      async (s) => !!(await prisma.service.findUnique({ where: { slug: s } })),
    )
    const service = await prisma.service.create({ data: { ...data, slug } })
    res.status(201).json(service)
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/services/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.service.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy dịch vụ' }); return }

    const data = serviceSchema.parse(req.body)
    let slug = data.slug ?? exists.slug
    if (slug !== exists.slug) {
      slug = await uniqueSlug(
        slug,
        async (s) => !!(await prisma.service.findFirst({ where: { slug: s, id: { not: id } } })),
      )
    }

    const service = await prisma.service.update({ where: { id }, data: { ...data, slug } })
    res.json(service)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/services/reorder  — cập nhật thứ tự hàng loạt
router.patch('/reorder', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = z.array(z.object({ id: z.number(), order: z.number() })).parse(req.body)
    await Promise.all(items.map((item) => prisma.service.update({ where: { id: item.id }, data: { order: item.order } })))
    res.json({ message: 'Cập nhật thứ tự thành công' })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/services/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.service.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy dịch vụ' }); return }
    await prisma.service.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) {
    next(err)
  }
})

export default router
