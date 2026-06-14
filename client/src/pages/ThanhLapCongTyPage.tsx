import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle, ChevronDown, ChevronUp, Phone, ArrowRight,
  FileText, Clock, Star, Building2, Stamp, Shield, Users,
  BadgeCheck, Landmark, Receipt, CalendarCheck, AlertCircle,
} from 'lucide-react'
import { fetchSettings } from '../api'
import ContactForm from '../components/ui/ContactForm'

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '5.000+', label: 'Doanh nghiệp hỗ trợ' },
  { value: '3 ngày', label: 'Hoàn thành hồ sơ' },
  { value: '100%', label: 'Đúng pháp luật' },
]

const companyTypes = [
  {
    type: 'Công ty TNHH 1 thành viên',
    price: '1.500.000đ',
    highlight: false,
    members: '1 thành viên',
    liability: 'Hữu hạn theo vốn góp',
    capital: 'Tự kê khai',
    pros: [
      'Dễ quản lý, quyết định nhanh',
      'Cơ cấu đơn giản, ít thủ tục',
      'Phù hợp khởi nghiệp cá nhân',
    ],
  },
  {
    type: 'Công ty TNHH 2+ thành viên',
    price: '1.500.000đ',
    highlight: true,
    members: '2 – 50 thành viên',
    liability: 'Hữu hạn theo vốn góp',
    capital: 'Tự kê khai',
    pros: [
      'Chia sẻ vốn và rủi ro',
      'Phổ biến nhất cho SME',
      'Linh hoạt góp vốn thêm',
    ],
  },
  {
    type: 'Công ty Cổ phần',
    price: '2.000.000đ',
    highlight: false,
    members: 'Tối thiểu 3 cổ đông',
    liability: 'Hữu hạn theo cổ phần',
    capital: 'Tự kê khai',
    pros: [
      'Huy động vốn linh hoạt',
      'Phù hợp niêm yết cổ phiếu',
      'Chuyển nhượng cổ phần dễ',
    ],
  },
]

