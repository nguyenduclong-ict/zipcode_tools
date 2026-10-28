import { describe, it, expect, beforeAll } from "vitest";
import { getDatabase, IDatabase } from "../lib/db";
import { searchZipCodes, getSupportedCountries, getZipCodeDetail } from "../lib/search-service";
import { isPostalCodeQuery, removeVietnameseTones } from "../lib/utils";

describe("Search Service & Utils Tests (TC-001 - TC-018)", () => {
  let db: IDatabase;

  beforeAll(async () => {
    db = await getDatabase();
  });

  describe("Utility Functions", () => {
    it("should remove Vietnamese tones correctly", () => {
      expect(removeVietnameseTones("Hà Nội")).toBe("ha noi");
      expect(removeVietnameseTones("Đà Nẵng")).toBe("da nang");
      expect(removeVietnameseTones("Thành phố Hồ Chí Minh")).toBe("thanh pho ho chi minh");
    });

    it("should detect postal code vs place name queries correctly (BR-001)", () => {
      expect(isPostalCodeQuery("90210")).toBe(true);
      expect(isPostalCodeQuery("10000")).toBe(true);
      expect(isPostalCodeQuery("SW1A 1AA")).toBe(true);
      expect(isPostalCodeQuery("K1A 0B1")).toBe(true);
      expect(isPostalCodeQuery("Hà Nội")).toBe(false);
      expect(isPostalCodeQuery("Beverly Hills")).toBe(false);
      expect(isPostalCodeQuery("Tokyo")).toBe(false);
    });
  });

  describe("Postal Code Search (FR-001, TC-001 - TC-005)", () => {
    it("TC-001: Tra cứu chính xác mã US ZIP 90210", async () => {
      const res = await searchZipCodes(db, { query: "90210", country: "US" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].place_name).toBe("Beverly Hills");
      expect(res.results[0].admin_name1).toBe("California");
      expect(res.results[0].country_code).toBe("US");
    });

    it("TC-002: Tra cứu chính xác mã bưu chính Việt Nam 10000", async () => {
      const res = await searchZipCodes(db, { query: "10000", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].place_name).toContain("Hà Nội");
      expect(res.results[0].country_code).toBe("VN");
    });

    it("TC-003: Tra cứu theo tiền tố mã (Prefix search) 9021", async () => {
      const res = await searchZipCodes(db, { query: "9021", country: "US" });
      expect(res.total).toBeGreaterThan(0);
      const match = res.results.find((r) => r.postal_code === "90210");
      expect(match).toBeDefined();
    });

    it("TC-004: Tra cứu toàn cầu không chọn quốc gia (all)", async () => {
      const res = await searchZipCodes(db, { query: "90210", country: "" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].country_code).toBe("US");
    });

    it("TC-005: Tra cứu mã không tồn tại trả về danh sách rỗng", async () => {
      const res = await searchZipCodes(db, { query: "00000", country: "US" });
      expect(res.total).toBe(0);
      expect(res.results).toEqual([]);
    });

    it("Edge case: Mã có dấu cách hoặc gạch nối (SW1A 1AA / SW1A1AA)", async () => {
      const res1 = await searchZipCodes(db, { query: "SW1A 1AA", country: "GB" });
      const res2 = await searchZipCodes(db, { query: "SW1A1AA", country: "GB" });
      expect(res1.total).toBeGreaterThan(0);
      expect(res2.total).toBeGreaterThan(0);
    });
  });

  describe("Place Name Search (FR-002, TC-006 - TC-009)", () => {
    it("TC-006: Tra cứu địa danh tiếng Anh (Tokyo, JP)", async () => {
      const res = await searchZipCodes(db, { query: "Tokyo", country: "JP" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].country_code).toBe("JP");
    });

    it("TC-007: Tra cứu tiếng Việt có dấu (Đà Nẵng)", async () => {
      const res = await searchZipCodes(db, { query: "Đà Nẵng", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results.some((r) => r.place_name.includes("Đà Nẵng"))).toBe(true);
    });

    it("TC-008: Tra cứu tiếng Việt không dấu (Da Nang)", async () => {
      const res = await searchZipCodes(db, { query: "Da Nang", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results.some((r) => r.place_name_normalized?.includes("da nang"))).toBe(true);
    });

    it("TC-009: Tra cứu không phân biệt hoa thường (lOs AnGeLeS)", async () => {
      const res = await searchZipCodes(db, { query: "lOs AnGeLeS", country: "US" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results.some((r) => r.place_name.toLowerCase().includes("los angeles"))).toBe(true);
    });

    it("TC-019: Tra cứu tên tỉnh Hưng Yên trả về mã đại diện 17000 ở vị trí đầu tiên", async () => {
      const res = await searchZipCodes(db, { query: "Hưng Yên", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("17000");
      expect(res.results[0].place_name).toContain("Trung tâm tỉnh Hưng Yên");
    });

    it("TC-020: Hỗ trợ mã bưu chính 6 chữ số cũ của Việt Nam (100000 -> 10000, 170000 -> 17000)", async () => {
      const res1 = await searchZipCodes(db, { query: "100000", country: "VN" });
      expect(res1.total).toBeGreaterThan(0);
      expect(res1.results[0].postal_code).toBe("10000");

      const res2 = await searchZipCodes(db, { query: "170000", country: "VN" });
      expect(res2.total).toBeGreaterThan(0);
      expect(res2.results.some((r) => r.postal_code === "17000")).toBe(true);
    });

    it("TC-021: Tra cứu tỉnh Thái Bình và TP Thái Bình trả về mã đại diện 06000 ở vị trí đầu", async () => {
      const res1 = await searchZipCodes(db, { query: "Thái Bình", country: "VN" });
      expect(res1.total).toBeGreaterThan(0);
      expect(res1.results[0].postal_code).toBe("06000");
      expect(res1.results[0].place_name).toContain("Thái Bình");

      const res2 = await searchZipCodes(db, { query: "tp thái bình", country: "VN" });
      expect(res2.total).toBeGreaterThan(0);
      expect(res2.results[0].postal_code).toBe("06000");
    });

    it("TC-022: Tra cứu tỉnh Hải Dương và TP Hải Dương trả về mã đại diện 03000 ở vị trí đầu", async () => {
      const res = await searchZipCodes(db, { query: "Hải Dương", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("03000");
      expect(res.results[0].place_name).toContain("Hải Dương");
    });

    it("TC-023: Tra cứu tỉnh Nam Định trả về mã đại diện 07000 ở vị trí đầu", async () => {
      const res = await searchZipCodes(db, { query: "Nam Định", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("07000");
      expect(res.results[0].place_name).toContain("Nam Định");
    });

    it("TC-024: Tra cứu tỉnh Ninh Bình trả về mã đại diện 08000 ở vị trí đầu", async () => {
      const res = await searchZipCodes(db, { query: "Ninh Bình", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("08000");
      expect(res.results[0].place_name).toContain("Ninh Bình");
    });

    it("TC-025: Tra cứu Bà Rịa Vũng Tàu không dấu/có dấu trả về mã đại diện 78000 ở vị trí đầu", async () => {
      const res1 = await searchZipCodes(db, { query: "Bà Rịa Vũng Tàu", country: "VN" });
      expect(res1.total).toBeGreaterThan(0);
      expect(res1.results[0].postal_code).toBe("78000");

      const res2 = await searchZipCodes(db, { query: "ba ria vung tau", country: "VN" });
      expect(res2.total).toBeGreaterThan(0);
      expect(res2.results[0].postal_code).toBe("78000");
    });

    it("TC-026: Tra cứu Thừa Thiên Huế trả về mã đại diện 49000 ở vị trí đầu", async () => {
      const res = await searchZipCodes(db, { query: "Thừa Thiên Huế", country: "VN" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("49000");
      expect(res.results[0].place_name).toContain("Thừa Thiên Huế");
    });

    it("TC-027: Tra cứu khi không nhập từ khóa (empty query) trả về danh sách mã bưu chính tương ứng", async () => {
      // 1. Khi chọn quốc gia VN
      const resVn = await searchZipCodes(db, { query: "", country: "VN", limit: 10 });
      expect(resVn.total).toBeGreaterThan(0);
      expect(resVn.results.length).toBeLessThanOrEqual(10);
      expect(resVn.results.every((r) => r.country_code === "VN")).toBe(true);

      // 2. Khi chọn quốc gia US
      const resUs = await searchZipCodes(db, { query: "", country: "US", limit: 10 });
      expect(resUs.total).toBeGreaterThan(0);
      expect(resUs.results.every((r) => r.country_code === "US")).toBe(true);

      // 3. Khi không chọn quốc gia (Tất cả quốc gia)
      const resAll = await searchZipCodes(db, { query: "", country: "", limit: 10 });
      expect(resAll.total).toBeGreaterThan(0);
      expect(resAll.results.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Security & Edge Cases (TC-014 - TC-017)", () => {
    it("TC-014: SQL Injection an toàn qua Prepared Statement", async () => {
      const res = await searchZipCodes(db, { query: "' OR '1'='1", country: "US" });
      expect(res.total).toBe(0);
    });

    it("TC-015: Ký tự đại diện SQL (% và _) được escape an toàn", async () => {
      const res = await searchZipCodes(db, { query: "%%%", country: "US" });
      expect(res.total).toBe(0);
    });

    it("TC-016: Khoảng trắng thừa được trim tự động", async () => {
      const res = await searchZipCodes(db, { query: "   90210   ", country: "US" });
      expect(res.total).toBeGreaterThan(0);
      expect(res.results[0].postal_code).toBe("90210");
    });

    it("TC-017: Giới hạn tối đa kết quả (max 50)", async () => {
      const res = await searchZipCodes(db, { query: "a", country: "US", limit: 100 });
      expect(res.results.length).toBeLessThanOrEqual(50);
    });
  });

  describe("Countries & Detail Lookup", () => {
    it("Lấy danh sách các quốc gia hỗ trợ", async () => {
      const countries = await getSupportedCountries(db);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries.some((c) => c.code === "VN")).toBe(true);
      expect(countries.some((c) => c.code === "US")).toBe(true);
    });

    it("Lấy chi tiết mã bưu chính", async () => {
      const detail = await getZipCodeDetail(db, "US", "90210");
      expect(detail).not.toBeNull();
      expect(detail?.place_name).toBe("Beverly Hills");
    });
  });
});
