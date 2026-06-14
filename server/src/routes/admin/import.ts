import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import { uniqueSlug } from '../../lib/slugify'

const router = Router()

// ── Download external image and save locally ──────────────────────────────────

const UPLOADS_BASE = path.join(__dirname, '../../../uploads')
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function downloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, { timeout: 10_000 }, (res) => {
      // Follow 1 redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location
        if (loc) return downloadImage(loc).then(resolve, reject)
        return reject(new Error('Redirect không hợp lệ'))
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))

      // Determine extension from URL or Content-Type
      let ext = path.extname(new URL(url).pathname).toLowerCase().split('?')[0]
      if (!ALLOWED_EXTS.has(ext)) {
        const ct = res.headers['content-type'] ?? ''
        if (ct.includes('png')) ext = '.png'
        else if (ct.includes('gif')) ext = '.gif'
        else if (ct.includes('webp')) ext = '.webp'
        else ext = '.jpg'
      }

      const folder = path.join(UPLOADS_BASE, new Date().toISOString().slice(0, 7))
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const dest = path.join(folder, filename)
      const stream = fs.createWriteStream(dest)

      res.pipe(stream)
      stream.on('finish', () => {
        const relative = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`
        resolve(relative)
      })
      stream.on('error', reject)
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')))
  })
}

// ── Schema ────────────────────────────────────────────────────────────────────

const postItemSchema = z.object({
  title: z.string().min(1).max(1000),
  slug: z.string().max(1000).optional(),
  excerpt: z.string().max(10000).optional(),
  content: z.string().min(1),
  publishedAt: z.string().optional(),
  thumbnailUrl: z.string().optional(),
})

const importSchema = z.object({
  posts: z.array(postItemSchema).min(1).max(5000),
  categoryId: z.number().int().positive().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
})

// ── POST /api/admin/import/wordpress ─────────────────────────────────────────

router.post('/wordpress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { posts, categoryId, status } = importSchema.parse(req.body)

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const post of posts) {
      try {
        // Skip if slug already exists (already imported)
        if (post.slug) {
          const exists = await prisma.post.findUnique({ where: { slug: post.slug } })
          if (exists) { skipped++; continue }
        }

        const slug = await uniqueSlug(
          post.slug ?? post.title,
          async (s) => !!(await prisma.post.findUnique({ where: { slug: s } })),
        )

        // Download thumbnail if provided
        let thumbnail: string | null = null
        if (post.thumbnailUrl) {
          try {
            thumbnail = await downloadImage(post.thumbnailUrl)
          } catch {
            // Non-fatal: import bài mà không có ảnh
          }
        }

        await prisma.post.create({
          data: {
            title: post.title,
            slug,
            excerpt: post.excerpt || null,
            content: post.content,
            thumbnail,
            status,
            categoryId: categoryId ?? null,
            publishedAt:
              status === 'PUBLISHED'
                ? post.publishedAt ? new Date(post.publishedAt) : new Date()
                : null,
          },
        })
        imported++
      } catch (err) {
        errors.push(`"${post.title}": ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    res.json({ imported, skipped, errors })
  } catch (err) {
    next(err)
  }
})

export default router
