"use client";

import Link from "next/link";
import { ZipCodeRecord } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import CopyButton from "./CopyButton";
import { CountryBadge } from "./CountrySelector";
import { MapPin, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ResultCardProps {
  item: ZipCodeRecord;
}

export default function ResultCard({ item }: ResultCardProps) {
  const { t } = useI18n();
  const fullAddress = formatAddress(item);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-5 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400 tracking-wide">
              {item.postal_code}
            </span>
            <CopyButton textToCopy={item.postal_code} label={t.card.copyCode} />
          </div>

          <CountryBadge code={item.country_code} />
        </div>

        <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.place_name}
        </h3>

        <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
          <span>{fullAddress}</span>
        </div>

        {/* Thông tin phân cấp hành chính chi tiết - tách biệt bằng tone nền thay cho hairline */}
        <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 mt-3">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.card.state} </span>
            <span className="text-slate-900 dark:text-slate-100">
              {item.admin_name1 || "—"} {item.admin_code1 ? `(${item.admin_code1})` : ""}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.card.district} </span>
            <span className="text-slate-900 dark:text-slate-100">{item.admin_name2 || "—"}</span>
          </div>
          {item.admin_name3 && (
            <div className="col-span-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.card.ward} </span>
              <span className="text-slate-900 dark:text-slate-100">{item.admin_name3}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1 tabular-nums">
          {item.latitude && item.longitude ? (
            <>
              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </span>
            </>
          ) : (
            <span>{t.card.coordsPending}</span>
          )}
        </div>

        <Link
          href={`/zip/${item.country_code.toLowerCase()}/${encodeURIComponent(item.postal_code)}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          {t.card.viewDetails}
        </Link>
      </div>
    </div>
  );
}
