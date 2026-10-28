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
 * Chuẩn hóa từ khóa địa danh tiếng Việt và nhận diện tiền tố/viết tắt hành chính
 */
function normalizeVietnameseSearch(query: string) {
  let norm = removeVietnameseTones(query);
  norm = norm.replace(/[-.,/]/g, " ").replace(/\s+/g, " ").trim();

  // Nhận diện viết tắt các thành phố trực thuộc trung ương phổ biến
  if (norm === "hcm" || norm === "tp hcm" || norm === "tphcm") {
    return { primary: "ho chi minh", expanded: "thanh pho ho chi minh", core: "ho chi minh" };
  }
  if (norm === "hn" || norm === "tp hn" || norm === "tphn") {
    return { primary: "ha noi", expanded: "thanh pho ha noi", core: "ha noi" };
  }

  let core = norm;
  let expanded = norm;

  if (/^(tp|thanh pho)\s+/i.test(norm)) {
    core = norm.replace(/^(tp|thanh pho)\s+/i, "").trim();
    expanded = `thanh pho ${core}`;
  } else if (/^tinh\s+/i.test(norm)) {
    core = norm.replace(/^tinh\s+/i, "").trim();
    expanded = `tinh ${core}`;
  } else if (/^(huyen|h)\s+/i.test(norm)) {
    core = norm.replace(/^(huyen|h)\s+/i, "").trim();
    expanded = `huyen ${core}`;
  } else if (/^(quan|q)\s+/i.test(norm)) {
    core = norm.replace(/^(quan|q)\s+/i, "").trim();
    expanded = `quan ${core}`;
  } else if (/^(thi xa|tx)\s+/i.test(norm)) {
    core = norm.replace(/^(thi xa|tx)\s+/i, "").trim();
    expanded = `thi xa ${core}`;
  } else if (/^(thi tran|tt)\s+/i.test(norm)) {
    core = norm.replace(/^(thi tran|tt)\s+/i, "").trim();
    expanded = `thi tran ${core}`;
  }

  return { primary: norm, expanded, core };
}

/**
 * Danh sách mã bưu chính tiêu biểu đại diện cho các quốc gia
 * Được truy vấn trực tiếp bằng B-Tree Index (IN-list seek) để tránh Full Table Scan (331.000 rows)
 */
const FEATURED_POSTAL_CODES_BY_COUNTRY: Record<string, string[]> = {
  VN: [
    "10000", "70000", "50000", "04000", "94000", "06000", "03000", "07000", "08000", "16000",
    "17000", "49000", "78000", "65000", "63000", "84000", "87000", "22000", "24000", "25000",
    "26000", "27000", "30000", "32000", "33000", "35000", "36000", "38000", "40000", "42000"
  ],
  US: [
    "90210", "10001", "60601", "75201", "98101", "33101", "02108", "94102", "20001", "30301",
    "77001", "85001", "19101", "92101", "48201", "80201", "55401", "64101", "89101", "97201"
  ],
  JP: ["100-0001", "600-8001", "530-0001", "060-0001", "460-0001", "810-0001", "980-0001", "730-0001"],
  GB: ["SW1A 1AA", "EC1A 1BB", "M1 1AE", "B1 1BB", "EH1 1YZ", "G1 1AA", "LS1 1AA", "BS1 1AA"],
  FR: ["75001", "13001", "69001", "06000", "31000", "44000", "33000", "67000", "59000", "34000"],
  DE: ["10115", "80331", "20095", "60311", "50667", "70173", "04109", "40213", "01067", "90403"],
  CA: ["K1A 0B1", "M5V 2T6", "H2Y 1C6", "V6B 1A1", "T2P 1J9", "R3C 0V8", "B3H 1A1", "T5J 0K1"],
  AU: ["2000", "3000", "4000", "5000", "6000", "7000", "2600", "0800"]
};

