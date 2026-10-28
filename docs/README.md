# Tài Liệu Dự Án ZipCode Tools

Dự án website tra cứu mã bưu chính (Zip/Postal Code) đa quốc gia, cho phép tra cứu 2 chiều nhanh chóng, chính xác. Ứng dụng được triển khai trên nền tảng **Cloudflare Pages** kết hợp cùng cơ sở dữ liệu phân tán **Cloudflare D1** (Serverless SQLite) tại Edge.

---

## Cấu Trúc Tài Liệu

```text
docs/
├── README.md                              # Mục lục và hướng dẫn điều hướng tài liệu
├── product/                               # Tài liệu sản phẩm & nghiệp vụ
│   ├── requirements.md                    # Yêu cầu sản phẩm tổng thể (PRD)
│   └── glossary.md                        # Bảng thuật ngữ chuyên ngành và từ viết tắt
├── architecture/                          # Kiến trúc hệ thống và kỹ thuật
│   ├── system-overview.md                 # Tổng quan kiến trúc hệ thống, tech stack
│   ├── data-model.md                      # Thiết kế dữ liệu và cấu trúc Cloudflare D1
│   └── decisions/                         # Các quyết định kiến trúc (ADR)
│       ├── 0001-tech-stack-and-storage.md # [Superseded] Thiết kế ban đầu với SQLite cục bộ
│       └── 0002-cloudflare-pages-and-d1.md # [Accepted] Triển khai lên Cloudflare Pages & D1
├── engineering/                           # Hướng dẫn kỹ thuật & quy chuẩn lập trình
│   └── guidelines.md                      # Cấu trúc dự án, Cloudflare Edge Runtime và Wrangler
└── specifications/                        # Đặc tả chi tiết tính năng & kiểm thử
    └── features/
        └── zipcode-lookup/
            ├── spec.md                    # Đặc tả tính năng tra cứu mã Zip code 2 chiều
            └── test-cases.md              # Kịch bản kiểm thử (Test cases) chi tiết
```

---

## Trạng Thái Tài Liệu (Status)

| Tài Liệu | Phiên Bản | Trạng Thái | Ngày Cập Nhật |
|---|---|---|---|
| [Product Requirements](./product/requirements.md) | 1.1.0 | `Ready for Implementation` | 2026-10-28 |
| [Glossary](./product/glossary.md) | 1.0.0 | `Ready for Implementation` | 2026-10-28 |
| [System Overview](./architecture/system-overview.md) | 1.1.0 | `Ready for Implementation` | 2026-10-28 |
| [Data Model](./architecture/data-model.md) | 1.2.0 | `Ready for Implementation` | 2026-10-28 |
| [ADR-0001](./architecture/decisions/0001-tech-stack-and-storage.md) | 1.0.0 | `Superseded` | 2026-10-28 |
| [ADR-0002](./architecture/decisions/0002-cloudflare-pages-and-d1.md) | 1.1.0 | `Accepted` | 2026-10-28 |
| [Engineering Guidelines](./engineering/guidelines.md) | 1.2.0 | `Ready for Implementation` | 2026-10-28 |
| [Zipcode Lookup Spec](./specifications/features/zipcode-lookup/spec.md) | 1.2.0 | `Implemented` | 2026-10-28 |
| [Zipcode Lookup Test Cases](./specifications/features/zipcode-lookup/test-cases.md) | 1.1.0 | `Implemented` | 2026-10-28 |

---

## Hướng Dẫn Đóng Góp & Cập Nhật Tài Liệu
- Mọi tài liệu đặc tả tính năng phải tuân thủ chuẩn mã hiệu: `FR-xxx` (Functional Requirements), `BR-xxx` (Business Rules), `AC-xxx` (Acceptance Criteria), `TC-xxx` (Test Cases).
- Quy trình sửa đổi hoặc thêm mới tính năng yêu cầu cập nhật tài liệu trước khi triển khai code (`create-docs` -> review -> `implement-feature`).

---

## Hướng Dẫn Đóng Góp & Cập Nhật Tài Liệu
- Mọi tài liệu đặc tả tính năng phải tuân thủ chuẩn mã hiệu: `FR-xxx` (Functional Requirements), `BR-xxx` (Business Rules), `AC-xxx` (Acceptance Criteria), `TC-xxx` (Test Cases).
- Quy trình sửa đổi hoặc thêm mới tính năng yêu cầu cập nhật tài liệu trước khi triển khai code (`create-docs` -> review -> `implement-feature`).
