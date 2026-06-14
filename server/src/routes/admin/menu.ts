import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import type { AuthRequest } from '../../middleware/auth'

const router = Router()

const menuItemSchema = z.object({
  label: z.string().min(1, 'Vui lòng nhập tên menu'),
  url: z.string().min(1, 'Vui lòng nhập URL'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  openNew: z.boolean().default(false),
  parentId: z.number().nullable().optional(),
})

// GET /api/admin/menu — lấy toàn bộ menu (dạng phẳng, kèm children)
router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: { orderBy: { order: 'asc' } },
          },
        },
      },
    })
    res.json(items)
  } catch (err) { next(err) }
})

// POST /api/admin/menu
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = menuItemSchema.parse(req.body)
    const item = await prisma.menuItem.create({ data: { ...data, parentId: data.parentId ?? null } })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

// PUT /api/admin/menu/reorder — phải đứng trước /:id để không bị match nhầm
router.put('/reorder', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items: { id: number; order: number; parentId?: number | null }[] = req.body
    await prisma.$transaction(
      items.map(({ id, order, parentId }) =>
        prisma.menuItem.update({
          where: { id },
          data: { order, parentId: parentId ?? null },
        })
      )
    )
    res.json({ message: 'Đã cập nhật thứ tự' })
  } catch (err) { next(err) }
})

// PUT /api/admin/menu/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const data = menuItemSchema.parse(req.body)
    const item = await prisma.menuItem.update({
      where: { id },
      data: { ...data, parentId: data.parentId ?? null },
    })
    res.json(item)
  } catch (err) { next(err) }
})

// DELETE /api/admin/menu/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.menuItem.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Đã xóa' })
  } catch (err) { next(err) }
})

export default router
