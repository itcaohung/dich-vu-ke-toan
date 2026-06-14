import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import type { AuthRequest } from '../../middleware/auth'

const router = Router()

const schema = z.object({
  name:     z.string().min(1),
  role:     z.string().min(1),
  company:  z.string().min(1),
  text:     z.string().min(1),
  avatar:   z.string().optional().nullable(),
  rating:   z.number().int().min(1).max(5).default(5),
  order:    z.number().int().default(0),
  isActive: z.boolean().default(true),
})

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(items)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = schema.parse(req.body)
    const item = await prisma.testimonial.create({ data })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.testimonial.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    const data = schema.parse(req.body)
    const item = await prisma.testimonial.update({ where: { id }, data })
    res.json(item)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.testimonial.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) { next(err) }
})

export default router
