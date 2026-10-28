"use client";

import { CountryRecord } from "@/lib/types";
import { getCountryFlag } from "@/components/CountrySelector";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface CountriesClientProps {
  countries: CountryRecord[];
}

export default function CountriesClient({ countries }: CountriesClientProps) {
  const { lang, t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>{t.countries.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          {t.countries.title}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          {t.countries.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countries.map((country) => (
          <Link
            key={country.code}
            href={`/countries/${country.code.toLowerCase()}`}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getCountryFlag(country.code)}</span>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {country.code}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === "vi" ? (country.native_name || country.name) : country.name}
              </h2>
              {country.native_name && country.native_name !== country.name && (
                <p className="text-xs text-slate-400 mb-2">
                  {lang === "vi" ? country.name : country.native_name}
                </p>
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t.countries.exampleCode}{" "}
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {country.postal_code_example}
                  </span>
                </div>
                {country.postal_code_format && (
                  <div className="truncate">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t.countries.format}{" "}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {country.postal_code_format}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>{t.countries.viewDirectory}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
