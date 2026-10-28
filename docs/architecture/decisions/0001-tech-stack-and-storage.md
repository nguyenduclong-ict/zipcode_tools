# ADR-0001: Lựa Chọn Tech Stack Next.js và Cơ Sở Dữ Liệu SQLite Cục Bộ

## Status
Superseded (Đã được thay thế bởi [ADR-0002: Triển Khai Lên Cloudflare Pages và Cloudflare D1](./0002-cloudflare-pages-and-d1.md))

> [!NOTE]
> Quyết định này là thiết kế ban đầu khi chạy trên máy chủ Node.js truyền thống. Dự án đã được chuyển hướng triển khai lên nền tảng **Cloudflare Pages** và sử dụng **Cloudflare D1** làm database phân tán theo [ADR-0002](./0002-cloudflare-pages-and-d1.md).

## Context
Dự án ZipCode Tools yêu cầu một website công cụ tra cứu mã bưu chính (Zip/Postal Code) với các đặc thù:
1. **Phạm vi toàn cầu:** Cần hỗ trợ nhiều quốc gia, khối lượng bản ghi có thể từ hàng chục ngàn đến hàng triệu dòng.
2. **Tra cứu 2 chiều:** Phải tìm kiếm nhanh theo cả mã số (Postal Code) và chuỗi chữ (Tên địa danh/Tỉnh/Bang).
3. **Độc lập và Offline-first:** Không bị phụ thuộc vào các API bên thứ ba (tránh rủi ro bị rate-limit, độ trễ mạng, chi phí API hoặc dịch vụ bên ngoài ngừng hoạt động).
4. **Tối ưu SEO và Hiệu năng:** Cần thời gian phản hồi tức thì (< 50ms) và khả năng tạo trang tĩnh / SSR phục vụ việc xếp hạng trên các công cụ tìm kiếm (Google, Bing).

## Decision
Chúng tôi quyết định:
1. **Khung ứng dụng (Web Framework):** Sử dụng **Next.js (App Router)** với React, TypeScript và Tailwind CSS.
2. **Cơ sở dữ liệu & Lưu trữ (Data Storage):** Sử dụng **Embedded SQLite** (`better-sqlite3`), lưu trữ file database cục bộ trong dự án (`data/zipcodes.db`).
3. **Kiến trúc dữ liệu:** Chuẩn hóa dữ liệu theo chuẩn bưu chính quốc tế (GeoNames Postal Data Scheme) kèm hệ thống chỉ mục kép (Compound B-Tree Indexes) trên `(country_code, postal_code)` và `(country_code, place_name)`.

## Alternatives Considered

### Lựa chọn A: Frontend tĩnh (Vite + React) tải toàn bộ file JSON vào trình duyệt
- **Ưu điểm:** Deploy cực kỳ đơn giản lên GitHub Pages hoặc Cloudflare Pages; không cần server backend.
- **Nhược điểm:** Dữ liệu bưu chính đa quốc gia có dung lượng từ hàng chục đến hàng trăm MB. Tải toàn bộ JSON về client sẽ làm nghẽn băng thông người dùng, tăng thời gian tải trang đầu tiên (TTFB) và tiêu tốn nhiều RAM trên thiết bị di động; khả năng SEO rất kém.

### Lựa chọn B: Gọi Live API bên thứ ba (như Zippopotam.us, Google Geocoding API)
- **Ưu điểm:** Không cần quản lý cơ sở dữ liệu và file dữ liệu.
- **Nhược điểm:** Phụ thuộc vào tính ổn định của bên thứ ba, độ trễ truy vấn mạng cao (300ms - 1500ms), rủi ro dính hạn mức gọi (Rate limit) và có thể phát sinh chi phí duy trì. Không đáp ứng tiêu chí offline độc lập mà dự án đề ra.

### Lựa chọn C: Sử dụng cơ sở dữ liệu Client-Server riêng biệt (PostgreSQL / MySQL / MongoDB)
- **Ưu điểm:** Khả năng mở rộng cụm dữ liệu phân tán cao.
- **Nhược điểm:** Phức tạp hóa hạ tầng triển khai không cần thiết đối với một ứng dụng tra cứu bưu chính vốn mang tính chất Read-heavy (chỉ đọc dữ liệu tĩnh, hiếm khi ghi); chi phí vận hành server đắt đỏ hơn SQLite.

## Consequences

### Tích Cực
- **Tốc độ truy vấn siêu tốc:** SQLite chạy in-process với Next.js server, truy vấn chỉ mục chỉ mất từ 1ms đến 5ms.
- **Độc lập và linh hoạt:** Đóng gói toàn bộ mã nguồn và dữ liệu vào một nơi duy nhất, dễ dàng chạy trên máy cục bộ hoặc đóng gói Docker container chạy ở bất kỳ máy chủ nào.
- **SEO vượt trội:** Next.js Server Components cho phép render sẵn thông tin địa danh, sinh sitemap và thẻ meta động tự động.
- **Chi phí vận hành bằng 0:** Không tốn tiền duy trì database server độc lập hay phí API bên ngoài.

### Đánh Đổi / Hạn Chế
- Việc cập nhật dữ liệu mới đòi hỏi chạy script nạp lại database và build lại/triển khai ứng dụng.
- File cơ sở dữ liệu SQLite sẽ chiếm từ 30MB đến 150MB trên dung lượng đĩa tùy số lượng quốc gia nạp vào.

## Related Documents
- [System Overview](../system-overview.md)
- [Data Model Specification](../data-model.md)
- [Feature Spec: Zipcode Lookup](../../specifications/features/zipcode-lookup/spec.md)
