"use client";

import { CountryRecord } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface CountrySelectorProps {
  countries: CountryRecord[];
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
}

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === "ALL") return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function CountrySelector({
  countries,
  selectedCountry,
  onSelectCountry,
}: CountrySelectorProps) {
  const { lang, t } = useI18n();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={selectedCountry}
        onChange={(e) => onSelectCountry(e.target.value)}
        aria-label="Select country"
        className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
      >
        <option value="">{t.search.allCountries}</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {getCountryFlag(c.code)} {lang === "vi" ? (c.native_name || c.name) : c.name} ({c.code})
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
        ▼
      </div>
    </div>
  );
}
