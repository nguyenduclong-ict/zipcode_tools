"use client";

import { useI18n } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
      <div className="px-1.5 text-slate-500 dark:text-slate-400 hidden sm:flex items-center">
        <Languages className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLang("en")}
        title="Switch to English"
        className={`px-2.5 py-1 rounded transition-colors ${
          lang === "en"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang("vi")}
        title="Chuyển sang Tiếng Việt"
        className={`px-2.5 py-1 rounded transition-colors ${
          lang === "vi"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        VI
      </button>
    </div>
  );
}
