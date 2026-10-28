-- Seed Data: Danh sách Quốc Gia
INSERT OR REPLACE INTO countries (code, name, native_name, postal_code_format, postal_code_example, total_records) VALUES
('VN', 'Vietnam', 'Việt Nam', '^\d{5}$', '10000', 30),
('US', 'United States', 'United States', '^\d{5}(-\d{4})?$', '90210', 35),
('GB', 'United Kingdom', 'United Kingdom', '^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$', 'SW1A 1AA', 15),
('CA', 'Canada', 'Canada', '^[A-Z]\d[A-Z] ?\d[A-Z]\d$', 'K1A 0B1', 12),
('JP', 'Japan', '日本', '^\d{3}-?\d{4}$', '100-0001', 15),
('DE', 'Germany', 'Deutschland', '^\d{5}$', '10115', 12),
('FR', 'France', 'France', '^\d{5}$', '75001', 12),
('AU', 'Australia', 'Australia', '^\d{4}$', '2000', 10);

-- Seed Data: Zipcodes Việt Nam (VN) - Mã bưu chính quốc gia 5 chữ số
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('VN', '10000', 'Hà Nội', 'ha noi', 'Hà Nội', 'HN', 'Quận Hoàn Kiếm', '001', 'Phường Hàng Trống', 21.0285, 105.8542, 6),
('VN', '11000', 'Ba Đình', 'ba dinh', 'Hà Nội', 'HN', 'Quận Ba Đình', '002', 'Phường Điện Biên', 21.0341, 105.8361, 6),
('VN', '12000', 'Đống Đa', 'dong da', 'Hà Nội', 'HN', 'Quận Đống Đa', '003', 'Phường Kim Liên', 21.0118, 105.8317, 6),
('VN', '13000', 'Hai Bà Trưng', 'hai ba trung', 'Hà Nội', 'HN', 'Quận Hai Bà Trưng', '004', 'Phường Bạch Mai', 21.0063, 105.8504, 6),
('VN', '14000', 'Cầu Giấy', 'cau giay', 'Hà Nội', 'HN', 'Quận Cầu Giấy', '005', 'Phường Dịch Vọng', 21.0362, 105.7905, 6),
('VN', '15000', 'Tây Hồ', 'tay ho', 'Hà Nội', 'HN', 'Quận Tây Hồ', '006', 'Phường Quảng An', 21.0664, 105.8286, 6),
('VN', '16000', 'Thanh Xuân', 'thanh xuan', 'Hà Nội', 'HN', 'Quận Thanh Xuân', '007', 'Phường Khương Mai', 20.9937, 105.8124, 6),
('VN', '17000', 'Hoàng Mai', 'hoang mai', 'Hà Nội', 'HN', 'Quận Hoàng Mai', '008', 'Phường Định Công', 20.9789, 105.8456, 6),
('VN', '18000', 'Long Biên', 'long bien', 'Hà Nội', 'HN', 'Quận Long Biên', '009', 'Phường Bồ Đề', 21.0423, 105.8752, 6),
('VN', '19000', 'Hà Đông', 'ha dong', 'Hà Nội', 'HN', 'Quận Hà Đông', '010', 'Phường Quang Trung', 20.9723, 105.7765, 6),
('VN', '70000', 'Hồ Chí Minh', 'ho chi minh', 'TP. Hồ Chí Minh', 'SG', 'Quận 1', '760', 'Phường Bến Nghé', 10.7769, 106.7009, 6),
('VN', '71000', 'Quận 3', 'quan 3', 'TP. Hồ Chí Minh', 'SG', 'Quận 3', '770', 'Phường Võ Thị Sáu', 10.7844, 106.6844, 6),
('VN', '72000', 'Quận 5', 'quan 5', 'TP. Hồ Chí Minh', 'SG', 'Quận 5', '774', 'Phường Chợ Lớn', 10.7552, 106.6622, 6),
('VN', '73000', 'Bình Thạnh', 'binh thanh', 'TP. Hồ Chí Minh', 'SG', 'Quận Bình Thạnh', '765', 'Phường 25', 10.8015, 106.7118, 6),
('VN', '74000', 'Phú Nhuận', 'phu nhuan', 'TP. Hồ Chí Minh', 'SG', 'Quận Phú Nhuận', '768', 'Phường 9', 10.7992, 106.6806, 6),
('VN', '75000', 'Tân Bình', 'tan binh', 'TP. Hồ Chí Minh', 'SG', 'Quận Tân Bình', '766', 'Phường 2 (Sân bay)', 10.8014, 106.6653, 6),
('VN', '76000', 'Quận 7', 'quan 7', 'TP. Hồ Chí Minh', 'SG', 'Quận 7', '778', 'Phường Tân Phú (Phú Mỹ Hưng)', 10.7324, 106.7188, 6),
('VN', '77000', 'TP. Thủ Đức', 'tp thu duc', 'TP. Hồ Chí Minh', 'SG', 'Thủ Đức', '769', 'Phường Thảo Điền', 10.8045, 106.7356, 6),
('VN', '55000', 'Đà Nẵng', 'da nang', 'Đà Nẵng', 'DNG', 'Quận Hải Châu', '490', 'Phường Hải Châu 1', 16.0678, 108.2208, 6),
('VN', '56000', 'Sơn Trà', 'son tra', 'Đà Nẵng', 'DNG', 'Quận Sơn Trà', '493', 'Phường An Hải Bắc', 16.0712, 108.2389, 6),
('VN', '57000', 'Ngũ Hành Sơn', 'ngu hanh son', 'Đà Nẵng', 'DNG', 'Quận Ngũ Hành Sơn', '494', 'Phường Mỹ An', 16.0354, 108.2456, 6),
('VN', '18000', 'Hải Phòng', 'hai phong', 'Hải Phòng', 'HPG', 'Quận Hồng Bàng', '300', 'Phường Hoàng Văn Thụ', 20.8651, 106.6838, 6),
('VN', '90000', 'Cần Thơ', 'can tho', 'Cần Thơ', 'CTO', 'Quận Ninh Kiều', '916', 'Phường Tân An', 10.0342, 105.7876, 6),
('VN', '65000', 'Nha Trang', 'nha trang', 'Khánh Hòa', 'KHA', 'TP. Nha Trang', '568', 'Phường Lộc Thọ', 12.2388, 109.1967, 6),
('VN', '53000', 'Huế', 'hue', 'Thừa Thiên Huế', 'TTH', 'TP. Huế', '474', 'Phường Phú Nhuận', 16.4637, 107.5909, 6),
('VN', '79000', 'Vũng Tàu', 'vung tau', 'Bà Rịa - Vũng Tàu', 'VTU', 'TP. Vũng Tàu', '747', 'Phường 1', 10.3460, 107.0843, 6),
('VN', '82000', 'Thủ Dầu Một', 'thu dau mot', 'Bình Dương', 'BDG', 'TP. Thủ Dầu Một', '718', 'Phường Phú Cường', 10.9805, 106.6519, 6),
('VN', '81000', 'Biên Hòa', 'bien hoa', 'Đồng Nai', 'DNA', 'TP. Biên Hòa', '731', 'Phường Quyết Thắng', 10.9574, 106.8427, 6),
('VN', '20000', 'Hạ Long', 'ha long', 'Quảng Ninh', 'QNH', 'TP. Hạ Long', '193', 'Phường Bạch Đằng', 20.9505, 107.0734, 6),
('VN', '67000', 'Đà Lạt', 'da lat', 'Lâm Đồng', 'LDG', 'TP. Đà Lạt', '672', 'Phường 1', 11.9404, 108.4583, 6);

