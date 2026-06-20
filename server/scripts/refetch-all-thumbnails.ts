/**
 * Reset thumbnail = NULL rồi re-fetch từ WP REST API cho tất cả bài.
 * Dùng trong Railway Console:
 *   npx ts-node --transpile-only scripts/refetch-all-thumbnails.ts
 */

import 'dotenv/config'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const WP_BASE = 'https://ketoanminhchau.com'
const UPLOADS_BASE = path.join(__dirname, '../uploads')
const CONCURRENCY = 5
const WP_BATCH = 20
const WP_DELAY_MS = 1500
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

interface WPPost {
  slug: string
  _embedded?: { 'wp:featuredmedia'?: { source_url: string }[] }
}

async function fetchWPSlugs(slugs: string[]): Promise<WPPost[]> {
  const url = `${WP_BASE}/wp-json/wp/v2/posts?slug=${slugs.join(',')}&_embed=true&per_page=100`
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 20_000 }, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch { reject(new Error('JSON parse')) } })
    }).on('error', reject).on('timeout', () => reject(new Error('WP timeout')))
  })
}

async function main() {
  console.log('\nBước 1: Reset thumbnail về NULL...')
  const { count } = await prisma.post.updateMany({
    where: { thumbnail: { startsWith: '/uploads/' } },
    data: { thumbnail: null },
  })
  console.log(`Đã reset ${count} bài`)

  console.log('\nBước 2: Lấy danh sách bài...')
  const posts = await prisma.post.findMany({
    where: { thumbnail: null, status: 'PUBLISHED' },
    select: { id: true, slug: true },
    orderBy: { id: 'asc' },
  })
  console.log(`Tổng bài cần fetch: ${posts.length}`)

  const slugToUrl = new Map<string, string>()
  const totalBatches = Math.ceil(posts.length / WP_BATCH)
  console.log(`\nBước 3: Fetch WP REST API (${totalBatches} batches)...`)

  for (let i = 0; i < posts.length; i += WP_BATCH) {
    const batch = posts.slice(i, i + WP_BATCH)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const wpPosts = await fetchWPSlugs(batch.map(p => p.slug))
        for (const wp of wpPosts) {
          const imgUrl = wp._embedded?.['wp:featuredmedia']?.[0]?.source_url
          if (imgUrl) slugToUrl.set(wp.slug, imgUrl)
        }
        break
      } catch {
        if (attempt === 3) console.warn(`  Bỏ qua batch ${i}`)
        else await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
    process.stdout.write(`  [${Math.min(i + WP_BATCH, posts.length)}/${posts.length}] ${slugToUrl.size} URLs\r`)
    await new Promise(r => setTimeout(r, WP_DELAY_MS))
  }
  console.log(`\nTìm thấy: ${slugToUrl.size}/${posts.length}`)

  console.log(`\nBước 4: Download ${slugToUrl.size} ảnh...`)
  const toProcess = posts.filter(p => slugToUrl.has(p.slug))
  let updated = 0, failed = 0

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(async (post) => {
      try {
        const localPath = await downloadImage(slugToUrl.get(post.slug)!)
        await prisma.post.update({ where: { id: post.id }, data: { thumbnail: localPath } })
        updated++
      } catch (err) {
        failed++
        if (failed <= 10) console.warn(`\n  Lỗi ${post.slug}: ${err instanceof Error ? err.message : err}`)
      }
    }))
    if ((i / CONCURRENCY) % 10 === 0) {
      process.stdout.write(`  [${updated + failed}/${toProcess.length}] ${updated} ok, ${failed} lỗi\r`)
    }
  }

  console.log(`\n\n─────────────────────────────────`)
  console.log(`Đã cập nhật : ${updated}`)
  console.log(`Lỗi         : ${failed}`)
  console.log(`Không có WP : ${posts.length - slugToUrl.size}`)
  console.log(`─────────────────────────────────\n`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
