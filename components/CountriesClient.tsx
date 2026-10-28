"use client";

import { CountryRecord } from "@/lib/types";
import { CountryBadge } from "@/components/CountrySelector";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface CountriesClientProps {
  countries: CountryRecord[];
}

function formatPostalPattern(format: string | null, example: string, lang: string): string {
  if (!format) return example;
  if (format === "^\\d{5}$") return lang === "vi" ? "5 chữ số liên tiếp" : "5 standard digits";
  if (format === "^\\d{4}$") return lang === "vi" ? "4 chữ số" : "4 standard digits";
  if (format === "^\\d{3}-?\\d{4}$") return lang === "vi" ? "7 chữ số (NNN-NNNN)" : "7 digits (NNN-NNNN)";
  if (format.includes("[A-Z]\\d[A-Z]")) return lang === "vi" ? "Chữ & số (A1A 1A1)" : "Alphanumeric (A1A 1A1)";
  if (format.includes("[A-Z]{1,2}\\d")) return lang === "vi" ? "Mã chữ & số (VD: SW1A 1AA)" : "Alphanumeric (e.g. SW1A 1AA)";
  if (format.includes("(-\\d{4})?")) return lang === "vi" ? "5 số hoặc ZIP+4" : "5 digits or ZIP+4";
  return example;
}

export default function CountriesClient({ countries }: CountriesClientProps) {
  const { lang, t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {t.countries.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.countries.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {countries.map((country) => (
          <Link
            key={country.code}
            href={`/countries/${country.code.toLowerCase()}`}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-5 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <CountryBadge code={country.code} className="text-sm px-2.5 py-1 font-bold" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {country.code}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === "vi" ? (country.native_name || country.name) : country.name}
              </h2>
              {country.native_name && country.native_name !== country.name && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {lang === "vi" ? country.name : country.native_name}
                </p>
              )}

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.countries.exampleCode}
                  </span>
                  <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {country.postal_code_example}
                  </span>
                </div>
                {country.postal_code_format && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.countries.format}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {formatPostalPattern(country.postal_code_format, country.postal_code_example, lang)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>{t.countries.viewDirectory}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
