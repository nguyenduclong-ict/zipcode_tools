import { TranslationDictionary } from "./types";

export const vi: TranslationDictionary = {
  nav: {
    lookup: "Tra Cứu",
    countries: "Danh Mục Quốc Gia",
  },
  home: {
    heroTitlePrefix: "Tra Cứu Mã Bưu Chính",
    heroTitleHighlight: "2 Chiều Toàn Cầu",
    heroSubtitle:
      "Nhập mã bưu chính để tìm địa danh, hoặc gõ tên tỉnh/thành phố để tra cứu mã Zip code. Dữ liệu chuẩn hóa quốc tế và mã 5 số Việt Nam.",
    popularCountries: "Quốc gia phổ biến:",
    features: {
      biDirectionalTitle: "Tra Cứu 2 Chiều Linh Hoạt",
      biDirectionalDesc:
        "Tự động nhận diện chuỗi tìm kiếm. Tìm từ mã ra địa chỉ, hoặc từ tên xã/phường/thành phố ra mã tương ứng.",
      globalDbTitle: "Kho Dữ Liệu Toàn Cầu",
      globalDbDesc:
        "Hàng trăm ngàn bản ghi mã bưu chính chuẩn hóa quốc tế (GeoNames) và mã bưu chính 5 số mới nhất của VNPost.",
      securityTitle: "Nhanh Chóng & Bảo Mật",
      securityDesc:
        "Tốc độ truy vấn dưới mili-giây với chỉ mục B-Tree. An toàn tuyệt đối chống SQL Injection và không phụ thuộc bên ngoài.",
    },
  },
  search: {
    allCountries: "🌐 Tất cả quốc gia",
    placeholderDefault:
      "Nhập mã Zip code hoặc tên địa danh (VD: 90210, 10000, Hà Nội, Tokyo)...",
    placeholderCountry: (countryName: string, example: string) =>
      `Tra cứu mã bưu chính ${countryName} (VD: ${example})...`,
    searchBtn: "Tra Cứu",
    autocompleteHeader: "Gợi ý tra cứu nhanh",
    selectHint: "Chọn ↵",
    foundResults: (total: number, query?: string) =>
      `Tìm thấy ${total} kết quả${query ? ` cho "${query}"` : ""}`,
    emptyTitle: "Không tìm thấy mã bưu chính phù hợp",
    emptyDesc: (query: string, country?: string) =>
      `Không có kết quả nào cho từ khóa "${query}"${country ? ` trong quốc gia ${country}` : ""}.`,
    emptyTipsHeader: "💡 Gợi ý tra cứu:",
    emptyTip1: "• Kiểm tra lại lỗi chính tả hoặc khoảng trắng",
    emptyTip2: "• Chuyển bộ lọc sang '🌐 Tất cả quốc gia' để mở rộng phạm vi tìm kiếm",
    emptyTip3: "• Thử gõ tên tỉnh/thành phố lớn (VD: Hà Nội, Hồ Chí Minh, New York, Tokyo)",
  },
  card: {
    copyCode: "Sao chép mã",
    copied: "Đã sao chép!",
    copyAddress: "Sao chép địa chỉ",
    state: "Bang/Tỉnh:",
    district: "Quận/Huyện:",
    ward: "Phường/Xã:",
    coordinates: "Tọa độ:",
    coordsPending: "Tọa độ: Đang cập nhật",
    viewDetails: "Chi tiết →",
    backToCountry: (country: string) => `Quay lại danh mục ${country}`,
    openInMaps: "Mở trên Google Maps ↗",
    postalAddressHeader: "Thông Tin Chi Tiết Mã Bưu Chính",
  },
  countries: {
    badge: "Danh Mục Quốc Tế",
    title: "Các Quốc Gia Được Hỗ Trợ Tra Cứu",
    subtitle: "Duyệt danh mục mã bưu chính và cấu trúc phân cấp hành chính theo từng quốc gia.",
    exampleCode: "Mã mẫu:",
    format: "Định dạng:",
    viewDirectory: "Xem danh mục",
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} ZipCode Tools.`,
    countries: "Quốc Gia",
    geoNamesSource: "Nguồn Dữ Liệu GeoNames",
    vnPostSource: "Mã Bưu Chính VN",
  },
};
