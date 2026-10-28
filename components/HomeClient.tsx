"use client";

import { useState } from "react";
import { CountryRecord, SearchResponseData, ZipCodeRecord } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ResultList from "@/components/ResultList";
import { getCountryFlag } from "@/components/CountrySelector";
import { Search, Database, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface HomeClientProps {
  initialCountries: CountryRecord[];
}

export default function HomeClient({ initialCountries }: HomeClientProps) {
  const { lang, t } = useI18n();
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
    handleSearch(currentQuery || (code === "VN" ? "Hà Nội" : "90210"), code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header (Đã loại bỏ badge vô nghĩa về serverless/sqlite) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight sm:leading-tight mb-4">
          {t.home.heroTitlePrefix}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.home.heroTitleHighlight}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          {t.home.heroSubtitle}
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
        <span className="text-xs font-medium text-slate-400 mr-1">{t.home.popularCountries}</span>
        {[
          { code: "VN", nameEn: "Vietnam", nameVi: "Việt Nam" },
          { code: "US", nameEn: "United States", nameVi: "Hoa Kỳ" },
          { code: "GB", nameEn: "United Kingdom", nameVi: "Anh" },
          { code: "CA", nameEn: "Canada", nameVi: "Canada" },
          { code: "JP", nameEn: "Japan", nameVi: "Nhật Bản" },
          { code: "FR", nameEn: "France", nameVi: "Pháp" },
          { code: "DE", nameEn: "Germany", nameVi: "Đức" },
          { code: "AU", nameEn: "Australia", nameVi: "Úc" },
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleQuickCountry(item.code)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 transition-all hover:scale-105"
          >
            <span>{getCountryFlag(item.code)}</span>
            <span>{lang === "vi" ? item.nameVi : item.nameEn}</span>
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
              {t.home.features.biDirectionalTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.home.features.biDirectionalDesc}
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              {t.home.features.globalDbTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.home.features.globalDbDesc}
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              {t.home.features.securityTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.home.features.securityDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
