/**
 * Script di chuyển ảnh từ WordPress sang server mới.
 *
 * Cách dùng:
 *   npx ts-node scripts/migrate-wp-images.ts
 *   npx ts-node scripts/migrate-wp-images.ts --dry-run   (xem trước, không thay đổi gì)
 */

import 'dotenv/config'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')
const UPLOADS_DIR = path.join(__dirname, '../uploads')
const WP_ORIGIN = 'https://ketoanminhchau.com'

// Regex khớp toàn bộ URL ảnh WordPress trong content HTML
const WP_IMAGE_REGEX = /https?:\/\/ketoanminhchau\.com\/wp-content\/uploads\/[^\s"'<>)]+/g

// Cache để không tải cùng một URL hai lần
const downloadCache = new Map<string, string>() // wpUrl → newRelativePath

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function getExtension(urlStr: string): string {
  const u = new URL(urlStr)
  const ext = path.extname(u.pathname)
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : '.jpg'
}

function downloadFile(urlStr: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = urlStr.startsWith('https') ? https : http
    const request = protocol.get(urlStr, { timeout: 15000 }, (res) => {
      // Theo redirect
      if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const file = fs.createWriteStream(destPath)
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
      file.on('error', (err) => { fs.unlink(destPath, () => {}); reject(err) })
    })
    request.on('error', reject)
    request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')) })
  })
}

async function migrateUrl(wpUrl: string): Promise<string> {
  if (downloadCache.has(wpUrl)) return downloadCache.get(wpUrl)!

  const ext = getExtension(wpUrl)
  const monthDir = new Date().toISOString().slice(0, 7) // YYYY-MM
  const destDir = path.join(UPLOADS_DIR, monthDir)
  const filename = `wp-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const destPath = path.join(destDir, filename)
  const newRelPath = `/uploads/${monthDir}/${filename}`

  if (DRY_RUN) {
    downloadCache.set(wpUrl, newRelPath)
    return newRelPath
  }

  ensureDir(destDir)
  await downloadFile(wpUrl, destPath)
  downloadCache.set(wpUrl, newRelPath)
  return newRelPath
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Bắt đầu migrate ảnh WordPress → server mới`)
  console.log(`WordPress origin: ${WP_ORIGIN}`)
  console.log(`Uploads dir: ${UPLOADS_DIR}\n`)

  const posts = await prisma.post.findMany({
    select: { id: true, slug: true, content: true, thumbnail: true },
  })

  const needsMigration = posts.filter(
    (p) => p.content.includes('ketoanminhchau.com/wp-content/uploads') ||
            (p.thumbnail ?? '').includes('ketoanminhchau.com'),
  )

  console.log(`Tổng bài viết: ${posts.length}`)
  console.log(`Bài viết cần migrate: ${needsMigration.length}\n`)

  let totalImages = 0
  let successCount = 0
  let errorCount = 0

  for (const post of needsMigration) {
    const wpUrls = [...new Set([
      ...(post.content.match(WP_IMAGE_REGEX) ?? []),
      ...(post.thumbnail?.match(WP_IMAGE_REGEX) ?? []),
    ])]

    if (wpUrls.length === 0) continue

    console.log(`\n[${post.id}] ${post.slug}`)
    console.log(`  ${wpUrls.length} ảnh cần migrate`)

    let newContent = post.content
    let newThumbnail = post.thumbnail

    for (const wpUrl of wpUrls) {
      totalImages++
      try {
        const newPath = await migrateUrl(wpUrl)
        newContent = newContent.split(wpUrl).join(newPath)
        if (newThumbnail) newThumbnail = newThumbnail.split(wpUrl).join(newPath)
        console.log(`  ✓ ${wpUrl.split('/').pop()} → ${newPath}`)
        successCount++
      } catch (err) {
        console.error(`  ✗ ${wpUrl.split('/').pop()} — ${(err as Error).message}`)
        errorCount++
      }
    }

    if (!DRY_RUN) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content: newContent, thumbnail: newThumbnail },
      })
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`Tổng ảnh xử lý : ${totalImages}`)
  console.log(`Thành công      : ${successCount}`)
  console.log(`Lỗi (giữ URL cũ): ${errorCount}`)
  if (DRY_RUN) console.log('\n[DRY RUN] Không có gì thay đổi. Bỏ --dry-run để chạy thật.')
  console.log('─────────────────────────────────\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
