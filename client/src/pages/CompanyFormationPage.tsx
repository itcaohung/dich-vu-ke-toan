import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle, ChevronDown, ChevronUp, Phone, ArrowRight,
  FileText, Clock, Star, Building2, Stamp, BookOpen,
} from 'lucide-react'
import { fetchSettings } from '../api'
import ContactForm from '../components/ui/ContactForm'

const PRICE = '1.500.000đ'
const DAYS  = '3 ngày'

const conditions = [
  'Tên công ty: Không trùng, không gây nhầm lẫn với công ty đã đăng ký',
  'Trụ sở: Có địa chỉ cụ thể (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)',
  'Vốn điều lệ: Không quy định mức tối thiểu (trừ ngành nghề có điều kiện)',
  'Ngành nghề: Đăng ký ngành nghề phù hợp, không vi phạm pháp luật',
  'Người đại diện pháp luật: Từ 18 tuổi, không bị cấm thành lập doanh nghiệp',
]

const documents = [
  'CMND/CCCD/Hộ chiếu của tất cả thành viên góp vốn (còn hiệu lực)',
  'Thông tin tên công ty, địa chỉ trụ sở, vốn điều lệ, ngành nghề kinh doanh',
  'Tỷ lệ vốn góp của từng thành viên (nếu có nhiều thành viên)',
  'Thông tin người đại diện theo pháp luật (họ tên, địa chỉ, chức danh)',
]

const steps = [
  {
    num: '01',
    title: 'Chuẩn bị hồ sơ',
    desc: 'Chuyên viên tư vấn miễn phí, hỗ trợ chuẩn bị toàn bộ hồ sơ đăng ký: giấy đề nghị, điều lệ công ty, danh sách thành viên/cổ đông.',
    icon: FileText,
  },
  {
    num: '02',
    title: 'Nộp đăng ký kinh doanh',
    desc: 'Nộp hồ sơ lên Cổng thông tin quốc gia về đăng ký doanh nghiệp, nộp phí công bố thông tin theo quy định.',
    icon: Building2,
  },
  {
    num: '03',
    title: 'Khắc dấu & bàn giao',
    desc: 'Sau khi có Giấy chứng nhận đăng ký doanh nghiệp, tiến hành khắc con dấu pháp nhân và bàn giao toàn bộ hồ sơ cho khách hàng.',
    icon: Stamp,
  },
]

const deliverables = [
  'Giấy chứng nhận đăng ký doanh nghiệp (có mã số thuế)',
  'Con dấu pháp nhân của công ty',
  'Điều lệ công ty đã được xác nhận',
  'Danh sách thành viên/cổ đông sáng lập',
  'Tư vấn mở tài khoản ngân hàng doanh nghiệp',
  'Hướng dẫn in hóa đơn điện tử, đăng ký chữ ký số',
  'Tư vấn nghĩa vụ thuế sau thành lập',
  'Hỗ trợ đăng ký bảo hiểm xã hội (nếu có nhân viên)',
]

const reasons = [
  {
    title: 'Giá cố định, không phát sinh',
    desc: 'Chi phí niêm yết rõ ràng từ đầu, cam kết không có khoản phụ thu ẩn ngoài hợp đồng.',
  },
  {
    title: 'Nhanh — từ 3 ngày làm việc',
    desc: 'Quy trình tối ưu, theo dõi tiến độ hồ sơ liên tục, thông báo ngay khi có kết quả.',
  },
  {
    title: 'Đội ngũ giàu kinh nghiệm',
    desc: 'Hơn 16 năm tư vấn thành lập doanh nghiệp, xử lý 70.000+ hồ sơ thành công.',
  },
  {
    title: 'Hỗ trợ hậu thành lập',
    desc: 'Đồng hành sau khi ra giấy phép: kế toán, thuế, bảo hiểm, chữ ký số — trọn gói.',
  },
]

