# Thuật Ngữ & Định Nghĩa (Glossary)

Tài liệu này định nghĩa các thuật ngữ, khái niệm và viết tắt chuẩn được sử dụng xuyên suốt trong hệ thống ZipCode Tools.

---

## 1. Thuật Ngữ Nghiệp Vụ

| Thuật Ngữ | Tên Tiếng Anh | Định Nghĩa & Phạm Vi Sử Dụng |
|---|---|---|
| **Mã Bưu Chính** | Postal Code / ZIP Code | Chuỗi ký tự (chữ số hoặc chữ cái kèm số) được bưu chính quốc gia cấp phát cho một khu vực địa lý cụ thể để định tuyến thư tín và bưu phẩm. |
| **ZIP Code** | Zone Improvement Plan Code | Tên gọi chuẩn của mã bưu chính tại Hoa Kỳ, gồm 5 chữ số cơ bản (hoặc 9 chữ số với định dạng mở rộng ZIP+4: `12345-6789`). |
| **Mã Quốc Gia ISO** | ISO Country Code | Mã 2 ký tự tiêu chuẩn quốc tế ISO 3166-1 alpha-2 đại diện cho quốc gia (ví dụ: `VN`, `US`, `GB`, `JP`, `CA`, `FR`, `DE`). |
| **Cấp Hành Chính 1** | Admin Division Level 1 (State / Province / Region) | Đơn vị hành chính cấp cao nhất dưới quốc gia (Tỉnh/Thành phố trực thuộc TW tại Việt Nam, State tại Mỹ, Prefecture tại Nhật). |
| **Cấp Hành Chính 2** | Admin Division Level 2 (County / District) | Đơn vị hành chính cấp trung (Quận/Huyện/Thị xã tại Việt Nam, County tại Mỹ, District tại Anh). |
| **Cấp Hành Chính 3** | Admin Division Level 3 (Ward / Commune / Town) | Đơn vị hành chính cấp cơ sở (Xã/Phường/Thị trấn tại Việt Nam). |
| **Tra Cứu 2 Chiều** | Bi-directional Lookup | Khả năng tìm kiếm theo 2 hướng: (1) Nhập mã bưu chính -> Ra thông tin địa phương; (2) Nhập địa danh/khu vực -> Ra danh sách mã bưu chính tương ứng. |
| **Tìm Kiếm Tức Thì** | Autocomplete / Instant Search | Cơ chế hiển thị danh sách gợi ý kết quả khi người dùng gõ từng ký tự với độ trễ phản hồi thấp (< 100ms). |

---

## 2. Thuật Ngữ Kỹ Thuật

| Thuật Ngữ | Định Nghĩa Trong Dự Án |
|---|---|
| **Offline Dataset** | Tập dữ liệu mã bưu chính được đóng gói và lưu trữ cục bộ trong dự án (dưới dạng SQLite / partitioned JSON), phục vụ tra cứu mà không phụ thuộc vào kết nối API bên ngoài. |
| **Fuzzy Search** | Thuật toán tìm kiếm gần đúng, cho phép tìm kiếm địa danh không dấu, có dấu, hoặc bỏ qua sai sót chính tả nhỏ. |
| **Server Component (RSC)** | Thành phần React chạy trên máy chủ (Next.js App Router) giúp truy vấn dữ liệu trực tiếp, tối ưu SEO và giảm tải dung lượng JavaScript gửi xuống trình duyệt. |
| **Route Handler / API Route** | Điểm cuối (Endpoint) HTTP do Next.js cung cấp (`/api/v1/...`) phục vụ các yêu cầu tìm kiếm dạng JSON từ client. |
