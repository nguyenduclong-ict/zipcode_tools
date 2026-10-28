import { getDatabase } from "@/lib/db";
import { getSupportedCountries } from "@/lib/search-service";
import HomeClient from "@/components/HomeClient";

export const runtime = "edge";
export const revalidate = 86400; // Edge Cache 24 giờ

export default async function HomePage() {
  const db = await getDatabase();
  const countries = await getSupportedCountries(db);

  return <HomeClient initialCountries={countries} />;
}
