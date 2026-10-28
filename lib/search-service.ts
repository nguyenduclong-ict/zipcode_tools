import { IDatabase } from "./db";
import { CountryRecord, SearchParams, SearchResponseData, ZipCodeRecord } from "./types";
import { isPostalCodeQuery, removeVietnameseTones } from "./utils";

/**
 * Escape ký tự đại diện của SQL LIKE (% và _) để chống tấn công phá chuỗi (TC-015)
 */
function escapeLikePattern(input: string): string {
  return input.replace(/([%_])/g, "\\$1");
}

/**
 * Dịch vụ tra cứu mã bưu chính 2 chiều đa quốc gia
 */
export async function searchZipCodes(
  db: IDatabase,
  params: SearchParams
): Promise<SearchResponseData> {
  const rawQuery = (params.query || "").trim();
  const country = (params.country || "").trim().toUpperCase();
  const limit = Math.min(Math.max(params.limit || 20, 1), 50); // BR-002: Max 50

  if (!rawQuery) {
    return {
      query: "",
      country,
      detectedType: "code",
      total: 0,
      results: [],
    };
  }

  // Nhận diện kiểu tra cứu nếu không ép kiểu thủ công
  const detectedType =
    params.type && params.type !== "all"
      ? params.type
      : isPostalCodeQuery(rawQuery)
      ? "code"
      : "place";

  let results: ZipCodeRecord[] = [];

  if (detectedType === "code") {
    // 1. Tìm theo Mã Bưu Chính (FR-001)
    // Loại bỏ dấu cách và gạch nối để tìm linh hoạt (Edge Case 1)
    const cleanCode = rawQuery.replace(/[\s-]/g, "");
    const escapedCode = escapeLikePattern(cleanCode);

    if (country && country !== "ALL") {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE country_code = ? 
          AND (REPLACE(REPLACE(postal_code, ' ', ''), '-', '') LIKE ? ESCAPE '\\')
        ORDER BY 
          CASE WHEN UPPER(REPLACE(REPLACE(postal_code, ' ', ''), '-', '')) = UPPER(?) THEN 0 ELSE 1 END,
          postal_code ASC
        LIMIT ?
      `;
      const stmt = db.prepare(sql).bind(country, `${escapedCode}%`, cleanCode, limit);
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    } else {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE REPLACE(REPLACE(postal_code, ' ', ''), '-', '') LIKE ? ESCAPE '\\'
        ORDER BY 
          CASE WHEN UPPER(REPLACE(REPLACE(postal_code, ' ', ''), '-', '')) = UPPER(?) THEN 0 ELSE 1 END,
          country_code ASC,
          postal_code ASC
        LIMIT ?
      `;
      const stmt = db.prepare(sql).bind(`${escapedCode}%`, cleanCode, limit);
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    }
  } else {
    // 2. Tìm theo Địa Danh (FR-002)
    // Chuẩn hóa không dấu cho tiếng Việt và lowercase
    const normalizedQuery = removeVietnameseTones(rawQuery);
    const escapedPlace = escapeLikePattern(normalizedQuery);

    if (country && country !== "ALL") {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE country_code = ? 
          AND (place_name_normalized LIKE ? ESCAPE '\\' 
               OR place_name LIKE ? ESCAPE '\\'
               OR admin_name1 LIKE ? ESCAPE '\\'
               OR admin_name2 LIKE ? ESCAPE '\\')
        ORDER BY 
          CASE WHEN place_name_normalized = ? THEN 0 ELSE 1 END,
          place_name ASC
        LIMIT ?
      `;
      const stmt = db
        .prepare(sql)
        .bind(
          country,
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          normalizedQuery,
          limit
        );
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    } else {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE place_name_normalized LIKE ? ESCAPE '\\' 
           OR place_name LIKE ? ESCAPE '\\'
           OR admin_name1 LIKE ? ESCAPE '\\'
           OR admin_name2 LIKE ? ESCAPE '\\'
        ORDER BY 
          CASE WHEN place_name_normalized = ? THEN 0 ELSE 1 END,
          country_code ASC,
          place_name ASC
        LIMIT ?
      `;
      const stmt = db
        .prepare(sql)
        .bind(
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          `%${escapedPlace}%`,
          normalizedQuery,
          limit
        );
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    }
  }

  return {
    query: rawQuery,
    country,
    detectedType,
    total: results.length,
    results,
  };
}

/**
 * Lấy danh sách toàn bộ các quốc gia được hỗ trợ trong hệ thống (FR-003)
 */
export async function getSupportedCountries(db: IDatabase): Promise<CountryRecord[]> {
  const sql = `SELECT * FROM countries ORDER BY name ASC`;
  const stmt = db.prepare(sql);
  const res = await stmt.all<CountryRecord>();
  return res.results || [];
}

/**
 * Lấy chi tiết thông tin của một mã bưu chính theo Quốc gia và Mã (phục vụ trang chi tiết SEO)
 */
export async function getZipCodeDetail(
  db: IDatabase,
  countryCode: string,
  postalCode: string
): Promise<ZipCodeRecord | null> {
  const cleanCode = postalCode.trim().replace(/[\s-]/g, "");
  const sql = `
    SELECT * FROM zipcodes 
    WHERE UPPER(country_code) = UPPER(?) 
      AND UPPER(REPLACE(REPLACE(postal_code, ' ', ''), '-', '')) = UPPER(?)
    LIMIT 1
  `;
  const stmt = db.prepare(sql).bind(countryCode, cleanCode);
  return stmt.first<ZipCodeRecord>();
}