const GLOBAL_FEATURED_POSTAL_CODES = [
  "10000", "70000", "50000", "04000", "06000", "03000", "16000", "17000", "49000", "78000",
  "90210", "10001", "100-0001", "SW1A 1AA", "75001", "10115", "K1A 0B1", "2000", "60601", "600-8001"
];

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
    let results: ZipCodeRecord[] = [];
    if (country && country !== "ALL") {
      const featuredCodes = FEATURED_POSTAL_CODES_BY_COUNTRY[country] || [];
      if (featuredCodes.length > 0) {
        const placeholders = featuredCodes.map(() => "?").join(",");
        const sql = `
          SELECT * FROM zipcodes 
          WHERE country_code = ? AND postal_code IN (${placeholders})
          ORDER BY 
            CASE 
              WHEN country_code = 'VN' AND postal_code IN ('10000', '70000', '50000', '04000', '94000', '06000', '03000', '07000', '08000') THEN 0
              WHEN postal_code LIKE '%000' THEN 1
              ELSE 2
            END,
            postal_code ASC
          LIMIT ?
        `;
        const res = await db.prepare(sql).bind(country, ...featuredCodes, limit).all<ZipCodeRecord>();
        results = res.results || [];
      }

      // Fallback nếu kết quả chưa đạt limit hoặc quốc gia không có featured list
      if (results.length < limit) {
        const remainingLimit = limit - results.length;
        const existingCodes = results.map((r) => r.postal_code);
        let fallbackSql = `SELECT * FROM zipcodes WHERE country_code = ?`;
        const fallbackParams: unknown[] = [country];
        if (existingCodes.length > 0) {
          fallbackSql += ` AND postal_code NOT IN (${existingCodes.map(() => "?").join(",")})`;
          fallbackParams.push(...existingCodes);
        }
        fallbackSql += ` LIMIT ?`;
        fallbackParams.push(remainingLimit);

        const fallbackRes = await db.prepare(fallbackSql).bind(...fallbackParams).all<ZipCodeRecord>();
        if (fallbackRes.results) {
          results.push(...(fallbackRes.results as ZipCodeRecord[]));
        }
      }
    } else {
      // Toàn cầu (Global Homepage): Truy vấn theo danh sách mã tiêu biểu IN (...) tận dụng Index B-Tree
      const placeholders = GLOBAL_FEATURED_POSTAL_CODES.map(() => "?").join(",");
      const sql = `
        SELECT * FROM zipcodes 
        WHERE postal_code IN (${placeholders})
        ORDER BY 
          CASE country_code 
            WHEN 'VN' THEN 0 
            WHEN 'US' THEN 1 
            WHEN 'JP' THEN 2 
            WHEN 'GB' THEN 3 
            WHEN 'FR' THEN 4 
            WHEN 'DE' THEN 5 
            WHEN 'CA' THEN 6 
            WHEN 'AU' THEN 7 
            ELSE 8 
          END,
          postal_code ASC
        LIMIT ?
      `;
      const res = await db.prepare(sql).bind(...GLOBAL_FEATURED_POSTAL_CODES, limit).all<ZipCodeRecord>();
      results = res.results || [];

      // Fallback nếu kết quả chưa đạt limit
      if (results.length < limit) {
        const remainingLimit = limit - results.length;
        const fallbackSql = `SELECT * FROM zipcodes LIMIT ?`;
        const fallbackRes = await db.prepare(fallbackSql).bind(remainingLimit).all<ZipCodeRecord>();
        if (fallbackRes.results) {
          for (const item of fallbackRes.results as ZipCodeRecord[]) {
            if (!results.some((r) => r.id === item.id)) {
              results.push(item);
            }
          }
        }
      }
    }

    return {
      query: "",
      country,
      detectedType: "code",
      total: results.length,
      results,
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
    // Hỗ trợ mã bưu chính 6 chữ số cũ của Việt Nam (VD: 100000 -> 10000, 170000 -> 17000)
    const legacyVn5 = cleanCode.length === 6 && /^\d{6}$/.test(cleanCode) ? cleanCode.slice(0, 5) : "";

    if (country && country !== "ALL") {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE country_code = ? 
          AND ((REPLACE(REPLACE(postal_code, ' ', ''), '-', '') LIKE ? ESCAPE '\\')
               OR (? != '' AND postal_code = ?))
        ORDER BY 
          CASE 
            WHEN UPPER(REPLACE(REPLACE(postal_code, ' ', ''), '-', '')) = UPPER(?) THEN 0 
            WHEN ? != '' AND postal_code = ? THEN 1
            ELSE 2 
          END,
          postal_code ASC
        LIMIT ?
      `;
      const stmt = db.prepare(sql).bind(
        country,
        `${escapedCode}%`,
        legacyVn5,
        legacyVn5,
        cleanCode,
        legacyVn5,
        legacyVn5,
        limit
      );
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    } else {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE (REPLACE(REPLACE(postal_code, ' ', ''), '-', '') LIKE ? ESCAPE '\\')
           OR (? != '' AND country_code = 'VN' AND postal_code = ?)
        ORDER BY 
          CASE 
            WHEN UPPER(REPLACE(REPLACE(postal_code, ' ', ''), '-', '')) = UPPER(?) THEN 0 
            WHEN ? != '' AND postal_code = ? THEN 1
            ELSE 2 
          END,
          country_code ASC,
          postal_code ASC
        LIMIT ?
      `;
      const stmt = db.prepare(sql).bind(
        `${escapedCode}%`,
        legacyVn5,
        legacyVn5,
        cleanCode,
        legacyVn5,
        legacyVn5,
        limit
      );
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    }
  } else {
    // 2. Tìm theo Địa Danh (FR-002)
    const { primary, expanded, core } = normalizeVietnameseSearch(rawQuery);
    const escPrimary = escapeLikePattern(primary);
    const escExpanded = escapeLikePattern(expanded);
    const escCore = escapeLikePattern(core);
    const escRaw = escapeLikePattern(rawQuery);

    if (country && country !== "ALL") {
      const sql = `
        SELECT * FROM zipcodes 
        WHERE country_code = ? 
          AND (place_name_normalized LIKE ? ESCAPE '\\' 
               OR place_name_normalized LIKE ? ESCAPE '\\'
               OR place_name_normalized LIKE ? ESCAPE '\\'
               OR REPLACE(place_name_normalized, '-', ' ') LIKE ? ESCAPE '\\'
               OR place_name LIKE ? ESCAPE '\\'
               OR LOWER(admin_name1) LIKE ? ESCAPE '\\'
               OR REPLACE(LOWER(admin_name1), '-', ' ') LIKE ? ESCAPE '\\'
               OR LOWER(admin_name2) LIKE ? ESCAPE '\\')
        ORDER BY 
          CASE 
            -- 0. Khớp chính xác hoàn toàn tên địa danh
            WHEN place_name_normalized = ? OR place_name_normalized = ? THEN 0
            
            -- 1. Bưu cục Trung tâm tỉnh / thành phố khớp với từ khóa
            WHEN (place_name_normalized LIKE '%buu cuc trung tam%tinh ' || ? 
               OR place_name_normalized LIKE '%buu cuc trung tam%thanh pho ' || ?
               OR place_name_normalized LIKE '%buu cuc trung tam%' || ? || '%') THEN 1

            -- 2. Tên bang / tỉnh khớp chính xác từ khóa và mã kết thúc bằng 000
            WHEN (LOWER(REPLACE(admin_name1, '-', ' ')) = ? OR LOWER(REPLACE(admin_name1, '-', ' ')) LIKE ? || '%') 
                 AND (postal_code LIKE '%000' OR postal_code LIKE '%0000') THEN 2

            -- 3. Bưu cục trung tâm bất kỳ khớp từ khóa
            WHEN place_name_normalized LIKE '%trung tam%' AND place_name_normalized LIKE '%' || ? || '%' THEN 3

            -- 4. Bắt đầu bằng từ khóa
            WHEN place_name_normalized LIKE ? || '%' OR place_name_normalized LIKE ? || '%' THEN 4

            -- 5. Mã kết thúc bằng 000 (mã đại diện cấp tỉnh/thành phố)
            WHEN postal_code LIKE '%000' THEN 5
            
            -- 6. Mã kết thúc bằng 00 (mã đại diện cấp quận/huyện)
            WHEN postal_code LIKE '%00' THEN 6

            ELSE 7
          END ASC,
          CASE WHEN postal_code LIKE '%000' THEN 0 WHEN postal_code LIKE '%00' THEN 1 ELSE 2 END,
          postal_code ASC
        LIMIT ?
      `;
      const stmt = db.prepare(sql).bind(
        country,
        `%${escCore}%`,
        `%${escExpanded}%`,
        `%${escPrimary}%`,
        `%${escCore}%`,
        `%${escRaw}%`,
        `%${escCore}%`,
        `%${escCore}%`,
        `%${escCore}%`,
        escPrimary,
        escExpanded,
        escCore,
        escCore,
        escCore,
        escCore,
        escCore,
        escCore,
        escCore,
        escExpanded,
        limit
      );
      const res = await stmt.all<ZipCodeRecord>();
      results = res.results || [];
    } else {
      // 2.2 Fast Path cho tìm kiếm toàn cầu: Thử tìm theo tiền tố (Prefix match) trước để tận dụng idx_zipcodes_place_global
      const fastSql = `
        SELECT * FROM zipcodes 
        WHERE place_name_normalized LIKE ? ESCAPE '\\'
        ORDER BY 
          CASE WHEN place_name_normalized = ? THEN 0 ELSE 1 END,
          country_code ASC,
          postal_code ASC
        LIMIT ?
      `;
      const fastStmt = db.prepare(fastSql).bind(`${escCore}%`, escPrimary, limit);
      const fastRes = await fastStmt.all<ZipCodeRecord>();
      if (fastRes.results && fastRes.results.length > 0) {
        results = fastRes.results;
      } else {
        // Fallback: Quét mở rộng nếu tìm theo tiền tố không có kết quả
        const sql = `
          SELECT * FROM zipcodes 
          WHERE place_name_normalized LIKE ? ESCAPE '\\' 
             OR place_name_normalized LIKE ? ESCAPE '\\'
             OR place_name_normalized LIKE ? ESCAPE '\\'
             OR REPLACE(place_name_normalized, '-', ' ') LIKE ? ESCAPE '\\'
             OR place_name LIKE ? ESCAPE '\\'
             OR LOWER(admin_name1) LIKE ? ESCAPE '\\'
             OR REPLACE(LOWER(admin_name1), '-', ' ') LIKE ? ESCAPE '\\'
             OR LOWER(admin_name2) LIKE ? ESCAPE '\\'
          ORDER BY 
            CASE 
              -- 0. Khớp chính xác hoàn toàn tên địa danh
              WHEN place_name_normalized = ? OR place_name_normalized = ? THEN 0
              
              -- 1. Bưu cục Trung tâm tỉnh / thành phố khớp với từ khóa
              WHEN (place_name_normalized LIKE '%buu cuc trung tam%tinh ' || ? 
                 OR place_name_normalized LIKE '%buu cuc trung tam%thanh pho ' || ?
                 OR place_name_normalized LIKE '%buu cuc trung tam%' || ? || '%') THEN 1

              -- 2. Tên bang / tỉnh khớp chính xác từ khóa và mã kết thúc bằng 000
              WHEN (LOWER(REPLACE(admin_name1, '-', ' ')) = ? OR LOWER(REPLACE(admin_name1, '-', ' ')) LIKE ? || '%') 
                   AND (postal_code LIKE '%000' OR postal_code LIKE '%0000') THEN 2

              -- 3. Bưu cục trung tâm bất kỳ khớp từ khóa
              WHEN place_name_normalized LIKE '%trung tam%' AND place_name_normalized LIKE '%' || ? || '%' THEN 3

              -- 4. Bắt đầu bằng từ khóa
              WHEN place_name_normalized LIKE ? || '%' OR place_name_normalized LIKE ? || '%' THEN 4

              -- 5. Mã kết thúc bằng 000 (mã đại diện cấp tỉnh/thành phố)
              WHEN postal_code LIKE '%000' THEN 5
              
              -- 6. Mã kết thúc bằng 00 (mã đại diện cấp quận/huyện)
              WHEN postal_code LIKE '%00' THEN 6

              ELSE 7
            END ASC,
            CASE WHEN postal_code LIKE '%000' THEN 0 WHEN postal_code LIKE '%00' THEN 1 ELSE 2 END,
            country_code ASC,
            postal_code ASC
          LIMIT ?
        `;
        const stmt = db.prepare(sql).bind(
          `%${escCore}%`,
          `%${escExpanded}%`,
          `%${escPrimary}%`,
          `%${escCore}%`,
          `%${escRaw}%`,
          `%${escCore}%`,
          `%${escCore}%`,
          `%${escCore}%`,
          escPrimary,
          escExpanded,
          escCore,
          escCore,
          escCore,
          escCore,
          escCore,
          escCore,
          escCore,
          escExpanded,
          limit
        );
        const res = await stmt.all<ZipCodeRecord>();
        results = res.results || [];
      }
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