-- Seed Data: Zipcodes Hoa Kỳ (US)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('US', '90210', 'Beverly Hills', 'beverly hills', 'California', 'CA', 'Los Angeles', '037', '', 34.0901, -118.4065, 4),
('US', '90001', 'Los Angeles', 'los angeles', 'California', 'CA', 'Los Angeles', '037', '', 33.9731, -118.2479, 4),
('US', '90012', 'Los Angeles Downtown', 'los angeles downtown', 'California', 'CA', 'Los Angeles', '037', '', 34.0614, -118.2384, 4),
('US', '94102', 'San Francisco', 'san francisco', 'California', 'CA', 'San Francisco', '075', '', 37.7797, -122.4192, 4),
('US', '94016', 'Daly City', 'daly city', 'California', 'CA', 'San Mateo', '081', '', 37.6908, -122.4697, 4),
('US', '95113', 'San Jose', 'san jose', 'California', 'CA', 'Santa Clara', '085', '', 37.3337, -121.8907, 4),
('US', '92101', 'San Diego', 'san diego', 'California', 'CA', 'San Diego', '073', '', 32.7197, -117.1673, 4),
('US', '10001', 'New York', 'new york', 'New York', 'NY', 'New York', '061', 'Manhattan', 40.7506, -73.9972, 4),
('US', '10021', 'New York Upper East Side', 'new york upper east side', 'New York', 'NY', 'New York', '061', 'Manhattan', 40.7699, -73.9577, 4),
('US', '11201', 'Brooklyn', 'brooklyn', 'New York', 'NY', 'Kings', '047', 'Brooklyn Heights', 40.6953, -73.9890, 4),
('US', '11354', 'Flushing', 'flushing', 'New York', 'NY', 'Queens', '081', '', 40.7686, -73.8296, 4),
('US', '60601', 'Chicago', 'chicago', 'Illinois', 'IL', 'Cook', '031', '', 41.8853, -87.6221, 4),
('US', '77001', 'Houston', 'houston', 'Texas', 'TX', 'Harris', '201', '', 29.7589, -95.3677, 4),
('US', '75201', 'Dallas', 'dallas', 'Texas', 'TX', 'Dallas', '113', '', 32.7876, -96.7996, 4),
('US', '78701', 'Austin', 'austin', 'Texas', 'TX', 'Travis', '453', '', 30.2713, -97.7426, 4),
('US', '98101', 'Seattle', 'seattle', 'Washington', 'WA', 'King', '033', '', 47.6101, -122.3344, 4),
('US', '33101', 'Miami', 'miami', 'Florida', 'FL', 'Miami-Dade', '086', '', 25.7743, -80.1937, 4),
('US', '32801', 'Orlando', 'orlando', 'Florida', 'FL', 'Orange', '095', '', 28.5383, -81.3792, 4),
('US', '89101', 'Las Vegas', 'las vegas', 'Nevada', 'NV', 'Clark', '003', '', 36.1719, -115.1398, 4),
('US', '80202', 'Denver', 'denver', 'Colorado', 'CO', 'Denver', '031', '', 39.7541, -104.9975, 4),
('US', '02108', 'Boston', 'boston', 'Massachusetts', 'MA', 'Suffolk', '025', 'Beacon Hill', 42.3581, -71.0636, 4),
('US', '19102', 'Philadelphia', 'philadelphia', 'Pennsylvania', 'PA', 'Philadelphia', '101', 'Center City', 39.9526, -75.1652, 4),
('US', '30303', 'Atlanta', 'atlanta', 'Georgia', 'GA', 'Fulton', '121', 'Downtown', 33.7537, -84.3911, 4),
('US', '85001', 'Phoenix', 'phoenix', 'Arizona', 'AZ', 'Maricopa', '013', '', 33.4484, -112.0740, 4),
('US', '97201', 'Portland', 'portland', 'Oregon', 'OR', 'Multnomah', '051', '', 45.5118, -122.6843, 4),
('US', '20001', 'Washington D.C.', 'washington d.c.', 'District of Columbia', 'DC', 'District of Columbia', '001', '', 38.9108, -77.0163, 4),
('US', '96813', 'Honolulu', 'honolulu', 'Hawaii', 'HI', 'Honolulu', '003', 'Downtown', 21.3069, -157.8583, 4),
('US', '99501', 'Anchorage', 'anchorage', 'Alaska', 'AK', 'Anchorage', '020', '', 61.2181, -149.9003, 4);

