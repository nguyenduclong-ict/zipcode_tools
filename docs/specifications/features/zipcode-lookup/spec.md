# Feature: Tra Cứu Mã Bưu Chính 2 Chiều (Bi-directional Zipcode Lookup)

## 1. Overview
### Purpose
Cung cấp cho người dùng một công cụ tra cứu mã bưu chính (Zip/Postal Code) và địa danh nhanh chóng, chính xác theo cả 2 chiều (Mã -> Địa danh và Địa danh -> Mã) trên phạm vi toàn cầu, vận hành dựa trên cơ sở dữ liệu offline độc lập.

### Background
Khi mua hàng online quốc tế hoặc làm các thủ tục chuyển phát bưu kiện, người dùng thường xuyên gặp trở ngại khi không biết mã bưu chính của khu vực mình ở hoặc ngược lại, nhận được một mã bưu chính lạ nhưng không biết thuộc bang/tỉnh/thành phố nào. Các công cụ hiện tại thường bị phụ thuộc mạng bên ngoài, chậm hoặc giao diện phức tạp và thiếu hỗ trợ đa quốc gia.

### Status
Implemented

---

## 2. Scope
### In Scope
- Tra cứu theo mã bưu chính (Postal Code) nhập vào (hỗ trợ nhập chính xác hoặc tiền tố).
- Tra cứu theo tên địa danh (Tên thành phố, bang, tỉnh, quận/huyện) bằng tiếng Việt hoặc tiếng Anh.
- Bộ lọc chọn quốc gia theo danh sách hỗ trợ (US, VN, GB, CA, JP, FR, DE, AU,...) hoặc chọn "Tất cả quốc gia".
- Tự động gợi ý từ khóa (Autocomplete / Instant Search) khi người dùng gõ từ 2 ký tự trở lên.
- Sao chép 1-click (Copy to clipboard) mã zip hoặc chuỗi địa chỉ đầy đủ.
- Trang chi tiết hiển thị đầy đủ thông tin phân cấp hành chính (Quốc gia, Cấp 1, Cấp 2, Cấp 3, Tọa độ địa lý nếu có).

### Out of Scope
- Định tuyến dẫn đường hoặc bản đồ chỉ đường chi tiết.
- Đăng nhập/lưu lịch sử tìm kiếm vào tài khoản cá nhân trên mây (chỉ lưu cục bộ ở LocalStorage nếu cần).
- Cập nhật dữ liệu bưu chính động từ người dùng cuối (dữ liệu chỉ đọc).

---

## 3. Actors and Permissions
- **Khách vãng lai (Public Visitor):**
  - Quyền hạn: Toàn quyền truy cập tìm kiếm, tra cứu, sao chép kết quả và duyệt danh mục quốc gia không cần đăng nhập.
  - Hạn chế: Không thể chỉnh sửa, thêm, xóa dữ liệu trong hệ thống.
- **Quản trị viên / Nhà phát triển hệ thống (Developer / System Admin):**
  - Quyền hạn: Chạy script nạp và cập nhật cơ sở dữ liệu (`scripts/seed.ts`), kiểm tra logs hệ thống.

---

## 4. Functional Requirements

### FR-001: Tìm Kiếm Theo Mã Bưu Chính (Postal Code Search)
- **Description:** Người dùng nhập chuỗi ký tự đại diện cho mã bưu chính (ví dụ: `10000`, `90210`, `SW1A`), hệ thống trả về thông tin địa phương tương ứng.
- **Preconditions:** Cơ sở dữ liệu SQLite đã được nạp dữ liệu bưu chính.
- **Expected Behavior:**
  - Nếu chọn một quốc gia cụ thể: Tìm kiếm mã bưu chính bắt đầu bằng hoặc khớp với từ khóa trong quốc gia đó.
  - Nếu chọn "Tất cả quốc gia": Tìm kiếm trên toàn bộ các quốc gia trong cơ sở dữ liệu.
  - Hiển thị danh sách kết quả phù hợp nhất xếp theo độ khớp chính xác (Exact match ưu tiên trước Prefix match).
- **Failure Behavior:** Nếu không tìm thấy kết quả, hiển thị thông báo "Không tìm thấy mã bưu chính phù hợp" kèm gợi ý kiểm tra lại quốc gia hoặc từ khóa.
- **Acceptance Criteria:**
  - `AC-001`: Nhập `90210` với quốc gia là `Hoa Kỳ (US)` phải trả về kết quả `Beverly Hills, California`.
  - `AC-002`: Nhập `10000` với quốc gia là `Việt Nam (VN)` phải trả về kết quả `Hà Nội`.
  - `AC-003`: Kết quả tìm kiếm trả về trong thời gian dưới 50ms.

