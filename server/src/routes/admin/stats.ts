import { Router, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// GET /api/admin/stats — dashboard overview
router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalPosts,
      publishedPosts,
      totalServices,
      totalContacts,
      newContacts,
      contactsThisMonth,
      contactsLastMonth,
      recentContacts,
      topPosts,
      contactsByStatus,
    ] = await Promise.all([
      prisma.post.count({ where: { deletedAt: null } }),
      prisma.post.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'NEW' } }),
      prisma.contact.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.contact.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, phone: true, service: true, status: true, createdAt: true },
      }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, views: true, publishedAt: true },
      }),
      prisma.contact.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    const contactGrowth =
      contactsLastMonth > 0
        ? Math.round(((contactsThisMonth - contactsLastMonth) / contactsLastMonth) * 100)
        : 100

    res.json({
      overview: {
        totalPosts,
        publishedPosts,
        totalServices,
        totalContacts,
        newContacts,
        contactsThisMonth,
        contactGrowth,
      },
      recentContacts,
      topPosts,
      contactsByStatus: Object.fromEntries(
        contactsByStatus.map((g) => [g.status, g._count.status]),
      ),
    })
  } catch (err) {
    next(err)
  }
})

export default router
