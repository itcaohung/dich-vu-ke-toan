import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, CheckCircle, Phone, Star, Users, FileText,
  Award, Clock, ChevronLeft, ChevronRight, Quote,
} from 'lucide-react'
import { fetchSettings, fetchServices, fetchPosts, fetchBanners, fetchTestimonials, fetchTeamMembers, API_BASE } from '../api'
import ContactForm from '../components/ui/ContactForm'
import type { Banner } from '../types'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

// ── Banner Slider ──────────────────────────────────────────────────────────────
function BannerSlider({ banners, hotline }: { banners: Banner[]; hotline?: string }) {
  const [idx, setIdx] = useState(0)
  const count = banners.length

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count])
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count])

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [count, next])

  const current = banners[idx]

  return (
    <div className="relative w-full overflow-hidden bg-blue-900" style={{ minHeight: 480 }}>
      {/* Slides */}
      {banners.map((b, i) => (
        <div key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {b.image
            ? <img src={imgUrl(b.image)} alt={b.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800" />
          }
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
        </div>
      ))}

      {/* Text content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4" style={{ minHeight: 480 }}>
        <div className="flex items-center" style={{ minHeight: 480 }}>
          <div className="max-w-2xl py-16 text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              Đơn vị kế toán uy tín từ 2007
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-md">
              {current?.title ?? 'Dịch Vụ Kế Toán & Thành Lập Doanh Nghiệp'}
            </h1>
            {current?.subtitle && (
              <p className="text-white/85 text-lg leading-relaxed mb-7 max-w-xl">
                {current.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link to="/lien-he"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg">
                Tư vấn miễn phí <ArrowRight size={16} />
              </Link>
              {hotline && (
                <a href={`tel:${hotline}`}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/40 text-white font-medium px-6 py-3 rounded-xl transition-colors backdrop-blur-sm">
                  <Phone size={16} /> {hotline}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/45 hover:bg-white/70'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Featured service cards (below banner) ─────────────────────────────────────
const FEATURED = [
  {
    icon: '📊',
    title: 'Dịch Vụ Kế Toán Trọn Gói',
    desc: 'Hạch toán sổ sách, lập báo cáo tài chính, quyết toán thuế hàng tháng/quý/năm.',
    price: 'Từ 500.000đ/tháng',
    to: '/dich-vu/ke-toan-tron-goi',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: '🏢',
    title: 'Thành Lập Công Ty Giá Rẻ',
    desc: 'Tư vấn loại hình, soạn hồ sơ, nộp đăng ký kinh doanh, khắc dấu và giao tận nơi.',
    price: 'Chỉ từ 250.000đ',
    to: '/dich-vu/thanh-lap-cong-ty-tnhh',
    color: 'from-emerald-500 to-emerald-700',
  },
]

export default function HomePage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const { data: postsData } = useQuery({ queryKey: ['posts', { limit: 3 }], queryFn: () => fetchPosts({ limit: 3 }) })
  const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: fetchBanners })
  const { data: testimonials = [] } = useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials })
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: fetchTeamMembers })

  const posts = postsData?.data ?? []
  const activebanners = banners.filter((b) => b.isActive)

  const stats = [
    { value: '16+', label: 'Năm kinh nghiệm', icon: Award },
    { value: '70.000+', label: 'Doanh nghiệp tin tưởng', icon: Users },
    { value: '1.000+', label: 'Hồ sơ đã xử lý', icon: FileText },
    { value: '24/7', label: 'Hỗ trợ liên tục', icon: Clock },
  ]

  const whyUs = [
    'Đội ngũ kế toán – luật sư có chứng chỉ hành nghề',
    'Cam kết hoàn tiền nếu xử lý sai sót',
    'Hồ sơ hoàn tất nhanh, đúng hạn',
    'Tư vấn miễn phí lần đầu, không phát sinh chi phí ẩn',
    'Hỗ trợ khách hàng 7 ngày/tuần',
    'Kinh nghiệm làm việc với 20+ ngành nghề khác nhau',
  ]

  return (
    <div>
      {/* ── Banner Slider ── */}
      <BannerSlider banners={activebanners} hotline={settings?.hotline} />

      {/* ── 2 Featured service cards ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURED.map((f) => (
              <Link key={f.to} to={f.to}
                className={`group bg-gradient-to-br ${f.color} flex items-start gap-4 p-6 rounded-2xl text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5`}>
                <span className="text-4xl shrink-0 mt-1">{f.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-snug mb-1">{f.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">{f.desc}</p>
                  <span className="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {f.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <Icon size={28} className="text-blue-300 mx-auto mb-2" />
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-blue-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dịch vụ nổi bật ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Giải pháp toàn diện</p>
            <h2 className="text-3xl font-bold text-gray-900">Dịch Vụ Của Chúng Tôi</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Giải pháp toàn diện cho mọi nhu cầu kế toán, thuế và pháp lý của doanh nghiệp
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.slice(0, 8).map((s) => (
              <Link key={s.id} to={`/dich-vu/${s.slug}`}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl transition-colors">
                  {s.icon?.startsWith('fa') ? '📋' : (s.icon ?? '📋')}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{s.description}</p>
                {s.price && <p className="mt-3 text-sm font-semibold text-blue-600">{s.price}</p>}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/dich-vu"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              Xem tất cả dịch vụ <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tại sao chọn chúng tôi ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Lý do tin tưởng</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Hơn 16 năm đồng hành cùng hơn 70.000 doanh nghiệp trên cả nước. Chúng tôi không chỉ cung cấp dịch vụ — chúng tôi là đối tác chiến lược giúp doanh nghiệp bạn vận hành đúng pháp luật và tối ưu chi phí.
              </p>
              <ul className="space-y-3">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/gioi-thieu"
                className="mt-8 inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Tìm hiểu thêm về chúng tôi <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-5 text-center">Quy trình làm việc</h3>
                {[
                  { step: '01', title: 'Tiếp nhận yêu cầu', desc: 'Tư vấn viên liên hệ trong 30 phút' },
                  { step: '02', title: 'Báo giá rõ ràng', desc: 'Không phát sinh chi phí ngoài hợp đồng' },
                  { step: '03', title: 'Xử lý hồ sơ', desc: 'Đúng hạn, đúng quy định pháp luật' },
                  { step: '04', title: 'Bàn giao kết quả', desc: 'Hỗ trợ hậu mãi trọn đời dịch vụ' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-4 mb-5 last:mb-0">
                    <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Khách hàng nói về chúng tôi ── */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Đánh giá</p>
              <h2 className="text-3xl font-bold text-gray-900">Khách Hàng Nói Về Chúng Tôi</h2>
              <p className="text-gray-500 mt-2">Hơn 70.000 doanh nghiệp đã tin tưởng sử dụng dịch vụ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                  <Quote size={28} className="text-blue-100 shrink-0" />
                  <p className="text-gray-600 leading-relaxed text-sm flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    {t.avatar
                      ? <img src={imgUrl(t.avatar)} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      : <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {t.name.split(' ').pop()?.charAt(0)}
                        </div>
                    }
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role} — {t.company}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Đội ngũ của chúng tôi ── */}
      {teamMembers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Con người</p>
              <h2 className="text-3xl font-bold text-gray-900">Đội Ngũ Của Chúng Tôi</h2>
              <p className="text-gray-500 mt-2">Chuyên viên được đào tạo bài bản, nhiều năm kinh nghiệm thực tế</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {teamMembers.map((m) => {
                const ini = m.name.split(' ').slice(-2).map((w: string) => w[0]).join('')
                const colors = ['bg-blue-600','bg-emerald-600','bg-violet-600','bg-rose-500','bg-amber-500','bg-teal-600']
                const color = colors[m.name.length % colors.length]
                return (
                  <div key={m.id} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md transition-shadow">
                    {m.avatar
                      ? <img src={imgUrl(m.avatar)} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
                      : <div className={`w-24 h-24 ${color} rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3`}>{ini}</div>
                    }
                    <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-blue-600 mt-1">{m.title}</p>
                    {m.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.bio}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Tin tức mới nhất ── */}
      {posts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-1">Blog</p>
                <h2 className="text-3xl font-bold text-gray-900">Tin Tức Mới Nhất</h2>
                <p className="text-gray-500 mt-1">Cập nhật kiến thức kế toán, thuế và pháp luật</p>
              </div>
              <Link to="/tin-tuc"
                className="hidden md:inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
                Xem tất cả <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/tin-tuc/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
                  {post.thumbnail
                    ? <img src={imgUrl(post.thumbnail)} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FileText size={40} className="text-blue-400" />
                      </div>
                  }
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
                    <p className="text-xs text-gray-400 mt-3">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Form liên hệ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Miễn phí</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nhận Tư Vấn Ngay</h2>
              <p className="text-gray-500">Điền thông tin bên dưới, chuyên viên sẽ gọi lại trong 30 phút</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 bg-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Bắt Đầu Ngay Hôm Nay</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Liên hệ ngay để nhận tư vấn miễn phí từ đội ngũ chuyên viên giàu kinh nghiệm
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/lien-he"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">
              Liên hệ tư vấn <ArrowRight size={16} />
            </Link>
            <a href={`tel:${settings?.hotline}`}
              className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              <Phone size={16} /> {settings?.hotline ?? 'Gọi ngay'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