### FR-002: Tìm Kiếm Theo Địa Danh / Khu Vực (Place Name Search)
- **Description:** Người dùng nhập tên thành phố, thị trấn, quận/huyện hoặc bang/tỉnh (ví dụ: `Los Angeles`, `Đà Nẵng`, `Tokyo`), hệ thống trả về danh sách các mã bưu chính thuộc địa danh đó.
- **Preconditions:** Người dùng nhập tối thiểu 2 ký tự vào ô tìm kiếm.
- **Expected Behavior:**
  - Hệ thống tìm kiếm không phân biệt hoa thường (Case-insensitive).
  - Đối với tiếng Việt, hỗ trợ tìm kiếm không dấu (ví dụ: gõ `Da Nang` vẫn tìm ra `Đà Nẵng`).
  - Trả về danh sách phân trang (hoặc giới hạn 50 kết quả đầu tiên) kèm tổng số kết quả tìm thấy.
- **Failure Behavior:** Hiển thị thông báo không có kết quả và gợi ý từ khóa liên quan.
- **Acceptance Criteria:**
  - `AC-004`: Nhập `Tokyo` và chọn Nhật Bản (`JP`) trả về các mã bưu chính tại Tokyo.
  - `AC-005`: Nhập `Ho Chi Minh` hoặc `Hồ Chí Minh` và chọn Việt Nam (`VN`) đều trả về danh sách mã bưu chính thuộc TP. Hồ Chí Minh.

### FR-003: Lọc & Chọn Quốc Gia (Country Filter)
- **Description:** Cung cấp menu lựa chọn quốc gia hỗ trợ, hiển thị tên quốc gia, cờ và định dạng mã bưu chính mẫu.
- **Preconditions:** Bảng `countries` có dữ liệu.
- **Expected Behavior:**
  - Mặc định hiển thị tùy chọn "Tất cả quốc gia" hoặc ghi nhớ quốc gia gần nhất người dùng đã chọn qua LocalStorage.
  - Khi thay đổi quốc gia, ô tìm kiếm cập nhật placeholder gợi ý mã mẫu tương ứng với quốc gia đó (ví dụ: `VD: 90210` cho US, `VD: 10000` cho VN).
- **Acceptance Criteria:**
  - `AC-006`: Chọn quốc gia từ dropdown sẽ tự động cập nhật phạm vi tìm kiếm của API tương ứng.

### FR-004: Gợi Ý Tự Động Tức Thì (Instant Autocomplete Suggestions)
- **Description:** Khi người dùng bắt đầu nhập từ khóa trong thanh tìm kiếm, hệ thống hiển thị một popover/dropdown chứa tối đa 8 kết quả nhanh nhất.
- **Preconditions:** Từ khóa có độ dài >= 2 ký tự.
- **Expected Behavior:**
  - Debounce 250ms trước khi gửi request tìm kiếm gợi ý.
  - Mỗi mục gợi ý hiển thị rõ: [Mã Bưu Chính] - [Địa danh, Bang/Tỉnh, Quốc gia].
  - Người dùng có thể nhấn phím mũi tên lên/xuống và Enter để chọn nhanh một kết quả.
- **Acceptance Criteria:**
  - `AC-007`: Dropdown gợi ý hiển thị trong vòng 100ms sau khi debounce kết thúc.
  - `AC-008`: Nhấn Enter hoặc click vào gợi ý sẽ điều hướng đến trang chi tiết hoặc điền vào ô tìm kiếm.

### FR-005: Tiện Ích Sao Chép Kết Quả 1-Click (Copy to Clipboard)
- **Description:** Cho phép người dùng nhấp vào biểu tượng sao chép để copy mã bưu chính hoặc địa chỉ đầy đủ vào bộ nhớ tạm.
- **Expected Behavior:**
  - Khi nhấn nút Copy, hiển thị thông báo tooltip / toast "Đã sao chép!" trong 2 giây.
  - Hỗ trợ fallback cho các trình duyệt không có `navigator.clipboard`.
- **Acceptance Criteria:**
  - `AC-009`: Nội dung sao chép đúng 100% với giá trị hiển thị trên thẻ kết quả.

