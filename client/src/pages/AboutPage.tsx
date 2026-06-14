import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Users, Award, FileText, Clock, ArrowRight } from 'lucide-react'
import { fetchSettings, fetchOffices } from '../api'

export default function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: offices = [] } = useQuery({ queryKey: ['offices'], queryFn: fetchOffices })

  const stats = [
    { value: '500+', label: 'Khách hàng tin tưởng', icon: Users },
    { value: '10+', label: 'Năm kinh nghiệm', icon: Award },
    { value: '1000+', label: 'Hồ sơ đã xử lý', icon: FileText },
    { value: '24/7', label: 'Hỗ trợ liên tục', icon: Clock },
  ]

  const values = [
    { title: 'Uy tín', desc: 'Cam kết chất lượng dịch vụ, minh bạch chi phí, không phát sinh ngoài hợp đồng.' },
    { title: 'Chuyên nghiệp', desc: 'Đội ngũ kế toán – luật sư được đào tạo bài bản, có chứng chỉ hành nghề.' },
    { title: 'Tận tâm', desc: 'Luôn đặt lợi ích khách hàng lên hàng đầu, hỗ trợ tận tình từ A đến Z.' },
    { title: 'Đúng hạn', desc: 'Cam kết hoàn thành hồ sơ đúng thời gian đã thỏa thuận.' },
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Về Chúng Tôi</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            {settings?.site_description ?? 'Đơn vị tư vấn kế toán – thuế – pháp lý doanh nghiệp uy tín hàng đầu'}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {settings?.site_name ?? 'Kế Toán Minh Châu'} được thành lập với sứ mệnh đồng hành cùng doanh nghiệp Việt trong hành trình phát triển bền vững. Chúng tôi hiểu rằng mỗi doanh nghiệp có những thách thức riêng trong quản lý tài chính và tuân thủ pháp luật.
                </p>
                <p>
                  Với đội ngũ chuyên viên giàu kinh nghiệm, chúng tôi cung cấp dịch vụ kế toán toàn diện, từ thành lập doanh nghiệp, kê khai thuế đến tư vấn pháp lý — giúp khách hàng an tâm tập trung phát triển kinh doanh.
                </p>
                <p>
                  Hơn 10 năm hoạt động, chúng tôi đã phục vụ hơn 500 khách hàng trên khắp cả nước với tỷ lệ hài lòng đạt 98%.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-blue-50 rounded-2xl p-6 text-center">
                  <Icon size={28} className="text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-blue-600">{value}</p>
                  <p className="text-sm text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Văn phòng */}
      {offices.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Hệ Thống Văn Phòng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {offices.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-gray-900 mb-3">{o.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{o.address}</p>
                  <div className="space-y-1">
                    {o.phone && <p className="text-sm text-blue-600"><strong>ĐT:</strong> {o.phone}</p>}
                    {o.email && <p className="text-sm text-gray-500"><strong>Email:</strong> {o.email}</p>}
                  </div>
                  {o.mapUrl && (
                    <a href={o.mapUrl} target="_blank" rel="noreferrer"
                      className="mt-4 inline-block text-xs text-blue-600 hover:underline">Xem bản đồ →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-14 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Sẵn sàng hợp tác cùng chúng tôi?</h2>
          <p className="text-blue-100 mb-6">Liên hệ ngay để được tư vấn miễn phí từ đội ngũ chuyên gia</p>
          <Link to="/lien-he"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">
            Liên hệ ngay <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