-- Seed Data: Zipcodes Vương Quốc Anh (GB)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('GB', 'SW1A 1AA', 'Buckingham Palace, London', 'buckingham palace london', 'England', 'ENG', 'Greater London', 'GLA', 'Westminster', 51.5014, -0.1419, 6),
('GB', 'SW1A 2AA', '10 Downing Street, London', '10 downing street london', 'England', 'ENG', 'Greater London', 'GLA', 'Westminster', 51.5034, -0.1276, 6),
('GB', 'EC1A 1BB', 'City of London', 'city of london', 'England', 'ENG', 'Greater London', 'GLA', '', 51.5200, -0.1000, 4),
('GB', 'W1D 3QU', 'Soho, London', 'soho london', 'England', 'ENG', 'Greater London', 'GLA', 'Westminster', 51.5136, -0.1315, 6),
('GB', 'M1 1AE', 'Manchester', 'manchester', 'England', 'ENG', 'Greater Manchester', 'GMN', '', 53.4808, -2.2426, 4),
('GB', 'B1 1AA', 'Birmingham', 'birmingham', 'England', 'ENG', 'West Midlands', 'WMD', '', 52.4862, -1.8904, 4),
('GB', 'EH1 1YZ', 'Edinburgh', 'edinburgh', 'Scotland', 'SCT', 'City of Edinburgh', 'EDH', '', 55.9533, -3.1883, 4),
('GB', 'G1 1DA', 'Glasgow', 'glasgow', 'Scotland', 'SCT', 'Glasgow City', 'GLG', '', 55.8642, -4.2518, 4),
('GB', 'CF10 1EP', 'Cardiff', 'cardiff', 'Wales', 'WLS', 'Cardiff', 'CRF', '', 51.4816, -3.1791, 4),
('GB', 'BT1 5GS', 'Belfast', 'belfast', 'Northern Ireland', 'NIR', 'Belfast', 'BFS', '', 54.5973, -5.9301, 4);