---

## 5. Business Rules
### BR-001: Định Dạng & Chuẩn Hóa Chuỗi Tìm Kiếm
- Toàn bộ chuỗi tìm kiếm được cắt bỏ khoảng trắng thừa ở 2 đầu (trim) trước khi xử lý.
- Tự động nhận diện hướng tìm kiếm:
  - Nếu chuỗi chỉ gồm số hoặc ký tự mã bưu chính đặc trưng (như `SW1A 1AA` của Anh): Ưu tiên tìm kiếm theo cột `postal_code`.
  - Nếu chuỗi chứa các từ chữ cái thông thường: Tìm kiếm theo cột `place_name`, `admin_name1`, `admin_name2`.

### BR-002: Giới Hạn Kết Quả Trả Về (Result Capping)
- Để bảo vệ hiệu năng máy chủ và giao diện người dùng, mỗi lượt tìm kiếm trả về tối đa 50 bản ghi cho trang kết quả và tối đa 8 bản ghi cho menu autocomplete.

### BR-003: Phân Định Phạm Vi Dữ Liệu
- Mọi dữ liệu trả về phải lấy trực tiếp từ cơ sở dữ liệu **Cloudflare D1** (Serverless SQLite tại Edge). Không thực hiện bất kỳ lệnh gọi HTTP ra API bên thứ 3 nào trong luồng tìm kiếm thời gian thực.

---

## 6. User & System Flows

### 6.1. Main Flow: Tra Cứu Mã Bưu Chính
1. Người dùng truy cập trang chủ `/`.
2. Người dùng chọn Quốc gia (hoặc giữ mặc định "Tất cả quốc gia").
3. Người dùng nhập mã bưu chính hoặc địa danh vào thanh tìm kiếm.
4. Sau 250ms debounce, menu Autocomplete hiển thị danh sách gợi ý nhanh.
5. Người dùng nhấn nút "Tìm kiếm" (hoặc phím Enter).
6. Hệ thống hiển thị danh sách kết quả chi tiết kèm phân cấp hành chính và nút Copy.
7. Người dùng click vào nút sao chép để lấy mã bưu chính.

### 6.2. Alternative Flow: Duyệt Theo Danh Mục Quốc Gia
1. Người dùng vào trang `/countries`.
2. Người dùng click vào một quốc gia (ví dụ: `Việt Nam`).
3. Hệ thống hiển thị trang danh mục bưu chính của quốc gia đó với các tỉnh/thành phố tiêu biểu và khung tìm kiếm đã được cố định theo quốc gia này.

### 6.3. Error Flow: Không Tìm Thấy Kết Quả
1. Người dùng nhập chuỗi từ khóa không tồn tại trong cơ sở dữ liệu.
2. Hệ thống kiểm tra kết quả trả về rỗng (`results.length === 0`).
3. Giao diện hiển thị trạng thái Empty State thân thiện:
   - Thông báo không tìm thấy kết quả.
   - Gợi ý kiểm tra lỗi chính tả hoặc chuyển bộ lọc sang "Tất cả quốc gia".

---

## 7. Data Requirements
- Bảng `zipcodes`: `country_code`, `postal_code`, `place_name`, `admin_name1`, `admin_name2`, `latitude`, `longitude`.
- Bảng `countries`: `code`, `name`, `native_name`, `postal_code_format`, `postal_code_example`.
- Quy chuẩn validate:
  - `q` (query search): chuỗi từ 1 đến 100 ký tự, loại bỏ ký tự điều khiển nguy hiểm.
  - `country`: mã 2 chữ cái (ISO 3166-1 alpha-2) hoặc rỗng (all).

---

## 8. API & Integration
### Endpoint: `GET /api/v1/search`
- **Query Parameters:**
  - `q` (string, required): Từ khóa tìm kiếm (mã hoặc địa danh).
  - `country` (string, optional): Mã quốc gia (ví dụ: `US`, `VN`).
  - `limit` (integer, optional, default: 20, max: 50): Số lượng kết quả.
  - `type` (string, optional: `all` | `code` | `place`): Ép kiểu tìm kiếm nếu cần.
