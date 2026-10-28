/**
 * Tiện ích chuẩn hóa chuỗi và hỗ trợ giao diện
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "a");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "e");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "i");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "o");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "u");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "y");
  str = str.replace(/Đ/g, "d");
  return str.toLowerCase().trim();
}

/**
 * Tự động nhận diện từ khóa là dạng Mã bưu chính hay Tên địa danh (BR-001)
 * Mã bưu chính thường gồm các chữ số, hoặc định dạng chữ-số ngắn như Anh (SW1A), Canada (K1A)
 */
export function isPostalCodeQuery(query: string): boolean {
  const clean = query.trim().replace(/[-\s]/g, "");
  if (!clean) return false;
  // Toàn chữ số (VD: 90210, 10000, 75001)
  if (/^\d+$/.test(clean)) return true;
  // Dạng chữ-số đặc trưng bưu chính Anh, Canada (VD: SW1A, K1A) với độ dài <= 8
  if (/^[a-zA-Z0-9]{2,8}$/.test(clean) && /\d/.test(clean)) return true;
  return false;
}

/**
 * Format hiển thị địa chỉ chuẩn hóa từ các trường hành chính
 */
export function formatAddress(item: {
  place_name: string;
  admin_name3?: string | null;
  admin_name2?: string | null;
  admin_name1?: string | null;
  country_code: string;
}): string {
  const parts: string[] = [item.place_name];
  if (item.admin_name3 && item.admin_name3 !== item.place_name) parts.push(item.admin_name3);
  if (item.admin_name2 && item.admin_name2 !== item.place_name) parts.push(item.admin_name2);
  if (item.admin_name1 && item.admin_name1 !== item.place_name) parts.push(item.admin_name1);
  return parts.filter(Boolean).join(", ");
}
