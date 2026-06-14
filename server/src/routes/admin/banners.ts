import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

const bannerSchema = z.object({
  title:    z.string().max(300).optional(),
  subtitle: z.string().max(500).optional(),
  image:    z.string().min(1, 'Ảnh banner không được trống'),
  link:     z.string().url().optional().or(z.literal('')),
  order:    z.number().int().default(0),
  isActive: z.boolean().default(true),
})

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    })
    res.json(banners)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = bannerSchema.parse(req.body)
    const banner = await prisma.banner.create({ data: { ...data, link: data.link || null } })
    res.status(201).json(banner)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.banner.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy banner' }); return }
    const data = bannerSchema.parse(req.body)
    const banner = await prisma.banner.update({ where: { id }, data: { ...data, link: data.link || null } })
    res.json(banner)
  } catch (err) { next(err) }
})

router.patch('/reorder', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = z.array(z.object({ id: z.number(), order: z.number() })).parse(req.body)
    await Promise.all(items.map((item) => prisma.banner.update({ where: { id: item.id }, data: { order: item.order } })))
    res.json({ message: 'Cập nhật thứ tự thành công' })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const exists = await prisma.banner.findFirst({ where: { id, deletedAt: null } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy banner' }); return }
    await prisma.banner.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: 'Đã chuyển vào thùng rác' })
  } catch (err) { next(err) }
})

export default router
