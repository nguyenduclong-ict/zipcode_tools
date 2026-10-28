"use client";

import { useI18n } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang("en")}
        title="Switch to English"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          lang === "en"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLang("vi")}
        title="Chuyển sang Tiếng Việt"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          lang === "vi"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <span>🇻🇳</span>
        <span>VI</span>
      </button>
    </div>
  );
}
