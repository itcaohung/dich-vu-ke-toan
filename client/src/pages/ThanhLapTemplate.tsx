import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle, ChevronDown, ChevronUp, Phone, ArrowRight,
  FileText, Clock, Star, Building2, Stamp, Shield, Users,
  BadgeCheck, Landmark, Receipt, CalendarCheck, AlertCircle, MapPin,
} from 'lucide-react'
import { fetchSettings } from '../api'
import ContactForm from '../components/ui/ContactForm'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProvinceData {
  name: string           // "Đồng Nai"
  slug: string           // "dong-nai"
  price: string          // "1.500.000đ"
  days: string           // "3 ngày"
  intro: string          // intro paragraph
  areas: string[]        // districts/cities covered
  offices: { label: string; address: string }[]
  extraFaqs?: { q: string; a: string }[]
}

// ─── Shared static data ───────────────────────────────────────────────────────

const companyTypes = [
  {
    type: 'Công ty TNHH 1 thành viên',
    price: '1.500.000đ',
    highlight: false,
    members: '1 thành viên',
    pros: ['Dễ quản lý, quyết định nhanh', 'Cơ cấu đơn giản, ít thủ tục', 'Phù hợp khởi nghiệp cá nhân'],
  },
  {
    type: 'Công ty TNHH 2+ thành viên',
    price: '1.500.000đ',
    highlight: true,
    members: '2 – 50 thành viên',
    pros: ['Chia sẻ vốn và rủi ro kinh doanh', 'Phổ biến nhất cho doanh nghiệp SME', 'Linh hoạt bổ sung vốn góp'],
  },
  {
    type: 'Công ty Cổ phần',
    price: '2.000.000đ',
    highlight: false,
    members: 'Tối thiểu 3 cổ đông',
    pros: ['Huy động vốn linh hoạt', 'Phù hợp niêm yết thị trường', 'Chuyển nhượng cổ phần dễ dàng'],
  },
]

const steps = [
  {
    num: '01', icon: FileText, color: 'bg-blue-600', title: 'Chuẩn bị hồ sơ', time: 'Ngày 1',
    items: [
      'Giấy đề nghị đăng ký doanh nghiệp',
      'Dự thảo điều lệ doanh nghiệp',
      'Danh sách thành viên / cổ đông sáng lập',
      'Bản sao CCCD / hộ chiếu của thành viên',
      'Quyết định góp vốn, văn bản cử đại diện',
    ],
  },
  {
    num: '02', icon: Building2, color: 'bg-indigo-600', title: 'Nộp đăng ký kinh doanh', time: 'Ngày 1–2',
    items: [
      'Nộp hồ sơ qua Cổng ĐKDN quốc gia',
      'Nộp lệ phí công bố thông tin doanh nghiệp',
      'Theo dõi và phản hồi yêu cầu bổ sung',
      'Nhận Giấy chứng nhận ĐKDN & mã số thuế',
    ],
  },
  {
    num: '03', icon: Stamp, color: 'bg-green-600', title: 'Khắc dấu & bàn giao', time: 'Ngày 2–3',
    items: [
      'Khắc con dấu pháp nhân cho công ty',
      'Bàn giao giấy phép và toàn bộ hồ sơ',
      'Hướng dẫn các bước sau thành lập',
      'Hỗ trợ mở tài khoản, chữ ký số, hóa đơn',
    ],
  },
]

const deliverables = [
  { icon: BadgeCheck, text: 'Giấy chứng nhận đăng ký doanh nghiệp (đồng thời là mã số thuế)' },
  { icon: Stamp, text: 'Con dấu pháp nhân của công ty' },
  { icon: FileText, text: 'Điều lệ công ty và danh sách thành viên / cổ đông sáng lập' },
  { icon: Landmark, text: 'Hướng dẫn mở tài khoản ngân hàng doanh nghiệp' },
  { icon: Shield, text: 'Hỗ trợ đăng ký chữ ký số và nộp thuế điện tử' },
  { icon: Receipt, text: 'Hỗ trợ tạo mẫu và phát hành hóa đơn điện tử' },
  { icon: CalendarCheck, text: 'Tư vấn kê khai thuế ban đầu và phương pháp tính thuế' },
  { icon: Users, text: 'Tư vấn kế toán – thuế – lao động – bảo hiểm sau thành lập' },
]

