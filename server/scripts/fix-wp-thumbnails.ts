/**
 * Download về local các thumbnail đang trỏ thẳng đến URL WP cũ.
 * Dùng: npx ts-node --transpile-only scripts/fix-wp-thumbnails.ts
 */

import 'dotenv/config'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const UPLOADS_BASE = path.join(__dirname, '../uploads')
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const CONCURRENCY = 5

function downloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, { timeout: 15_000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location
        if (loc) return downloadImage(loc).then(resolve, reject)
        return reject(new Error('Redirect không hợp lệ'))
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))

      let ext = path.extname(new URL(url).pathname).toLowerCase().split('?')[0]
      if (!ALLOWED_EXTS.has(ext)) {
        const ct = res.headers['content-type'] ?? ''
        ext = ct.includes('png') ? '.png' : ct.includes('gif') ? '.gif' : ct.includes('webp') ? '.webp' : '.jpg'
      }

      const folder = path.join(UPLOADS_BASE, new Date().toISOString().slice(0, 7))
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

      const filename = `wp-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const dest = path.join(folder, filename)
      const stream = fs.createWriteStream(dest)

      res.pipe(stream)
      stream.on('finish', () => resolve(`/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`))
      stream.on('error', reject)
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')))
  })
}

async function main() {
  const posts = await prisma.post.findMany({
    where: { thumbnail: { startsWith: 'https://ketoanminhchau.com' } },
    select: { id: true, thumbnail: true },
  })
  console.log(`\nFix ${posts.length} thumbnail WP URL → local\n`)

  let updated = 0, failed = 0

  for (let i = 0; i < posts.length; i += CONCURRENCY) {
    const batch = posts.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(async (post) => {
      try {
        const localPath = await downloadImage(post.thumbnail!)
        await prisma.post.update({ where: { id: post.id }, data: { thumbnail: localPath } })
        updated++
      } catch (err) {
        failed++
        console.warn(`  Lỗi [${post.id}]: ${err instanceof Error ? err.message : err}`)
      }
    }))
    process.stdout.write(`  [${Math.min(i + CONCURRENCY, posts.length)}/${posts.length}] done, ${failed} lỗi\r`)
  }

  console.log('\n\n─────────────────────────────────')
  console.log(`Đã fix  : ${updated}`)
  console.log(`Lỗi     : ${failed}`)
  console.log('─────────────────────────────────\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
