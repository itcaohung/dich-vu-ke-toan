import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// GET /api/admin/settings — trả về tất cả settings dạng object key:value
router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany()
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    res.json(map)
  } catch (err) { next(err) }
})

// PUT /api/admin/settings — upsert nhiều key cùng lúc
router.put('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = z.record(z.string()).parse(req.body)

    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    )

    res.json({ message: 'Lưu cài đặt thành công' })
  } catch (err) { next(err) }
})

export default router
