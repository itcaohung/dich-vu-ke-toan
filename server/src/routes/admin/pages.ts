import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import type { AuthRequest } from '../../middleware/auth'

const router = Router()

const schema = z.object({
  title:          z.string().min(1),
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm a-z, 0-9, dấu gạch ngang'),
  content:        z.string().default(''),
  excerpt:        z.string().optional().nullable(),
  thumbnail:      z.string().optional().nullable(),
  status:         z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  seoTitle:       z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  order:          z.number().int().default(0),
})

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const pages = await prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(pages)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.page.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
    })
    if (!page) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    res.json(page)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = schema.parse(req.body)
    const page = await prisma.page.create({ data })
    res.status(201).json(page)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.page.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    const data = schema.parse(req.body)
    const page = await prisma.page.update({ where: { id }, data })
    res.json(page)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.page.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy' }); return }
    await prisma.page.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) { next(err) }
})

export default router
