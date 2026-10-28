import { getDatabase } from "@/lib/db";
import { getZipCodeDetail } from "@/lib/search-service";
import ZipDetailClient from "@/components/ZipDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const runtime = "edge";
export const revalidate = 86400; // Edge Cache 24 giờ

interface Props {
  params: Promise<{ country: string; code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, code } = await params;
  const decodedCode = decodeURIComponent(code);
  const db = await getDatabase();
  const detail = await getZipCodeDetail(db, country, decodedCode);

  if (!detail) {
    return { title: "Postal Code Not Found" };
  }

  return {
    title: `ZIP / Postal Code ${detail.postal_code} - ${detail.place_name}, ${detail.admin_name1 || ""} (${detail.country_code})`,
    description: `Details for postal code ${detail.postal_code} in ${detail.place_name}, ${detail.admin_name1 || ""}, ${detail.country_code}. Geographic coordinates and administrative divisions.`,
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ZipDetailClient detail={detail} />
    </>
  );
}
