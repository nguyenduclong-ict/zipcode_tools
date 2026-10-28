# Yêu Cầu Sản Phẩm Tổng Thể (Product Requirements Document - PRD)

## 1. Tổng Quan Dự Án
### Mục tiêu (Goal)
Xây dựng một website công cụ trực tuyến hiện đại, tối ưu tốc độ và thân thiện với người dùng, phục vụ nhu cầu tra cứu mã bưu chính (Zip/Postal Code) trên phạm vi toàn cầu (hỗ trợ nhiều quốc gia phổ biến), hỗ trợ tìm kiếm 2 chiều linh hoạt, hoạt động dựa trên kho dữ liệu offline độc lập và tối ưu SEO.

### Đối tượng người dùng mục tiêu (Target Users)
- **Cá nhân mua sắm quốc tế / gửi hàng chuyển phát:** Cần kiểm tra mã Zip code để điền địa chỉ giao hàng, thanh toán qua cổng quốc tế (Amazon, eBay, AliExpress, Stripe,...).
- **Nhân viên bưu chính, logistics, kho vận:** Cần xác minh nhanh mã bưu chính theo tỉnh/thành phố/quận/huyện và ngược lại.
- **Lập trình viên / Doanh nghiệp e-commerce:** Cần một công cụ tra cứu tham chiếu nhanh, chuẩn xác và có thể cung cấp API nội bộ.

---

## 2. Phạm Vi Sản Phẩm (Scope)

### Trong Phạm Vi (In Scope)
1. **Phạm vi địa lý (Coverage):**
   - Hỗ trợ toàn bộ dữ liệu mã bưu chính toàn cầu từ tập dữ liệu đầy đủ GeoNames (`allCountries.zip` với hơn 1.200.000 bản ghi của gần 100 quốc gia trên thế giới) kết hợp đồng bộ bộ mã bưu chính quốc gia 5 chữ số chính thức của Việt Nam (từ Bộ TT&TT / VNPost với ~30.000 xã/phường/bưu cục).
2. **Khả năng tra cứu 2 chiều (Bi-directional Lookup):**
   - Hướng 1: Tra cứu từ mã Zip code -> hiển thị quốc gia, bang/tỉnh, quận/huyện, tọa độ (nếu có).
   - Hướng 2: Tra cứu từ tên địa danh / thành phố / quận huyện -> danh sách các mã Zip code liên quan.
3. **Trải nghiệm tìm kiếm (Search UX):**
   - Tìm kiếm nhanh với thanh search thông minh (tự nhận diện từ khóa là mã số hay địa danh).
   - Hỗ trợ bộ lọc theo Quốc gia (Country Selector / Filter).
   - Autocomplete / Instant Suggestions khi gõ từ khóa.
   - Hỗ trợ tìm kiếm không dấu (cho tiếng Việt) và không phân biệt hoa thường.
4. **Chi tiết kết quả & Tiện ích:**
   - Thẻ hiển thị kết quả rõ ràng, có nút Copy to Clipboard (1-click copy mã zip hoặc địa chỉ đầy đủ).
   - Trang danh mục quốc gia & danh mục phân cấp hành chính (Country Directory / Browse by Country/State) hỗ trợ SEO.
5. **Hiệu năng & Vận hành:**
   - Vận hành trên hạ tầng Cloudflare Pages và Cloudflare D1 (Serverless SQLite tại Edge, không phụ thuộc API bên thứ 3).
   - Thời gian phản hồi tìm kiếm tại Edge < 50ms.
   - Giao diện responsive trên mobile, tablet, desktop; hỗ trợ Dark/Light mode.

### Ngoài Phạm Vi (Out of Scope - Giai đoạn 1)
- Tính năng tài khoản người dùng, đăng ký, đăng nhập.
- Tích hợp cổng thanh toán hoặc tính phí dịch vụ.
- Tra cứu theo số nhà / tên đường chi tiết đến từng ngõ ngách (vì bưu chính đa quốc gia phân cấp chuẩn theo khu vực/xã/phường/quận/huyện).
- Dịch vụ gửi thư tín vật lý.

---

## 3. Yêu Cầu Chức Năng (Functional Requirements Summary)

| Mã | Tên Yêu Cầu | Mức Độ Ưu Tiên | Mô Tả Tóm Tắt |
|---|---|---|---|
| `REQ-001` | Tra cứu theo Mã Zip | P0 (Bắt buộc) | Nhập chuỗi mã bưu chính, hiển thị thông tin địa lý tương ứng kèm danh sách gợi ý. |
| `REQ-002` | Tra cứu theo Địa Danh | P0 (Bắt buộc) | Nhập tên thành phố, tỉnh, bang, quận huyện để tìm ra mã bưu chính tương ứng. |
| `REQ-003` | Lọc / Chọn Quốc Gia | P0 (Bắt buộc) | Cho phép chọn quốc gia cụ thể hoặc tìm kiếm trên toàn bộ quốc gia đang có trong hệ thống. |
| `REQ-004` | Autocomplete & Gợi Ý | P1 (Quan trọng) | Hiển thị dropdown gợi ý kết quả khi người dùng gõ từ ký tự thứ 2 trở lên. |
| `REQ-005` | Sao chép nhanh kết quả | P1 (Quan trọng) | Nút bấm 1-click sao chép mã zip hoặc chuỗi địa chỉ chuẩn hóa. |
| `REQ-006` | Danh mục duyệt theo Quốc gia (Directory) | P1 (Quan trọng) | Trang hiển thị danh sách các quốc gia hỗ trợ và phân cấp hành chính phục vụ người dùng duyệt web & SEO. |
| `REQ-007` | API Tra Cứu Nội Bộ | P2 (Mở rộng) | Cung cấp endpoint RESTful nội bộ (`/api/v1/search`, `/api/v1/countries`, `/api/v1/lookup/:code`) phục vụ frontend hoặc tích hợp. |

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

- **Hiệu năng (Performance):** 
  - Tốc độ phản hồi API tra cứu < 50ms cho các truy vấn qua Cloudflare D1 index tại Edge.
  - Điểm Google Lighthouse: Performance > 90, Accessibility > 95, SEO > 95.
- **Tính khả dụng (Availability & Independence):** 
  - 100% độc lập với API ngoài khi truy vấn, toàn bộ dữ liệu zip code được lưu trữ phân tán trực tiếp trên Cloudflare D1.
- **Bảo mật (Security):** 
  - Khử mã độc (Sanitization) toàn bộ dữ liệu đầu vào trong truy vấn tìm kiếm để chống SQL Injection / XSS.
  - Rate limiting nhẹ trên API route để phòng ngừa spam request.
- **Khả năng tương thích (Compatibility):** 
  - Hoạt động trơn tru trên mọi trình duyệt hiện đại (Chrome, Safari, Firefox, Edge) và mọi kích thước màn hình (Mobile first).
