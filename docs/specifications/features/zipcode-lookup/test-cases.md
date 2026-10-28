# Kịch Bản Kiểm Thử: Tra Cứu Mã Bưu Chính (Test Cases)

Tài liệu này xác định các kịch bản kiểm thử (Test Cases) chi tiết cho tính năng tra cứu mã bưu chính 2 chiều, đảm bảo mọi tiêu chí chấp nhận (Acceptance Criteria) trong [Feature Spec](./spec.md) đều được xác minh độc lập.

---

## Danh Sách Kịch Bản Kiểm Thử

### 1. Kiểm Thử Tra Cứu Theo Mã Bưu Chính (Postal Code Search)

| Mã Kịch Bản | Yêu Cầu Liên Quan | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi | Trạng Thái |
|---|---|---|---|---|---|
| `TC-001` | `FR-001`, `AC-001` | Tra cứu chính xác mã US ZIP | `country = US`, `q = 90210` | Trả về kết quả: `Beverly Hills`, `California`, tọa độ xấp xỉ `(34.09, -118.40)`. Thời gian < 50ms. | Passed |
| `TC-002` | `FR-001`, `AC-002` | Tra cứu chính xác mã bưu chính Việt Nam | `country = VN`, `q = 10000` | Trả về kết quả: `Hà Nội`. | Passed |
| `TC-003` | `FR-001` | Tra cứu theo tiền tố mã (Prefix search) | `country = US`, `q = 9021` | Trả về danh sách các mã bắt đầu bằng `9021` (ví dụ: `90210`, `90211`, `90212`). | Passed |
| `TC-004` | `FR-001` | Tra cứu toàn cầu không chọn quốc gia | `country = all`, `q = 90210` | Trả về danh sách kết quả chứa mã `90210` kèm thẻ gắn mã quốc gia `US`. | Passed |
| `TC-005` | `FR-001` | Tra cứu mã không tồn tại | `country = US`, `q = 00000` | Trả về danh sách rỗng (`total = 0`), hiển thị trạng thái Empty State thông báo không tìm thấy. | Passed |

---

### 2. Kiểm Thử Tra Cứu Theo Địa Danh (Place Name Search)

| Mã Kịch Bản | Yêu Cầu Liên Quan | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi | Trạng Thái |
|---|---|---|---|---|---|
| `TC-006` | `FR-002`, `AC-004` | Tra cứu địa danh tiếng Anh | `country = JP`, `q = Tokyo` | Trả về danh sách các mã bưu chính tại Tokyo (ví dụ: `100-0001`...). | Passed |
| `TC-007` | `FR-002`, `AC-005` | Tra cứu tiếng Việt có dấu | `country = VN`, `q = Đà Nẵng` | Trả về các mã bưu chính thuộc thành phố Đà Nẵng. | Passed |
| `TC-008` | `FR-002`, `AC-005` | Tra cứu tiếng Việt không dấu | `country = VN`, `q = Da Nang` | Trả về kết quả tương đương như khi gõ có dấu (`Đà Nẵng`). | Passed |
| `TC-009` | `FR-002` | Tra cứu không phân biệt hoa thường | `country = US`, `q = lOs AnGeLeS` | Trả về các mã bưu chính tại Los Angeles tương tự như gõ chữ chuẩn. | Passed |

---

### 3. Kiểm Thử Bộ Lọc Quốc Gia & Giao Diện (Country Selector & UI)

| Mã Kịch Bản | Yêu Cầu Liên Quan | Mục Tiêu Kiểm Thử | Hành Động / Đầu Vào | Kết Quả Mong Đợi | Trạng Thái |
|---|---|---|---|---|---|
| `TC-010` | `FR-003`, `AC-006` | Đổi quốc gia cập nhật gợi ý | Chọn quốc gia `Việt Nam` | Ô tìm kiếm đổi placeholder thành ví dụ: "VD: 10000 hoặc Hà Nội...". | Passed |
| `TC-011` | `FR-004`, `AC-007` | Tự động gợi ý tức thì (Autocomplete) | Gõ liên tiếp "902" trong 100ms | Sau 250ms debounce, menu dropdown hiển thị tối đa 8 gợi ý nhanh. | Passed |
| `TC-012` | `FR-004`, `AC-008` | Phím điều hướng trên gợi ý | Nhấn mũi tên xuống và Enter | Mục đầu tiên được chọn và thông tin được nạp vào ô tìm kiếm. | Passed |
| `TC-013` | `FR-005`, `AC-009` | Sao chép 1-click vào Clipboard | Click icon Copy trên thẻ kết quả | Clipboard nhận chuỗi chính xác; hiển thị thông báo "Đã sao chép!" trong 2 giây. | Passed |

---

### 4. Kiểm Thử Ranh Giới, Bảo Mật & Ký Tự Lạ (Edge Cases & Security)

| Mã Kịch Bản | Yêu Cầu Liên Quan | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi | Trạng Thái |
|---|---|---|---|---|---|
| `TC-014` | `BR-001`, `Security` | Ký tự phá chuỗi SQL Injection | `q = ' OR '1'='1` | Hệ thống xử lý an toàn qua Cloudflare D1 Prepared Statement, không phát sinh lỗi SQL, trả về rỗng. | Passed |
| `TC-015` | `BR-001` | Ký tự đại diện SQL (`%`, `_`) | `q = %%%` | Ký tự được escape an toàn, không làm quét toàn bộ cơ sở dữ liệu. | Passed |
| `TC-016` | `BR-001` | Khoảng trắng thừa ở hai đầu | `q = "   90210   "` | Hệ thống tự động trim khoảng trắng và tìm ra mã `90210`. | Passed |
| `TC-017` | `BR-002` | Giới hạn tối đa kết quả | Tìm từ khóa chung chung như `a` | Danh sách kết quả không vượt quá `limit = 50`. | Passed |
| `TC-018` | `BR-003` | Tính độc lập của Database D1 | Truy vấn tìm kiếm | Trực tiếp từ Cloudflare D1 phân tán tại Edge, không phụ thuộc bất kỳ external API nào, phản hồi < 50ms. | Passed |
