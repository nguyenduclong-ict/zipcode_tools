import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

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

const supplementData = [
  // ================= THÁI BÌNH (06xxx) =================
  { zip: "06000", place: "Bưu cục Trung tâm tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06001", place: "Tỉnh ủy tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06002", place: "Hội đồng nhân dân tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06003", place: "Ủy ban nhân dân tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06004", place: "Ủy ban Mặt trận Tổ quốc tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06005", place: "Tòa án nhân dân tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06006", place: "Viện kiểm sát nhân dân tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06007", place: "Công an tỉnh Thái Bình", admin1: "Thái Bình", admin2: null },
  { zip: "06100", place: "Bưu cục Trung tâm thành phố Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06150", place: "Bưu cục phát thành phố Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06101", place: "Phường Bồ Xuyên thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06102", place: "Phường Đề Thám thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06103", place: "Phường Kỳ Bá thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06104", place: "Phường Lê Hồng Phong thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06105", place: "Phường Quang Trung thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06106", place: "Phường Tiền Phong thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06107", place: "Phường Trần Hưng Đạo thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06108", place: "Phường Trần Lãm thành phố Thái Bình tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Thành phố Thái Bình" },
  { zip: "06200", place: "Bưu cục Trung tâm huyện Tiền Hải", admin1: "Thái Bình", admin2: "Huyện Tiền Hải" },
  { zip: "06201", place: "Thị trấn Tiền Hải huyện Tiền Hải tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Tiền Hải" },
  { zip: "06300", place: "Bưu cục Trung tâm huyện Kiến Xương", admin1: "Thái Bình", admin2: "Huyện Kiến Xương" },
  { zip: "06301", place: "Thị trấn Kiến Xương huyện Kiến Xương tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Kiến Xương" },
  { zip: "06400", place: "Bưu cục Trung tâm huyện Thái Thụy", admin1: "Thái Bình", admin2: "Huyện Thái Thụy" },
  { zip: "06401", place: "Thị trấn Diêm Điền huyện Thái Thụy tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Thái Thụy" },
  { zip: "06500", place: "Bưu cục Trung tâm huyện Quỳnh Phụ", admin1: "Thái Bình", admin2: "Huyện Quỳnh Phụ" },
  { zip: "06501", place: "Thị trấn Quỳnh Côi huyện Quỳnh Phụ tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Quỳnh Phụ" },
  { zip: "06502", place: "Thị trấn An Bài huyện Quỳnh Phụ tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Quỳnh Phụ" },
  { zip: "06600", place: "Bưu cục Trung tâm huyện Đông Hưng", admin1: "Thái Bình", admin2: "Huyện Đông Hưng" },
  { zip: "06601", place: "Thị trấn Đông Hưng huyện Đông Hưng tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Đông Hưng" },
  { zip: "06700", place: "Bưu cục Trung tâm huyện Hưng Hà", admin1: "Thái Bình", admin2: "Huyện Hưng Hà" },
  { zip: "06701", place: "Thị trấn Hưng Hà huyện Hưng Hà tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Hưng Hà" },
  { zip: "06702", place: "Thị trấn Hưng Nhân huyện Hưng Hà tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Hưng Hà" },
  { zip: "06800", place: "Bưu cục Trung tâm huyện Vũ Thư", admin1: "Thái Bình", admin2: "Huyện Vũ Thư" },
  { zip: "06801", place: "Thị trấn Vũ Thư huyện Vũ Thư tỉnh Thái Bình", admin1: "Thái Bình", admin2: "Huyện Vũ Thư" },

  // ================= HẢI DƯƠNG (03xxx) =================
  { zip: "03000", place: "Bưu cục Trung tâm tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03001", place: "Tỉnh ủy tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03002", place: "Hội đồng nhân dân tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03003", place: "Ủy ban nhân dân tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03004", place: "Ủy ban Mặt trận Tổ quốc tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03005", place: "Công an tỉnh Hải Dương", admin1: "Hải Dương", admin2: null },
  { zip: "03100", place: "Bưu cục Trung tâm thành phố Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03150", place: "Bưu cục phát thành phố Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03101", place: "Phường Trần Phú thành phố Hải Dương tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03102", place: "Phường Lê Thanh Nghị thành phố Hải Dương tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03103", place: "Phường Nguyễn Trãi thành phố Hải Dương tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03104", place: "Phường Quang Trung thành phố Hải Dương tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Hải Dương" },
  { zip: "03200", place: "Bưu cục Trung tâm thành phố Chí Linh", admin1: "Hải Dương", admin2: "Thành phố Chí Linh" },
  { zip: "03201", place: "Phường Sao Đỏ thành phố Chí Linh tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thành phố Chí Linh" },
  { zip: "03300", place: "Bưu cục Trung tâm thị xã Kinh Môn", admin1: "Hải Dương", admin2: "Thị xã Kinh Môn" },
  { zip: "03301", place: "Phường An Lưu thị xã Kinh Môn tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Thị xã Kinh Môn" },
  { zip: "03400", place: "Bưu cục Trung tâm huyện Nam Sách", admin1: "Hải Dương", admin2: "Huyện Nam Sách" },
  { zip: "03401", place: "Thị trấn Nam Sách huyện Nam Sách tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Nam Sách" },
  { zip: "03500", place: "Bưu cục Trung tâm huyện Kim Thành", admin1: "Hải Dương", admin2: "Huyện Kim Thành" },
  { zip: "03501", place: "Thị trấn Phú Thái huyện Kim Thành tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Kim Thành" },
  { zip: "03600", place: "Bưu cục Trung tâm huyện Thanh Hà", admin1: "Hải Dương", admin2: "Huyện Thanh Hà" },
  { zip: "03601", place: "Thị trấn Thanh Hà huyện Thanh Hà tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Thanh Hà" },
  { zip: "03700", place: "Bưu cục Trung tâm huyện Cẩm Giàng", admin1: "Hải Dương", admin2: "Huyện Cẩm Giàng" },
  { zip: "03701", place: "Thị trấn Lai Cách huyện Cẩm Giàng tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Cẩm Giàng" },
  { zip: "03800", place: "Bưu cục Trung tâm huyện Bình Giang", admin1: "Hải Dương", admin2: "Huyện Bình Giang" },
  { zip: "03801", place: "Thị trấn Kẻ Sặt huyện Bình Giang tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Bình Giang" },
  { zip: "03850", place: "Bưu cục Trung tâm huyện Gia Lộc", admin1: "Hải Dương", admin2: "Huyện Gia Lộc" },
  { zip: "03851", place: "Thị trấn Gia Lộc huyện Gia Lộc tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Gia Lộc" },
  { zip: "03900", place: "Bưu cục Trung tâm huyện Tứ Kỳ", admin1: "Hải Dương", admin2: "Huyện Tứ Kỳ" },
  { zip: "03901", place: "Thị trấn Tứ Kỳ huyện Tứ Kỳ tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Tứ Kỳ" },
  { zip: "03950", place: "Bưu cục Trung tâm huyện Ninh Giang", admin1: "Hải Dương", admin2: "Huyện Ninh Giang" },
  { zip: "03951", place: "Thị trấn Ninh Giang huyện Ninh Giang tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Ninh Giang" },
  { zip: "03980", place: "Bưu cục Trung tâm huyện Thanh Miện", admin1: "Hải Dương", admin2: "Huyện Thanh Miện" },
  { zip: "03981", place: "Thị trấn Thanh Miện huyện Thanh Miện tỉnh Hải Dương", admin1: "Hải Dương", admin2: "Huyện Thanh Miện" },

  // ================= NAM ĐỊNH (07xxx) =================
  { zip: "07000", place: "Bưu cục Trung tâm tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07001", place: "Tỉnh ủy tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07002", place: "Hội đồng nhân dân tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07003", place: "Ủy ban nhân dân tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07004", place: "Ủy ban Mặt trận Tổ quốc tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07005", place: "Công an tỉnh Nam Định", admin1: "Nam Định", admin2: null },
  { zip: "07100", place: "Bưu cục Trung tâm thành phố Nam Định", admin1: "Nam Định", admin2: "Thành phố Nam Định" },
  { zip: "07150", place: "Bưu cục phát thành phố Nam Định", admin1: "Nam Định", admin2: "Thành phố Nam Định" },
  { zip: "07101", place: "Phường Vị Xuyên thành phố Nam Định tỉnh Nam Định", admin1: "Nam Định", admin2: "Thành phố Nam Định" },
  { zip: "07102", place: "Phường Trần Tế Xương thành phố Nam Định tỉnh Nam Định", admin1: "Nam Định", admin2: "Thành phố Nam Định" },
  { zip: "07103", place: "Phường Hạ Long thành phố Nam Định tỉnh Nam Định", admin1: "Nam Định", admin2: "Thành phố Nam Định" },
  { zip: "07200", place: "Bưu cục Trung tâm huyện Mỹ Lộc", admin1: "Nam Định", admin2: "Huyện Mỹ Lộc" },
  { zip: "07201", place: "Thị trấn Mỹ Lộc huyện Mỹ Lộc tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Mỹ Lộc" },
  { zip: "07300", place: "Bưu cục Trung tâm huyện Vụ Bản", admin1: "Nam Định", admin2: "Huyện Vụ Bản" },
  { zip: "07301", place: "Thị trấn Gôi huyện Vụ Bản tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Vụ Bản" },
  { zip: "07400", place: "Bưu cục Trung tâm huyện Ý Yên", admin1: "Nam Định", admin2: "Huyện Ý Yên" },
  { zip: "07401", place: "Thị trấn Lâm huyện Ý Yên tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Ý Yên" },
  { zip: "07500", place: "Bưu cục Trung tâm huyện Nghĩa Hưng", admin1: "Nam Định", admin2: "Huyện Nghĩa Hưng" },
  { zip: "07501", place: "Thị trấn Liễu Đề huyện Nghĩa Hưng tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Nghĩa Hưng" },
  { zip: "07600", place: "Bưu cục Trung tâm huyện Nam Trực", admin1: "Nam Định", admin2: "Huyện Nam Trực" },
  { zip: "07601", place: "Thị trấn Nam Giang huyện Nam Trực tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Nam Trực" },
  { zip: "07700", place: "Bưu cục Trung tâm huyện Trực Ninh", admin1: "Nam Định", admin2: "Huyện Trực Ninh" },
  { zip: "07701", place: "Thị trấn Cổ Lễ huyện Trực Ninh tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Trực Ninh" },
  { zip: "07800", place: "Bưu cục Trung tâm huyện Xuân Trường", admin1: "Nam Định", admin2: "Huyện Xuân Trường" },
  { zip: "07801", place: "Thị trấn Xuân Trường huyện Xuân Trường tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Xuân Trường" },
  { zip: "07900", place: "Bưu cục Trung tâm huyện Giao Thủy", admin1: "Nam Định", admin2: "Huyện Giao Thủy" },
  { zip: "07901", place: "Thị trấn Ngô Đồng huyện Giao Thủy tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Giao Thủy" },
  { zip: "07950", place: "Bưu cục Trung tâm huyện Hải Hậu", admin1: "Nam Định", admin2: "Huyện Hải Hậu" },
  { zip: "07951", place: "Thị trấn Yên Định huyện Hải Hậu tỉnh Nam Định", admin1: "Nam Định", admin2: "Huyện Hải Hậu" },

  // ================= NINH BÌNH (08xxx) =================
  { zip: "08000", place: "Bưu cục Trung tâm tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08001", place: "Tỉnh ủy tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08002", place: "Hội đồng nhân dân tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08003", place: "Ủy ban nhân dân tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08004", place: "Ủy ban Mặt trận Tổ quốc tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08005", place: "Công an tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: null },
  { zip: "08100", place: "Bưu cục Trung tâm thành phố Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Ninh Bình" },
  { zip: "08150", place: "Bưu cục phát thành phố Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Ninh Bình" },
  { zip: "08101", place: "Phường Vân Giang thành phố Ninh Bình tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Ninh Bình" },
  { zip: "08102", place: "Phường Tân Thành thành phố Ninh Bình tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Ninh Bình" },
  { zip: "08103", place: "Phường Đông Thành thành phố Ninh Bình tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Ninh Bình" },
  { zip: "08200", place: "Bưu cục Trung tâm thành phố Tam Điệp", admin1: "Ninh Bình", admin2: "Thành phố Tam Điệp" },
  { zip: "08201", place: "Phường Bắc Sơn thành phố Tam Điệp tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Thành phố Tam Điệp" },
  { zip: "08300", place: "Bưu cục Trung tâm huyện Hoa Lư", admin1: "Ninh Bình", admin2: "Huyện Hoa Lư" },
  { zip: "08301", place: "Thị trấn Thiên Tôn huyện Hoa Lư tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Hoa Lư" },
  { zip: "08400", place: "Bưu cục Trung tâm huyện Gia Viễn", admin1: "Ninh Bình", admin2: "Huyện Gia Viễn" },
  { zip: "08401", place: "Thị trấn Me huyện Gia Viễn tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Gia Viễn" },
  { zip: "08500", place: "Bưu cục Trung tâm huyện Nho Quan", admin1: "Ninh Bình", admin2: "Huyện Nho Quan" },
  { zip: "08501", place: "Thị trấn Nho Quan huyện Nho Quan tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Nho Quan" },
  { zip: "08600", place: "Bưu cục Trung tâm huyện Yên Khánh", admin1: "Ninh Bình", admin2: "Huyện Yên Khánh" },
  { zip: "08601", place: "Thị trấn Ninh huyện Yên Khánh tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Yên Khánh" },
  { zip: "08700", place: "Bưu cục Trung tâm huyện Kim Sơn", admin1: "Ninh Bình", admin2: "Huyện Kim Sơn" },
  { zip: "08701", place: "Thị trấn Phát Diệm huyện Kim Sơn tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Kim Sơn" },
  { zip: "08800", place: "Bưu cục Trung tâm huyện Yên Mô", admin1: "Ninh Bình", admin2: "Huyện Yên Mô" },
  { zip: "08801", place: "Thị trấn Yên Thịnh huyện Yên Mô tỉnh Ninh Bình", admin1: "Ninh Bình", admin2: "Huyện Yên Mô" },

  // ================= BÀ RỊA - VŨNG TÀU (78xxx, 79xxx) =================
  { zip: "78000", place: "Bưu cục Trung tâm tỉnh Bà Rịa - Vũng Tàu", admin1: "Bà Rịa - Vũng Tàu", admin2: null },
  { zip: "78100", place: "Bưu cục Trung tâm thành phố Bà Rịa", admin1: "Bà Rịa - Vũng Tàu", admin2: "Thành phố Bà Rịa" },
  { zip: "78200", place: "Bưu cục Trung tâm huyện Châu Đức", admin1: "Bà Rịa - Vũng Tàu", admin2: "Huyện Châu Đức" },
  { zip: "78300", place: "Bưu cục Trung tâm huyện Xuyên Mộc", admin1: "Bà Rịa - Vũng Tàu", admin2: "Huyện Xuyên Mộc" },
  { zip: "78400", place: "Bưu cục Trung tâm huyện Long Điền", admin1: "Bà Rịa - Vũng Tàu", admin2: "Huyện Long Điền" },
  { zip: "78500", place: "Bưu cục Trung tâm huyện Đất Đỏ", admin1: "Bà Rịa - Vũng Tàu", admin2: "Huyện Đất Đỏ" },
  { zip: "78600", place: "Bưu cục Trung tâm thị xã Phú Mỹ", admin1: "Bà Rịa - Vũng Tàu", admin2: "Thị xã Phú Mỹ" },
  { zip: "78700", place: "Bưu cục Trung tâm huyện Côn Đảo", admin1: "Bà Rịa - Vũng Tàu", admin2: "Huyện Côn Đảo" },
  { zip: "79000", place: "Bưu cục Trung tâm thành phố Vũng Tàu", admin1: "Bà Rịa - Vũng Tàu", admin2: "Thành phố Vũng Tàu" },

  // ================= THỪA THIÊN HUẾ (49xxx) =================
  { zip: "49000", place: "Bưu cục Trung tâm tỉnh Thừa Thiên Huế", admin1: "Thừa Thiên Huế", admin2: null },
  { zip: "49100", place: "Bưu cục Trung tâm thành phố Huế", admin1: "Thừa Thiên Huế", admin2: "Thành phố Huế" },
  { zip: "49200", place: "Bưu cục Trung tâm thị xã Hương Thủy", admin1: "Thừa Thiên Huế", admin2: "Thị xã Hương Thủy" },
  { zip: "49300", place: "Bưu cục Trung tâm thị xã Hương Trà", admin1: "Thừa Thiên Huế", admin2: "Thị xã Hương Trà" },
  { zip: "49400", place: "Bưu cục Trung tâm huyện Phong Điền", admin1: "Thừa Thiên Huế", admin2: "Huyện Phong Điền" },
  { zip: "49500", place: "Bưu cục Trung tâm huyện Quảng Điền", admin1: "Thừa Thiên Huế", admin2: "Huyện Quảng Điền" },
  { zip: "49600", place: "Bưu cục Trung tâm huyện Phú Vang", admin1: "Thừa Thiên Huế", admin2: "Huyện Phú Vang" },
  { zip: "49700", place: "Bưu cục Trung tâm huyện Phú Lộc", admin1: "Thừa Thiên Huế", admin2: "Huyện Phú Lộc" },
  { zip: "49800", place: "Bưu cục Trung tâm huyện Nam Đông", admin1: "Thừa Thiên Huế", admin2: "Huyện Nam Đông" },
  { zip: "49900", place: "Bưu cục Trung tâm huyện A Lưới", admin1: "Thừa Thiên Huế", admin2: "Huyện A Lưới" }
];

async function main() {
  console.log("=== BẮT ĐẦU TẠO DỮ LIỆU BỔ SUNG VÀ NẠP VÀO DATABASE ===\n");

  // 1. Lưu file JSON bổ sung
  const rawDir = path.join(process.cwd(), "data", "raw");
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
  const supplementJsonPath = path.join(rawDir, "vietnam_provinces_supplement.json");
  fs.writeFileSync(supplementJsonPath, JSON.stringify(supplementData, null, 2), "utf-8");
  console.log(`1. Đã lưu ${supplementData.length} bản ghi bổ sung vào: ${supplementJsonPath}`);

  // 2. Mở cơ sở dữ liệu SQLite cục bộ
  const dbPath = path.join(process.cwd(), "data", "zipcodes_local.db");
  const db = new DatabaseSync(dbPath);

  db.exec("BEGIN TRANSACTION;");

  // Chuẩn bị statement
  const insertStmt = db.prepare(`
    INSERT INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_name2, accuracy)
    VALUES ('VN', ?, ?, ?, ?, ?, 6)
  `);

  // Xóa các bản ghi placeholder trùng postal_code (nếu có) trước khi chèn mới
  const deletePostalStmt = db.prepare("DELETE FROM zipcodes WHERE country_code = 'VN' AND postal_code = ? AND place_name = ?");

  let insertedCount = 0;
  for (const item of supplementData) {
    const norm = removeVietnameseTones(item.place);
    deletePostalStmt.run(item.zip, item.place);
    insertStmt.run(item.zip, item.place, norm, item.admin1, item.admin2);
    insertedCount++;
  }
  console.log(`2. Đã nạp ${insertedCount} bản ghi vào bảng zipcodes.`);

  // 3. Chuẩn hóa các bản ghi cũ của Bà Rịa - Vũng Tàu và Thừa Thiên Huế
  db.exec(`
    UPDATE zipcodes 
    SET admin_name1 = 'Bà Rịa - Vũng Tàu'
    WHERE country_code = 'VN' AND (postal_code LIKE '78%' OR postal_code LIKE '79%') AND (admin_name1 IS NULL OR admin_name1 = 'Bà Rịa');

    UPDATE zipcodes 
    SET place_name = 'Bưu cục Trung tâm tỉnh Bà Rịa - Vũng Tàu',
        place_name_normalized = 'buu cuc trung tam tinh ba ria - vung tau'
    WHERE country_code = 'VN' AND postal_code = '78000' AND place_name LIKE '%Bà Rịa%';

    UPDATE zipcodes 
    SET admin_name1 = 'Thừa Thiên Huế'
    WHERE country_code = 'VN' AND postal_code LIKE '49%' AND (admin_name1 IS NULL OR admin_name1 = 'Thừa Thiên');

    UPDATE zipcodes 
    SET place_name = 'Bưu cục Trung tâm tỉnh Thừa Thiên Huế',
        place_name_normalized = 'buu cuc trung tam tinh thua thien hue'
    WHERE country_code = 'VN' AND postal_code = '49000' AND place_name LIKE '%Thừa Thiên%';
  `);
  console.log("3. Đã chuẩn hóa bản ghi tỉnh Bà Rịa - Vũng Tàu và Thừa Thiên Huế.");

  // 4. Trích xuất tự động admin_name1 cho các bản ghi Việt Nam còn thiếu
  console.log("4. Đang phân tích trích xuất admin_name1 cho các bản ghi Việt Nam...");
  const vnRows = db.prepare("SELECT id, place_name FROM zipcodes WHERE country_code = 'VN' AND admin_name1 IS NULL").all();
  const updateAdminStmt = db.prepare("UPDATE zipcodes SET admin_name1 = ?, admin_name2 = COALESCE(admin_name2, ?) WHERE id = ?");

  let adminUpdated = 0;
  for (const row of vnRows) {
    const place = row.place_name || "";
    // Tỉnh hoặc Thành phố ở cuối tên địa danh
    const provMatch = place.match(/(?:tỉnh|thành phố|tp\.?)\s+([^,]+)$/i);
    if (provMatch) {
      let prov = provMatch[1].trim();
      // Chuẩn hóa tên đặc biệt
      if (prov.toLowerCase() === "bà rịa") prov = "Bà Rịa - Vũng Tàu";
      if (prov.toLowerCase() === "thừa thiên") prov = "Thừa Thiên Huế";
      if (prov.toLowerCase() === "hồ chí minh") prov = "TP. Hồ Chí Minh";

      const distMatch = place.match(/(?:quận|huyện|thị xã|tx\.?|tp\.?|thành phố)\s+([^,]+?)(?=\s+(?:tỉnh|thành phố)|$)/i);
      const dist = distMatch ? distMatch[0].trim() : null;

      updateAdminStmt.run(prov, dist, row.id);
      adminUpdated++;
    }
  }
  console.log(`-> Đã cập nhật trường admin_name1 cho ${adminUpdated} bản ghi.`);

  // 5. Cập nhật lại tổng số bản ghi trong bảng countries
  db.exec(`
    UPDATE countries 
    SET total_records = (SELECT COUNT(*) FROM zipcodes WHERE zipcodes.country_code = countries.code)
    WHERE code = 'VN';
  `);

  db.exec("COMMIT;");

  // 6. Tạo file SQL nạp cho D1: data/seed/vietnam_supplement.sql
  const d1SqlRows = supplementData.map(item => {
    const norm = removeVietnameseTones(item.place);
    return `('VN', ${escapeSql(item.zip)}, ${escapeSql(item.place)}, ${escapeSql(norm)}, ${escapeSql(item.admin1)}, ${escapeSql(item.admin2)}, NULL, NULL, NULL, NULL, NULL, 6)`;
  });

  const supplementSql = `-- Dữ liệu bổ sung mã bưu chính Việt Nam chuẩn Bộ TT&TT (Quyết định 2475/QĐ-BTTTT)
-- Bổ sung các tỉnh: Thái Bình (06xxx), Hải Dương (03xxx), Nam Định (07xxx), Ninh Bình (08xxx), Bà Rịa - Vũng Tàu, Thừa Thiên Huế

INSERT INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_name2, admin_code1, admin_code2, admin_name3, latitude, longitude, accuracy)
VALUES
${d1SqlRows.join(",\n")};

UPDATE zipcodes 
SET admin_name1 = 'Bà Rịa - Vũng Tàu'
WHERE country_code = 'VN' AND (postal_code LIKE '78%' OR postal_code LIKE '79%') AND (admin_name1 IS NULL OR admin_name1 = 'Bà Rịa');

UPDATE zipcodes 
SET place_name = 'Bưu cục Trung tâm tỉnh Bà Rịa - Vũng Tàu',
    place_name_normalized = 'buu cuc trung tam tinh ba ria - vung tau'
WHERE country_code = 'VN' AND postal_code = '78000' AND place_name LIKE '%Bà Rịa%';

UPDATE zipcodes 
SET admin_name1 = 'Thừa Thiên Huế'
WHERE country_code = 'VN' AND postal_code LIKE '49%' AND (admin_name1 IS NULL OR admin_name1 = 'Thừa Thiên');

UPDATE zipcodes 
SET place_name = 'Bưu cục Trung tâm tỉnh Thừa Thiên Huế',
    place_name_normalized = 'buu cuc trung tam tinh thua thien hue'
WHERE country_code = 'VN' AND postal_code = '49000' AND place_name LIKE '%Thừa Thiên%';

UPDATE countries 
SET total_records = (SELECT COUNT(*) FROM zipcodes WHERE zipcodes.country_code = countries.code)
WHERE code = 'VN';
`;

  const supplementSqlPath = path.join(process.cwd(), "data", "seed", "vietnam_supplement.sql");
  fs.writeFileSync(supplementSqlPath, supplementSql, "utf-8");
  console.log(`5. Đã tạo file SQL nạp D1 tại: ${supplementSqlPath}`);

  console.log("\n=== NẠP DỮ LIỆU BỔ SUNG HOÀN TẤT THÀNH CÔNG ===");
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
