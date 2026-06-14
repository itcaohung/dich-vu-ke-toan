import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { AuthRequest, requireSuperAdmin } from '../../middleware/auth'

const router = Router()

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']).default('ADMIN'),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

// GET /api/admin/users  (Super Admin only)
router.get('/', requireSuperAdmin, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
    res.json(users)
  } catch (err) { next(err) }
})

// POST /api/admin/users  (Super Admin only)
router.post('/', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) { res.status(400).json({ message: 'Email đã được sử dụng' }); return }

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

// PUT /api/admin/users/:id  (Super Admin only)
router.put('/:id', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const data = updateUserSchema.parse(req.body)

    const updateData: Record<string, unknown> = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }
    delete updateData.password

    if (data.password) updateData.password = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
    res.json(user)
  } catch (err) { next(err) }
})

// DELETE /api/admin/users/:id  (Super Admin only)
router.delete('/:id', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    if (id === (req as AuthRequest).user!.id) {
      res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' })
      return
    }
    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Đã xóa tài khoản' })
  } catch (err) { next(err) }
})

export default router
