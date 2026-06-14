import { Router, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { upload, getFileUrl } from '../../middleware/upload'
import { AuthRequest } from '../../middleware/auth'

const router = Router()
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads')

// GET /api/admin/upload — liệt kê tất cả file trong uploads
router.get('/', (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const folder = String(req.query.folder ?? '')
    const search = String(req.query.search ?? '').toLowerCase()

    if (!fs.existsSync(UPLOADS_DIR)) {
      res.json({ folders: [], files: [] })
      return
    }

    // Lấy danh sách thư mục con (YYYY-MM)
    const folders = fs.readdirSync(UPLOADS_DIR)
      .filter((f) => fs.statSync(path.join(UPLOADS_DIR, f)).isDirectory())
      .sort((a, b) => b.localeCompare(a)) // mới nhất trước

    // Liệt kê file trong folder được chọn (hoặc tất cả)
    const targetFolders = folder ? [folder] : folders
    const files: { url: string; filename: string; folder: string; size: number; createdAt: string }[] = []

    for (const f of targetFolders) {
      const dir = path.join(UPLOADS_DIR, f)
      if (!fs.existsSync(dir)) continue
      const names = fs.readdirSync(dir).filter((n) => !n.startsWith('.'))
      for (const name of names) {
        if (search && !name.toLowerCase().includes(search)) continue
        const stat = fs.statSync(path.join(dir, name))
        if (stat.isFile()) {
          files.push({
            url: `/uploads/${f}/${name}`,
            filename: name,
            folder: f,
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
          })
        }
      }
    }

    // Sắp xếp mới nhất trước
    files.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    res.json({ folders, files, total: files.length })
  } catch (err) {
    next(err)
  }
})

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
