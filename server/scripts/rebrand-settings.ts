/**
 * Cập nhật settings trong DB sang thương hiệu mới: Kế Toán Việt Á Châu
 * Chạy trong Railway Console:
 *   npx ts-node --transpile-only scripts/rebrand-settings.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_SETTINGS: { key: string; value: string }[] = [
  { key: 'site_name',        value: 'Kế Toán Việt Á Châu' },
  { key: 'site_description', value: 'Dịch vụ kế toán trọn gói uy tín – Kế Toán Việt Á Châu' },
  { key: 'email',            value: 'cskh@ketoanvietachau.vn' },
  { key: 'facebook',         value: 'https://facebook.com/ketoanvietachau' },
]

async function main() {
  console.log('\nCập nhật settings → Kế Toán Việt Á Châu...\n')

  for (const s of NEW_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    })
    console.log(`✅  ${s.key} = ${s.value}`)
  }

  console.log('\n✅ Xong! Reload trang để thấy tên mới.\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
