import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

const officeSchema = z.object({
  name:     z.string().min(1).max(200),
  address:  z.string().min(1).max(500),
  phone:    z.string().max(50).optional(),
  email:    z.string().email().optional().or(z.literal('')),
  zalo:     z.string().max(100).optional(),
  mapUrl:   z.string().url().optional().or(z.literal('')),
  order:    z.number().int().default(0),
  isActive: z.boolean().default(true),
})

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const offices = await prisma.office.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(offices)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = officeSchema.parse(req.body)
    const office = await prisma.office.create({
      data: { ...data, email: data.email || null, mapUrl: data.mapUrl || null },
    })
    res.status(201).json(office)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.office.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy chi nhánh' }); return }
    const data = officeSchema.parse(req.body)
    const office = await prisma.office.update({
      where: { id },
      data: { ...data, email: data.email || null, mapUrl: data.mapUrl || null },
    })
    res.json(office)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.office.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy chi nhánh' }); return }
    await prisma.office.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) { next(err) }
})

export default router
