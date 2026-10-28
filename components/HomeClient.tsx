"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CountryRecord, SearchResponseData, ZipCodeRecord } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ResultList from "@/components/ResultList";
import { CountryBadge } from "@/components/CountrySelector";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight, Hash, MapPin } from "lucide-react";

interface HomeClientProps {
  initialCountries: CountryRecord[];
  initialCountry?: string;
  initialQuery?: string;
  initialResults?: ZipCodeRecord[];
  initialTotal?: number;
  initialHasSearched?: boolean;
}

export default function HomeClient({
  initialCountries,
  initialCountry = "",
  initialQuery = "",
  initialResults = [],
  initialTotal = 0,
  initialHasSearched = false,
}: HomeClientProps) {
  const { lang, t } = useI18n();
  const [results, setResults] = useState<ZipCodeRecord[]>(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [currentCountry, setCurrentCountry] = useState(initialCountry);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(
    initialHasSearched || Boolean(initialCountry || initialQuery || initialResults.length > 0)
  );

  useEffect(() => {
    if (initialCountry) {
      setCurrentCountry(initialCountry);
      setResults(initialResults);
      setTotal(initialTotal);
      setHasSearched(true);
    }
  }, [initialCountry, initialResults, initialTotal]);

  const handleSearch = async (query: string, country: string) => {
    setCurrentQuery(query);
    setCurrentCountry(country);
    setHasSearched(true);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        country: country || "",
        limit: "50",
      });
      const res = await fetch(`/api/v1/search?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as {
          success: boolean;
          data?: SearchResponseData;
        };
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
    const nextCountry = currentCountry === code ? "" : code;
    setCurrentCountry(nextCountry);
    handleSearch(currentQuery, nextCountry);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          {t.home.heroTitlePrefix} {t.home.heroTitleHighlight}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.home.heroSubtitle}
        </p>
      </div>

      {/* Main Search Component */}
      <SearchBar
        countries={initialCountries}
        initialQuery={currentQuery}
        initialCountry={currentCountry}
        onQueryChange={setCurrentQuery}
        onCountryChange={(code) => {
          setCurrentCountry(code);
        }}
        onSearch={handleSearch}
      />

      {/* Quick Country Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 mb-8">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
          {t.home.popularCountries}
        </span>
        {[
          { code: "VN", nameEn: "Vietnam", nameVi: "Việt Nam" },
          { code: "US", nameEn: "United States", nameVi: "Hoa Kỳ" },
          { code: "GB", nameEn: "United Kingdom", nameVi: "Anh" },
          { code: "CA", nameEn: "Canada", nameVi: "Canada" },
          { code: "JP", nameEn: "Japan", nameVi: "Nhật Bản" },
          { code: "FR", nameEn: "France", nameVi: "Pháp" },
          { code: "DE", nameEn: "Germany", nameVi: "Đức" },
          { code: "AU", nameEn: "Australia", nameVi: "Úc" },
        ].map((item) => {
          const isActive = currentCountry === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleQuickCountry(item.code)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-sm ring-1 ring-blue-600/30"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200"
              }`}
            >
              <CountryBadge
                code={item.code}
                className={`px-1 py-0 text-[10px] ${
                  isActive ? "bg-blue-600 dark:bg-blue-500" : ""
                }`}
              />
              <span>{lang === "vi" ? item.nameVi : item.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Search Results */}
      <ResultList
        results={results}
        total={total}
        query={currentQuery}
        country={currentCountry}
        loading={loading}
      />

      {/* Substantive Reference & Guide (Hiển thị khi chưa tìm kiếm) */}
      {!hasSearched && (
        <div className="mt-14 space-y-12">
          {/* Section 1: Two-Way Lookup Mechanics */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.home.guideTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              {t.home.statsSub}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
                  <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t.home.guideByCodeTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.home.guideByCodeDesc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSearch("10000", "VN")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    VN: 10000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearch("90210", "US")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    US: 90210
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearch("SW1A 1AA", "GB")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    GB: SW1A 1AA
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t.home.guideByPlaceTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.home.guideByPlaceDesc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSearch("Hoàn Kiếm", "VN")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    Hoàn Kiếm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearch("Beverly Hills", "US")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    Beverly Hills
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearch("Tokyo", "JP")}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-blue-600"
                  >
                    Tokyo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Standard Formats Quick Ledger */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t.home.formatsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {t.home.formatsDesc}
                </p>
              </div>

              <Link
                href="/countries"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{t.home.browseAllBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {initialCountries.slice(0, 8).map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {lang === "vi" ? c.native_name || c.name : c.name}
                    </span>
                    <CountryBadge code={c.code} />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <span className="text-slate-500">Mẫu: </span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                        {c.postal_code_example}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
