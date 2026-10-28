"use client";

import { useState, useEffect, useRef } from "react";
import { CountryRecord, ZipCodeRecord } from "@/lib/types";
import CountrySelector, { getCountryFlag } from "./CountrySelector";
import { Search, Loader2, MapPin, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface SearchBarProps {
  countries: CountryRecord[];
  initialQuery?: string;
  initialCountry?: string;
  onSearch: (query: string, country: string) => void;
}

export default function SearchBar({
  countries,
  initialQuery = "",
  initialCountry = "",
  onSearch,
}: SearchBarProps) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [suggestions, setSuggestions] = useState<ZipCodeRecord[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tìm placeholder mẫu theo quốc gia được chọn
  const selectedCountryObj = countries.find((c) => c.code === country);
  const countryDisplayName = selectedCountryObj
    ? lang === "vi"
      ? (selectedCountryObj.native_name || selectedCountryObj.name)
      : selectedCountryObj.name
    : "";

  const placeholderText = selectedCountryObj
    ? t.search.placeholderCountry(countryDisplayName, selectedCountryObj.postal_code_example)
    : t.search.placeholderDefault;

  // Debounced Autocomplete Fetcher (250ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const params = new URLSearchParams({
          q: trimmed,
          country: country || "",
          limit: "8",
        });
        const res = await fetch(`/api/v1/search?${params.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as { success: boolean; data?: { results?: ZipCodeRecord[] } };
          if (json.success && json.data) {
            setSuggestions(json.data.results || []);
            setShowDropdown(true);
            setSelectedIndex(-1);
          }
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, country]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    onSearch(query.trim(), country);
  };

  const handleSelectSuggestion = (item: ZipCodeRecord) => {
    setQuery(item.postal_code);
    setShowDropdown(false);
    onSearch(item.postal_code, item.country_code);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") handleSubmit();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
      >
        <CountrySelector
          countries={countries}
          selectedCountry={country}
          onSelectCountry={(c) => {
            setCountry(c);
            inputRef.current?.focus();
          }}
        />

        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 text-slate-400">
            {isSuggesting ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholderText}
            className="w-full pl-10 pr-10 py-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          <span>{t.search.searchBtn}</span>
        </button>
      </form>

      {/* Popover gợi ý tức thì */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
            {t.search.autocompleteHeader}
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {suggestions.map((item, idx) => (
              <li
                key={item.id}
                onClick={() => handleSelectSuggestion(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? "bg-blue-50 dark:bg-blue-950/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {getCountryFlag(item.country_code)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {item.postal_code}
                      </span>
                      <span>—</span>
                      <span>{item.place_name}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>
                        {[item.admin_name2, item.admin_name1, item.country_code]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  {t.search.selectHint}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
