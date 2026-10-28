"use client";

import { ZipCodeRecord } from "@/lib/types";
import ResultCard from "./ResultCard";
import { SearchX, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ResultListProps {
  results: ZipCodeRecord[];
  total: number;
  query: string;
  country: string;
  loading: boolean;
}

export default function ResultList({
  results,
  total,
  query,
  country,
  loading,
}: ResultListProps) {
  const { t } = useI18n();

  // 1. Khi đang tải lần đầu (chưa có dữ liệu nào trên màn hình)
  if (loading && results.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60">
                  <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Không tìm thấy kết quả
  if (!loading && results.length === 0) {
    if (query || country) {
      return (
        <div className="mt-10 text-center py-10 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t.search.emptyTitle}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-5">
            {t.search.emptyDesc(query, country)}
          </p>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 text-left max-w-sm mx-auto bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{t.search.emptyTipsHeader}</p>
            <p>{t.search.emptyTip1}</p>
            <p>{t.search.emptyTip2}</p>
            <p>{t.search.emptyTip3}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // 3. Có kết quả (kèm hiệu ứng làm mờ nhẹ không giật lag khi đang refetch)
  return (
    <div className="mt-8 transition-opacity duration-200">
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>{t.search.foundResults(total, query)}</span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 inline" />}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {results.map((item) => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
