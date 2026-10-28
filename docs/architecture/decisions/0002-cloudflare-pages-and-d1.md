# ADR-0002: Triển Khai Ứng Dụng Lên Cloudflare Pages và Sử Dụng Cloudflare D1 Database

## Status
Accepted (Thay thế [ADR-0001](./0001-tech-stack-and-storage.md))

## Context
Ban đầu tại ADR-0001, dự án định hướng triển khai ứng dụng trên máy chủ Node.js truyền thống sử dụng thư viện SQLite cục bộ `better-sqlite3`. Tuy nhiên, để tối ưu hóa chi phí vận hành, tận dụng mạng lưới máy chủ biên (Edge Network) phân tán toàn cầu với độ trễ cực thấp (< 30ms trên toàn thế giới), dự án chuyển hướng triển khai toàn bộ ứng dụng lên hệ sinh thái **Cloudflare**:
1. **Nền tảng Hosting:** Cloudflare Pages (hỗ trợ Next.js Edge Runtime thông qua `@cloudflare/next-on-pages` hoặc OpenNext).
2. **Cơ sở dữ liệu:** **Cloudflare D1** – giải pháp cơ sở dữ liệu quan hệ Serverless phân tán của Cloudflare, tương thích hoàn toàn với chuẩn SQLite.

## Decision
1. **Hosting & Compute:** Triển khai website Next.js lên **Cloudflare Pages**. Toàn bộ Server Components và API Routes sẽ chạy trên V8 Edge Workers Runtime (workerd).
2. **Database Engine:** Sử dụng **Cloudflare D1** làm kho dữ liệu chính cho hệ thống mã bưu chính toàn cầu.
3. **Cơ Chế Kết Nối:** Truy vấn thông qua Cloudflare D1 Binding (`env.DB`) được tiêm trực tiếp vào request context, kết hợp cùng **Drizzle ORM** (driver `drizzle-orm/d1`) hoặc D1 Client API chuẩn (`env.DB.prepare(...).bind(...).all()`).
4. **Quản Lý Migration & Nạp Dữ Liệu:** Sử dụng công cụ dòng lệnh **Wrangler CLI** (`wrangler.jsonc` / `wrangler.toml`) với các câu lệnh:
   - Chạy cục bộ: `wrangler d1 execute <DB_NAME> --local --file=...`
   - Triển khai production: `wrangler d1 execute <DB_NAME> --remote --file=...`

## Alternatives Considered

### Lựa chọn A: Giữ máy chủ Node.js truyền thống (VPS / Docker) + `better-sqlite3` (theo ADR-0001)
- **Ưu điểm:** Quen thuộc, không bị giới hạn môi trường Node.js.
- **Nhược điểm:** Phải trả chi phí thuê máy chủ hàng tháng; không có sẵn CDN/Edge toàn cầu; độ trễ cao khi người dùng truy cập từ các quốc gia khác nhau; phải tự bảo trì hạ tầng, SSL, chống DDoS.

### Lựa chọn B: Sử dụng Cloudflare KV (Key-Value)
- **Ưu điểm:** Tích hợp sâu vào Cloudflare, tốc độ đọc cache cực nhanh.
- **Nhược điểm:** KV chỉ hỗ trợ truy xuất theo Key duy nhất, không hỗ trợ câu lệnh SQL truy vấn quan hệ, không có `LIKE '%...%'`, không đánh được Compound Index để phục vụ tìm kiếm 2 chiều (Mã $\leftrightarrow$ Địa danh).

### Lựa chọn C: Cloudflare Pages + Cơ sở dữ liệu bên ngoài (Supabase / PlanetScale / Neon)
- **Ưu điểm:** Tách biệt database sang nhà cung cấp chuyên biệt.
- **Nhược điểm:** Kết nối từ Cloudflare Edge sang DB bên ngoài tạo độ trễ mạng (network hop) từ 100ms - 200ms; phát sinh chi phí hoặc quản lý tài khoản riêng rẽ.

## Consequences

### Tích Cực
- **Độ trễ toàn cầu cực thấp:** Dữ liệu và ứng dụng chạy sát người dùng cuối nhờ mạng lưới 300+ data center của Cloudflare.
- **Chi phí tối ưu:** Tận dụng gói miễn phí rất hào phóng của Cloudflare Pages (không giới hạn băng thông) và Cloudflare D1 (5 triệu lượt đọc/ngày, 100.000 lượt ghi/ngày).
- **Kế thừa 100% cú pháp SQLite:** Cấu trúc bảng `countries`, `zipcodes` và các chỉ mục B-Tree đã thiết kế ở [Data Model](../data-model.md) được tái sử dụng nguyên vẹn trên D1 mà không cần chỉnh sửa cú pháp SQL.
- **Bảo mật và chống DDoS tích hợp:** Thừa hưởng sẵn hạ tầng bảo vệ chống DDoS, chứng chỉ SSL tự động của Cloudflare.

### Đánh Đổi / Hạn Chế
- **Môi trường Edge Runtime:** Không thể sử dụng các module C++ Native của Node.js (như `better-sqlite3`, `fs`, `path`). Toàn bộ truy vấn phải dùng D1 binding API.
- **Giới hạn dung lượng của D1:** Free tier tối đa 500MB/database (Paid tier tối đa 10GB/database). Với quyết định chọn Phương án 2 (nạp toàn bộ ~1.200.000 bản ghi mã bưu chính toàn cầu từ GeoNames và Việt Nam), dung lượng đạt khoảng 140MB – 180MB, nằm an toàn trong hạn ngạch 500MB của Free Tier.
- **Quy trình nạp dữ liệu lớn (Seeding):** Việc nạp 1.2 triệu dòng vào D1 đòi hỏi chia nhỏ thành các file SQL chunks (~5.000 – 10.000 dòng/file) để thực thi tuần tự qua Wrangler CLI, có script tự động hóa để tránh timeout khi import.

## Related Documents
- [ADR-0001: Lựa Chọn Cũ (Superseded)](./0001-tech-stack-and-storage.md)
- [System Overview](../system-overview.md)
- [Data Model](../data-model.md)
- [Engineering Guidelines](../../engineering/guidelines.md)
