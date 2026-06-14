import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Không có token xác thực' })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as {
      id: number
      email: string
      role: string
    }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Chỉ Super Admin mới có quyền thực hiện' })
    return
  }
  next()
}
