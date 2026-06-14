import ThanhLapTemplate, { type ProvinceData } from './ThanhLapTemplate'

const data: ProvinceData = {
  name: 'Đồng Nai',
  slug: 'dong-nai',
  price: '1.500.000đ',
  days: '3 ngày',
  intro: 'Bạn đang kinh doanh tại Đồng Nai và cần thành lập công ty nhanh chóng, đúng pháp luật? Với gần 10 năm kinh nghiệm, chúng tôi đã hỗ trợ hàng ngàn doanh nghiệp tại Biên Hòa, Long Thành, Nhơn Trạch và toàn tỉnh — trọn gói, cố định giá, bàn giao tận nơi.',
  areas: [
    'TP. Biên Hòa', 'H. Long Thành', 'H. Nhơn Trạch', 'H. Trảng Bom',
    'H. Thống Nhất', 'H. Vĩnh Cửu', 'H. Xuân Lộc', 'TX. Long Khánh',
    'H. Cẩm Mỹ', 'H. Định Quán', 'H. Tân Phú',
  ],
  offices: [
    {
      label: 'Văn phòng Long Thành – Nhơn Trạch',
      address: 'Số 240/5, đường Lê Duẩn, Ấp 3, Xã An Phước, H. Long Thành, Đồng Nai',
    },
    {
      label: 'Văn phòng Biên Hòa',
      address: '468/1, Đường Đồng Khởi, Khu phố 3, TP. Biên Hòa, Đồng Nai',
    },
  ],
  extraFaqs: [
    {
      q: 'Thành lập công ty tại Đồng Nai có thể đặt trụ sở ở KCN không?',
      a: 'Được, nhưng phải đăng ký địa chỉ cụ thể trong khu công nghiệp (số nhà, đường, khu phố). Một số KCN tại Đồng Nai như KCN Long Thành, KCN Nhơn Trạch có nhà xưởng cho thuê với điều kiện đặt trụ sở công ty.',
    },
    {
      q: 'Thành lập công ty tại Nhơn Trạch, Long Thành có khác gì Biên Hòa không?',
      a: 'Về thủ tục đăng ký, tất cả đều nộp tại Phòng Đăng ký kinh doanh – Sở Kế hoạch & Đầu tư Đồng Nai. Sự khác biệt là cơ quan quản lý thuế sau thành lập: Biên Hòa thuộc Chi cục Thuế Biên Hòa, Long Thành và Nhơn Trạch thuộc Chi cục Thuế khu vực riêng. Chúng tôi hỗ trợ đầy đủ cho tất cả khu vực.',
    },
  ],
}

export default function ThanhLapDongNaiPage() {
  return <ThanhLapTemplate data={data} />
}
