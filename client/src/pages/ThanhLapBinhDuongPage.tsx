import ThanhLapTemplate, { type ProvinceData } from './ThanhLapTemplate'

const data: ProvinceData = {
  name: 'Bình Dương',
  slug: 'binh-duong',
  price: '1.500.000đ',
  days: '3 ngày',
  intro: 'Bình Dương là một trong những trung tâm kinh tế sôi động nhất miền Nam với hàng trăm khu công nghiệp lớn. Chúng tôi hỗ trợ thành lập công ty tại Thủ Dầu Một, Dĩ An, Thuận An và toàn tỉnh — nhanh chóng, trọn gói, không phát sinh chi phí.',
  areas: [
    'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TP. Bến Cát',
    'TX. Tân Uyên', 'H. Bàu Bàng', 'H. Dầu Tiếng', 'H. Phú Giáo',
  ],
  offices: [],
  extraFaqs: [
    {
      q: 'Thành lập công ty tại Bình Dương có cần đăng ký tại KCN không?',
      a: 'Không bắt buộc. Bạn có thể đặt trụ sở tại bất kỳ địa chỉ hợp lệ nào trong tỉnh. Nếu hoạt động trong khu công nghiệp (KCN Việt Nam–Singapore, KCN Sóng Thần, VSIP...), cần liên hệ Ban Quản lý KCN để được hướng dẫn thêm về điều kiện thuê đất và đặt trụ sở.',
    },
    {
      q: 'Nộp hồ sơ thành lập công ty tại Bình Dương ở đâu?',
      a: 'Nộp tại Phòng Đăng ký kinh doanh – Sở Kế hoạch và Đầu tư tỉnh Bình Dương, địa chỉ tại TP. Thủ Dầu Một. Hiện nay có thể nộp online qua Cổng thông tin quốc gia về ĐKDN. Chúng tôi thực hiện toàn bộ thay bạn.',
    },
    {
      q: 'Công ty tại Bình Dương sau thành lập phải đăng ký thuế ở đâu?',
      a: 'Sau khi có Giấy chứng nhận ĐKDN, hệ thống sẽ tự động kết nối với Cục Thuế Bình Dương. Bạn cần đăng ký phương pháp tính thuế, mở tài khoản ngân hàng và đăng ký nộp thuế điện tử. Chúng tôi hỗ trợ đầy đủ các thủ tục này.',
    },
  ],
}

export default function ThanhLapBinhDuongPage() {
  return <ThanhLapTemplate data={data} />
}