-- Seed Data: Zipcodes Canada (CA)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('CA', 'K1A 0B1', 'Parliament Hill, Ottawa', 'parliament hill ottawa', 'Ontario', 'ON', 'Ottawa', '3506', '', 45.4248, -75.6997, 6),
('CA', 'M5V 2T6', 'Toronto (CN Tower)', 'toronto cn tower', 'Ontario', 'ON', 'Toronto', '3520', 'Downtown', 43.6426, -79.3871, 6),
('CA', 'M5B 2H1', 'Toronto Downtown', 'toronto downtown', 'Ontario', 'ON', 'Toronto', '3520', '', 43.6559, -79.3797, 4),
('CA', 'V6B 1A1', 'Vancouver Downtown', 'vancouver downtown', 'British Columbia', 'BC', 'Greater Vancouver', '5915', '', 49.2827, -123.1207, 4),
('CA', 'H2Y 1C6', 'Old Montreal', 'old montreal', 'Quebec', 'QC', 'Montreal', '2466', '', 45.5074, -73.5544, 4),
('CA', 'T2P 1J9', 'Calgary Downtown', 'calgary downtown', 'Alberta', 'AB', 'Division No. 6', '4806', '', 51.0486, -114.0708, 4),
('CA', 'T5J 0N3', 'Edmonton', 'edmonton', 'Alberta', 'AB', 'Division No. 11', '4811', '', 53.5444, -113.4909, 4);

