import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' })
      return
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

      const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
      if (!user) {
        res.status(404).json({ message: 'Không tìm thấy người dùng' })
        return
      }

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' })
        return
      }

      const hashed = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

      res.json({ message: 'Đổi mật khẩu thành công' })
    } catch (err) {
      next(err)
    }
  },
)

export default router
