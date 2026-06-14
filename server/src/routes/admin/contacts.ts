import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// GET /api/admin/contacts?status=NEW&page=1
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1))
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)))
    const skip = (page - 1) * limit
    const status = req.query.status as string | undefined
    const search = String(req.query.search ?? '').trim()

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ]

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    res.json({ data: contacts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/contacts/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: Number(req.params.id) } })
    if (!contact) { res.status(404).json({ message: 'Không tìm thấy liên hệ' }); return }
    res.json(contact)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/contacts/:id — cập nhật status & note
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const data = z.object({
      status: z.enum(['NEW', 'CONTACTED', 'DONE', 'CANCELLED']).optional(),
      note: z.string().max(1000).optional(),
    }).parse(req.body)

    const contact = await prisma.contact.update({ where: { id }, data })
    res.json(contact)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/contacts/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    await prisma.contact.delete({ where: { id } })
    res.json({ message: 'Đã xóa liên hệ' })
  } catch (err) {
    next(err)
  }
})

export default router
