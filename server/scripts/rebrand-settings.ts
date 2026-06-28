/**
 * Cập nhật settings + văn phòng trong DB sang thương hiệu mới: Kế Toán Việt Á Châu
 * Chạy trong Railway Console:
 *   npx ts-node --transpile-only scripts/rebrand-settings.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_SETTINGS: { key: string; value: string }[] = [
  { key: 'site_name',        value: 'Kế Toán Việt Á Châu' },
  { key: 'site_description', value: 'Dịch vụ kế toán trọn gói uy tín – Kế Toán Việt Á Châu' },
  { key: 'hotline',          value: '091 999 6113' },
  { key: 'email',            value: 'ketoanvietachau88@gmail.com' },
  { key: 'zalo',             value: '0919996113' },
  { key: 'address',          value: '468/1/26 KP.13, P. Tam Hiệp, TP. Biên Hòa, Đồng Nai' },
  { key: 'website',          value: 'https://ketoanvietachau.com' },
  { key: 'facebook',         value: 'https://facebook.com/ketoanvietachau' },
]

async function main() {
  console.log('\n── Cập nhật Settings ───────────────────────')
  for (const s of NEW_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    })
    console.log(`✅  ${s.key} = ${s.value}`)
  }

  console.log('\n── Cập nhật Chi Nhánh ──────────────────────')
  // Xoá hết offices cũ rồi tạo lại 1 văn phòng mới
  await prisma.office.deleteMany({})
  await prisma.office.create({
    data: {
      name: 'Kế Toán Việt Á Châu',
      address: '468/1/26 KP.13, P. Tam Hiệp, TP. Biên Hòa, Đồng Nai',
      phone: '091 999 6113',
      email: 'ketoanvietachau88@gmail.com',
      order: 1,
      isActive: true,
    },
  })
  console.log('✅  Văn phòng: Kế Toán Việt Á Châu – Biên Hòa, Đồng Nai')

  console.log('\n✅ Hoàn tất! Reload trang để thấy thông tin mới.\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