-- Seed Data: Zipcodes Nhật Bản (JP)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('JP', '100-0001', 'Chiyoda, Tokyo', 'chiyoda tokyo', 'Tokyo', '13', 'Chiyoda-ku', '', '', 35.6838, 139.7539, 4),
('JP', '160-0022', 'Shinjuku, Tokyo', 'shinjuku tokyo', 'Tokyo', '13', 'Shinjuku-ku', '', '', 35.6938, 139.7034, 4),
('JP', '150-0001', 'Shibuya, Tokyo', 'shibuya tokyo', 'Tokyo', '13', 'Shibuya-ku', '', '', 35.6618, 139.7041, 4),
('JP', '110-0005', 'Ueno, Tokyo', 'ueno tokyo', 'Tokyo', '13', 'Taito-ku', '', '', 35.7141, 139.7741, 4),
('JP', '530-0001', 'Umeda, Osaka', 'umeda osaka', 'Osaka', '27', 'Kita-ku', '', '', 34.7025, 135.4959, 4),
('JP', '600-8001', 'Shimogyo, Kyoto', 'shimogyo kyoto', 'Kyoto', '26', 'Shimogyo-ku', '', '', 34.9858, 135.7588, 4),
('JP', '220-0001', 'Nishi-ku, Yokohama', 'nishi ku yokohama', 'Kanagawa', '14', 'Yokohama', '', '', 35.4658, 139.6227, 4),
('JP', '060-0001', 'Chuo-ku, Sapporo', 'chuo ku sapporo', 'Hokkaido', '01', 'Sapporo', '', '', 43.0618, 141.3545, 4);

-- Seed Data: Zipcodes Đức (DE)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('DE', '10115', 'Berlin Mitte', 'berlin mitte', 'Berlin', 'BE', 'Berlin', '', '', 52.5323, 13.3846, 4),
('DE', '80331', 'Munich (Altstadt)', 'munich altstadt', 'Bavaria', 'BY', 'Munich', '', '', 48.1371, 11.5754, 4),
('DE', '60311', 'Frankfurt am Main', 'frankfurt am main', 'Hesse', 'HE', 'Frankfurt', '', '', 50.1109, 8.6821, 4),
('DE', '20095', 'Hamburg Mitte', 'hamburg mitte', 'Hamburg', 'HH', 'Hamburg', '', '', 53.5511, 10.0007, 4),
('DE', '50667', 'Cologne (Innenstadt)', 'cologne innenstadt', 'North Rhine-Westphalia', 'NW', 'Cologne', '', '', 50.9375, 6.9603, 4);

-- Seed Data: Zipcodes Pháp (FR)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('FR', '75001', 'Paris 1er Arrondissement (Louvre)', 'paris 1er arrondissement louvre', 'Île-de-France', 'IDF', 'Paris', '75', '', 48.8606, 2.3376, 4),
('FR', '75008', 'Paris 8e Arrondissement (Champs-Élysées)', 'paris 8e arrondissement champs elysees', 'Île-de-France', 'IDF', 'Paris', '75', '', 48.8727, 2.3125, 4),
('FR', '13001', 'Marseille 1er Arrondissement', 'marseille 1er arrondissement', 'Provence-Alpes-Côte d''Azur', 'PAC', 'Bouches-du-Rhône', '13', '', 43.2965, 5.3698, 4),
('FR', '69001', 'Lyon 1er Arrondissement', 'lyon 1er arrondissement', 'Auvergne-Rhône-Alpes', 'ARA', 'Lyon', '69', '', 45.7640, 4.8357, 4),
('FR', '06000', 'Nice Centre', 'nice centre', 'Provence-Alpes-Côte d''Azur', 'PAC', 'Alpes-Maritimes', '06', '', 43.7102, 7.2620, 4);

-- Seed Data: Zipcodes Úc (AU)
INSERT OR REPLACE INTO zipcodes (country_code, postal_code, place_name, place_name_normalized, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, latitude, longitude, accuracy) VALUES
('AU', '2000', 'Sydney CBD', 'sydney cbd', 'New South Wales', 'NSW', 'Sydney', '', '', -33.8688, 151.2093, 4),
('AU', '3000', 'Melbourne CBD', 'melbourne cbd', 'Victoria', 'VIC', 'Melbourne', '', '', -37.8136, 144.9631, 4),
('AU', '4000', 'Brisbane City', 'brisbane city', 'Queensland', 'QLD', 'Brisbane', '', '', -27.4698, 153.0251, 4),
('AU', '6000', 'Perth City', 'perth city', 'Western Australia', 'WA', 'Perth', '', '', -31.9505, 115.8605, 4),
('AU', '5000', 'Adelaide City', 'adelaide city', 'South Australia', 'SA', 'Adelaide', '', '', -34.9285, 138.6007, 4);
