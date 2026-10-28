import { getDatabase } from "@/lib/db";
import { getZipCodeDetail, getSupportedCountries } from "@/lib/search-service";
import { formatAddress } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";
import { getCountryFlag } from "@/components/CountrySelector";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Navigation, ArrowLeft, Building2, Globe } from "lucide-react";
import type { Metadata } from "next";

export const runtime = "edge";

interface Props {
  params: Promise<{ country: string; code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, code } = await params;
  const decodedCode = decodeURIComponent(code);
  const db = await getDatabase();
  const detail = await getZipCodeDetail(db, country, decodedCode);

  if (!detail) {
    return { title: "Không tìm thấy mã bưu chính" };
  }

  return {
    title: `Mã Bưu Chính ${detail.postal_code} - ${detail.place_name}, ${detail.admin_name1 || ""} (${detail.country_code})`,
    description: `Thông tin chi tiết mã Zip/Postal Code ${detail.postal_code} thuộc địa bàn ${detail.place_name}, ${detail.admin_name1 || ""}, ${detail.country_code}. Tọa độ địa lý và phân cấp hành chính.`,
  };
}

export default async function ZipCodeDetailPage({ params }: Props) {
  const { country, code } = await params;
  const decodedCode = decodeURIComponent(code);
  const db = await getDatabase();
  const detail = await getZipCodeDetail(db, country, decodedCode);

  if (!detail) {
    notFound();
  }

  const fullAddress = formatAddress(detail);

  // Schema.org JSON-LD cho SEO địa phương
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PostalAddress",
    postalCode: detail.postal_code,
    addressLocality: detail.place_name,
    addressRegion: detail.admin_name1,
    addressCountry: detail.country_code,
    ...(detail.latitude && detail.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: detail.latitude,
            longitude: detail.longitude,
          },
        }
      : {}),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link
          href={`/countries/${detail.country_code.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh mục {detail.country_code}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Header Badge & Code */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCountryFlag(detail.country_code)}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {detail.country_code} • Mã Bưu Chính
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-wider">
              {detail.postal_code}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <CopyButton textToCopy={detail.postal_code} label="Sao chép Mã" className="py-2 px-3 text-sm" />
            <CopyButton textToCopy={fullAddress} label="Sao chép Địa Chỉ" className="py-2 px-3 text-sm" />
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
              Đơn Vị Cấp 1 (Tỉnh / Bang)
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name1 || "Không có thông tin"} {detail.admin_code1 ? `(${detail.admin_code1})` : ""}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Đơn Vị Cấp 2 (Quận / Huyện)
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name2 || "Không có thông tin"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Đơn Vị Cấp 3 (Phường / Xã)
            </span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {detail.admin_name3 || "Không có thông tin"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Tọa Độ Địa Lý (WGS84)
            </span>
            <span className="text-base font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              {detail.latitude && detail.longitude
                ? `${detail.latitude.toFixed(4)}, ${detail.longitude.toFixed(4)}`
                : "Đang cập nhật"}
            </span>
          </div>
        </div>

        {/* Liên kết ngoài */}
        {detail.latitude && detail.longitude && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-500">Xem vị trí trực tuyến trên bản đồ:</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${detail.latitude},${detail.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Mở trên Google Maps ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
