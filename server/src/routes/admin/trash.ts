import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// ── Types ─────────────────────────────────────────────────────────────────────

const TRASH_TYPES = ['post', 'page', 'service', 'team', 'testimonial', 'office', 'banner'] as const
type TrashType = typeof TRASH_TYPES[number]

function isValidType(t: string): t is TrashType {
  return (TRASH_TYPES as readonly string[]).includes(t)
}

// Maps each type to its Prisma delegate — all share the same interface for our ops
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(type: TrashType): any {
  const map: Record<TrashType, unknown> = {
    post:        prisma.post,
    page:        prisma.page,
    service:     prisma.service,
    team:        prisma.teamMember,
    testimonial: prisma.testimonial,
    office:      prisma.office,
    banner:      prisma.banner,
  }
  return map[type]
}

// Normalize each model's row into { id, label, subtitle } for the unified list
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(type: TrashType, row: any) {
  switch (type) {
    case 'post':        return { id: row.id, label: row.title, subtitle: row.slug, meta: row.status, deletedAt: row.deletedAt }
    case 'page':        return { id: row.id, label: row.title, subtitle: row.slug, meta: row.status, deletedAt: row.deletedAt }
    case 'service':     return { id: row.id, label: row.title, subtitle: row.slug, meta: null, deletedAt: row.deletedAt }
    case 'team':        return { id: row.id, label: row.name,  subtitle: row.title, meta: null, deletedAt: row.deletedAt }
    case 'testimonial': return { id: row.id, label: row.name,  subtitle: row.company, meta: `${row.rating}★`, deletedAt: row.deletedAt }
    case 'office':      return { id: row.id, label: row.name,  subtitle: row.address, meta: null, deletedAt: row.deletedAt }
    case 'banner':      return { id: row.id, label: row.title ?? `Banner #${row.id}`, subtitle: row.image, meta: null, deletedAt: row.deletedAt }
  }
}

const DELETED_FILTER = { deletedAt: { not: null as null } }

// ── GET /api/admin/trash/count ────────────────────────────────────────────────

router.get('/count', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [post, page, service, team, testimonial, office, banner] = await Promise.all([
      prisma.post.count({ where: DELETED_FILTER }),
      prisma.page.count({ where: DELETED_FILTER }),
      prisma.service.count({ where: DELETED_FILTER }),
      prisma.teamMember.count({ where: DELETED_FILTER }),
      prisma.testimonial.count({ where: DELETED_FILTER }),
      prisma.office.count({ where: DELETED_FILTER }),
      prisma.banner.count({ where: DELETED_FILTER }),
    ])

    const byType = { post, page, service, team, testimonial, office, banner }
    const total = Object.values(byType).reduce((a, b) => a + b, 0)
    res.json({ total, byType })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/admin/trash/:type ────────────────────────────────────────────────

router.get('/:type', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }

    const page   = Math.max(1, Number(req.query.page ?? 1))
    const limit  = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)))
    const skip   = (page - 1) * limit
    const search = String(req.query.search ?? '').trim()

    const searchField = ['post', 'page', 'service'].includes(type) ? 'title' : 'name'
    const where = {
      ...DELETED_FILTER,
      ...(search ? { [searchField]: { contains: search, mode: 'insensitive' } } : {}),
    }

    const [rows, total] = await Promise.all([
      delegate(type).findMany({ where, orderBy: { deletedAt: 'desc' }, skip, take: limit }),
      delegate(type).count({ where }),
    ])

    res.json({
      data: rows.map((r: unknown) => normalize(type, r)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/admin/trash/:type/restore/bulk ──────────────────────────────────

router.post('/:type/restore/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }
    const { ids } = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200) }).parse(req.body)
    const { count } = await delegate(type).updateMany({
      where: { id: { in: ids }, ...DELETED_FILTER },
      data: { deletedAt: null },
    })
    res.json({ restored: count })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/admin/trash/:type/restore/:id ───────────────────────────────────

router.post('/:type/restore/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }
    const id = Number(req.params.id)
    const exists = await delegate(type).findFirst({ where: { id, ...DELETED_FILTER } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy trong thùng rác' }); return }
    await delegate(type).update({ where: { id }, data: { deletedAt: null } })
    res.json({ message: 'Đã khôi phục' })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/admin/trash/:type/bulk ───────────────────────────────────────

router.delete('/:type/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }
    const { ids } = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200) }).parse(req.body)
    const { count } = await delegate(type).deleteMany({
      where: { id: { in: ids }, ...DELETED_FILTER },
    })
    res.json({ deleted: count })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/admin/trash/:type/empty ──────────────────────────────────────

router.delete('/:type/empty', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }
    const { count } = await delegate(type).deleteMany({ where: DELETED_FILTER })
    res.json({ deleted: count })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/admin/trash/:type/:id ────────────────────────────────────────

router.delete('/:type/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type
    if (!isValidType(type)) { res.status(400).json({ message: 'Loại không hợp lệ' }); return }
    const id = Number(req.params.id)
    const exists = await delegate(type).findFirst({ where: { id, ...DELETED_FILTER } })
    if (!exists) { res.status(404).json({ message: 'Không tìm thấy trong thùng rác' }); return }
    await delegate(type).delete({ where: { id } })
    res.json({ message: 'Đã xóa vĩnh viễn' })
  } catch (err) {
    next(err)
  }
})

export default router
