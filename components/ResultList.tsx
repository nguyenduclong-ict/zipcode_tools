import { ZipCodeRecord } from "@/lib/types";
import ResultCard from "./ResultCard";
import { SearchX } from "lucide-react";

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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-48 flex flex-col justify-between"
          >
            <div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="mt-12 text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl mx-auto shadow-sm">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Không tìm thấy mã bưu chính phù hợp
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
          Không có kết quả nào cho từ khóa &quot;<strong>{query}</strong>&quot;
          {country ? ` trong quốc gia ${country}` : ""}.
        </p>
        <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <p>💡 Gợi ý tra cứu:</p>
          <p>• Kiểm tra lại lỗi chính tả hoặc khoảng trắng</p>
          <p>• Chuyển bộ lọc sang &quot;🌐 Tất cả quốc gia&quot; để mở rộng phạm vi tìm kiếm</p>
          <p>• Thử gõ tên tỉnh/thành phố lớn (VD: Hà Nội, Hồ Chí Minh, New York, Tokyo)</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tìm thấy <strong className="text-slate-900 dark:text-slate-100">{total}</strong> kết quả
          {query ? ` cho "${query}"` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
