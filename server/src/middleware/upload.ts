import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = Number(process.env.MAX_FILE_SIZE ?? 5242880) // 5MB default

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const dir = path.join(__dirname, '../../uploads', new Date().toISOString().slice(0, 7))
    ensureDir(dir)
    cb(null, dir)
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'))
  }
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })

export function getFileUrl(_req: Request, filePath: string): string {
  // Trả về path tương đối để frontend tự ghép domain
  const relative = filePath.replace(path.join(__dirname, '../../'), '').replace(/\\/g, '/')
  return `/${relative}`
}
