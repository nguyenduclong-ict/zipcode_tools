import fs from "fs";
import path from "path";
import readline from "readline";

/**
 * Script ETL: Đọc dữ liệu thô GeoNames / VNPost và sinh các file SQL chunks nạp vào Cloudflare D1.
 * Hỗ trợ nạp toàn bộ dữ liệu hoặc chia nhỏ thành từng batch 5.000 dòng.
 */

function removeVietnameseTones(str: string): string {
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

function escapeSql(val: string | null | undefined): string {
  if (val === null || val === undefined) return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

async function processGeoNamesFile(filePath: string, outputDir: string, chunkSize = 5000) {
  if (!fs.existsSync(filePath)) {
    console.log(`File nguồn ${filePath} không tồn tại. Vui lòng tải từ https://download.geonames.org/export/zip/allCountries.zip`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let chunkIndex = 1;
  let recordsInChunk = 0;
  let valuesBatch: string[] = [];

  const writeChunk = (values: string[]) => {
    const chunkFileName = path.join(outputDir, `chunk_${String(chunkIndex).padStart(4, "0")}.sql`);
    const sql = `INSERT OR IGNORE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy)\nVALUES\n${values.join(",\n")};\n`;
    fs.writeFileSync(chunkFileName, sql, "utf-8");
    console.log(`Đã xuất chunk #${chunkIndex} (${values.length} bản ghi): ${chunkFileName}`);
    chunkIndex++;
  };

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

    const normalizedPlace = removeVietnameseTones(placeName);

    const rowVal = `(${escapeSql(countryCode)}, ${escapeSql(postalCode)}, ${escapeSql(placeName)}, ${escapeSql(normalizedPlace)}, ${escapeSql(adminName1)}, ${escapeSql(adminCode1)}, ${escapeSql(adminName2)}, ${escapeSql(adminCode2)}, ${escapeSql(adminName3)}, ${lat ?? "NULL"}, ${lng ?? "NULL"}, ${accuracy ?? "NULL"})`;
    valuesBatch.push(rowVal);
    recordsInChunk++;

    if (recordsInChunk >= chunkSize) {
      writeChunk(valuesBatch);
      valuesBatch = [];
      recordsInChunk = 0;
    }
  }

  if (valuesBatch.length > 0) {
    writeChunk(valuesBatch);
  }

  console.log(`Hoàn tất xử lý! Tổng cộng ${chunkIndex - 1} chunks.`);
}

export { processGeoNamesFile, removeVietnameseTones };
