import { getDatabase } from "@/lib/db";
import { getSupportedCountries } from "@/lib/search-service";
import CountriesClient from "@/components/CountriesClient";
import type { Metadata } from "next";

export const runtime = "edge";
export const revalidate = 86400; // Edge Cache 24 giờ

export const metadata: Metadata = {
  title: "Supported Countries - ZipCode Tools",
  description: "Browse postal codes and administrative divisions by country on ZipCode Tools.",
};

export default async function CountriesPage() {
  const db = await getDatabase();
  const countries = await getSupportedCountries(db);

  return <CountriesClient countries={countries} />;
}