const steps = [
  {
    num: '01',
    icon: FileText,
    title: 'Chuẩn bị hồ sơ',
    time: 'Ngày 1',
    color: 'bg-blue-600',
    items: [
      'Giấy đề nghị đăng ký doanh nghiệp',
      'Dự thảo điều lệ doanh nghiệp',
      'Danh sách thành viên / cổ đông sáng lập',
      'Bản sao CCCD / hộ chiếu của thành viên',
      'Quyết định góp vốn, văn bản cử đại diện',
      'Hợp đồng ủy quyền dịch vụ',
    ],
  },
  {
    num: '02',
    icon: Building2,
    title: 'Nộp đăng ký kinh doanh',
    time: 'Ngày 1–2',
    color: 'bg-indigo-600',
    items: [
      'Nộp hồ sơ qua Cổng ĐKDN quốc gia',
      'Nộp lệ phí công bố thông tin doanh nghiệp',
      'Theo dõi và phản hồi yêu cầu bổ sung (nếu có)',
      'Nhận Giấy chứng nhận ĐKDN & mã số thuế',
    ],
  },
  {
    num: '03',
    icon: Stamp,
    title: 'Khắc dấu & bàn giao',
    time: 'Ngày 2–3',
    color: 'bg-green-600',
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
  { icon: Shield, text: 'Hướng dẫn đăng ký chữ ký số và nộp thuế điện tử' },
  { icon: Receipt, text: 'Hỗ trợ tạo mẫu và phát hành hóa đơn điện tử' },
  { icon: CalendarCheck, text: 'Tư vấn kê khai thuế ban đầu và đăng ký phương pháp tính thuế' },
  { icon: Users, text: 'Tư vấn trọn gói kế toán – thuế – lao động – bảo hiểm sau thành lập' },
]

const postSteps = [
  { num: 1, title: 'Mở tài khoản ngân hàng', desc: 'Mở tài khoản doanh nghiệp tại ngân hàng, đăng ký số tài khoản với cơ quan thuế trong vòng 10 ngày.' },
  { num: 2, title: 'Đăng ký chữ ký số (Token)', desc: 'Đăng ký chữ ký số để nộp tờ khai thuế điện tử và ký các văn bản điện tử hợp pháp.' },
  { num: 3, title: 'Đăng ký nộp thuế điện tử', desc: 'Liên kết tài khoản ngân hàng để nộp thuế điện tử — không cần đến Chi cục Thuế.' },
  { num: 4, title: 'Nộp tờ khai thuế môn bài', desc: 'Doanh nghiệp thành lập từ 2021 được miễn thuế môn bài năm đầu, nhưng vẫn phải nộp tờ khai trước 30/01 năm sau.' },
  { num: 5, title: 'Phát hành hóa đơn điện tử', desc: 'Đăng ký với cơ quan thuế, chọn nhà cung cấp, tạo mẫu và thông báo phát hành trước khi sử dụng.' },
  { num: 6, title: 'Treo bảng hiệu công ty', desc: 'Treo biển tên tại trụ sở chính, thể hiện đầy đủ tên công ty, mã số thuế và địa chỉ theo quy định.' },
]

const taxes = [
  {
    name: 'Thuế môn bài',
    rate: 'Cố định theo vốn điều lệ',
    deadline: 'Trước 30/01 năm sau (miễn năm đầu nếu thành lập từ 2021)',
    icon: Receipt,
  },
  {
    name: 'Thuế Giá trị gia tăng (VAT)',
    rate: '10% (hoặc 0%, 5% tùy ngành)',
    deadline: 'Kê khai theo quý: Q1→30/4 | Q2→30/7 | Q3→30/10 | Q4→30/1',
    icon: Landmark,
  },
  {
    name: 'Thuế Thu nhập doanh nghiệp (TNDN)',
    rate: '20% lợi nhuận (chỉ nộp khi có lãi)',
    deadline: 'Tạm nộp theo quý, quyết toán trước 31/3 năm sau',
    icon: CalendarCheck,
  },
  {
    name: 'Báo cáo tài chính năm',
    rate: 'Bắt buộc kể cả khi chưa phát sinh doanh thu',
    deadline: 'Nộp trước 31/3 năm sau',
    icon: FileText,
  },
]

const faqs = [
  {
    q: 'Khi thành lập công ty có cần trụ sở không?',
    a: 'Có. Khi thành lập công ty bắt buộc phải đăng ký trụ sở chính. Trụ sở phải liên hệ được và có người nhận thư. Nếu cơ quan thuế gửi thông báo mà không nhận được, công ty có thể bị đưa vào danh sách không hoạt động và bị khóa mã số thuế. Khi thuê địa điểm, nên ký hợp đồng thuê và yêu cầu chủ nhà cung cấp bản sao sổ đỏ.',
  },
  {
    q: 'Trụ sở công ty có được đặt tại nhà chung cư không?',
    a: 'Không. Theo quy định pháp luật hiện hành, trụ sở công ty không được đặt tại nhà tập thể, nhà chung cư. Lý do: chung cư được xác định là nơi ở, đất thuộc sở hữu chung, không phục vụ mục đích kinh doanh riêng lẻ. Bạn có thể dùng nhà riêng (không phải chung cư) hoặc liên hệ chúng tôi để được hỗ trợ địa chỉ văn phòng.',
  },
  {
    q: 'Nên thành lập loại hình doanh nghiệp nào?',
    a: 'Ba loại hình phổ biến: (1) Công ty TNHH 1 thành viên — 1 chủ sở hữu, quyết định nhanh, phù hợp khởi nghiệp cá nhân. (2) Công ty TNHH 2+ thành viên — 2 đến 50 thành viên, chia sẻ vốn và rủi ro, phổ biến nhất cho SME. (3) Công ty Cổ phần — tối thiểu 3 cổ đông, phù hợp khi cần huy động vốn lớn hoặc niêm yết. Chỉ nên chọn Cổ phần khi thực sự cần vì quy định nội bộ phức tạp hơn.',
  },
  {
    q: 'Đặt tên công ty như thế nào cho đúng?',
    a: 'Tên công ty phải gồm 2 phần: loại hình doanh nghiệp (TNHH, Cổ phần…) và tên riêng. Tên không được trùng hoặc gây nhầm lẫn với tên đã đăng ký. Do số lượng doanh nghiệp ngày càng nhiều, bạn nên chuẩn bị 2–3 phương án tên và thêm tiền tố/hậu tố để tránh trùng. Không đặt tên theo tên danh nhân hoặc nhãn hiệu đã đăng ký độc quyền.',
  },
  {
    q: 'Vốn điều lệ tối thiểu là bao nhiêu?',
    a: 'Pháp luật không quy định mức vốn tối thiểu chung. Doanh nghiệp tự kê khai và tự chịu trách nhiệm. Tuy nhiên, một số ngành có quy định vốn pháp định riêng (bất động sản, tài chính, y tế, bảo hiểm…). Bạn không cần chứng minh vốn khi đăng ký. Thời hạn góp đủ vốn là 90 ngày kể từ ngày cấp Giấy chứng nhận.',
  },
  {
    q: 'Trong quá trình hoạt động có được thay đổi vốn điều lệ không?',
    a: 'Được. Tăng vốn đơn giản hơn: chỉ cần làm thủ tục bổ sung. Giảm vốn phức tạp hơn: cần đáp ứng điều kiện pháp lý (thông báo chủ nợ, đảm bảo nghĩa vụ thanh toán…) và mất nhiều thời gian hơn. Nên cân nhắc kỹ mức vốn ngay từ đầu để tránh phát sinh thủ tục về sau.',
  },
  {
    q: 'Được đăng ký bao nhiêu ngành nghề kinh doanh?',
    a: 'Không giới hạn số ngành nghề, miễn là pháp luật không cấm. Nên đăng ký nhiều ngành nghề rộng ngay từ đầu để khi phát sinh nhu cầu kinh doanh mới không phải làm thủ tục bổ sung. Ngành nghề có điều kiện (bảo vệ, giáo dục, y tế, xây dựng…) cần đáp ứng điều kiện riêng nhưng không cần chứng minh ngay khi đăng ký theo Luật Doanh nghiệp 2020.',
  },
  {
    q: 'Ai có quyền thành lập công ty?',
    a: 'Cá nhân từ đủ 18 tuổi, không thuộc diện cấm theo luật (cán bộ, công chức nhà nước không được thành lập/quản lý doanh nghiệp tư nhân, TNHH, cổ phần, hợp danh — nhưng có thể đầu tư góp vốn vào cổ phần như giao dịch chứng khoán). Không phụ thuộc hộ khẩu thường trú — bạn có thể lập công ty ở bất kỳ tỉnh/thành nào theo nhu cầu kinh doanh.',
  },
  {
    q: 'Nộp hồ sơ thành lập công ty ở đâu?',
    a: 'Nộp tại Phòng Đăng ký kinh doanh – Sở Kế hoạch và Đầu tư tỉnh/thành phố nơi công ty đặt trụ sở chính. Hiện nay có thể nộp online qua Cổng thông tin quốc gia về đăng ký doanh nghiệp (dangkykinhdoanh.gov.vn). Chúng tôi thực hiện toàn bộ quy trình này thay bạn.',
  },
  {
    q: 'Công ty chưa có doanh thu có phải kê khai và nộp thuế không?',
    a: 'Vẫn phải kê khai dù chưa có doanh thu: (1) Tờ khai VAT hàng quý — kê khai "không phát sinh". (2) Báo cáo sử dụng hóa đơn (nếu đã phát hành). (3) Báo cáo tài chính năm — bắt buộc. Chỉ không phải nộp thuế TNDN nếu không có lợi nhuận. Bỏ qua kê khai sẽ bị phạt từ 1–3 triệu đồng/lần.',
  },
  {
    q: 'Ưu điểm của công ty so với hộ kinh doanh?',
    a: 'Công ty có tư cách pháp nhân, chịu trách nhiệm hữu hạn trong phạm vi vốn góp (hộ kinh doanh chịu trách nhiệm vô hạn bằng tài sản cá nhân). Công ty xuất được hóa đơn VAT đầu ra, giúp khách hàng khấu trừ thuế — lợi thế lớn khi làm việc với doanh nghiệp lớn. VAT là thuế thu hộ nhà nước từ khách hàng, không phải chi phí thực của doanh nghiệp. Hộ kinh doanh chịu thuế khoán theo doanh thu kể cả khi lỗ.',
  },
  {
    q: 'Không có chuyên môn kế toán, có tự quản lý sổ sách được không?',
    a: 'Doanh nghiệp bắt buộc tổ chức kế toán theo Luật kế toán. Nếu chưa có bộ phận kế toán nội bộ, bạn có thể sử dụng dịch vụ kế toán trọn gói của chúng tôi từ 500.000đ/tháng — đảm bảo đúng pháp luật, tránh rủi ro bị phạt. Dịch vụ bao gồm: kê khai thuế, lập báo cáo tài chính, quyết toán thuế cuối năm.',
  },
]

const reasons = [
  { icon: Shield, title: 'Cam kết giá cố định', desc: 'Báo giá từ đầu, không phát sinh thêm chi phí ẩn ngoài hợp đồng.' },
  { icon: Clock, title: 'Xử lý nhanh — từ 3 ngày', desc: 'Quy trình tối ưu, theo dõi tiến độ hồ sơ liên tục và thông báo ngay.' },
  { icon: Users, title: 'Đội ngũ giàu kinh nghiệm', desc: 'Gần 10 năm tư vấn thành lập doanh nghiệp, xử lý hàng nghìn hồ sơ thành công.' },
  { icon: BadgeCheck, title: 'Hỗ trợ hậu thành lập', desc: 'Đồng hành toàn diện: kế toán, thuế, bảo hiểm, chữ ký số — trọn gói.' },
]

const pricing = [
  { name: 'Thành lập công ty TNHH 1 thành viên', price: '1.500.000đ', note: '' },
  { name: 'Thành lập công ty TNHH 2+ thành viên', price: '1.500.000đ', note: '' },
  { name: 'Thành lập công ty cổ phần', price: '2.000.000đ', note: '' },
  { name: 'Thành lập công ty FDI (có vốn nước ngoài)', price: 'Từ 15.000.000đ', note: 'Liên hệ báo giá' },
  { name: 'Phí nhà nước (nộp hộ khách hàng)', price: 'Theo quy định', note: '' },
  { name: 'Khắc dấu pháp nhân', price: 'Bao gồm trong gói', note: '' },
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
        {open
          ? <ChevronUp size={18} className="shrink-0 text-blue-600" />
          : <ChevronDown size={18} className="shrink-0 text-gray-400" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThanhLapCongTyPage() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white">Thành lập công ty</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                Dịch vụ uy tín — gần 10 năm kinh nghiệm
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Dịch Vụ Thành Lập Công Ty<br className="hidden md:block" /> Trọn Gói
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed mb-7">
                Tư vấn miễn phí, chuẩn bị toàn bộ hồ sơ, nộp đăng ký và bàn giao giấy phép tận nơi.
                Nhanh chóng — uy tín — không phát sinh chi phí ngoài hợp đồng.
              </p>

              {/* Price badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                  <p className="text-3xl font-bold text-yellow-300">1.500.000đ</p>
                  <p className="text-blue-200 text-xs mt-1">Trọn gói — cố định</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                  <p className="text-3xl font-bold text-yellow-300">3 ngày</p>
                  <p className="text-blue-200 text-xs mt-1">Hoàn thành hồ sơ</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/lien-he"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow"
                >
                  Tư vấn miễn phí <ArrowRight size={16} />
                </Link>
                {settings?.hotline && (
                  <a
                    href={`tel:${settings.hotline}`}
                    className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Phone size={16} /> {settings.hotline}
                  </a>
                )}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <ContactForm
                title="Đăng ký tư vấn ngay"
                subtitle="Chuyên viên gọi lại trong 30 phút"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="bg-blue-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-blue-800">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center py-5 px-4">
                <p className="text-2xl font-bold text-yellow-300">{value}</p>
                <p className="text-blue-300 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Điều kiện & Hồ sơ ───────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Chuẩn bị
            </span>
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
                {[
                  'Bản sao CCCD / CMND / Hộ chiếu còn hiệu lực của tất cả thành viên, cổ đông sáng lập và người đại diện pháp luật',
                  'Ảnh thẻ cá nhân (nếu cần theo yêu cầu cơ quan đăng ký)',
                ].map((item) => (
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
                  'Địa chỉ trụ sở chính (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)',
                  'Vốn điều lệ và tỷ lệ góp vốn của từng thành viên (nếu nhiều người)',
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
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Loại hình
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Nên Chọn Loại Hình Nào?</h2>
            <p className="text-gray-500 mt-2">So sánh 3 loại hình phổ biến nhất để lựa chọn phù hợp</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyTypes.map(({ type, price, highlight, members, liability, pros }) => (
              <div
                key={type}
                className={`rounded-2xl p-6 border-2 transition-shadow ${
                  highlight
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {highlight && (
                  <div className="inline-block bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{type}</h3>
                <p className={`text-2xl font-bold mb-4 ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>
                  {price}
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Thành viên</span>
                    <span className="font-medium text-gray-800">{members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trách nhiệm</span>
                    <span className="font-medium text-gray-800">{liability}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Không chắc chọn loại hình nào?{' '}
            <Link to="/lien-he" className="text-blue-600 font-semibold hover:underline">
              Liên hệ tư vấn miễn phí →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Quy trình ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Quy trình
            </span>
            <h2 className="text-3xl font-bold text-gray-900">3 Bước Thành Lập Công Ty</h2>
            <p className="text-gray-500 mt-2">Chúng tôi xử lý toàn bộ — bạn chỉ cần ngồi chờ nhận kết quả</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ num, icon: Icon, title, time, color, items }) => (
              <div key={num} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0`}>
                    {num}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} /> {time}
                    </p>
                  </div>
                </div>
                <Icon size={28} className="text-gray-200 mb-4" />
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kết quả bàn giao + Lý do chọn ──────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4">
                Kết quả bàn giao
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Khách Hàng Nhận Được Gì?</h2>
              <p className="text-gray-500 mb-7 leading-relaxed">
                Sau khi hoàn thành, chúng tôi bàn giao trọn bộ giấy tờ pháp lý và hỗ trợ đầy đủ các bước tiếp theo để doanh nghiệp đi vào hoạt động ngay.
              </p>
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
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4">
                Tại sao chọn chúng tôi
              </span>
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

      {/* ── Thủ tục sau thành lập ────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Sau thành lập
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Thủ Tục Cần Làm Sau Khi Có Giấy Phép</h2>
            <p className="text-gray-500 mt-2">Chúng tôi đồng hành và hướng dẫn đầy đủ từng bước</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postSteps.map(({ num, title, desc }) => (
              <div key={num} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {num}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thuế phải kê khai ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Nghĩa vụ thuế
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Các Loại Thuế Phải Kê Khai</h2>
            <p className="text-gray-500 mt-2">Nắm rõ để tránh bị phạt chậm nộp, bỏ sót tờ khai</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {taxes.map(({ name, rate, deadline, icon: Icon }) => (
              <div key={name} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="text-gray-400">Mức:</span> {rate}
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <CalendarCheck size={12} className="inline mr-1 text-blue-400" />
                  {deadline}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-blue-500" />
            <span><strong>Lưu ý:</strong> Công ty chưa có doanh thu vẫn phải nộp tờ khai VAT hàng quý và báo cáo tài chính năm. Bỏ qua có thể bị phạt từ 1–3 triệu đồng/lần.</span>
          </div>
        </div>
      </section>

      {/* ── Bảng giá ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-blue-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-4">
            Chi phí
          </span>
          <h2 className="text-3xl font-bold mb-2">Bảng Giá Dịch Vụ</h2>
          <p className="text-blue-200 mb-8">Giá cố định, minh bạch — không phát sinh thêm</p>

          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-3 bg-blue-50 border-b border-gray-100">
              <div className="grid grid-cols-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span>Dịch vụ</span>
                <span className="text-right">Phí dịch vụ</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pricing.map(({ name, price, note }) => (
                <div key={name} className="px-5 py-3.5 grid grid-cols-2 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700">{name}</span>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">{price}</span>
                    {note && <p className="text-xs text-gray-400">{note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-300 text-xs mt-4">* Giá chưa bao gồm VAT. Liên hệ để được báo giá chính xác theo từng trường hợp cụ thể.</p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
              Câu hỏi thường gặp
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Giải Đáp Thắc Mắc</h2>
            <p className="text-gray-500 mt-2">Những câu hỏi khách hàng hỏi nhiều nhất khi thành lập công ty</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sẵn Sàng Thành Lập Công Ty?</h2>
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
