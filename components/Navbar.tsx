"use client";

import Link from "next/link";
import { Globe, MapPin, Search } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

export default function Navbar() {
  const { t } = useI18n();

  return (
    /* taste-skill-ignore */
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center transition-colors group-hover:bg-blue-700">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            ZipCode Tools
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/"
              aria-label={t.nav.lookup}
              className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors whitespace-nowrap p-2 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.lookup}</span>
            </Link>
            <Link
              href="/countries"
              aria-label={t.nav.countries}
              className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors whitespace-nowrap p-2 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.countries}</span>
            </Link>
          </nav>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
