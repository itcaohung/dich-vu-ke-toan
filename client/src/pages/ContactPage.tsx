import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { fetchSettings, fetchOffices } from '../api'
import ContactForm from '../components/ui/ContactForm'

export default function ContactPage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: offices = [] } = useQuery({ queryKey: ['offices'], queryFn: fetchOffices })

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Liên Hệ</h1>
          <p className="text-blue-100 text-lg">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <ContactForm
                title="Gửi yêu cầu tư vấn"
                subtitle="Chúng tôi sẽ liên hệ lại trong vòng 30 phút"
              />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  {settings?.hotline && (
                    <a href={`tel:${settings.hotline}`}
                      className="flex items-start gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Hotline</p>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{settings.hotline}</p>
                        <p className="text-xs text-gray-400">Hỗ trợ 7 ngày/tuần, 8:00 – 18:00</p>
                      </div>
                    </a>
                  )}
                  {settings?.email && (
                    <a href={`mailto:${settings.email}`}
                      className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                      <div className="w-10 h-10 bg-gray-700 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{settings.email}</p>
                      </div>
                    </a>
                  )}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Giờ làm việc</p>
                      <p className="font-semibold text-gray-900">Thứ 2 – Thứ 7: 8:00 – 18:00</p>
                      <p className="text-xs text-gray-400">Chủ nhật: 8:00 – 12:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offices */}
              {offices.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Văn phòng</h3>
                  <div className="space-y-3">
                    {offices.map((o) => (
                      <div key={o.id} className="p-4 border border-gray-100 rounded-xl">
                        <p className="font-semibold text-gray-900 mb-2">{o.name}</p>
                        <div className="space-y-1">
                          <p className="flex items-start gap-2 text-sm text-gray-500">
                            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" /> {o.address}
                          </p>
                          {o.phone && (
                            <p className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone size={14} className="text-blue-500 shrink-0" />
                              <a href={`tel:${o.phone}`} className="hover:text-blue-600">{o.phone}</a>
                            </p>
                          )}
                        </div>
                        {o.mapUrl && (
                          <a href={o.mapUrl} target="_blank" rel="noreferrer"
                            className="inline-block mt-2 text-xs text-blue-600 hover:underline">Xem bản đồ →</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
