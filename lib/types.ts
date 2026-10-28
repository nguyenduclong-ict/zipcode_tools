export interface CountryRecord {
  code: string;
  name: string;
  native_name: string | null;
  postal_code_format: string | null;
  postal_code_example: string;
  total_records: number;
}

export interface ZipCodeRecord {
  id: number;
  country_code: string;
  postal_code: string;
  place_name: string;
  place_name_normalized: string | null;
  admin_name1: string | null;
  admin_code1: string | null;
  admin_name2: string | null;
  admin_code2: string | null;
  admin_name3: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export interface SearchParams {
  query: string;
  country?: string;
  limit?: number;
  type?: "all" | "code" | "place";
}

export interface SearchResponseData {
  query: string;
  country: string;
  detectedType: "code" | "place";
  total: number;
  results: ZipCodeRecord[];
}
