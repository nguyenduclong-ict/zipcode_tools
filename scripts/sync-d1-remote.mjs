#!/usr/bin/env node

/**
 * ============================================================================
 * SCRIPT ĐỒNG BỘ CƠ SỞ DỮ LIỆU LÊN CLOUDFLARE D1 (REMOTE / LOCAL)
 * ============================================================================
 * 
 * Tính năng chính:
 * 1. Tự động xuất schema và toàn bộ dữ liệu thật từ `data/zipcodes_local.db`
 *    thành các file SQL chunks chuẩn kích thước Cloudflare D1 (chia nhỏ theo
 *    nhiều câu lệnh INSERT 100 dòng để chống lỗi SQLITE_TOOBIG).
 * 2. Tự động áp dụng schema, bảng countries, và nạp tuần tự các chunks lên D1.
 * 3. Hỗ trợ resume từ chunk bất kỳ (`--start-chunk=N`) nếu bị ngắt kết nối mạng.
 * 4. Hỗ trợ chế độ nạp nhanh chỉ riêng Việt Nam (`--vn-only`) hoặc toàn cầu (`--all`).
 * 5. Tự động retry tối đa 3 lần khi gặp sự cố mạng (network timeout / 5xx).
 * 
 * Cách sử dụng:
 *   node scripts/sync-d1-remote.mjs                     # Nạp toàn bộ lên D1 remote
 *   node scripts/sync-d1-remote.mjs --vn-only           # Chỉ nạp mã bưu chính Việt Nam
 *   node scripts/sync-d1-remote.mjs --target=local      # Nạp vào D1 local để test
 *   node scripts/sync-d1-remote.mjs --export-only       # Chỉ sinh các file SQL chunks
 *   node scripts/sync-d1-remote.mjs --start-chunk=15    # Tiếp tục chạy từ chunk 15
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { DatabaseSync } from "node:sqlite";

// Đọc tham số dòng lệnh
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Hướng dẫn sử dụng script đồng bộ Cloudflare D1:
  node scripts/sync-d1-remote.mjs [options]

Tùy chọn:
  --target=remote     Đồng bộ lên Cloudflare D1 Remote trên Cloudflare Edge (Mặc định)
  --target=local      Đồng bộ vào D1 cục bộ của Wrangler (.wrangler/state/v3/d1)
  --db=<name>         Tên database D1 (Mặc định đọc từ wrangler.jsonc: 'zipcodes-db')
  --vn-only           Chỉ đồng bộ dữ liệu Việt Nam (~21.100 bản ghi, ~11 chunks, rất nhanh)
  --all               Đồng bộ toàn bộ dữ liệu 8 quốc gia (~331.000 bản ghi, ~166 chunks)
  --chunk-size=<N>    Số lượng dòng trên mỗi file SQL chunk (Mặc định: 2000 dòng)
  --start-chunk=<N>   Bắt đầu thực thi từ chunk số N (Dùng để tiếp tục khi bị ngắt kết nối)
  --export-only       Chỉ xuất các file SQL chunks ra đĩa, không chạy lệnh Wrangler
  --skip-export       Bỏ qua bước xuất chunks, chạy thẳng các file SQL đã có sẵn
  -h, --help          Hiển thị trợ giúp này

Ví dụ:
  node scripts/sync-d1-remote.mjs --vn-only
  node scripts/sync-d1-remote.mjs --all
  node scripts/sync-d1-remote.mjs --start-chunk=25
`);
  process.exit(0);
}

// 1. Phân tích cấu hình
const isLocal = args.some((a) => a.includes("--target=local"));
const targetFlag = isLocal ? "--local" : "--remote";
const vnOnly = args.includes("--vn-only");
const exportOnly = args.includes("--export-only");
const skipExport = args.includes("--skip-export");

const dbArg = args.find((a) => a.startsWith("--db="));
let dbName = dbArg ? dbArg.split("=")[1] : "zipcodes-db";

// Đọc tên db từ wrangler.jsonc nếu không chỉ định qua cli
if (!dbArg) {
  try {
    const wranglerPath = path.join(process.cwd(), "wrangler.jsonc");
    if (fs.existsSync(wranglerPath)) {
      const wranglerContent = fs.readFileSync(wranglerPath, "utf-8");
      const cleanJson = wranglerContent.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const parsed = JSON.parse(cleanJson);
      if (parsed.d1_databases?.[0]?.database_name) {
        dbName = parsed.d1_databases[0].database_name;
      }
    }
  } catch {
    // Giữ mặc định
  }
}

const chunkSizeArg = args.find((a) => a.startsWith("--chunk-size="));
const CHUNK_SIZE = chunkSizeArg ? parseInt(chunkSizeArg.split("=")[1], 10) : 2000;
const ROWS_PER_STATEMENT = 100; // Chia nhỏ 100 dòng mỗi câu lệnh INSERT để tuân thủ giới hạn SQLite/D1

const startChunkArg = args.find((a) => a.startsWith("--start-chunk="));
const startChunk = startChunkArg ? parseInt(startChunkArg.split("=")[1], 10) : 0;

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "zipcodes_local.db");
const CHUNKS_DIR = path.join(process.cwd(), "data", "seed", "d1_chunks");

function escapeSql(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  console.log("==================================================================");
  console.log("           CLOUDFLARE D1 DATABASE SYNC TOOL                        ");
  console.log("==================================================================");
  console.log(`- Mục tiêu đồng bộ:   ${isLocal ? "LOCAL (Wrangler local state)" : "REMOTE (Cloudflare Edge Production)"}`);
  console.log(`- Database Name:      ${dbName}`);
  console.log(`- Phạm vi dữ liệu:    ${vnOnly ? "Việt Nam (VN Only)" : "Toàn bộ quốc gia (VN, US, CA, GB, JP, DE, FR, AU)"}`);
  console.log(`- Kích thước chunk:   ${CHUNK_SIZE.toLocaleString()} dòng / file SQL (${ROWS_PER_STATEMENT} dòng / câu lệnh INSERT)`);
  console.log(`- Thư mục SQL chunks: ${CHUNKS_DIR}`);
  console.log("==================================================================\n");

  if (!fs.existsSync(LOCAL_DB_PATH)) {
    console.error(`[LỖI] Không tìm thấy cơ sở dữ liệu cục bộ tại: ${LOCAL_DB_PATH}`);
    process.exit(1);
  }

  // Bước 1: Xuất các file SQL chunks từ SQLite cục bộ
  if (!skipExport) {
    console.log(">>> [BƯỚC 1/3] Đang xuất dữ liệu từ SQLite cục bộ ra các file SQL chunks...");
    if (fs.existsSync(CHUNKS_DIR)) {
      fs.rmSync(CHUNKS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(CHUNKS_DIR, { recursive: true });

    const db = new DatabaseSync(LOCAL_DB_PATH);

    // 1.1 File 0000_schema_and_countries.sql
    const schemaSqlPath = path.join(process.cwd(), "migrations", "0001_initial_schema.sql");
    const baseSchema = fs.existsSync(schemaSqlPath)
      ? fs.readFileSync(schemaSqlPath, "utf-8")
      : "";

    const countries = db.prepare("SELECT * FROM countries").all();
    const countriesSqlRows = countries.map(
      (c) =>
        `(${escapeSql(c.code)}, ${escapeSql(c.name)}, ${escapeSql(c.native_name)}, ${escapeSql(c.postal_code_format)}, ${escapeSql(c.postal_code_example)}, ${c.total_records || 0})`
    );

    const schemaAndCountriesSql = `-- ==========================================
-- 0000: Initial Schema & Supported Countries
-- ==========================================

${baseSchema}

INSERT OR REPLACE INTO countries (code, name, native_name, postal_code_format, postal_code_example, total_records)
VALUES
${countriesSqlRows.join(",\n")};
`;

    fs.writeFileSync(path.join(CHUNKS_DIR, "0000_schema_and_countries.sql"), schemaAndCountriesSql, "utf-8");
    console.log(`✓ Đã tạo: 0000_schema_and_countries.sql (${countries.length} quốc gia)`);

    // 1.2 Xuất zipcodes thành các chunks
    const countSql = vnOnly
      ? "SELECT COUNT(*) as c FROM zipcodes WHERE country_code = 'VN'"
      : "SELECT COUNT(*) as c FROM zipcodes";
    const totalRecords = db.prepare(countSql).get().c;

    console.log(`- Tổng số bản ghi zipcodes cần nạp: ${totalRecords.toLocaleString()} dòng`);

    const selectQuery = vnOnly
      ? db.prepare("SELECT * FROM zipcodes WHERE country_code = 'VN' ORDER BY postal_code ASC")
      : db.prepare("SELECT * FROM zipcodes ORDER BY country_code ASC, postal_code ASC");

    let chunkIndex = 1;
    let currentBatch = [];

    const flushChunk = () => {
      const fileName = `chunk_${String(chunkIndex).padStart(4, "0")}.sql`;
      const filePath = path.join(CHUNKS_DIR, fileName);
      
      // Chia nhỏ thành các câu lệnh INSERT mỗi câu 100 dòng
      let chunkSql = "";
      for (let i = 0; i < currentBatch.length; i += ROWS_PER_STATEMENT) {
        const statementBatch = currentBatch.slice(i, i + ROWS_PER_STATEMENT);
        chunkSql += `INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES\n${statementBatch.join(",\n")};\n`;
      }

      fs.writeFileSync(filePath, chunkSql, "utf-8");
      chunkIndex++;
      currentBatch = [];
    };

    for (const r of selectQuery.all()) {
      const rowVal = `(${escapeSql(r.country_code)}, ${escapeSql(r.postal_code)}, ${escapeSql(r.place_name)}, ${escapeSql(r.place_name_normalized)}, ${escapeSql(r.admin_name1)}, ${escapeSql(r.admin_code1)}, ${escapeSql(r.admin_name2)}, ${escapeSql(r.admin_code2)}, ${escapeSql(r.admin_name3)}, ${r.latitude ?? "NULL"}, ${r.longitude ?? "NULL"}, ${r.accuracy ?? "NULL"})`;
      currentBatch.push(rowVal);
      if (currentBatch.length >= CHUNK_SIZE) {
        flushChunk();
      }
    }
    if (currentBatch.length > 0) {
      flushChunk();
    }

    // 1.3 File 9999_finalize.sql
    const finalizeSql = `-- Cập nhật chính xác số lượng bản ghi cho các quốc gia
UPDATE countries 
SET total_records = (SELECT COUNT(*) FROM zipcodes WHERE zipcodes.country_code = countries.code);
`;
    fs.writeFileSync(path.join(CHUNKS_DIR, "9999_finalize.sql"), finalizeSql, "utf-8");

    const totalChunks = chunkIndex - 1;
    console.log(`✓ Đã tạo thành công ${totalChunks} file SQL chunks tại: ${CHUNKS_DIR}\n`);
  } else {
    console.log(">>> [BƯỚC 1/3] Bỏ qua xuất chunks theo tùy chọn --skip-export.\n");
  }

  if (exportOnly) {
    console.log("=== HOÀN TẤT BƯỚC XUẤT CHUNKS (Tùy chọn --export-only) ===");
    console.log(`Bạn có thể kiểm tra các file tại: ${CHUNKS_DIR}`);
    return;
  }

  // Bước 2: Kiểm tra công cụ Wrangler CLI
  console.log(">>> [BƯỚC 2/3] Kiểm tra công cụ Wrangler CLI...");
  try {
    const wranglerVer = execSync("npx wrangler --version", { encoding: "utf-8" }).trim();
    console.log(`✓ Wrangler CLI: ${wranglerVer.split("\n")[0]}`);
  } catch (err) {
    console.error("[LỖI] Không thể chạy `npx wrangler`. Vui lòng chạy `npm install` trước.");
    process.exit(1);
  }

  // Bước 3: Thực thi các file SQL vào Cloudflare D1 theo đúng thứ tự
  const schemaFile = "0000_schema_and_countries.sql";
  const finalizeFile = "9999_finalize.sql";
  const chunkFiles = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.startsWith("chunk_") && f.endsWith(".sql"))
    .sort();

  const sqlFiles = [
    ...(fs.existsSync(path.join(CHUNKS_DIR, schemaFile)) ? [schemaFile] : []),
    ...chunkFiles,
    ...(fs.existsSync(path.join(CHUNKS_DIR, finalizeFile)) ? [finalizeFile] : []),
  ];

  console.log(`>>> [BƯỚC 3/3] Bắt đầu đồng bộ ${sqlFiles.length} file SQL vào Cloudflare D1 (${targetFlag})...\n`);

  let executedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < sqlFiles.length; i++) {
    const file = sqlFiles[i];
    const filePath = path.join(CHUNKS_DIR, file);

    // Kiểm tra --start-chunk
    const chunkNumMatch = file.match(/chunk_(\d+)\.sql/);
    if (chunkNumMatch) {
      const chunkNum = parseInt(chunkNumMatch[1], 10);
      if (chunkNum < startChunk) {
        skippedCount++;
        continue;
      }
    }

    const progressStr = `[${i + 1}/${sqlFiles.length}] (${(((i + 1) / sqlFiles.length) * 100).toFixed(1)}%)`;
    process.stdout.write(`${progressStr} Đang nạp ${file}... `);

    const startTime = Date.now();
    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!success && attempts < maxAttempts) {
      attempts++;
      try {
        const cmd = `npx wrangler d1 execute ${dbName} ${targetFlag} --file="${filePath}" --yes`;
        execSync(cmd, { stdio: "pipe", encoding: "utf-8" });
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✓ Xong (${elapsed}s)`);
        success = true;
        executedCount++;
      } catch (err) {
        const fullErr = (err.stderr || "") + "\n" + (err.stdout || "") + "\n" + (err.message || "");
        const cleanErr = fullErr
          .split("\n")
          .filter((line) => line.trim() && !line.includes("WARNING") && !line.includes("update available"))
          .join(" ")
          .trim();

        if (attempts < maxAttempts) {
          console.warn(`\n  ⚠️ Lỗi lần ${attempts}/${maxAttempts}: ${cleanErr.slice(0, 150)}... Đang thử lại sau 3s...`);
          execSync("powershell -Command Start-Sleep -Seconds 3");
          process.stdout.write(`  -> Thử lại ${file}... `);
        } else {
          console.error(`\n\n❌ [LỖI THẤT BẠI] Không thể nạp ${file} sau ${maxAttempts} lần thử.`);
          console.error(cleanErr);
          console.log(`\n💡 GỢI Ý XỬ LÝ:`);
          console.log(`1. Nếu gặp lỗi xác thực hoặc kết nối, hãy kiểm tra:`);
          console.log(`   npx wrangler whoami`);
          console.log(`2. Bạn có thể tiếp tục tiến trình từ file bị dừng mà không phải chạy lại từ đầu:`);
          console.log(`   node scripts/sync-d1-remote.mjs ${targetFlag} --start-chunk=${chunkNumMatch ? chunkNumMatch[1] : 0}\n`);
          process.exit(1);
        }
      }
    }
  }

  console.log("\n==================================================================");
  console.log("🎉 ĐỒNG BỘ CLOUDFLARE D1 HOÀN TẤT THÀNH CÔNG!");
  console.log("==================================================================");
  console.log(`- Tổng số file đã thực thi: ${executedCount} file SQL`);
  if (skippedCount > 0) {
    console.log(`- Số file đã bỏ qua (theo --start-chunk): ${skippedCount} file`);
  }
  console.log(`- Mục tiêu: ${targetFlag}`);
  console.log(`- Database: ${dbName}`);
  console.log("\nBây giờ toàn bộ dữ liệu mã bưu chính đã sẵn sàng hoạt động tại Cloudflare Edge!");
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
