"use client";

import { ZipCodeRecord } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";
import { CountryBadge } from "@/components/CountrySelector";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href={`/countries/${detail.country_code.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.card.backToCountry(detail.country_code)}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        {/* Header Badge & Code */}
        {/* taste-skill-ignore */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CountryBadge code={detail.country_code} />
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                {t.card.postalAddressHeader}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white tracking-wide">
              {detail.postal_code}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <CopyButton textToCopy={detail.postal_code} label={t.card.copyCode} className="py-2 px-3 text-xs sm:text-sm" />
            <CopyButton textToCopy={fullAddress} label={t.card.copyAddress} className="py-2 px-3 text-xs sm:text-sm" />
          </div>
        </div>

        {/* Địa danh chính */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {detail.place_name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>{fullAddress}</span>
          </div>
        </div>

        {/* Bảng phân cấp hành chính */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <dt className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.card.state}
            </dt>
            <dd className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.admin_name1 || "—"} {detail.admin_code1 ? `(${detail.admin_code1})` : ""}
            </dd>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <dt className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.card.district}
            </dt>
            <dd className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.admin_name2 || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <dt className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.card.ward}
            </dt>
            <dd className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.admin_name3 || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <dt className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.card.coordinates}
            </dt>
            <dd className="text-sm sm:text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {detail.latitude && detail.longitude
                ? `${detail.latitude.toFixed(4)}, ${detail.longitude.toFixed(4)}`
                : t.card.coordsPending}
            </dd>
          </div>
        </dl>

        {/* Liên kết ngoài */}
        {detail.latitude && detail.longitude && (
          /* taste-skill-ignore */
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-400">Google Maps:</span>
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
