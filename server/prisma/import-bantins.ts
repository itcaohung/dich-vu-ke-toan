import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const KE_TOAN_THUE_ID = 1
const PHAP_LUAT_DN_ID = 4

const articles = [
  {
    title: 'Chính thức bãi bỏ lệ phí môn bài từ năm 2026',
    slug: 'chinh-thuc-bai-bo-le-phi-mon-bai-tu-nam-2026',
    excerpt: 'Lệ phí môn bài sẽ được bãi bỏ hoàn toàn từ 01/01/2026. Đây là thay đổi lớn nhằm giảm gánh nặng thủ tục hành chính cho doanh nghiệp, đặc biệt là các doanh nghiệp nhỏ và mới khởi nghiệp.',
    publishedAt: new Date('2026-01-13'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Lệ phí môn bài chính thức bị bãi bỏ từ 01/01/2026</h2>
<p>Lệ phí môn bài sẽ được bãi bỏ hoàn toàn từ 01/01/2026. Đây là thay đổi lớn nhằm giảm gánh nặng thủ tục hành chính cho doanh nghiệp, đặc biệt là các doanh nghiệp nhỏ và mới khởi nghiệp.</p>

<h2>Thời điểm áp dụng</h2>
<ul>
  <li>Từ 01/01/2026, doanh nghiệp, hộ kinh doanh, cá nhân kinh doanh không còn phải nộp lệ phí môn bài.</li>
  <li>Năm 2025 vẫn thực hiện đầy đủ nghĩa vụ này.</li>
</ul>

<h2>Căn cứ pháp lý</h2>
<ul>
  <li>Nghị quyết số 198/2025/QH15 của Quốc hội</li>
  <li>Nghị định số 362/2025/NĐ-CP ngày 31/12/2025 của Chính phủ</li>
  <li>Bãi bỏ Nghị định 139/2016/NĐ-CP và Nghị định 22/2020/NĐ-CP</li>
</ul>

<h2>Hệ quả tích cực cho doanh nghiệp</h2>
<ul>
  <li>Không cần lập tờ khai lệ phí</li>
  <li>Tránh rủi ro bị phạt chậm nộp</li>
  <li>Giảm chi phí tuân thủ cho kế toán nội bộ</li>
  <li>Hỗ trợ dòng tiền cho doanh nghiệp mới thành lập</li>
</ul>

<h2>Khuyến cáo cho doanh nghiệp</h2>
<ul>
  <li>Tiếp tục tuân thủ nghĩa vụ lệ phí môn bài năm 2025 đầy đủ</li>
  <li>Cập nhật hệ thống kế toán trước khi bước sang năm 2026</li>
  <li>Theo dõi chi tiết các quy định hành chính mới thay thế</li>
</ul>`,
  },
  {
    title: 'Chính sách thuế mới cho hộ kinh doanh từ 01/01/2026',
    slug: 'chinh-sach-thue-moi-cho-ho-kinh-doanh-tu-01-01-2026',
    excerpt: 'Từ 01/01/2026, Thông tư 152/2025/TT-BTC của Bộ Tài chính đưa ra những thay đổi quan trọng trong chính sách thuế cho hộ kinh doanh, thay thế Thông tư 88/2021/TT-BTC.',
    publishedAt: new Date('2026-02-05'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Chính sách thuế mới cho hộ kinh doanh từ 01/01/2026</h2>
<p>Từ 01/01/2026, Thông tư 152/2025/TT-BTC của Bộ Tài chính đưa ra những thay đổi quan trọng trong chính sách thuế cho hộ kinh doanh, thay thế Thông tư 88/2021/TT-BTC.</p>

<h2>Tổng quan quy định kế toán mới</h2>
<p>Người làm kế toán có thể là chủ hộ, thành viên gia đình hoặc dịch vụ kế toán thuê ngoài. Chứng từ và sổ sách phải lưu trữ tối thiểu 5 năm dưới hình thức giấy hoặc điện tử.</p>

<h2>4 Nhóm hộ kinh doanh theo doanh thu</h2>

<h3>Nhóm 1: Dưới 500 triệu đồng/năm</h3>
<ul>
  <li>Miễn thuế GTGT và TNCN</li>
  <li>Kê khai doanh thu 1 lần/năm</li>
  <li>Hóa đơn điện tử không bắt buộc</li>
</ul>

<h3>Nhóm 2: Từ 500 triệu đến 3 tỷ đồng/năm</h3>
<ul>
  <li>Chịu thuế GTGT theo tỷ lệ ngành nghề</li>
  <li>Thuế TNCN: 2 phương pháp lựa chọn</li>
  <li>Hóa đơn điện tử bắt buộc</li>
</ul>

<h3>Nhóm 3: Từ 3 tỷ đến 50 tỷ đồng/năm</h3>
<ul>
  <li>Khai GTGT theo quý, TNCN theo năm</li>
  <li>Thuế TNCN: (Doanh thu – Chi phí) × 17%</li>
</ul>

<h3>Nhóm 4: Trên 50 tỷ đồng/năm</h3>
<ul>
  <li>Thuế TNCN: (Doanh thu – Chi phí) × 20%</li>
  <li>Gần tương đương chế độ doanh nghiệp</li>
</ul>

<h2>Lưu ý quan trọng</h2>
<p>Hộ kinh doanh cần theo dõi doanh thu, ghi chép đầy đủ, sử dụng hóa đơn điện tử đúng quy định và cân nhắc thuê dịch vụ kế toán chuyên nghiệp để tránh rủi ro thuế.</p>`,
  },
  {
    title: 'Những lưu ý doanh nghiệp cần biết về chính sách miễn thuế thu nhập doanh nghiệp 3 năm',
    slug: 'nhung-luu-y-doanh-nghiep-can-biet-ve-chinh-sach-mien-thue-thu-nhap-doanh-nghiep-3-nam',
    excerpt: 'Bài viết hướng dẫn các doanh nghiệp về chính sách miễn thuế thu nhập doanh nghiệp (TNDN) trong 3 năm đầu, được quy định trong Nghị định 20/2026/NĐ-CP.',
    publishedAt: new Date('2026-02-14'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Chính sách miễn thuế TNDN 3 năm – Doanh nghiệp cần biết gì?</h2>
<p>Chính sách miễn thuế thu nhập doanh nghiệp (TNDN) trong 3 năm đầu theo Nghị định 20/2026/NĐ-CP là một ưu đãi quan trọng dành cho doanh nghiệp nhỏ và vừa mới thành lập.</p>

<h2>Đối tượng được miễn thuế</h2>
<p>Các doanh nghiệp nhỏ và vừa (SME) được cấp đăng ký lần đầu có thể hưởng ưu đãi nếu đáp ứng các tiêu chí:</p>
<ul>
  <li>Là doanh nghiệp đăng ký kinh doanh lần đầu</li>
  <li>Được cấp Giấy chứng nhận đăng ký doanh nghiệp lần đầu</li>
  <li>Đáp ứng tiêu chí doanh nghiệp nhỏ và vừa theo quy định hiện hành</li>
</ul>

<h2>Thời gian áp dụng</h2>
<p>Chính sách có hiệu lực kể từ "kỳ tính thuế năm 2025" theo Nghị quyết 198/2025/QH15 (có hiệu lực từ 17/05/2025). Doanh nghiệp đăng ký từ năm 2025 sẽ tính 3 năm miễn thuế kể từ năm đó.</p>

<h2>Các trường hợp loại trừ</h2>
<p>Doanh nghiệp <strong>không được miễn thuế</strong> nếu thuộc các trường hợp:</p>
<ul>
  <li>Thành lập do sáp nhập, hợp nhất, tách, chia, chuyển đổi chủ sở hữu hoặc chuyển loại hình</li>
  <li>Người đại diện pháp luật đã tham gia hoạt động kinh doanh tương tự tại công ty khác</li>
  <li>Giải thể doanh nghiệp chưa đủ 12 tháng trước khi thành lập doanh nghiệp mới</li>
</ul>

<h2>Thu nhập không được miễn</h2>
<p>Các khoản thu nhập sau đây vẫn phải chịu thuế bình thường dù doanh nghiệp được miễn thuế:</p>
<ul>
  <li>Thu nhập từ chuyển nhượng vốn, bất động sản</li>
  <li>Thu nhập từ dự án đầu tư</li>
  <li>Hoạt động kinh doanh nước ngoài</li>
  <li>Ngành nghề đặc thù theo quy định</li>
</ul>`,
  },
  {
    title: '[Tổng hợp mới nhất] 10 Chính sách thuế, phí mới hỗ trợ doanh nghiệp',
    slug: 'tong-hop-moi-nhat-10-chinh-sach-thue-phi-moi-ho-tro-doanh-nghiep',
    excerpt: 'Nghị quyết số 198/2025/QH15 của Quốc hội Việt Nam ban hành các chính sách đặc biệt nhằm hỗ trợ doanh nghiệp, đặc biệt là lĩnh vực khởi nghiệp đổi mới sáng tạo, với các ưu đãi thuế, phí đáng kể có hiệu lực từ 2025-2026.',
    publishedAt: new Date('2026-02-27'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>10 Chính sách thuế, phí mới hỗ trợ doanh nghiệp theo Nghị quyết 198/2025/QH15</h2>
<p>Nghị quyết số 198/2025/QH15 của Quốc hội Việt Nam ban hành các chính sách đặc biệt nhằm hỗ trợ doanh nghiệp, đặc biệt là lĩnh vực khởi nghiệp đổi mới sáng tạo, với các ưu đãi thuế, phí đáng kể có hiệu lực từ 2025-2026.</p>

<h2>1. Miễn, giảm thuế TNDN cho hoạt động khởi nghiệp sáng tạo</h2>
<p>Doanh nghiệp khởi nghiệp được miễn thuế TNDN trong 02 năm và giảm 50% số thuế phải nộp trong 04 năm tiếp theo đối với thu nhập từ hoạt động này. Chính sách khuyến khích đầu tư công nghệ cao và giảm gánh nặng tài chính giai đoạn đầu.</p>

<h2>2. Bỏ thu một số khoản phí, lệ phí từ 01/01/2026</h2>
<p>Từ ngày 01/01/2026, một số khoản phí, lệ phí sẽ chấm dứt để giảm chi phí hành chính cho doanh nghiệp và cá nhân kinh doanh.</p>

<h2>3. Miễn thuế TNCN và TNDN với khoản thu từ chuyển nhượng chứng khoán</h2>
<p>Chính sách này khuyến khích đầu tư mạo hiểm vào startup, giúp nhà đầu tư thoái vốn mà không chịu gánh nặng thuế.</p>

<h2>4. Trích tối đa 20% thu nhập để lập quỹ phát triển khoa học công nghệ</h2>
<p>Doanh nghiệp được trích tối đa 20% thu nhập tính thuế TNDN để lập quỹ phát triển KH&amp;CN với khoản chi được tính vào chi phí được trừ.</p>

<h2>5. Miễn thuế TNCN cho thu nhập từ doanh nghiệp khởi nghiệp sáng tạo</h2>
<p>Chuyên gia và cá nhân sáng lập được miễn thuế TNCN 02 năm, giảm 50% trong 04 năm tiếp theo. Chính sách thu hút nhân tài cho startup.</p>

<h2>6. Chi phí phát triển khoa học, công nghệ được trừ</h2>
<p>Nghiên cứu, đào tạo và chuyển giao công nghệ được tính vào chi phí trừ, khuyến khích đổi mới công nghệ.</p>

<h2>7. Doanh nghiệp nhỏ và vừa được miễn thuế TNDN trong 3 năm đầu</h2>
<p>SME được miễn thuế TNDN trong thời hạn 03 năm kể từ năm đầu tiên có thu nhập chịu thuế, hỗ trợ doanh nghiệp vượt qua giai đoạn khó khăn ban đầu.</p>

<h2>8. Ngừng thu lệ phí môn bài từ 01/01/2026</h2>
<p>Chấm dứt việc thu lệ phí môn bài giúp giảm gánh nặng hành chính và tài chính cho hàng triệu hộ kinh doanh trên cả nước.</p>

<h2>9. Chi phí đào tạo được trừ khi tính thuế TNDN</h2>
<p>Chi phí đào tạo nhân viên được tính vào chi phí trừ, khuyến khích doanh nghiệp đầu tư vào nguồn nhân lực chất lượng cao.</p>

<h2>10. Miễn phí, lệ phí cấp lại giấy tờ</h2>
<p>Miễn thu phí cho các giấy tờ cấp lại, cấp đổi trong quá trình sắp xếp, tổ chức lại bộ máy nhà nước.</p>

<h2>Kết luận</h2>
<p>Các chính sách từ Nghị quyết 198/2025/QH15 nhằm giảm chi phí kinh doanh, thúc đẩy đổi mới sáng tạo và phát triển bền vững. Doanh nghiệp nên cập nhật quy định từ các nguồn chính thức để áp dụng đúng và tối ưu hóa lợi ích thuế.</p>`,
  },
  {
    title: 'Chính phủ giảm thuế nhập khẩu một số mặt hàng xăng dầu về 0%',
    slug: 'chinh-phu-giam-thue-nhap-khau-mot-so-mat-hang-xang-dau-ve-0-de-on-dinh-nguon-cung',
    excerpt: 'Để ứng phó với tình hình địa chính trị phức tạp tại Trung Đông và rủi ro gián đoạn chuỗi cung ứng dầu, Chính phủ Việt Nam đã ban hành Nghị định số 72/2026/NĐ-CP giảm thuế nhập khẩu xăng dầu về 0%.',
    publishedAt: new Date('2026-03-10'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Chính phủ giảm thuế nhập khẩu xăng dầu về 0% để ổn định nguồn cung</h2>
<p>Để ứng phó với tình hình địa chính trị phức tạp tại Trung Đông và rủi ro gián đoạn chuỗi cung ứng dầu, Chính phủ Việt Nam đã ban hành Nghị định số 72/2026/NĐ-CP vào ngày 09/03/2026.</p>

<h2>Các mặt hàng được giảm thuế nhập khẩu</h2>
<ul>
  <li><strong>Xăng động cơ không pha chì:</strong> Giảm từ 10% xuống 0%</li>
  <li><strong>Nguyên liệu pha chế xăng (naphtha, reformate):</strong> Giảm từ 10% xuống 0%</li>
  <li><strong>Nhiên liệu diesel và dầu nhiên liệu:</strong> Giảm từ 7% xuống 0%</li>
  <li><strong>Xylen, condensate, p-xylen:</strong> Giảm từ 3% xuống 0%</li>
  <li><strong>Hydrocarbon mạch vòng loại khác:</strong> Giảm từ 2% xuống 0%</li>
</ul>

<h2>Mục tiêu chính sách</h2>
<p>Chính sách hướng tới hỗ trợ doanh nghiệp chủ động đa dạng hóa nguồn nhập khẩu và kiểm soát giá bán lẻ để ổn định kinh tế xã hội trong bối cảnh thị trường năng lượng toàn cầu có nhiều biến động.</p>

<h2>Thời gian áp dụng</h2>
<p>Từ ngày 09/03/2026 đến 30/04/2026, với khả năng gia hạn nếu tình hình thị trường năng lượng chưa ổn định.</p>

<h2>Tác động đối với doanh nghiệp</h2>
<p>Các doanh nghiệp sử dụng xăng dầu trong sản xuất, vận tải, logistics cần cập nhật thông tin để tối ưu chi phí đầu vào. Đây là cơ hội để doanh nghiệp nhập khẩu trực tiếp từ thị trường quốc tế với chi phí thuế thấp hơn.</p>`,
  },
  {
    title: 'Những điểm cần lưu ý khi cá nhân cho thuê nhà, tài sản từ 01/01/2026',
    slug: 'nhung-diem-can-luu-y-khi-ca-nhan-cho-thue-nha-tai-san-tu-01-01-2026',
    excerpt: 'Từ ngày 01/01/2026, hoạt động cho thuê nhà, kho, xưởng, xe và các tài sản khác của cá nhân có nhiều thay đổi về chính sách thuế và nghĩa vụ kê khai cần nắm rõ.',
    publishedAt: new Date('2026-03-26'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Quy định mới về thuế cho cá nhân cho thuê nhà, tài sản từ 01/01/2026</h2>
<p>Từ ngày 01/01/2026, hoạt động cho thuê nhà, kho, xưởng, xe và các tài sản khác của cá nhân có nhiều thay đổi về chính sách thuế và nghĩa vụ kê khai cần nắm rõ.</p>

<h2>Đối tượng phải khai nộp thuế</h2>
<p>Theo quy định mới, cá nhân cho thuê tài sản phải tự khai nộp trực tiếp với cơ quan thuế. Doanh nghiệp thuê có thể khai nộp thay nếu hai bên thỏa thuận trong hợp đồng.</p>
<p><strong>Lưu ý quan trọng:</strong> Dù tổng doanh thu cho thuê trong năm dưới 500 triệu đồng (không phải nộp thuế), cá nhân vẫn phải kê khai thuế.</p>

<h2>Cách tính thuế từ 01/01/2026</h2>
<p>Khi doanh thu cho thuê vượt 500 triệu đồng/năm:</p>
<ul>
  <li><strong>Thuế GTGT:</strong> 5% trên tổng doanh thu</li>
  <li><strong>Thuế TNCN:</strong> 5% trên phần doanh thu vượt 500 triệu đồng</li>
</ul>
<p>Hệ thống không áp dụng tính thuế theo lợi nhuận mà theo tỷ lệ phần trăm trực tiếp trên doanh thu.</p>

<h2>Hồ sơ cần thiết</h2>
<p>Để chi phí thuê được công nhận hợp lệ, doanh nghiệp cần chuẩn bị:</p>
<ul>
  <li>Hợp đồng thuê tài sản (bắt buộc)</li>
  <li>Giấy tờ chứng minh quyền sở hữu tài sản</li>
  <li>CCCD/CMND người cho thuê</li>
  <li>Chứng từ thanh toán không dùng tiền mặt (nếu ≥5 triệu đồng/lần)</li>
</ul>
<p><em>Doanh nghiệp không cần hóa đơn GTGT từ cá nhân cho thuê, nhưng phải có đủ hồ sơ trên.</em></p>

<h2>Rủi ro khi doanh nghiệp nộp thuế thay</h2>
<p>Cần ghi rõ "nộp thay thuế cho người cho thuê" trong hợp đồng và không lập tờ khai 01/TNDN thay cho cá nhân để tránh bị loại chi phí hoặc truy thu thuế.</p>`,
  },
  {
    title: '5 điều kế toán nội bộ cần biết để không "lãnh đạn" khi quyết toán thuế',
    slug: '5-dieu-ke-toan-noi-bo-can-biet-de-khong-lanh-dan-khi-quyet-toan-thue',
    excerpt: 'Quyết toán thuế là một trong những thử thách lớn nhất trong năm của kế toán. Hiểu rõ 5 điều then chốt này sẽ giúp bạn tránh bị phạt và loại chi phí oan.',
    publishedAt: new Date('2026-04-11'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>5 điều kế toán nội bộ cần biết để không "lãnh đạn" khi quyết toán thuế</h2>
<p>Quyết toán thuế là một trong những thử thách lớn nhất trong năm của kế toán. Hiểu rõ 5 điều then chốt này sẽ giúp bạn tránh bị phạt và loại chi phí oan.</p>

<h2>1. Hóa đơn phải "đúng, đủ, hợp lệ" – Không có ngoại lệ</h2>
<p>Đây là nguyên tắc số 1 nhưng vẫn là nguyên nhân gây ra hơn 70% trường hợp bị loại chi phí. Kế toán nội bộ cần lưu ý:</p>
<ul>
  <li>Hóa đơn phải có đủ thông tin: tên công ty, mã số thuế, địa chỉ, nội dung hàng hóa/dịch vụ rõ ràng.</li>
  <li>Hóa đơn điện tử phải được khởi tạo đúng thời điểm, có mã của cơ quan thuế.</li>
  <li>Không chấp nhận hóa đơn sai sót nhỏ mà không có hóa đơn điều chỉnh hoặc thay thế.</li>
  <li>Hóa đơn từ nhà cung cấp thuộc danh sách rủi ro cao cần kiểm tra kỹ trước khi kê khai.</li>
</ul>
<p>Phải luôn kiểm tra hóa đơn ngay trong ngày nhận, không để dồn đến cuối quý hoặc cuối năm.</p>

<h2>2. Chứng từ thanh toán phải khớp với quy định pháp luật</h2>
<p>Nhiều khoản chi dù có hóa đơn nhưng vẫn bị loại vì thanh toán không đúng cách:</p>
<ul>
  <li>Hóa đơn từ 20 triệu đồng trở lên đòi hỏi phải thanh toán không dùng tiền mặt.</li>
  <li>Thanh toán tiền mặt cho hóa đơn lớn hoặc chia nhỏ hóa đơn để né quy định rất dễ bị cơ quan thuế bác bỏ.</li>
  <li>Chi phí tiếp khách, công tác phải có đầy đủ chứng từ: quyết định công tác, danh sách khách, biên bản cuộc họp, mục đích kinh doanh rõ ràng.</li>
</ul>
<p>Kế toán nên xây dựng quy trình thanh toán nội bộ nghiêm ngặt và yêu cầu bộ phận liên quan cung cấp đủ chứng từ trước khi kế toán hạch toán.</p>

<h2>3. Chi phí phải có "căn cứ hợp lý" và phục vụ hoạt động kinh doanh</h2>
<p>Cơ quan thuế không chỉ xem hóa đơn mà còn xem bản chất giao dịch. Một số khoản chi dễ bị loại:</p>
<ul>
  <li>Phụ cấp, thưởng, hỗ trợ nhân viên không có quy chế nội bộ hoặc không ghi trong hợp đồng lao động.</li>
  <li>Chi phí sửa chữa, mua sắm nhỏ không có biên bản bàn giao, bảng phân bổ.</li>
  <li>Chi tiếp khách, quảng cáo, marketing không chứng minh được mối liên hệ với doanh thu.</li>
</ul>
<p>Mọi khoản chi lớn hoặc thường xuyên nên có quy chế nội bộ rõ ràng, được ban hành và lưu trữ làm căn cứ.</p>

<h2>4. Hiểu rõ thời hạn kê khai và nộp thuế</h2>
<p>Kế toán nội bộ thường "lãnh đạn" vì nộp chậm hoặc kê khai sai thời hạn:</p>
<ul>
  <li>Kê khai thuế GTGT: theo tháng hoặc quý (tùy doanh thu)</li>
  <li>Quyết toán thuế TNDN: chậm nhất là ngày cuối cùng của tháng thứ 3 năm sau</li>
  <li>Báo cáo tài chính: chậm nhất 90 ngày kể từ ngày kết thúc năm tài chính</li>
</ul>
<p>Nộp chậm dù chỉ 1 ngày cũng bị phạt từ 2 triệu đến 20 triệu đồng, cộng tiền chậm nộp 0,03%/ngày.</p>

<h2>5. Luôn chuẩn bị tâm lý và hồ sơ cho kiểm tra, quyết toán</h2>
<p>Khi quyết toán, cơ quan thuế có thể yêu cầu giải trình bất kỳ khoản chi nào. Kế toán nội bộ cần:</p>
<ul>
  <li>Lưu trữ chứng từ đầy đủ, khoa học (ưu tiên số hóa).</li>
  <li>Có sẵn file giải trình cho các khoản chi lớn, chi tiếp khách, chi khấu hao…</li>
  <li>Hiểu rõ logic hạch toán của từng khoản để trả lời thuyết phục khi làm việc với cán bộ thuế.</li>
</ul>
<p>Cuối mỗi quý nên tự review lại hồ sơ, phát hiện sớm sai sót để khắc phục trước khi quyết toán năm.</p>`,
  },
  {
    title: 'Quốc hội chính thức bỏ ngưỡng chịu thuế 500 triệu đồng cho hộ kinh doanh',
    slug: 'quoc-hoi-chinh-thuc-bo-nguong-chiu-thue-500-trieu-dong-cho-ho-kinh-doanh',
    excerpt: 'Ngày 24/4/2026, Quốc hội khóa XVI đã thông qua Luật sửa đổi các luật thuế với tỷ lệ 93,2%, trong đó bãi bỏ ngưỡng chịu thuế cứng 500 triệu đồng/năm đối với hộ, cá nhân kinh doanh.',
    publishedAt: new Date('2026-04-29'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Quốc hội chính thức bỏ ngưỡng chịu thuế 500 triệu đồng cho hộ kinh doanh</h2>
<p>Ngày 24/4/2026, Quốc hội khóa XVI thông qua luật sửa đổi các luật thuế với tỷ lệ 93,2% (466/488 đại biểu). Điểm nổi bật là bãi bỏ ngưỡng chịu thuế cứng 500 triệu đồng/năm đối với hộ, cá nhân kinh doanh.</p>
<p>Thay vào đó, Chính phủ sẽ quy định mức doanh thu không phải nộp thuế phù hợp từng giai đoạn phát triển kinh tế-xã hội. Bộ trưởng Bộ Tài chính Ngô Văn Tuấn dự kiến mức ngưỡng mới là <strong>1 tỷ đồng/năm</strong>.</p>

<h2>Những thay đổi chính</h2>
<ul>
  <li><strong>Thuế TNCN:</strong> Cá nhân có doanh thu dưới mức Chính phủ quy định sẽ được miễn thuế</li>
  <li><strong>Thuế GTGT:</strong> Hộ kinh doanh có doanh thu dưới mức quy định không chịu thuế</li>
  <li><strong>Thuế TNDN:</strong> Doanh nghiệp nhỏ được miễn thuế nếu doanh thu dưới mức định</li>
</ul>

<h2>Tác động tích cực</h2>
<p>Chính sách mới hướng đến 2,55 triệu hộ kinh doanh có doanh thu dưới 1 tỷ đồng/năm, giảm gánh nặng thuế và khuyến khích mở rộng sản xuất kinh doanh, đặc biệt trong bối cảnh chi phí đầu vào tăng cao.</p>

<h2>Lợi ích thực tế</h2>
<p>Việc nâng ngưỡng từ 500 triệu lên 1 tỷ đồng giúp:</p>
<ul>
  <li>Hàng triệu hộ kinh doanh nhỏ được miễn hoàn toàn nghĩa vụ thuế</li>
  <li>Giảm thủ tục hành chính, chi phí tuân thủ thuế</li>
  <li>Khuyến khích hộ kinh doanh mở rộng quy mô mà không lo gánh nặng thuế tăng đột ngột</li>
  <li>Hỗ trợ phục hồi kinh tế sau giai đoạn khó khăn</li>
</ul>`,
  },
  {
    title: 'Luật thuế mới: Những điểm sửa đổi quan trọng mà doanh nghiệp cần biết',
    slug: 'luat-thue-moi-nhung-diem-sua-doi-quan-trong-ma-doanh-nghiep-can-biet',
    excerpt: 'Quốc hội thông qua Luật sửa đổi 4 Luật Thuế, bao gồm thuế thu nhập cá nhân, giá trị gia tăng, thu nhập doanh nghiệp và tiêu thụ đặc biệt, nhằm tăng tính linh hoạt và hỗ trợ doanh nghiệp.',
    publishedAt: new Date('2026-05-20'),
    categoryId: KE_TOAN_THUE_ID,
    content: `<h2>Luật thuế mới 2026: Những điểm sửa đổi quan trọng</h2>
<p>Quốc hội thông qua Luật sửa đổi 4 Luật Thuế, bao gồm thuế thu nhập cá nhân, giá trị gia tăng, thu nhập doanh nghiệp và tiêu thụ đặc biệt. Luật tập trung vào hoàn thiện cơ chế quản lý thuế theo hướng minh bạch, linh hoạt với nhấn mạnh hỗ trợ doanh nghiệp nhỏ và vừa, khuyến khích chuyển đổi số và phát triển xanh.</p>

<h2>Những điểm sửa đổi nổi bật</h2>
<ul>
  <li><strong>Thuế Thu nhập doanh nghiệp:</strong> Bổ sung quy định về mức doanh thu để xác định đối tượng được miễn thuế</li>
  <li><strong>Thuế Giá trị gia tăng:</strong> Sửa đổi danh mục hàng hóa, dịch vụ không chịu thuế và hoàn thiện cơ chế khấu trừ</li>
  <li><strong>Thuế Thu nhập cá nhân:</strong> Điều chỉnh quy định về thu nhập chịu thuế và khoản miễn thuế</li>
  <li><strong>Thuế Tiêu thụ đặc biệt:</strong> Sửa đổi mức thuế, đặc biệt cho xe điện để khuyến khích năng lượng xanh</li>
</ul>

<h2>Tác động tích cực cho doanh nghiệp</h2>
<ul>
  <li>Doanh nghiệp nhỏ và vừa được hưởng ưu đãi linh hoạt hơn</li>
  <li>Thủ tục khấu trừ và hoàn thuế GTGT được cải thiện</li>
  <li>Khuyến khích đầu tư công nghệ xanh và chuyển đổi số</li>
  <li>Tăng tính dự báo và ổn định chính sách thuế</li>
</ul>

<h2>Những việc doanh nghiệp cần chuẩn bị</h2>
<ol>
  <li><strong>Rà soát hệ thống kế toán:</strong> Chuyển đổi hoàn toàn sang hóa đơn điện tử, nâng cấp phần mềm kế toán</li>
  <li><strong>Xây dựng kế hoạch tài chính dài hạn:</strong> Dự báo doanh thu, chi phí và tối ưu các khoản khấu trừ</li>
  <li><strong>Chuẩn bị chuyển đổi số:</strong> Ưu tiên đầu tư công nghệ, tự động hóa quy trình</li>
  <li><strong>Tăng cường tuân thủ:</strong> Lưu trữ đầy đủ chứng từ, thực hiện kiểm toán nội bộ</li>
  <li><strong>Hợp tác với tư vấn chuyên nghiệp:</strong> Cập nhật chính sách mới, tối ưu hóa thuế hợp pháp</li>
</ol>`,
  },
  {
    title: 'Tiêu chí xác định doanh nghiệp siêu nhỏ mới nhất năm 2026 doanh nghiệp cần biết',
    slug: 'tieu-chi-xac-dinh-doanh-nghiep-sieu-nho-moi-nhat-nam-2026-doanh-nghiep-can-biet',
    excerpt: 'Trong những năm gần đây, nhóm doanh nghiệp siêu nhỏ đang chiếm tỷ lệ rất lớn trong cơ cấu doanh nghiệp Việt Nam. Bài viết hướng dẫn các tiêu chí xác định doanh nghiệp siêu nhỏ theo quy định năm 2026.',
    publishedAt: new Date('2026-05-31'),
    categoryId: PHAP_LUAT_DN_ID,
    content: `<h2>Tiêu chí xác định doanh nghiệp siêu nhỏ mới nhất năm 2026</h2>
<p>Trong những năm gần đây, nhóm doanh nghiệp siêu nhỏ đang chiếm tỷ lệ rất lớn trong cơ cấu doanh nghiệp Việt Nam. Việc xác định đúng quy mô giúp doanh nghiệp tiếp cận đúng các chính sách hỗ trợ.</p>

<h2>Định nghĩa doanh nghiệp siêu nhỏ</h2>
<p>Theo Luật Hỗ trợ doanh nghiệp nhỏ và vừa 2017, doanh nghiệp siêu nhỏ là một nhóm trong hệ thống doanh nghiệp nhỏ và vừa. Việc phân loại dựa trên ba tiêu chí: số lượng lao động tham gia bảo hiểm xã hội, tổng doanh thu của năm, và tổng nguồn vốn.</p>

<h2>Tiêu chí theo từng lĩnh vực</h2>

<h3>Nông nghiệp, công nghiệp, xây dựng</h3>
<ul>
  <li>Tối đa 10 người lao động tham gia bảo hiểm xã hội</li>
  <li>Doanh thu hoặc vốn không quá 3 tỷ đồng</li>
</ul>

<h3>Thương mại và dịch vụ</h3>
<ul>
  <li>Tối đa 10 người lao động tham gia bảo hiểm xã hội</li>
  <li>Doanh thu tối đa 10 tỷ đồng hoặc vốn không quá 3 tỷ đồng</li>
</ul>

<h2>Lợi ích của việc xác định đúng quy mô</h2>
<p>Doanh nghiệp siêu nhỏ được hưởng nhiều chính sách ưu đãi:</p>
<ul>
  <li>Chương trình hỗ trợ chuyển đổi số miễn phí</li>
  <li>Đào tạo nhân lực và tư vấn pháp lý</li>
  <li>Áp dụng chế độ kế toán đơn giản hơn</li>
  <li>Tiếp cận các chương trình hỗ trợ tín dụng ưu đãi</li>
  <li>Miễn thuế TNDN trong 3 năm đầu (theo Nghị quyết 198/2025/QH15)</li>
</ul>

<h2>Những hiểu lầm thường gặp</h2>
<ul>
  <li>Doanh thu thấp không đảm bảo xếp vào nhóm siêu nhỏ nếu vượt quá nhân công quy định</li>
  <li>Vốn điều lệ và tổng nguồn vốn là hai khái niệm khác nhau – cần dùng đúng chỉ tiêu</li>
  <li>Doanh nghiệp siêu nhỏ vẫn phải thực hiện đầy đủ các nghĩa vụ kế toán và thuế</li>
  <li>Mỗi năm cần rà soát lại tiêu chí vì doanh nghiệp có thể thay đổi nhóm phân loại</li>
</ul>`,
  },
]

async function main() {
  console.log('Bắt đầu nhập bài viết từ Bản tin...')

  for (const article of articles) {
    const existing = await prisma.post.findUnique({ where: { slug: article.slug } })
    if (existing) {
      console.log(`⚠️  Bỏ qua (đã tồn tại): ${article.title}`)
      continue
    }

    await prisma.post.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: 'PUBLISHED',
        categoryId: article.categoryId,
        publishedAt: article.publishedAt,
      },
    })
    console.log(`✅ Đã nhập: ${article.title}`)
  }

  console.log('\nHoàn thành nhập bài viết!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
