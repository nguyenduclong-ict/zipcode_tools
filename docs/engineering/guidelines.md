# Hướng Dẫn Kỹ Thuật & Quy Chuẩn Lập Trình (Engineering Guidelines)

Tài liệu này quy định các tiêu chuẩn kỹ thuật, cấu trúc mã nguồn và quy trình phát triển cho dự án ZipCode Tools.

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án được tổ chức theo chuẩn Next.js App Router:

```text
zipcode_tools/
├── app/                           # Next.js App Router (Edge Runtime)
│   ├── layout.tsx                 # Root layout (Metadata, Tailwind, Font, Header, Footer)
│   ├── page.tsx                   # Trang chủ: Thanh tìm kiếm, Quốc gia nổi bật, FAQ
│   ├── countries/                 # Trang danh mục quốc gia (/countries)
│   │   ├── page.tsx               # Danh sách tất cả quốc gia hỗ trợ
│   │   └── [country]/             # Danh mục bưu chính theo quốc gia (/countries/us, /countries/vn)
│   │       └── page.tsx
│   ├── zip/                       # Trang chi tiết mã bưu chính phục vụ SEO (/zip/us/90210)
│   │   └── [country]/
│   │       └── [code]/
│   │           └── page.tsx
│   └── api/                       # API Route Handlers (Edge runtime: export const runtime = 'edge')
│       └── v1/
│           ├── search/            # GET /api/v1/search?q=...&country=...
│           │   └── route.ts
│           └── countries/         # GET /api/v1/countries
│               └── route.ts
├── components/                    # UI Components có thể tái sử dụng
│   ├── SearchBar.tsx              # Thanh tìm kiếm thông minh với Autocomplete
│   ├── CountrySelector.tsx        # Dropdown lựa chọn quốc gia
│   ├── ResultCard.tsx             # Thẻ hiển thị thông tin bưu chính & địa danh
│   ├── ResultList.tsx             # Danh sách kết quả tìm kiếm kèm phân trang
│   ├── CopyButton.tsx             # Nút bấm sao chép kèm toast thông báo
│   ├── Navbar.tsx                 # Thanh điều hướng trên cùng
│   └── Footer.tsx                 # Chân trang với liên kết và bản quyền
├── lib/                           # Logic nghiệp vụ và tiện ích
│   ├── db.ts                      # Helper kết nối Cloudflare D1 (env.DB binding)
│   ├── search-service.ts          # Logic tìm kiếm 2 chiều, nhận diện và chuẩn hóa từ khóa
│   └── utils.ts                   # Các hàm định dạng chuỗi, debounce, xử lý tiếng Việt
├── migrations/                    # SQL Schema & Migrations cho Cloudflare D1
│   └── 0001_initial_schema.sql    # Khởi tạo bảng countries, zipcodes và các index
├── data/                          # Nguồn dữ liệu & script sinh SQL
│   └── seed/                      # File dữ liệu gốc và SQL chunks nạp vào D1
├── scripts/                       # Scripts hỗ trợ nạp và tiền xử lý dữ liệu
│   └── generate-d1-sql.ts         # Script chuyển đổi dữ liệu nguồn thành SQL inserts cho D1
├── docs/                          # Hệ thống tài liệu dự án
├── wrangler.jsonc                 # Cấu hình Cloudflare Pages, D1 Database Binding
├── env.d.ts                       # Định nghĩa TypeScript interface cho Cloudflare CloudflareEnv (DB: D1Database)
└── public/                        # Tài nguyên tĩnh (Favicon, Logo, Cờ các quốc gia SVG)
```

---

## 2. Quy Chuẩn Code (Coding Conventions)

- **Cloudflare Edge Runtime:**
  - Trong các API Routes và Server Components truy vấn database, khai báo `export const runtime = 'edge';`.
  - Không sử dụng các module native của Node.js (không dùng `better-sqlite3`, `fs`, `child_process`).
- **Tương Tác Với Cloudflare D1:**
  - Nhận D1 instance thông qua Cloudflare context binding:
    ```typescript
    // Ví dụ trong Next.js App Router với @cloudflare/next-on-pages
    import { getRequestContext } from '@cloudflare/next-on-pages';

    export const runtime = 'edge';

    export async function GET(request: Request) {
      const db = getRequestContext().env.DB;
      const stmt = db.prepare('SELECT * FROM zipcodes WHERE postal_code = ?').bind('90210');
      const { results } = await stmt.all();
      return Response.json(results);
    }
    ```
  - Luôn sử dụng `db.prepare(...).bind(...)` để ngăn ngừa SQL Injection 100%.
- **TypeScript:** 
  - Kích hoạt `strict: true` trong `tsconfig.json`.
  - Khai báo rõ ràng interface `CloudflareEnv` trong `env.d.ts`:
    ```typescript
    interface CloudflareEnv {
      DB: D1Database;
    }
    ```
- **Styling:**
  - Sử dụng Tailwind CSS với các utility classes chuẩn.
  - Hỗ trợ tốt cho cả Dark Mode và Light Mode thông qua CSS variables hoặc class `dark:`.

---

## 3. Quy Trình Phát Triển & Triển Khai (Development & Deployment Workflow)

1. **Phát triển cục bộ (Local Development):**
   - Chạy migration D1 local:
     ```bash
     npx wrangler d1 execute zipcodes-db --local --file=./migrations/0001_initial_schema.sql
     ```
   - Nạp dữ liệu seed local (tự động nạp tuần tự các chunks SQL):
     ```bash
     npm run db:seed:local
     # hoặc nạp từng chunk: npx wrangler d1 execute zipcodes-db --local --file=./data/seed/chunks/chunk_001.sql
     ```
   - Chạy môi trường dev hỗ trợ D1 binding:
     ```bash
     npm run pages:dev
     ```
2. **Triển khai lên Cloudflare Pages (Production Deployment):**
   - Tạo D1 Database trên Cloudflare:
     ```bash
     npx wrangler d1 create zipcodes-db
     ```
   - Khai báo database ID vào `wrangler.jsonc` (hoặc `wrangler.toml`).
   - Chạy migration trên production:
     ```bash
     npx wrangler d1 execute zipcodes-db --remote --file=./migrations/0001_initial_schema.sql
     ```
   - Nạp toàn bộ dữ liệu ~1.2M dòng lên Cloudflare D1 Remote qua script tự động:
     ```bash
     npm run db:seed:remote
     ```
   - Kết nối GitHub repository với **Cloudflare Pages**, chọn framework preset là **Next.js**. Hệ thống sẽ tự động build và deploy mỗi khi push code lên nhánh chính.