const faqs = [
  {
    q: 'Thành lập công ty TNHH hay công ty cổ phần?',
    a: 'Công ty TNHH phù hợp với doanh nghiệp vừa và nhỏ, cơ cấu đơn giản, tối thiểu 1 thành viên. Công ty cổ phần phù hợp khi cần huy động vốn rộng rãi, tối thiểu 3 cổ đông. Chuyên viên sẽ tư vấn loại hình phù hợp nhất với nhu cầu của bạn.',
  },
  {
    q: 'Vốn điều lệ tối thiểu là bao nhiêu?',
    a: 'Pháp luật không quy định vốn điều lệ tối thiểu chung. Tuy nhiên, một số ngành nghề có điều kiện (kinh doanh bất động sản, tài chính, y tế…) yêu cầu vốn pháp định tối thiểu riêng. Chúng tôi tư vấn cụ thể theo ngành bạn đăng ký.',
  },
  {
    q: 'Địa chỉ trụ sở có thể là nhà riêng không?',
    a: 'Có thể dùng nhà riêng làm trụ sở nếu không thuộc chung cư (nhà ở chung cư không được đăng ký trụ sở kinh doanh theo quy định). Nếu chưa có địa chỉ, chúng tôi hỗ trợ địa chỉ văn phòng ảo.',
  },
  {
    q: 'Sau khi có giấy phép, bao lâu phải nộp thuế?',
    a: 'Trong vòng 30 ngày kể từ ngày cấp giấy chứng nhận đăng ký doanh nghiệp, cần đăng ký phương pháp tính thuế GTGT. Tờ khai thuế môn bài nộp chậm nhất ngày 30/01 năm tiếp theo. Chuyên viên kế toán sẽ hướng dẫn đầy đủ.',
  },
  {
    q: 'Không có chuyên môn kế toán, có tự quản lý được không?',
    a: 'Doanh nghiệp bắt buộc phải tổ chức kế toán theo Luật kế toán. Nếu chưa có bộ phận kế toán nội bộ, bạn có thể sử dụng dịch vụ kế toán trọn gói của chúng tôi từ 500.000đ/tháng — an toàn, đúng pháp luật.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span>{q}</span>
        {open ? <ChevronUp size={18} className="shrink-0 text-blue-600" /> : <ChevronDown size={18} className="shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function CompanyFormationPage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-14">
        <div className="max-w-site mx-auto px-4">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white">Thành lập công ty</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                Dịch vụ uy tín — 16 năm kinh nghiệm
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Dịch Vụ Thành Lập Công Ty Trọn Gói
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Tư vấn miễn phí, chuẩn bị hồ sơ, nộp đăng ký và bàn giao giấy phép tận nơi. Nhanh chóng — uy tín — không phát sinh chi phí.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-yellow-300">{PRICE}</p>
                  <p className="text-blue-200 text-xs mt-0.5">Trọn gói, cố định</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-yellow-300">{DAYS}</p>
                  <p className="text-blue-200 text-xs mt-0.5">Hoàn thành hồ sơ</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/lien-he"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                  Tư vấn miễn phí <ArrowRight size={16} />
                </Link>
                {settings?.hotline && (
                  <a href={`tel:${settings.hotline}`}
                    className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                    <Phone size={16} /> {settings.hotline}
                  </a>
                )}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <ContactForm title="Đăng ký tư vấn ngay" subtitle="Chuyên viên gọi lại trong 30 phút" />
            </div>
          </div>
        </div>
      </section>

      {/* Điều kiện & Hồ sơ */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-site mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Chuẩn bị</p>
            <h2 className="text-3xl font-bold text-gray-900">Điều Kiện & Hồ Sơ Cần Thiết</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> Điều kiện thành lập
              </h3>
              <ul className="space-y-3">
                {conditions.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" /> Thông tin cần cung cấp
              </h3>
              <ul className="space-y-3">
                {documents.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình */}
      <section className="py-14 bg-white">
        <div className="max-w-site mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Quy trình</p>
            <h2 className="text-3xl font-bold text-gray-900">3 Bước Thành Lập Công Ty</h2>
            <p className="text-gray-500 mt-2">Chúng tôi xử lý toàn bộ — bạn chỉ cần cung cấp thông tin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="relative bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                    {num}
                  </div>
                  <Icon size={22} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock size={15} className="text-blue-500" />
            Thời gian hoàn thành: <strong className="text-gray-900">từ {DAYS} làm việc</strong>
          </div>
        </div>
      </section>

      {/* Kết quả bàn giao */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-site mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Bàn giao</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Khách Hàng Nhận Được Gì?</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Sau khi hoàn thành hồ sơ, chúng tôi bàn giao trọn bộ giấy tờ pháp lý và hỗ trợ các bước tiếp theo để doanh nghiệp đi vào hoạt động ngay.
              </p>
              <ul className="space-y-3">
                {deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Lý do chọn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map(({ title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle size={16} className="text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bảng giá */}
      <section className="py-14 bg-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">Chi phí</p>
          <h2 className="text-3xl font-bold mb-2">Bảng Giá Dịch Vụ</h2>
          <p className="text-blue-200 mb-8">Giá cố định, minh bạch — không phát sinh thêm</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl text-left">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-5 py-3 text-gray-700 font-semibold">Dịch vụ</th>
                  <th className="px-5 py-3 text-gray-700 font-semibold text-right">Phí dịch vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {[
                  ['Thành lập công ty TNHH 1 thành viên', '1.500.000đ'],
                  ['Thành lập công ty TNHH 2+ thành viên', '1.500.000đ'],
                  ['Thành lập công ty cổ phần', '2.000.000đ'],
                  ['Thành lập công ty FDI (vốn nước ngoài)', 'Từ 15.000.000đ'],
                  ['Phí nhà nước (nộp hộ)', 'Theo quy định'],
                  ['Khắc dấu pháp nhân', 'Bao gồm trong gói'],
                ].map(([name, price]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-5 py-3">{name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-600">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-blue-200 text-xs mt-4">* Giá chưa bao gồm VAT. Liên hệ để được báo giá chính xác theo từng trường hợp cụ thể.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Câu hỏi thường gặp</p>
            <h2 className="text-3xl font-bold text-gray-900">Giải Đáp Thắc Mắc</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <BookOpen size={36} className="text-blue-600 mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sẵn Sàng Thành Lập Công Ty?</h2>
              <p className="text-gray-500">Điền thông tin bên dưới — chuyên viên tư vấn gọi lại trong 30 phút</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