- **Response Format (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "90210",
    "country": "US",
    "total": 1,
    "results": [
      {
        "id": 10423,
        "countryCode": "US",
        "postalCode": "90210",
        "placeName": "Beverly Hills",
        "adminName1": "California",
        "adminCode1": "CA",
        "adminName2": "Los Angeles",
        "latitude": 34.0901,
        "longitude": -118.4065
      }
    ]
  }
}
```

### Endpoint: `GET /api/v1/countries`
- Trả về danh sách tất cả các quốc gia được hỗ trợ trong hệ thống kèm số lượng mã bưu chính của từng quốc gia.

---

## 9. Security & Privacy
- **Khử độc truy vấn (SQL Injection Prevention):** Toàn bộ truy vấn Cloudflare D1 sử dụng Prepared Statements với Parameter Binding (`db.prepare('... WHERE postal_code LIKE ?').bind(param).all()`). Tuyệt đối không nối chuỗi trực tiếp.
- **XSS Prevention:** React tự động escape các dữ liệu render; không sử dụng `dangerouslySetInnerHTML`.
- **Bảo mật dữ liệu:** Dữ liệu mã bưu chính là dữ liệu công cộng mở, không chứa bất kỳ thông tin cá nhân (PII) nào.

---

## 10. Edge Cases
1. **Mã bưu chính có dấu cách hoặc dấu gạch nối (VD: Anh `SW1A 1AA`, Canada `K1A 0B1`, Mỹ `90210-1234`):**
   - Hệ thống tự động chuẩn hóa: tìm kiếm linh hoạt cả khi người dùng gõ có hoặc không có dấu cách.
2. **Một mã bưu chính thuộc nhiều địa danh (Many-to-Many):**
   - Một mã postal code có thể áp dụng cho nhiều phường/xã hoặc thị trấn nhỏ. Hệ thống hiển thị đầy đủ danh sách các địa danh đó dưới dạng danh sách nhóm theo mã.
3. **Ký tự đặc biệt trong từ khóa:**
   - Xử lý các ký tự `%`, `_`, `'`, `"` để không làm hỏng cú pháp `LIKE` trong SQL.

---

## 11. Testing Requirements
- **Unit Tests:** Kiểm tra hàm chuẩn hóa chuỗi tìm kiếm, hàm nhận diện loại từ khóa (Code vs Place), hàm kiểm tra format regex quốc gia.
- **Integration Tests:** Kiểm tra các Route Handlers `/api/v1/search` và `/api/v1/countries` với dữ liệu mẫu trên môi trường D1 local/mock.
- **E2E / Component Tests:** Kiểm tra luồng nhập từ khóa trên SearchBar, hiển thị danh sách kết quả và nút bấm Copy hoạt động chính xác.

---

## 12. Open Questions and Assumptions

### Confirmed Decisions
- [x] Nền tảng triển khai: Cloudflare Pages (Edge Runtime).
- [x] Cơ sở dữ liệu: Cloudflare D1 (Serverless SQLite phân tán tại Edge).
- [x] Quy mô & Nguồn dữ liệu: Toàn cầu (GeoNames `allCountries.zip` ~1.200.000 bản ghi của gần 100 quốc gia kết hợp mã bưu chính quốc gia 5 số của Việt Nam ~30.000 bản ghi).
- [x] Tính năng: Tra cứu 2 chiều (Mã -> Địa danh & Địa danh -> Mã) kèm Autocomplete gợi ý tức thì.
- [x] Tech Stack: Next.js (App Router, Edge Runtime, TypeScript, Tailwind CSS).

### Assumptions
- Dữ liệu toàn cầu được phân tách thành các file SQL chunks (~5.000 - 10.000 dòng/file) để nạp ổn định vào Cloudflare D1 thông qua Wrangler CLI.

### Open Questions
- Không có câu hỏi nào gây nghẽn (Blocking). Toàn bộ yêu cầu cốt lõi và phạm vi dữ liệu đã được làm rõ và thống nhất.

---

## 13. Implementation Notes
- Cấu hình Cloudflare: `wrangler.jsonc` (khai báo D1 binding `DB = "zipcodes-db"`)
- Schema migrations: `migrations/0001_initial_schema.sql`
- Script nạp dữ liệu: `scripts/generate-d1-sql.ts` & `scripts/import-all.ts` (thực thi Wrangler D1 chunked imports)
- Module truy vấn: `lib/db.ts` (lấy `env.DB` từ request context) và `lib/search-service.ts`
- Giao diện người dùng:
  - `components/SearchBar.tsx`
  - `components/CountrySelector.tsx`
  - `components/ResultCard.tsx`
  - `components/ResultList.tsx`
  - `components/CopyButton.tsx`
  - `components/CopyButton.tsx`
