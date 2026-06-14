import ThanhLapTemplate, { type ProvinceData } from './ThanhLapTemplate'

const data: ProvinceData = {
  name: 'Bà Rịa – Vũng Tàu',
  slug: 'ba-ria-vung-tau',
  price: '1.500.000đ',
  days: '3–6 ngày',
  intro: 'Bà Rịa – Vũng Tàu là tỉnh có nền kinh tế đa dạng: dầu khí, du lịch, cảng biển và khu công nghiệp. Chúng tôi hỗ trợ thành lập công ty tại TP. Vũng Tàu, Phú Mỹ, Long Điền và toàn tỉnh — trọn gói, minh bạch, bàn giao tận nơi.',
  areas: [
    'TP. Vũng Tàu', 'TP. Bà Rịa', 'TX. Phú Mỹ', 'H. Châu Đức',
    'H. Xuyên Mộc', 'H. Long Điền', 'H. Đất Đỏ', 'H. Côn Đảo',
  ],
  offices: [
    {
      label: 'Chi nhánh Bà Rịa – Vũng Tàu',
      address: '66 Đường Hùng Vương, Phường Phú Mỹ, TX. Phú Mỹ, Bà Rịa – Vũng Tàu',
    },
  ],
  extraFaqs: [
    {
      q: 'Thành lập công ty tại Vũng Tàu có khác tỉnh thành khác không?',
      a: 'Quy trình thành lập công ty tại Bà Rịa – Vũng Tàu tương tự các tỉnh khác. Điểm khác biệt: doanh nghiệp trong lĩnh vực dầu khí, cảng biển có thể cần thêm giấy phép chuyên ngành từ các cơ quan liên quan (Cục Hàng hải, Petrovietnam...). Chúng tôi tư vấn cụ thể từng trường hợp.',
    },
    {
      q: 'Có thể thành lập công ty du lịch tại Vũng Tàu không?',
      a: 'Hoàn toàn được. Kinh doanh lữ hành, khách sạn, nhà hàng, dịch vụ du lịch là ngành nghề được phép đăng ký. Một số ngành có điều kiện (lữ hành quốc tế, khách sạn 3–5 sao) cần xin thêm giấy phép con sau khi có đăng ký kinh doanh. Chúng tôi hỗ trợ toàn bộ quy trình.',
    },
    {
      q: 'Thành lập công ty tại Phú Mỹ – KCN Phú Mỹ có cần điều kiện gì đặc biệt?',
      a: 'Đối với doanh nghiệp muốn thuê đất, thuê xưởng trong KCN Phú Mỹ 1, 2, 3, cần làm việc thêm với Ban Quản lý KCN Bà Rịa – Vũng Tàu (BV-IP) để ký hợp đồng thuê đất. Thủ tục đăng ký kinh doanh vẫn nộp tại Sở Kế hoạch và Đầu tư tỉnh.',
    },
  ],
}

export default function ThanhLapBaRiaVungTauPage() {
  return <ThanhLapTemplate data={data} />
}
