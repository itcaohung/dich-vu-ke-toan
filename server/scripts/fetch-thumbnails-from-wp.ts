/**
 * Lấy featured image từ WP REST API và set thumbnail cho các bài chưa có ảnh.
 *
 * Dùng: npx ts-node --transpile-only scripts/fetch-thumbnails-from-wp.ts
 *       npx ts-node --transpile-only scripts/fetch-thumbnails-from-wp.ts --dry-run
 */

import 'dotenv/config'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')
const WP_BASE = 'https://ketoanminhchau.com'
const UPLOADS_BASE = path.join(__dirname, '../uploads')
const TARGET_SLUGS = ['luat-dn', 'luat-thue', 'luat-ke-toan', 'luat-lao-dong', 'luat-quan-ly-chung']
const CONCURRENCY = 5
const WP_BATCH = 20
const WP_DELAY_MS = 1500

// ── Download image ────────────────────────────────────────────────────────────

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

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

// ── WP REST API: fetch featured image URL for a batch of slugs ────────────────

interface WPPost {
  slug: string
  featured_media: number
  _embedded?: { 'wp:featuredmedia'?: { source_url: string }[] }
}

async function fetchWPPage(page: number, slugs: string[]): Promise<WPPost[]> {
  const url = `${WP_BASE}/wp-json/wp/v2/posts?slug=${slugs.join(',')}&_embed=true&per_page=100&page=${page}`
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 20_000 }, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { reject(new Error('JSON parse error')) }
      })
    }).on('error', reject).on('timeout', () => reject(new Error('WP API timeout')))
  })
}

// ── Run in batches ────────────────────────────────────────────────────────────

async function runBatch<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(batch.map(fn))
    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value)
    }
  }
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Fetch thumbnails từ WP REST API\n`)

  // 1. Lấy danh sách bài chưa có thumbnail trong 5 danh mục
  const posts = await prisma.post.findMany({
    where: {
      thumbnail: null,
      category: { slug: { in: TARGET_SLUGS } },
    },
    select: { id: true, slug: true },
    orderBy: { id: 'asc' },
  })
  console.log(`Tổng bài chưa có thumbnail: ${posts.length}`)

  if (posts.length === 0) {
    console.log('Không còn bài nào cần cập nhật.')
    return
  }

  // 2. Fetch featured image từ WP theo batch 100 slugs
  const slugToUrl = new Map<string, string>()

  console.log(`\nFetch từ WP REST API (${Math.ceil(posts.length / WP_BATCH)} requests)...`)
  for (let i = 0; i < posts.length; i += WP_BATCH) {
    const batch = posts.slice(i, i + WP_BATCH)
    const slugs = batch.map(p => p.slug)
    // Retry tối đa 3 lần
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const wpPosts = await fetchWPPage(1, slugs)
        for (const wp of wpPosts) {
          const imgUrl = wp._embedded?.['wp:featuredmedia']?.[0]?.source_url
          if (imgUrl) slugToUrl.set(wp.slug, imgUrl)
        }
        break
      } catch (err) {
        if (attempt === 3) {
          console.warn(`\n  Lỗi batch ${i}-${i + WP_BATCH} (bỏ qua):`, err instanceof Error ? err.message : err)
        } else {
          await new Promise(r => setTimeout(r, 1000 * attempt))
        }
      }
    }
    process.stdout.write(`  [${Math.min(i + WP_BATCH, posts.length)}/${posts.length}] ${slugToUrl.size} thumbnails tìm thấy\r`)
    await new Promise(r => setTimeout(r, WP_DELAY_MS))
  }

  console.log(`\n\nTìm thấy thumbnail URL: ${slugToUrl.size}/${posts.length} bài`)

  if (slugToUrl.size === 0) {
    console.log('Không tìm thấy thumbnail nào trên WP.')
    return
  }

  // 3. Download và update DB
  const toProcess = posts.filter(p => slugToUrl.has(p.slug))
  console.log(`\nDownload & update ${toProcess.length} ảnh (${CONCURRENCY} đồng thời)...\n`)

  let updated = 0
  let failed = 0

  await runBatch(toProcess, CONCURRENCY, async (post) => {
    const imgUrl = slugToUrl.get(post.slug)!
    try {
      if (!DRY_RUN) {
        const localPath = await downloadImage(imgUrl)
        await prisma.post.update({ where: { id: post.id }, data: { thumbnail: localPath } })
      }
      updated++
      if (updated % 20 === 0 || updated === toProcess.length) {
        process.stdout.write(`  [${updated}/${toProcess.length}] done, ${failed} lỗi\r`)
      }
    } catch (err) {
      failed++
      console.warn(`\n  Lỗi [${post.id}] ${post.slug}: ${err instanceof Error ? err.message : err}`)
    }
  })

  console.log('\n\n─────────────────────────────────')
  console.log(`Đã cập nhật  : ${updated}`)
  console.log(`Lỗi          : ${failed}`)
  console.log(`Không có ảnh : ${posts.length - slugToUrl.size}`)
  if (DRY_RUN) console.log('\n[DRY RUN] Không thay đổi gì.')
  console.log('─────────────────────────────────\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
