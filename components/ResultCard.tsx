"use client";

import Link from "next/link";
import { ZipCodeRecord } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import CopyButton from "./CopyButton";
import { getCountryFlag } from "./CountrySelector";
import { MapPin, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ResultCardProps {
  item: ZipCodeRecord;
}

export default function ResultCard({ item }: ResultCardProps) {
  const { t } = useI18n();
  const fullAddress = formatAddress(item);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-wider">
              {item.postal_code}
            </span>
            <CopyButton textToCopy={item.postal_code} label={t.card.copyCode} />
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>{getCountryFlag(item.country_code)}</span>
            <span>{item.country_code}</span>
          </span>
        </div>

        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.place_name}
        </h3>

        <div className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
          <span>{fullAddress}</span>
        </div>

        {/* Thông tin phân cấp hành chính chi tiết */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{t.card.state} </span>
            {item.admin_name1 || "—"} {item.admin_code1 ? `(${item.admin_code1})` : ""}
          </div>
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{t.card.district} </span>
            {item.admin_name2 || "—"}
          </div>
          {item.admin_name3 && (
            <div className="col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">{t.card.ward} </span>
              {item.admin_name3}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1 font-mono">
          {item.latitude && item.longitude ? (
            <>
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
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
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {t.card.viewDetails}
        </Link>
      </div>
    </div>
  );
}
