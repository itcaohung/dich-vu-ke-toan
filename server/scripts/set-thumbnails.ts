/**
 * Tự động set thumbnail cho bài viết bằng cách lấy ảnh đầu tiên trong content.
 *
 * Cách dùng:
 *   npx ts-node --transpile-only scripts/set-thumbnails.ts
 *   npx ts-node --transpile-only scripts/set-thumbnails.ts --overwrite  (ghi đè thumbnail đã có)
 *   npx ts-node --transpile-only scripts/set-thumbnails.ts --dry-run
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')
const OVERWRITE = process.argv.includes('--overwrite')

// Khớp src="..." hoặc src='...' trong thẻ <img>
const IMG_SRC_REGEX = /<img[^>]+src=["']([^"']+)["']/i

function extractFirstImage(html: string): string | null {
  const match = IMG_SRC_REGEX.exec(html)
  if (!match) return null
  const src = match[1].trim()
  // Chỉ lấy ảnh local hoặc http, bỏ qua data:image
  if (src.startsWith('data:')) return null
  return src
}

async function main() {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Set thumbnail từ ảnh đầu tiên trong content`)
  if (OVERWRITE) console.log('Chế độ: ghi đè thumbnail đã có')
  console.log()

  const posts = await prisma.post.findMany({
    select: { id: true, slug: true, content: true, thumbnail: true },
    orderBy: { id: 'asc' },
  })

  let updated = 0
  let skipped = 0
  let noImage = 0

  for (const post of posts) {
    // Bỏ qua bài đã có thumbnail (trừ khi --overwrite)
    if (post.thumbnail && !OVERWRITE) {
      skipped++
      continue
    }

    const firstImg = extractFirstImage(post.content)
    if (!firstImg) {
      console.log(`  — [${post.id}] ${post.slug.slice(0, 60)} (không có ảnh)`)
      noImage++
      continue
    }

    console.log(`  ✓ [${post.id}] ${post.slug.slice(0, 50)}`)
    console.log(`       ${firstImg}`)

    if (!DRY_RUN) {
      await prisma.post.update({
        where: { id: post.id },
        data: { thumbnail: firstImg },
      })
    }
    updated++
  }

  console.log('\n─────────────────────────────────')
  console.log(`Đã cập nhật  : ${updated}`)
  console.log(`Bỏ qua       : ${skipped} (đã có thumbnail)`)
  console.log(`Không có ảnh : ${noImage}`)
  if (DRY_RUN) console.log('\n[DRY RUN] Không thay đổi gì. Bỏ --dry-run để chạy thật.')
  console.log('─────────────────────────────────\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
