import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, Phone,
  FileText, Calendar, MessageCircle, Building2,
  Calculator, BookOpen, Shield, CheckCircle2,
} from 'lucide-react'
import { fetchSettings, fetchServices, fetchPosts, fetchTestimonials, fetchTeamMembers, API_BASE } from '../api'
import ContactForm from '../components/ui/ContactForm'
import type { Service } from '../types'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

// ── Service Hero Grid ──────────────────────────────────────────────────────────
function ServiceHeroGrid({ services }: { services: Service[] }) {
  const [s0, s1, s2, s3] = services

  const BG_FALLBACKS = [
    'from-blue-700 to-blue-900',
    'from-orange-600 to-orange-800',
    'from-emerald-600 to-teal-700',
    'from-violet-600 to-indigo-700',
  ]

  const Card = ({ s, idx, className }: { s: Service; idx: number; className: string }) => (
    <Link to={`/dich-vu/${s.slug}`}
      className={`relative overflow-hidden block group ${className}`}>
      {s.image
        ? <img src={imgUrl(s.image)} alt={s.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className={`w-full h-full bg-gradient-to-br ${BG_FALLBACKS[idx % 4]}`} />
      }
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{s.title}</p>
        {s.price && <p className="text-orange-300 text-xs font-medium mt-0.5">{s.price}</p>}
      </div>
    </Link>
  )

  if (!s0) return <div className="w-full bg-gradient-to-r from-blue-700 to-blue-900" style={{ height: 420 }} />

  return (
    <div className="flex gap-0.5 bg-gray-200" style={{ height: 420 }}>
      {/* Large left */}
      <div className="w-1/2 h-full">
        <Card s={s0} idx={0} className="w-full h-full" />
      </div>
      {/* Right grid */}
      <div className="w-1/2 h-full flex flex-col gap-0.5">
        {s1 && (
          <div className={s2 || s3 ? 'h-1/2' : 'h-full'}>
            <Card s={s1} idx={1} className="w-full h-full" />
          </div>
        )}
        {(s2 || s3) && (
          <div className="h-1/2 flex gap-0.5">
            {s2 && <div className={s3 ? 'w-1/2' : 'w-full'}><Card s={s2} idx={2} className="w-full h-full" /></div>}
            {s3 && <div className="w-1/2"><Card s={s3} idx={3} className="w-full h-full" /></div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Service icon map ───────────────────────────────────────────────────────────
const SERVICE_ICONS = [
  { Icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50' },
  { Icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
  { Icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { Icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
  { Icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
  { Icon: Calculator, color: 'text-teal-600', bg: 'bg-teal-50' },
  { Icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  { Icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
]

export default function HomePage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const { data: postsData } = useQuery({ queryKey: ['posts', { limit: 7 }], queryFn: () => fetchPosts({ limit: 7 }) })
  const { data: testimonials = [] } = useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials })
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: fetchTeamMembers })

  const posts = postsData?.data ?? []
  const featuredPost = posts[0]
  const sidePosts = posts.slice(1, 6)
  const activeServices = services.filter((s) => s.isActive)

  const whyUs = [
    { title: 'Hơn 16 năm kinh nghiệm', desc: 'Đồng hành cùng 70.000+ doanh nghiệp trên cả nước' },
    { title: 'Đội ngũ chuyên nghiệp', desc: 'Kế toán, luật sư có chứng chỉ hành nghề, được đào tạo bài bản' },
    { title: 'Cam kết hoàn tiền', desc: 'Xử lý sai sót hoàn trả 100% phí dịch vụ' },
    { title: 'Báo giá minh bạch', desc: 'Không phát sinh chi phí ngoài hợp đồng đã ký' },
    { title: 'Hỗ trợ 7 ngày/tuần', desc: 'Tư vấn và giải đáp nhanh chóng qua điện thoại, Zalo' },
    { title: 'Hoàn tất đúng hạn', desc: 'Cam kết tiến độ, bàn giao đúng thời hạn thỏa thuận' },
  ]

  const steps = [
    { n: '01', t: 'Liên hệ tư vấn', d: 'Gọi điện hoặc để lại thông tin — tư vấn viên gọi lại trong 30 phút' },
    { n: '02', t: 'Báo giá & ký hợp đồng', d: 'Báo giá rõ ràng, không phát sinh chi phí ẩn sau ký kết' },
    { n: '03', t: 'Xử lý hồ sơ', d: 'Chuyên viên thực hiện đúng quy định pháp luật, đúng tiến độ' },
    { n: '04', t: 'Bàn giao & hỗ trợ', d: 'Bàn giao kết quả và hỗ trợ hậu mãi trọn đời dịch vụ' },
  ]

  return (
    <div className="bg-white">
      {/* ── Hero dịch vụ + hotline ── */}
      <div className="bg-gray-50">
        <div className="max-w-site mx-auto px-4 pt-8 pb-0">
          <ServiceHeroGrid services={activeServices.slice(0, 4)} />
          {/* Hotline bar gắn liền dưới grid */}
          <div className="bg-blue-700 text-white px-6 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-6">
                {settings?.hotline && (
                  <a href={`tel:${settings.hotline}`}
                    className="flex items-center gap-2 font-semibold hover:text-blue-200 transition-colors">
                    <Phone size={15} /> {settings.hotline}
                  </a>
                )}
                {settings?.email && (
                  <span className="hidden sm:block text-blue-200">{settings.email}</span>
                )}
              </div>
              <Link to="/lien-he"
                className="flex items-center gap-1.5 bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-full text-xs hover:bg-blue-50 transition-colors">
                Tư vấn miễn phí <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top 4 dịch vụ nổi bật ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-site mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.slice(0, 4).map((s, i) => {
              const { Icon, color, bg } = SERVICE_ICONS[i % SERVICE_ICONS.length]
              return (
                <Link key={s.id} to={`/dich-vu/${s.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                  <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={26} className={color} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                  {s.price && <p className="text-orange-600 font-bold text-sm mt-1">{s.price}</p>}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gray-50 py-4">
        <div className="max-w-site mx-auto px-4">
          <div className="bg-blue-700 text-white px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { v: '16+', l: 'Năm hoạt động' },
                { v: '70.000+', l: 'Doanh nghiệp tin tưởng' },
                { v: '1.000+', l: 'Hồ sơ đã xử lý' },
                { v: '24/7', l: 'Hỗ trợ khách hàng' },
              ].map(({ v, l }) => (
                <div key={l} className="border-r border-blue-600 last:border-0">
                  <p className="text-3xl font-bold">{v}</p>
                  <p className="text-blue-200 text-sm mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tất cả dịch vụ ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-site mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Giải pháp toàn diện</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Dịch Vụ Của Chúng Tôi</h2>
            </div>
            <Link to="/dich-vu" className="hidden md:flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm">
              Xem tất cả <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.slice(0, 8).map((s, i) => {
              const { Icon, color, bg } = SERVICE_ICONS[i % SERVICE_ICONS.length]
              return (
                <Link key={s.id} to={`/dich-vu/${s.slug}`}
                  className="bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group overflow-hidden">
                  <div className={`h-1.5 w-full ${i % 2 === 0 ? 'bg-orange-600' : 'bg-blue-600'}`} />
                  <div className="p-5">
                    <div className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon size={22} className={color} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors leading-snug">{s.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
                    {s.price && (
                      <p className="mt-3 text-orange-600 font-bold text-sm">{s.price}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-6 md:hidden">
            <Link to="/dich-vu"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
              Xem tất cả dịch vụ <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tại sao chọn chúng tôi ── */}
      <section className="py-14 bg-white">
        <div className="max-w-site mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: why us */}
            <div>
              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Cam kết của chúng tôi</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 mb-6">Tại Sao Chọn Kế Toán Minh Châu?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyUs.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/gioi-thieu"
                className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
                Tìm hiểu thêm <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right: process */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 text-center">Quy Trình Làm Việc</h3>
              <div className="space-y-5">
                {steps.map(({ n, t, d }) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
                    <div className="border-b border-gray-100 pb-5 flex-1 last:border-0 last:pb-0">
                      <p className="font-semibold text-gray-900 text-sm">{t}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Đội ngũ ── */}
      {teamMembers.filter(m => m.isActive).length > 0 && (
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-site mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Con người của chúng tôi</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Đội Ngũ Của Chúng Tôi</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm đồng hành cùng doanh nghiệp của bạn</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.filter(m => m.isActive).map((member) => (
                <div key={member.id} className="group text-center">
                  <div className="relative mx-auto w-28 h-28 mb-4">
                    {member.avatar
                      ? <img src={imgUrl(member.avatar)} alt={member.name}
                          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg group-hover:border-blue-100 transition-all duration-300" />
                      : <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-white shadow-md text-white font-bold text-3xl">
                          {member.name.split(' ').pop()?.charAt(0)}
                        </div>
                    }
                    <div className="absolute inset-0 rounded-full ring-2 ring-blue-600/0 group-hover:ring-blue-600/30 transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                  <p className="text-orange-600 text-xs font-medium mt-0.5">{member.title}</p>
                  {member.bio && (
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2 px-2">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tin tức & kiến thức ── */}
      {posts.length > 0 && (
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-site mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Chia sẻ kinh nghiệm</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Tin Tức & Kiến Thức</h2>
              </div>
              <Link to="/tin-tuc" className="hidden md:flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm">
                Xem tất cả <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Featured post */}
              {featuredPost && (
                <Link to={`/tin-tuc/${featuredPost.slug}`}
                  className="lg:col-span-3 group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                  {featuredPost.thumbnail
                    ? <img src={imgUrl(featuredPost.thumbnail)} alt={featuredPost.title}
                        className="w-full h-56 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-56 md:h-72 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FileText size={48} className="text-blue-400" />
                      </div>
                  }
                  <div className="p-5">
                    {featuredPost.category && (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        {featuredPost.category.name}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg mt-3 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4">
                      <Calendar size={12} />
                      {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                </Link>
              )}

              {/* Side posts list */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {sidePosts.map((post) => (
                  <Link key={post.id} to={`/tin-tuc/${post.slug}`}
                    className="group flex gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                    {post.thumbnail
                      ? <img src={imgUrl(post.thumbnail)} alt={post.title}
                          className="w-20 h-16 object-cover rounded-lg shrink-0 group-hover:opacity-90 transition-opacity" />
                      : <div className="w-20 h-16 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-blue-400" />
                        </div>
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                        <Calendar size={11} />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link to="/tin-tuc"
                  className="flex items-center justify-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm py-2 border border-orange-200 hover:border-orange-400 rounded-xl transition-colors mt-1">
                  Xem thêm bài viết <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Đánh giá khách hàng ── */}
      {testimonials.length > 0 && (
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-site mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Khách hàng nói gì</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Đánh Giá Từ Khách Hàng</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < t.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    {t.avatar
                      ? <img src={imgUrl(t.avatar)} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      : <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {t.name.split(' ').pop()?.charAt(0)}
                        </div>
                    }
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role} — {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Form liên hệ ── */}
      <section className="py-14 bg-blue-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Nhận Tư Vấn Miễn Phí</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Để lại thông tin, chuyên viên kế toán của chúng tôi sẽ liên hệ tư vấn miễn phí trong vòng 30 phút.
              </p>
              <ul className="space-y-2">
                {['Tư vấn 100% miễn phí, không ràng buộc', 'Báo giá chi tiết, không ẩn phí', 'Hỗ trợ tận tâm 7 ngày/tuần'].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                    <CheckCircle2 size={15} className="text-blue-300 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
              {settings?.hotline && (
                <a href={`tel:${settings.hotline}`}
                  className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors">
                  <Phone size={16} /> {settings.hotline}
                </a>
              )}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating contact buttons ── */}
      <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-2">
        {settings?.hotline && (
          <a href={`tel:${settings.hotline}`}
            className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            title="Gọi điện">
            <Phone size={20} />
          </a>
        )}
        {settings?.zalo && (
          <a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer"
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            title="Zalo">
            <MessageCircle size={20} />
          </a>
        )}
      </div>
    </div>
  )
}