const reasons = [
  { icon: Shield, title: 'Giá cố định, không phát sinh', desc: 'Báo giá minh bạch từ đầu, không có chi phí ẩn ngoài hợp đồng.' },
  { icon: Clock, title: 'Xử lý nhanh — từ 3 ngày', desc: 'Quy trình tối ưu, theo dõi tiến độ hồ sơ liên tục và thông báo kịp thời.' },
  { icon: Users, title: 'Đội ngũ giàu kinh nghiệm', desc: 'Gần 10 năm tư vấn, hỗ trợ hàng ngàn doanh nghiệp thành lập thành công.' },
  { icon: BadgeCheck, title: 'Hỗ trợ trọn vẹn hậu thành lập', desc: 'Đồng hành toàn diện: kế toán, thuế, bảo hiểm, chữ ký số, hóa đơn.' },
]

const baseFaqs = [
  {
    q: 'Thành lập công ty cần có trụ sở không?',
    a: 'Có. Khi thành lập công ty bắt buộc phải đăng ký trụ sở chính. Trụ sở phải liên hệ được và có người nhận thư. Nếu cơ quan thuế gửi thông báo mà không nhận được, công ty có thể bị đưa vào danh sách không hoạt động và bị khóa mã số thuế. Lưu ý: trụ sở không được đặt tại nhà chung cư.',
  },
  {
    q: 'Nên thành lập loại hình doanh nghiệp nào?',
    a: 'Ba loại hình phổ biến: (1) Công ty TNHH 1 thành viên — 1 chủ sở hữu, quyết định nhanh, phù hợp khởi nghiệp cá nhân. (2) Công ty TNHH 2+ thành viên — 2 đến 50 thành viên, chia sẻ vốn và rủi ro, phổ biến nhất cho SME. (3) Công ty Cổ phần — tối thiểu 3 cổ đông, phù hợp khi cần huy động vốn lớn hoặc niêm yết. Chỉ nên chọn Cổ phần khi thực sự cần vì quy định nội bộ phức tạp hơn.',
  },
  {
    q: 'Vốn điều lệ tối thiểu là bao nhiêu?',
    a: 'Pháp luật không quy định mức vốn tối thiểu chung. Doanh nghiệp tự kê khai và tự chịu trách nhiệm. Một số ngành có quy định vốn pháp định riêng (bất động sản, tài chính, y tế…). Thời hạn góp đủ vốn là 90 ngày kể từ ngày cấp Giấy chứng nhận đăng ký doanh nghiệp.',
  },
  {
    q: 'Được đăng ký bao nhiêu ngành nghề kinh doanh?',
    a: 'Không giới hạn số ngành nghề, miễn là pháp luật không cấm. Nên đăng ký nhiều ngành nghề rộng ngay từ đầu để tránh phải làm thủ tục bổ sung sau này khi phát sinh nhu cầu kinh doanh mới.',
  },
  {
    q: 'Ai có quyền thành lập công ty?',
    a: 'Cá nhân từ đủ 18 tuổi, không thuộc diện cấm theo luật. Không phụ thuộc hộ khẩu thường trú — bạn có thể lập công ty ở bất kỳ tỉnh/thành nào theo nhu cầu kinh doanh. Cán bộ, công chức nhà nước không được đứng tên thành lập công ty (trừ đầu tư dạng mua cổ phần).',
  },
  {
    q: 'Công ty chưa có doanh thu có phải kê khai thuế không?',
    a: 'Vẫn phải kê khai dù chưa có doanh thu: (1) Tờ khai VAT hàng quý — kê khai "không phát sinh". (2) Báo cáo tài chính năm — bắt buộc. Chỉ không phải nộp thuế TNDN nếu không có lợi nhuận. Bỏ qua kê khai sẽ bị phạt từ 1–3 triệu đồng/lần.',
  },
  {
    q: 'Ưu điểm của công ty so với hộ kinh doanh?',
    a: 'Công ty có tư cách pháp nhân, chịu trách nhiệm hữu hạn trong phạm vi vốn góp. Xuất được hóa đơn VAT giúp đối tác khấu trừ thuế đầu vào — lợi thế lớn khi làm việc với doanh nghiệp. VAT là thuế thu hộ nhà nước từ khách hàng, không phải chi phí thực của doanh nghiệp. Hộ kinh doanh chịu thuế khoán theo doanh thu kể cả khi lỗ.',
  },
  {
    q: 'Không có chuyên môn kế toán, có tự quản lý sổ sách được không?',
    a: 'Doanh nghiệp bắt buộc tổ chức kế toán theo Luật kế toán. Nếu chưa có bộ phận kế toán nội bộ, bạn có thể sử dụng dịch vụ kế toán trọn gói từ 500.000đ/tháng — đảm bảo đúng pháp luật, tránh rủi ro bị phạt. Dịch vụ bao gồm kê khai thuế, lập báo cáo tài chính, quyết toán thuế cuối năm.',
  },
]

