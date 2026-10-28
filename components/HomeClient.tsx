"use client";

import { useState } from "react";
import { CountryRecord, SearchResponseData, ZipCodeRecord } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ResultList from "@/components/ResultList";
import { getCountryFlag } from "@/components/CountrySelector";
import { Zap, ShieldCheck, Database, Search } from "lucide-react";

interface HomeClientProps {
  initialCountries: CountryRecord[];
}

export default function HomeClient({ initialCountries }: HomeClientProps) {
  const [results, setResults] = useState<ZipCodeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string, country: string) => {
    setCurrentQuery(query);
    setCurrentCountry(country);
    setHasSearched(true);

    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        country: country || "",
        limit: "50",
      });
      const res = await fetch(`/api/v1/search?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data?: SearchResponseData };
        if (json.success && json.data) {
          setResults(json.data.results || []);
          setTotal(json.data.total || 0);
        }
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCountry = (code: string) => {
    setCurrentCountry(code);
    handleSearch(currentQuery || "Hà Nội", code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Serverless SQLite trên Cloudflare Edge • Phản hồi &lt; 50ms</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight sm:leading-tight mb-4">
          Tra Cứu Mã Bưu Chính{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            2 Chiều Toàn Cầu
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Nhập mã bưu chính để tìm địa danh, hoặc gõ tên tỉnh/thành phố để tra cứu mã Zip code.
          Dữ liệu chuẩn hóa quốc tế và mã 5 số Việt Nam.
        </p>
      </div>

      {/* Main Search Component */}
      <SearchBar
        countries={initialCountries}
        initialCountry={currentCountry}
        onSearch={handleSearch}
      />

      {/* Quick Country Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="text-xs font-medium text-slate-400 mr-1">Quốc gia phổ biến:</span>
        {[
          { code: "VN", name: "Việt Nam" },
          { code: "US", name: "Hoa Kỳ" },
          { code: "GB", name: "Anh" },
          { code: "CA", name: "Canada" },
          { code: "JP", name: "Nhật Bản" },
          { code: "FR", name: "Pháp" },
          { code: "DE", name: "Đức" },
          { code: "AU", name: "Úc" },
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleQuickCountry(item.code)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 transition-all hover:scale-105"
          >
            <span>{getCountryFlag(item.code)}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Search Results */}
      <ResultList
        results={results}
        total={total}
        query={currentQuery}
        country={currentCountry}
        loading={loading}
      />

      {/* Features Overview (hiển thị khi chưa tìm kiếm) */}
      {!hasSearched && (
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Tra Cứu 2 Chiều Linh Hoạt
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tự động nhận diện chuỗi tìm kiếm. Tìm từ mã ra địa chỉ, hoặc từ tên xã/phường/thành phố ra mã tương ứng.
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Kho Dữ Liệu Toàn Cầu
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Hơn 1.200.000 bản ghi mã bưu chính chuẩn hóa quốc tế (GeoNames) và mã bưu chính 5 số mới nhất của VNPost.
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Độc Lập & Bảo Mật
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Vận hành 100% trên Cloudflare D1. Không phụ thuộc vào API bên ngoài, chống SQL Injection với Prepared Statements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
