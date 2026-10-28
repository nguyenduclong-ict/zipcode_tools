import { TranslationDictionary } from "./types";

export const vi: TranslationDictionary = {
  nav: {
    lookup: "Tra Cứu",
    countries: "Danh Mục Quốc Gia",
  },
  home: {
    heroTitlePrefix: "Tra Cứu Mã Bưu Chính",
    heroTitleHighlight: "Toàn Cầu",
    heroSubtitle:
      "Tra cứu hai chiều chuẩn xác: nhập mã bưu chính để xác định phân cấp hành chính, hoặc gõ tên tỉnh/thành phố để tra cứu mã Zip code tương ứng.",
    popularCountries: "Quốc gia phổ biến:",
    statsHeadline: "Hơn 330.000 bản ghi mã bưu chính",
    statsSub: "Dữ liệu chuẩn hóa quốc tế và bộ mã bưu chính 5 số Việt Nam, sẵn sàng tra cứu tức thì.",
    guideTitle: "Nguyên Lý Tra Cứu 2 Chiều",
    guideByCodeTitle: "Tra cứu theo Mã Bưu Chính",
    guideByCodeDesc:
      "Nhập mã bưu chính bất kỳ (VD: 10000, 90210, 75001, SW1A 1AA) để hiển thị chi tiết tên bưu cục, tỉnh/thành, quận/huyện và tọa độ.",
    guideByPlaceTitle: "Tra cứu theo Tên Địa Danh",
    guideByPlaceDesc:
      "Nhập tên tỉnh, thành phố, quận huyện hoặc phường xã (hỗ trợ cả tiếng Việt có dấu và không dấu) để tìm các mã bưu chính liên quan.",
    formatsTitle: "Cấu Trúc Mã Bưu Chính Theo Quốc Gia",
    formatsDesc: "Quy chuẩn định dạng mã bưu chính các thị trường phổ biến phục vụ đóng gói và gửi hàng.",
    browseAllBtn: "Xem toàn bộ danh mục quốc gia →",
  },
  search: {
    allCountries: "Tất cả quốc gia",
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
    emptyTipsHeader: "Gợi ý tra cứu:",
    emptyTip1: "Kiểm tra lại lỗi chính tả hoặc khoảng trắng",
    emptyTip2: "Chuyển bộ lọc sang 'Tất cả quốc gia' để mở rộng phạm vi tìm kiếm",
    emptyTip3: "Thử tìm theo tên trung tâm hành chính (VD: Hà Nội, London, New York, Tokyo)",
  },
  card: {
    copyCode: "Sao chép mã",
    copied: "Đã sao chép",
    copyAddress: "Sao chép địa chỉ",
    state: "Bang / Tỉnh:",
    district: "Quận / Huyện:",
    ward: "Phường / Xã:",
    coordinates: "Tọa độ:",
    coordsPending: "Đang cập nhật tọa độ",
    viewDetails: "Chi tiết →",
    backToCountry: (country: string) => `Quay lại danh mục ${country}`,
    openInMaps: "Mở trên Google Maps ↗",
    postalAddressHeader: "Thông Tin Chi Tiết Mã Bưu Chính",
  },
  countries: {
    badge: "Danh Mục Quốc Tế",
    title: "Danh Mục Quốc Gia & Quy Chuẩn Định Dạng",
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
