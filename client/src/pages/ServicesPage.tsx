import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Phone } from 'lucide-react'
import { fetchServices, fetchSettings } from '../api'

export default function ServicesPage() {
  const { data: services = [], isLoading } = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-site mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Dịch Vụ</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Giải pháp kế toán, thuế và pháp lý toàn diện cho doanh nghiệp
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-site mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Link key={s.id} to={`/dich-vu/${s.slug}`}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col">
                  <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-5 text-3xl transition-colors">
                    {s.icon?.startsWith('fa') ? '📋' : (s.icon ?? '📋')}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{s.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{s.description}</p>
                  {s.price && (
                    <p className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 inline-block">{s.price}</p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Tìm hiểu thêm <ArrowRight size={15} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy dịch vụ phù hợp?</h2>
          <p className="text-gray-500 mb-6">Liên hệ trực tiếp để được tư vấn giải pháp phù hợp với nhu cầu của bạn</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/lien-he"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              Liên hệ tư vấn <ArrowRight size={16} />
            </Link>
            <a href={`tel:${settings?.hotline}`}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors">
              <Phone size={16} className="text-blue-600" /> {settings?.hotline ?? 'Gọi ngay'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
