-- Bảng countries: Lưu danh sách quốc gia hỗ trợ
CREATE TABLE IF NOT EXISTS countries (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    native_name TEXT,
    postal_code_format TEXT,
    postal_code_example TEXT NOT NULL,
    total_records INTEGER DEFAULT 0
);

-- Bảng zipcodes: Lưu trữ mã bưu chính đa quốc gia
CREATE TABLE IF NOT EXISTS zipcodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_code TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    place_name TEXT NOT NULL,
    place_name_normalized TEXT,
    admin_name1 TEXT,
    admin_code1 TEXT,
    admin_name2 TEXT,
    admin_code2 TEXT,
    admin_name3 TEXT,
    latitude REAL,
    longitude REAL,
    accuracy INTEGER,
    FOREIGN KEY (country_code) REFERENCES countries(code)
);

-- Các B-Tree Indexes tối ưu tốc độ tra cứu < 10ms
CREATE INDEX IF NOT EXISTS idx_zipcodes_country_postal 
ON zipcodes (country_code, postal_code);

CREATE INDEX IF NOT EXISTS idx_zipcodes_country_place 
ON zipcodes (country_code, place_name_normalized);

CREATE INDEX IF NOT EXISTS idx_zipcodes_postal_global 
ON zipcodes (postal_code);

CREATE INDEX IF NOT EXISTS idx_zipcodes_place_global 
ON zipcodes (place_name_normalized);
