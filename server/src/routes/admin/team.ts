import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import type { AuthRequest } from '../../middleware/auth'

const router = Router()

const schema = z.object({
  name:     z.string().min(1),
  title:    z.string().min(1),
  bio:      z.string().optional().nullable(),
  avatar:   z.string().optional().nullable(),
  order:    z.number().int().default(0),
  isActive: z.boolean().default(true),
})

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(items)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = schema.parse(req.body)
    const item = await prisma.teamMember.create({ data })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.teamMember.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    const data = schema.parse(req.body)
    const item = await prisma.teamMember.update({ where: { id }, data })
    res.json(item)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.teamMember.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    await prisma.teamMember.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) { next(err) }
})

export default router
