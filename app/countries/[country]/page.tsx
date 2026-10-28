import { getDatabase } from "@/lib/db";
import { getSupportedCountries, searchZipCodes } from "@/lib/search-service";
import HomeClient from "@/components/HomeClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const runtime = "edge";

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const db = await getDatabase();
  const countries = await getSupportedCountries(db);
  const found = countries.find((c) => c.code.toLowerCase() === country.toLowerCase());

  if (!found) {
    return { title: "Không tìm thấy quốc gia" };
  }

  return {
    title: `Tra Cứu Mã Bưu Chính ${found.name} (${found.code}) - ZipCode Tools`,
    description: `Danh mục và công cụ tra cứu mã Zip code, Postal code tại ${found.name}. Hỗ trợ tìm kiếm theo tỉnh/thành phố và mã bưu chính.`,
  };
}

export default async function CountryDetailPage({ params }: Props) {
  const { country } = await params;
  const db = await getDatabase();
  const countries = await getSupportedCountries(db);
  const found = countries.find((c) => c.code.toLowerCase() === country.toLowerCase());

  if (!found) {
    notFound();
  }

  return <HomeClient initialCountries={countries} />;
}
