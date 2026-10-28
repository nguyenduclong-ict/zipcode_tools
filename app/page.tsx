import { getDatabase } from "@/lib/db";
import { getSupportedCountries } from "@/lib/search-service";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const db = await getDatabase();
  const countries = await getSupportedCountries(db);

  return <HomeClient initialCountries={countries} />;
}
