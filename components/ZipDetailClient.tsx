"use client";

import { ZipCodeRecord } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";
import { getCountryFlag } from "@/components/CountrySelector";
import Link from "next/link";
import { MapPin, Navigation, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ZipDetailClientProps {
  detail: ZipCodeRecord;
}

export default function ZipDetailClient({ detail }: ZipDetailClientProps) {
  const { t } = useI18n();
  const fullAddress = formatAddress(detail);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href={`/countries/${detail.country_code.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.card.backToCountry(detail.country_code)}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Header Badge & Code */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCountryFlag(detail.country_code)}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {detail.country_code} • {t.nav.lookup}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-wider">
              {detail.postal_code}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <CopyButton textToCopy={detail.postal_code} label={t.card.copyCode} className="py-2 px-3 text-sm" />
            <CopyButton textToCopy={fullAddress} label={t.card.copyAddress} className="py-2 px-3 text-sm" />
          </div>
        </div>

        {/* Địa danh chính */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {detail.place_name}
          </h2>
          <div className="flex items-center gap-2 text-base text-slate-600 dark:text-slate-400">
            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span>{fullAddress}</span>
          </div>
        </div>

        {/* Bảng phân cấp hành chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t.card.state}
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name1 || "—"} {detail.admin_code1 ? `(${detail.admin_code1})` : ""}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t.card.district}
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name2 || "—"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t.card.ward}
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name3 || "—"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t.card.coordinates}
            </span>
            <span className="text-base font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              {detail.latitude && detail.longitude
                ? `${detail.latitude.toFixed(4)}, ${detail.longitude.toFixed(4)}`
                : t.card.coordsPending}
            </span>
          </div>
        </div>

        {/* Liên kết ngoài */}
        {detail.latitude && detail.longitude && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-500">Google Maps:</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${detail.latitude},${detail.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {t.card.openInMaps}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
