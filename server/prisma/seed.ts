import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@ketoanvietachau.vn' },
    update: {},
    create: {
      email: 'admin@ketoanvietachau.vn',
      password: await bcrypt.hash('Admin@123456', 12),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ User:', superAdmin.email)

  // ── Categories ───────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'thanh-lap-doanh-nghiep' }, update: {}, create: { name: 'Thành Lập Doanh Nghiệp', slug: 'thanh-lap-doanh-nghiep' } }),
    prisma.category.upsert({ where: { slug: 'ke-toan-thue' }, update: {}, create: { name: 'Kế Toán - Thuế', slug: 'ke-toan-thue' } }),
    prisma.category.upsert({ where: { slug: 'phap-luat-doanh-nghiep' }, update: {}, create: { name: 'Pháp Luật Doanh Nghiệp', slug: 'phap-luat-doanh-nghiep' } }),
    prisma.category.upsert({ where: { slug: 'lao-dong-bao-hiem' }, update: {}, create: { name: 'Lao Động - Bảo Hiểm', slug: 'lao-dong-bao-hiem' } }),
  ])
  console.log('✅ Categories:', categories.length)

  // ── Services ─────────────────────────────────────────────
  const services = [
    { title: 'Kế Toán Trọn Gói', slug: 'ke-toan-tron-goi', description: 'Hạch toán sổ sách, lập báo cáo tài chính, quyết toán thuế hàng tháng/quý/năm.', price: 'Từ 500.000đ/tháng', icon: 'fa-calculator', order: 1 },
    { title: 'Thành Lập Công Ty TNHH', slug: 'thanh-lap-cong-ty-tnhh', description: 'Tư vấn loại hình, soạn hồ sơ, nộp đăng ký kinh doanh, khắc dấu và giao tận nơi.', price: 'Từ 250.000đ', icon: 'fa-building', order: 2 },
    { title: 'Khai Báo & Quyết Toán Thuế', slug: 'khai-bao-quyet-toan-thue', description: 'Kê khai thuế GTGT, TNDN, TNCN đúng hạn. Hỗ trợ giải trình, kiểm tra thuế.', price: 'Từ 300.000đ/lần', icon: 'fa-file-invoice-dollar', order: 3 },
    { title: 'Thay Đổi Giấy Phép Kinh Doanh', slug: 'thay-doi-giay-phep-kinh-doanh', description: 'Thay đổi tên, địa chỉ, vốn điều lệ, người đại diện, ngành nghề kinh doanh.', price: 'Từ 500.000đ/lần', icon: 'fa-edit', order: 4 },
    { title: 'Thành Lập Công Ty FDI', slug: 'thanh-lap-cong-ty-fdi', description: 'Tư vấn đầu tư nước ngoài, xin giấy chứng nhận đăng ký đầu tư.', price: 'Từ 15.000.000đ', icon: 'fa-globe', order: 5 },
    { title: 'Bảo Hiểm Xã Hội & Lao Động', slug: 'bao-hiem-xa-hoi-lao-dong', description: 'Đăng ký BHXH, BHYT, BHTN. Lập hợp đồng lao động, nội quy công ty.', price: 'Từ 200.000đ/tháng', icon: 'fa-shield-alt', order: 6 },
    { title: 'Chữ Ký Số & Hóa Đơn Điện Tử', slug: 'chu-ky-so-hoa-don-dien-tu', description: 'Đăng ký chữ ký số token, hóa đơn điện tử theo Thông tư 78/2021/TT-BTC.', price: 'Từ 1.800.000đ/năm', icon: 'fa-file-signature', order: 7 },
    { title: 'Đào Tạo Kế Toán Thực Tế', slug: 'dao-tao-ke-toan-thuc-te', description: 'Đào tạo kế toán thực hành trên phần mềm MISA, Fast, Excel.', price: 'Từ 2.500.000đ/khóa', icon: 'fa-graduation-cap', order: 8 },
  ]

  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: { ...s, isActive: true } })
  }
  console.log('✅ Services:', services.length)

  // ── Posts ────────────────────────────────────────────────
  const posts = [
    {
      title: 'Thủ tục thành lập công ty TNHH 1 thành viên năm 2025 mới nhất',
      slug: 'thu-tuc-thanh-lap-cong-ty-tnhh-1-thanh-vien-2025',
      excerpt: 'Hướng dẫn chi tiết thủ tục thành lập công ty TNHH 1 thành viên theo quy định mới nhất của Luật Doanh nghiệp 2020.',
      content: '<p>Công ty TNHH 1 thành viên là loại hình doanh nghiệp phổ biến nhất tại Việt Nam hiện nay...</p>',
      status: 'PUBLISHED' as const,
      categoryId: categories[0].id,
      publishedAt: new Date('2025-06-10'),
      views: 15234,
    },
    {
      title: 'Cách đặt tên công ty theo quy định mới nhất của Luật Doanh Nghiệp',
      slug: 'cach-dat-ten-cong-ty-theo-quy-dinh-luat-doanh-nghiep',
      excerpt: 'Những lưu ý quan trọng khi đặt tên công ty để đảm bảo đáp ứng đúng quy định pháp luật.',
      content: '<p>Việc đặt tên công ty là bước đầu tiên và quan trọng trong quá trình thành lập doanh nghiệp...</p>',
      status: 'PUBLISHED' as const,
      categoryId: categories[0].id,
      publishedAt: new Date('2025-06-08'),
      views: 12890,
    },
    {
      title: 'Mức thuế môn bài năm 2025 cho hộ kinh doanh và doanh nghiệp',
      slug: 'muc-thue-mon-bai-2025',
      excerpt: 'Cập nhật mức thuế môn bài năm 2025 áp dụng cho hộ kinh doanh cá thể và doanh nghiệp theo thông tư mới.',
      content: '<p>Thuế môn bài (hay lệ phí môn bài) là loại thuế mà các tổ chức, cá nhân hoạt động kinh doanh phải nộp...</p>',
      status: 'PUBLISHED' as const,
      categoryId: categories[1].id,
      publishedAt: new Date('2025-06-05'),
      views: 9456,
    },
    {
      title: 'Quy định về vốn điều lệ tối thiểu khi thành lập công ty 2025',
      slug: 'quy-dinh-von-dieu-le-toi-thieu-thanh-lap-cong-ty-2025',
      excerpt: 'Vốn điều lệ khi thành lập công ty cần tối thiểu bao nhiêu? Tổng hợp quy định mới nhất theo ngành nghề.',
      content: '<p>Hiện nay, pháp luật Việt Nam không quy định mức vốn điều lệ tối thiểu chung...</p>',
      status: 'PUBLISHED' as const,
      categoryId: categories[2].id,
      publishedAt: new Date('2025-06-03'),
      views: 8123,
    },
  ]

  for (const p of posts) {
    await prisma.post.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log('✅ Posts:', posts.length)

  // ── Offices ──────────────────────────────────────────────
  const offices = [
    { name: 'TP. Hồ Chí Minh (Trụ Sở)', address: '144 Đinh Tiên Hoàng, P.1, Q. Bình Thạnh, TP.HCM', phone: '(028) 2244 6739', email: 'hcm@ketoanvietachau.vn', order: 1 },
    { name: 'Hà Nội', address: 'Tầng 7, 57 Trần Quốc Toản, Q. Hoàn Kiếm, Hà Nội', phone: '(024) 6295 5968', email: 'hn@ketoanvietachau.vn', order: 2 },
    { name: 'Đà Nẵng', address: 'Tầng 5, 82 Hùng Vương, Q. Hải Châu, Đà Nẵng', phone: '(0236) 3030 779', email: 'dn@ketoanvietachau.vn', order: 3 },
    { name: 'Cần Thơ', address: 'Số 66 Mậu Thân, Q. Ninh Kiều, TP. Cần Thơ', phone: '(0292) 3012 555', email: 'ct@ketoanvietachau.vn', order: 4 },
    { name: 'Đồng Nai', address: 'Số 12 Nguyễn Ái Quốc, P. Tân Hiệp, Biên Hòa, Đồng Nai', phone: '(0251) 3881 288', email: 'dn2@ketoanvietachau.vn', order: 5 },
    { name: 'Bình Dương', address: 'Số 8 Đại lộ Bình Dương, P. Phú Hòa, TP. Thủ Dầu Một', phone: '(0274) 2222 568', email: 'bd@ketoanvietachau.vn', order: 6 },
  ]

  for (const [i, o] of offices.entries()) {
    const existing = await prisma.office.findFirst({ where: { name: o.name } })
    if (!existing) await prisma.office.create({ data: { ...o, isActive: true } })
    else console.log(`  skip office ${i + 1}`)
  }
  console.log('✅ Offices:', offices.length)

  // ── Settings ─────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'Kế Toán Việt Á Châu' },
    { key: 'site_description', value: 'Dịch vụ kế toán trọn gói uy tín từ 2007' },
    { key: 'hotline', value: '1900 6234' },
    { key: 'email', value: 'cskh@ketoanvietachau.vn' },
    { key: 'facebook', value: 'https://facebook.com/ketoanvietachau' },
    { key: 'youtube', value: '' },
    { key: 'zalo', value: '1900 6234' },
    { key: 'address', value: '144 Đinh Tiên Hoàng, P.1, Q. Bình Thạnh, TP.HCM' },
    { key: 'working_hours', value: 'Thứ 2 – Thứ 7: 08:00 – 17:30' },
    { key: 'tax_code', value: '0307520384' },
    { key: 'established_year', value: '2007' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('✅ Settings:', settings.length)

  // ── Banners ──────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: { title: 'Dịch Vụ Kế Toán Trọn Gói', subtitle: 'Uy tín – Chuyên nghiệp – Đúng hạn', image: '/uploads/banner-default.jpg', order: 1, isActive: true },
  })
  console.log('✅ Banners: 1')

  // ── Menu mặc định ────────────────────────────────────────
  const existingMenuCount = await prisma.menuItem.count()
  if (existingMenuCount === 0) {
    const defaultMenu = [
      { label: 'Trang chủ', url: '/', order: 1 },
      { label: 'Dịch vụ',   url: '/dich-vu', order: 2 },
      { label: 'Tin tức',   url: '/tin-tuc', order: 3 },
      { label: 'Giới thiệu', url: '/gioi-thieu', order: 4 },
      { label: 'Liên hệ',   url: '/lien-he', order: 5 },
    ]
    await prisma.menuItem.createMany({ data: defaultMenu })
    console.log('✅ Menu: 5 items mặc định')
  } else {
    console.log(`✅ Menu: bỏ qua (đã có ${existingMenuCount} items)`)
  }

  // ── Testimonials ─────────────────────────────────────────
  const existingTestimonials = await prisma.testimonial.count()
  if (existingTestimonials === 0) {
    await prisma.testimonial.createMany({
      data: [
        { name: 'Võ Minh Trúc',    role: 'Giám Đốc', company: 'CTY TNHH Võ Han Minh',                    text: 'Đánh giá cao về sự chuyên môn cũng như trách nhiệm trong công việc, báo cáo thuế đúng quy định.', rating: 5, order: 1 },
        { name: 'Phạm Xuân Kim',   role: 'Giám Đốc', company: 'CTY TNHH Sắt Thép Kim Trung',             text: 'Dịch vụ thành lập công ty rất chuyên nghiệp và đúng hẹn, tiết kiệm thời gian và chi phí.', rating: 5, order: 2 },
        { name: 'Lê Ngọc Minh',    role: 'Giám Đốc', company: 'CTY TNHH BĐS Lê Trang',                  text: 'Hoàn toàn tin tưởng bàn giao tất cả công việc dịch vụ kế toán thuế với những thủ tục chính xác.', rating: 5, order: 3 },
        { name: 'Lê Văn Tiến',     role: 'Giám Đốc', company: 'CTY TNHH In Ấn Hoàng Anh Tiến',          text: 'Nhân viên đại diện giải quyết vấn đề nhanh chóng và hiệu quả nhất.', rating: 5, order: 4 },
        { name: 'Nguyễn Ngọc Thu', role: 'Giám Đốc', company: 'CTY TNHH Hankook Crane',                  text: 'Hoàn toàn yên tâm không cần phải lo các vấn đề pháp lý của công ty.', rating: 5, order: 5 },
        { name: 'Tôn Đức Lâm',    role: 'Giám Đốc', company: 'CTY TNHH Cơ Khí Năng Lượng Tôn Nguyễn Phát', text: 'Các bạn rất nhiệt tình, tư vấn rất kỹ về các vấn đề ngành nghề, vốn, thuế.', rating: 5, order: 6 },
      ],
    })
    console.log('✅ Testimonials: 6 mẫu')
  } else {
    console.log(`✅ Testimonials: bỏ qua (đã có ${existingTestimonials})`)
  }

  // ── Team Members ─────────────────────────────────────────
  const existingTeam = await prisma.teamMember.count()
  if (existingTeam === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: 'Phạm Thị Hưng',       title: 'Trưởng BP Thành Lập DN',       order: 1 },
        { name: 'Phạm Thị Y Lênh',      title: 'Trưởng BP Kế Toán Thuế',       order: 2 },
        { name: 'Trương Thị Hạnh',      title: 'Trưởng BP Thuế Kế Toán',       order: 3 },
        { name: 'Phạm Thị Lệ',          title: 'Trưởng BP Thuế Kế Toán',       order: 4 },
        { name: 'Bùi Thị Thanh Dung',   title: 'Trưởng BP Thuế Kế Toán',       order: 5 },
        { name: 'Lê Thị Hà',            title: 'Trưởng BP Thuế Kế Toán',       order: 6 },
        { name: 'Phạm Thị Phương',      title: 'Trưởng BP Thuế Kế Toán',       order: 7 },
        { name: 'Trần Kim My',           title: 'Chuyên Viên Thuế Kế Toán',     order: 8 },
        { name: 'Võ Thị Thu Ngân',      title: 'Chuyên Viên Thuế Kế Toán',     order: 9 },
        { name: 'Ninh Thị Ngọc Yến',    title: 'Chuyên Viên Thuế Kế Toán',     order: 10 },
        { name: 'Đoàn Thị Ngọc Diễm',  title: 'Chuyên Viên Thuế Kế Toán',     order: 11 },
        { name: 'Nguyễn Hồng Hạnh',     title: 'Chuyên Viên Thuế Kế Toán',     order: 12 },
      ],
    })
    console.log('✅ TeamMembers: 12 mẫu')
  } else {
    console.log(`✅ TeamMembers: bỏ qua (đã có ${existingTeam})`)
  }

  console.log('\n🎉 Seed hoàn tất!')
  console.log('─────────────────────────────────')
  console.log('📧 Email: admin@ketoanvietachau.vn')
  console.log('🔑 Password: Admin@123456')
  console.log('─────────────────────────────────\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