const pricing = [
  { name: 'Thành lập công ty TNHH 1 thành viên', price: '1.500.000đ' },
  { name: 'Thành lập công ty TNHH 2+ thành viên', price: '1.500.000đ' },
  { name: 'Thành lập công ty cổ phần', price: '2.000.000đ' },
  { name: 'Thành lập công ty FDI (vốn nước ngoài)', price: 'Từ 15.000.000đ' },
  { name: 'Phí nhà nước (nộp hộ)', price: 'Theo quy định' },
  { name: 'Khắc dấu pháp nhân', price: 'Bao gồm trong gói' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-blue-300' : 'border-gray-200'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm md:text-base">{q}</span>
        {open ? <ChevronUp size={18} className="shrink-0 text-blue-600" /> : <ChevronDown size={18} className="shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3">{a}</div>
      )}
    </div>
  )
}

// ─── Main Template ─────────────────────────────────────────────────────────────

export default function ThanhLapTemplate({ data }: { data: ProvinceData }) {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const faqs = [...baseFaqs, ...(data.extraFaqs ?? [])]

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link to="/thanh-lap-cong-ty" className="hover:text-white transition-colors">Thành lập công ty</Link>
            <span>/</span>
            <span className="text-white">{data.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                Dịch vụ uy tín — gần 10 năm kinh nghiệm
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Thành Lập Công Ty<br className="hidden md:block" /> Tại {data.name}
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed mb-7">{data.intro}</p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                  <p className="text-3xl font-bold text-yellow-300">{data.price}</p>
                  <p className="text-blue-200 text-xs mt-1">Trọn gói — cố định</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                  <p className="text-3xl font-bold text-yellow-300">{data.days}</p>
                  <p className="text-blue-200 text-xs mt-1">Hoàn thành hồ sơ</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/lien-he" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow">
                  Tư vấn miễn phí <ArrowRight size={16} />
                </Link>
                {settings?.hotline && (
                  <a href={`tel:${settings.hotline}`} className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                    <Phone size={16} /> {settings.hotline}
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <ContactForm title="Đăng ký tư vấn ngay" subtitle="Chuyên viên gọi lại trong 30 phút" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Khu vực phục vụ ──────────────────────────────────── */}
      <section className="bg-blue-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-300 font-semibold text-sm whitespace-nowrap">
              <MapPin size={16} />
              Khu vực phục vụ tại {data.name}:
            </div>
            <div className="flex flex-wrap gap-2">
              {data.areas.map((area) => (
                <span key={area} className="bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full border border-white/20">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hồ sơ cần thiết ─────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">Chuẩn bị</span>
            <h2 className="text-3xl font-bold text-gray-900">Khách Hàng Cần Cung Cấp Gì?</h2>
            <p className="text-gray-500 mt-2">Chúng tôi chuẩn bị toàn bộ hồ sơ — bạn chỉ cần cung cấp 2 thứ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Giấy tờ cá nhân</h3>
              </div>
              <ul className="space-y-3">
                {['Bản sao CCCD / CMND / Hộ chiếu còn hiệu lực của tất cả thành viên, cổ đông sáng lập và người đại diện pháp luật'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Thông tin công ty</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Tên công ty dự kiến (chuẩn bị 2–3 phương án phòng trùng)',
                  'Địa chỉ trụ sở chính tại ' + data.name,
                  'Vốn điều lệ và tỷ lệ góp vốn của từng thành viên',
                  'Ngành nghề kinh doanh dự kiến',
                  'Họ tên và chức danh người đại diện pháp luật',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-500" />
            <span><strong>Lưu ý:</strong> Trụ sở không được đặt tại nhà chung cư. Nên ký hợp đồng thuê mặt bằng và cung cấp bản sao sổ đỏ của chủ nhà khi đăng ký.</span>
          </div>
        </div>
      </section>

      {/* ── Loại hình doanh nghiệp ──────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">Loại hình</span>
            <h2 className="text-3xl font-bold text-gray-900">Nên Chọn Loại Hình Nào?</h2>
            <p className="text-gray-500 mt-2">So sánh 3 loại hình phổ biến nhất để lựa chọn phù hợp</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyTypes.map(({ type, price, highlight, members, pros }) => (
              <div key={type} className={`rounded-2xl p-6 border-2 ${highlight ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' : 'border-gray-200 bg-white'}`}>
                {highlight && (
                  <div className="inline-block bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">Phổ biến nhất</div>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{type}</h3>
                <p className={`text-2xl font-bold mb-4 ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>{price}</p>
                <p className="text-xs text-gray-400 mb-4">{members}</p>
                <ul className="space-y-2">
                  {pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quy trình ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">Quy trình</span>
            <h2 className="text-3xl font-bold text-gray-900">3 Bước Thành Lập Công Ty</h2>
            <p className="text-gray-500 mt-2">Chúng tôi xử lý toàn bộ — bạn chỉ cần ngồi chờ nhận kết quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ num, icon: Icon, title, time, color, items }) => (
              <div key={num} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0`}>{num}</div>
                  <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={11} />{time}</p>
                  </div>
                </div>
                <Icon size={28} className="text-gray-200 mb-4" />
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kết quả & Lý do chọn ────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4">Kết quả bàn giao</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Khách Hàng Nhận Được Gì?</h2>
              <ul className="space-y-4">
                {deliverables.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed pt-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4">Tại sao chọn chúng tôi</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4 Lý Do Tin Tưởng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reasons.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 text-sm">{title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bảng giá ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-blue-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-4">Chi phí</span>
          <h2 className="text-3xl font-bold mb-2">Bảng Giá Dịch Vụ</h2>
          <p className="text-blue-200 mb-8">Giá cố định, minh bạch — không phát sinh thêm</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-3 bg-blue-50 border-b border-gray-100 grid grid-cols-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span>Dịch vụ</span><span className="text-right">Phí dịch vụ</span>
            </div>
            <div className="divide-y divide-gray-100">
              {pricing.map(({ name, price }) => (
                <div key={name} className="px-5 py-3.5 grid grid-cols-2 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className="text-right font-bold text-blue-600">{price}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-300 text-xs mt-4">* Giá chưa bao gồm VAT. Liên hệ để được báo giá chính xác.</p>
        </div>
      </section>

      {/* ── Văn phòng ─────────────────────────────────────────── */}
      {data.offices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">Văn phòng</span>
              <h2 className="text-3xl font-bold text-gray-900">Văn Phòng Tại {data.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.offices.map(({ label, address }) => (
                <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">{label}</p>
                    <p className="text-sm text-gray-500">{address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">Câu hỏi thường gặp</span>
            <h2 className="text-3xl font-bold text-gray-900">Giải Đáp Thắc Mắc</h2>
            <p className="text-gray-500 mt-2">Những câu hỏi khách hàng hỏi nhiều nhất khi thành lập công ty tại {data.name}</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sẵn Sàng Thành Lập Công Ty Tại {data.name}?</h2>
              <p className="text-gray-500">Để lại thông tin — chuyên viên tư vấn gọi lại trong <strong>30 phút</strong></p>
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
