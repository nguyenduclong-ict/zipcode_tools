import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import { DatabaseSync } from "node:sqlite";

/**
 * Script tự động tải và chuyển đổi dữ liệu thật:
 * 1. Dữ liệu quốc tế từ GeoNames (download.geonames.org)
 * 2. Dữ liệu Việt Nam 5 số từ cổng mabuuchinh.vn (open data)
 * 3. Xuất thành các file SQL chunks và nạp thẳng vào local SQLite database
 */

const RAW_DIR = path.join(process.cwd(), "data", "raw");
const CHUNKS_DIR = path.join(process.cwd(), "data", "seed", "chunks");
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "zipcodes_local.db");

// Đảm bảo các thư mục tồn tại
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });

function removeVietnameseTones(str) {
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

function escapeSql(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function downloadFile(url, destPath) {
  console.log(`Đang tải: ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lỗi tải ${url}: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`-> Lưu thành công: ${destPath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
}

async function extractZip(zipPath, targetDir) {
  console.log(`Đang giải nén: ${path.basename(zipPath)} ...`);
  try {
    execSync(`tar -xf "${zipPath}" -C "${targetDir}"`);
  } catch (err) {
    // Fallback qua powershell nếu tar lỗi
    execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`);
  }
}

async function main() {
  const isFull = process.argv.includes("--all");
  console.log(`\n=== BẮT ĐẦU TẢI DỮ LIỆU THẬT (${isFull ? "TOÀN BỘ THẾ GIỚI" : "CÁC QUỐC GIA CHÍNH + VN"}) ===\n`);

  // 1. Tải dữ liệu Việt Nam 5 chữ số từ repo open data
  const vnJsonPath = path.join(RAW_DIR, "vietnam_postal.json");
  if (!fs.existsSync(vnJsonPath)) {
    try {
      await downloadFile(
        "https://raw.githubusercontent.com/KangHidro/zipcode-vietnam/master/full.json",
        vnJsonPath
      );
    } catch (err) {
      console.warn("Không thể tải vietnam_postal.json:", err.message);
    }
  }

  // 2. Tải dữ liệu quốc tế từ GeoNames
  const countriesToDownload = isFull
    ? ["allCountries"]
    : ["US", "CA", "GB", "JP", "DE", "FR", "AU"];

  for (const c of countriesToDownload) {
    const zipName = `${c}.zip`;
    const zipPath = path.join(RAW_DIR, zipName);
    const txtName = `${c}.txt`;
    const txtPath = path.join(RAW_DIR, txtName);

    if (!fs.existsSync(txtPath)) {
      if (!fs.existsSync(zipPath)) {
        await downloadFile(`https://download.geonames.org/export/zip/${zipName}`, zipPath);
      }
      await extractZip(zipPath, RAW_DIR);
    }
  }

  // 3. Khởi tạo / kết nối Database SQLite cục bộ để nạp thẳng
  const db = new DatabaseSync(LOCAL_DB_PATH);

  // Tạo bảng & index nếu chưa có
  const schemaSql = fs.readFileSync(path.join(process.cwd(), "migrations", "0001_initial_schema.sql"), "utf-8");
  db.exec(schemaSql);

  // Đảm bảo có danh sách countries
  const countriesSeed = `
    INSERT OR REPLACE INTO countries (code, name, native_name, postal_code_format, postal_code_example, total_records) VALUES
    ('VN', 'Vietnam', 'Việt Nam', '^\\d{5}$', '10000', 20900),
    ('US', 'United States', 'United States', '^\\d{5}(-\\d{4})?$', '90210', 43000),
    ('GB', 'United Kingdom', 'United Kingdom', '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', 'SW1A 1AA', 15000),
    ('CA', 'Canada', 'Canada', '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', 'K1A 0B1', 1600),
    ('JP', 'Japan', '日本', '^\\d{3}-?\\d{4}$', '100-0001', 120000),
    ('DE', 'Germany', 'Deutschland', '^\\d{5}$', '10115', 16000),
    ('FR', 'France', 'France', '^\\d{5}$', '75001', 50000),
    ('AU', 'Australia', 'Australia', '^\\d{4}$', '2000', 17000);
  `;
  db.exec(countriesSeed);

  console.log("\n-> Đang chuyển đổi và nạp dữ liệu vào cơ sở dữ liệu...");

  // Chuẩn bị statement chèn nhanh
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalInserted = 0;
  let chunkCount = 1;
  let currentChunkRows = [];
  const CHUNK_SIZE = 5000;

  const flushChunkToDisk = (rows) => {
    const chunkFile = path.join(CHUNKS_DIR, `chunk_${String(chunkCount).padStart(4, "0")}.sql`);
    const sql = `INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy)\nVALUES\n${rows.join(",\n")};\n`;
    fs.writeFileSync(chunkFile, sql, "utf-8");
    chunkCount++;
  };

  // Nạp dữ liệu Việt Nam
  if (fs.existsSync(vnJsonPath)) {
    console.log("-> Đang nạp dữ liệu mã bưu chính 5 số Việt Nam...");
    const vnList = JSON.parse(fs.readFileSync(vnJsonPath, "utf-8"));
    db.exec("BEGIN TRANSACTION;");
    for (const item of vnList) {
      const code = String(item.zip).padStart(5, "0");
      const place = item.place || "";
      const norm = removeVietnameseTones(place);

      insertStmt.run("VN", code, place, norm, null, null, null, null, null, null, null, 6);
      totalInserted++;

      const sqlRow = `('VN', ${escapeSql(code)}, ${escapeSql(place)}, ${escapeSql(norm)}, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6)`;
      currentChunkRows.push(sqlRow);
      if (currentChunkRows.length >= CHUNK_SIZE) {
        flushChunkToDisk(currentChunkRows);
        currentChunkRows = [];
      }
    }
    db.exec("COMMIT;");
    console.log(`-> Đã nạp ${vnList.length} mã bưu chính Việt Nam.`);
  }

  // Nạp dữ liệu quốc tế
  for (const c of countriesToDownload) {
    const txtPath = path.join(RAW_DIR, `${c}.txt`);
    if (!fs.existsSync(txtPath)) continue;

    console.log(`-> Đang đọc file GeoNames: ${c}.txt ...`);
    db.exec("BEGIN TRANSACTION;");

    const rl = readline.createInterface({
      input: fs.createReadStream(txtPath),
      crlfDelay: Infinity,
    });

    let countInFile = 0;
    for await (const line of rl) {
      if (!line.trim()) continue;
      const cols = line.split("\t");
      if (cols.length < 9) continue;

      const countryCode = cols[0]?.trim();
      const postalCode = cols[1]?.trim();
      const placeName = cols[2]?.trim();
      const adminName1 = cols[3]?.trim();
      const adminCode1 = cols[4]?.trim();
      const adminName2 = cols[5]?.trim();
      const adminCode2 = cols[6]?.trim();
      const adminName3 = cols[7]?.trim();
      const lat = parseFloat(cols[9]) || null;
      const lng = parseFloat(cols[10]) || null;
      const accuracy = parseInt(cols[11], 10) || null;

      const norm = removeVietnameseTones(placeName);

      insertStmt.run(
        countryCode,
        postalCode,
        placeName,
        norm,
        adminName1,
        adminCode1,
        adminName2,
        adminCode2,
        adminName3,
        lat,
        lng,
        accuracy
      );
      totalInserted++;
      countInFile++;

      const sqlRow = `(${escapeSql(countryCode)}, ${escapeSql(postalCode)}, ${escapeSql(placeName)}, ${escapeSql(norm)}, ${escapeSql(adminName1)}, ${escapeSql(adminCode1)}, ${escapeSql(adminName2)}, ${escapeSql(adminCode2)}, ${escapeSql(adminName3)}, ${lat ?? "NULL"}, ${lng ?? "NULL"}, ${accuracy ?? "NULL"})`;
      currentChunkRows.push(sqlRow);
      if (currentChunkRows.length >= CHUNK_SIZE) {
        flushChunkToDisk(currentChunkRows);
        currentChunkRows = [];
      }
    }

    db.exec("COMMIT;");
    console.log(`-> Hoàn tất nạp ${countInFile} bản ghi cho ${c}.`);
  }

  if (currentChunkRows.length > 0) {
    flushChunkToDisk(currentChunkRows);
  }

  // Cập nhật lại số lượng bản ghi trong countries
  db.exec(`
    UPDATE countries 
    SET total_records = (SELECT COUNT(*) FROM zipcodes WHERE zipcodes.country_code = countries.code);
  `);

  console.log(`\n=== THÀNH CÔNG! ===`);
  console.log(`- Tổng số bản ghi thật đã nạp vào database: ${totalInserted.toLocaleString()} dòng`);
  console.log(`- Đã xuất ${chunkCount - 1} file SQL chunks tại: data/seed/chunks/`);
  console.log(`- Database cục bộ đã được cập nhật: data/zipcodes_local.db`);
  console.log(`- Bây giờ bạn có thể chạy 'npm run dev' để tra cứu ngay lập tức, hoặc nạp lên Cloudflare D1 bằng:`);
  console.log(`  npx wrangler d1 execute zipcodes-db --remote --file=./data/seed/chunks/chunk_0001.sql`);
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
