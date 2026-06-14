import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, CheckCircle } from 'lucide-react'
import { fetchService, fetchSettings, fetchServices } from '../api'
import ContactForm from '../components/ui/ContactForm'

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => fetchService(slug!),
    enabled: !!slug,
  })
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: allServices = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices })

  const related = allServices.filter((s) => s.slug !== slug).slice(0, 4)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </div>
  )

  if (isError || !service) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-gray-500">Không tìm thấy dịch vụ này.</p>
      <Link to="/dich-vu" className="text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={15} /> Quay lại dịch vụ</Link>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/dich-vu" className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft size={15} /> Tất cả dịch vụ
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shrink-0">
              {service.icon?.startsWith('fa') ? '📋' : (service.icon ?? '📋')}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{service.title}</h1>
              <p className="text-blue-100 text-lg max-w-2xl">{service.description}</p>
              {service.price && (
                <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm text-white font-semibold px-4 py-2 rounded-xl text-sm">
                  {service.price}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Content */}
            <div className="lg:col-span-2">
              {service.content ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: service.content }} />
              ) : (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết dịch vụ</h2>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Bao gồm những gì?</h3>
                    <ul className="space-y-2">
                      {[
                        'Tư vấn ban đầu miễn phí',
                        'Soạn thảo và nộp hồ sơ',
                        'Theo dõi tiến trình và cập nhật kết quả',
                        'Hỗ trợ sau khi hoàn tất',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Related services */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Dịch vụ liên quan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((s) => (
                      <Link key={s.id} to={`/dich-vu/${s.slug}`}
                        className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-200">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shrink-0 shadow-sm">
                          {s.icon?.startsWith('fa') ? '📋' : (s.icon ?? '📋')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 text-sm transition-colors">{s.title}</p>
                          {s.price && <p className="text-xs text-blue-600 mt-0.5">{s.price}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                <ContactForm
                  title="Đăng ký tư vấn"
                  subtitle="Chuyên viên sẽ gọi lại trong 30 phút"
                  serviceDefault={service.title}
                />
              </div>

              <div className="bg-blue-600 text-white rounded-2xl p-5 text-center">
                <p className="font-semibold mb-1">Cần hỗ trợ ngay?</p>
                <p className="text-blue-100 text-sm mb-4">Gọi trực tiếp để được giải đáp</p>
                <a href={`tel:${settings?.hotline}`}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                  <Phone size={15} /> {settings?.hotline ?? 'Gọi ngay'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
