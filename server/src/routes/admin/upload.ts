import { Router, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { upload, getFileUrl } from '../../middleware/upload'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// POST /api/admin/upload  — single image
router.post('/', upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'Không có file được upload' })
    return
  }
  const url = getFileUrl(req, req.file.path)
  res.json({ url, filename: req.file.filename, size: req.file.size })
})

// POST /api/admin/upload/multiple  — up to 10 images
router.post('/multiple', upload.array('files', 10), (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files?.length) {
    res.status(400).json({ message: 'Không có file được upload' })
    return
  }
  const result = files.map((f) => ({ url: getFileUrl(req, f.path), filename: f.filename, size: f.size }))
  res.json(result)
})

// DELETE /api/admin/upload  — xóa file theo path tương đối
router.delete('/', (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filePath = String(req.query.path ?? '')
    if (!filePath) { res.status(400).json({ message: 'Thiếu đường dẫn file' }); return }

    // Chỉ cho phép xóa file trong thư mục uploads
    const uploadsDir = path.resolve(__dirname, '../../../uploads')
    const fullPath = path.resolve(uploadsDir, filePath.replace(/^\/?(uploads\/)?/, ''))

    if (!fullPath.startsWith(uploadsDir)) {
      res.status(400).json({ message: 'Đường dẫn không hợp lệ' })
      return
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      res.json({ message: 'Đã xóa file' })
    } else {
      res.status(404).json({ message: 'File không tồn tại' })
    }
  } catch (err) {
    next(err)
  }
})

export default router
