import { describe, it, expect } from "vitest";
import { GET as searchHandler } from "../app/api/v1/search/route";
import { GET as countriesHandler } from "../app/api/v1/countries/route";
import { NextRequest } from "next/server";

describe("API Route Handlers Tests", () => {
  it("GET /api/v1/search should return formatted search results", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/search?q=90210&country=US");
    const res = await searchHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.query).toBe("90210");
    expect(json.data.results.length).toBeGreaterThan(0);
    expect(json.data.results[0].place_name).toBe("Beverly Hills");
  });

  it("GET /api/v1/countries should return list of supported countries", async () => {
    const res = await countriesHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.some((c: { code: string }) => c.code === "VN")).toBe(true);
  });
});
