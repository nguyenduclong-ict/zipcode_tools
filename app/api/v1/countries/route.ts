import { getDatabase } from "@/lib/db";
import { getSupportedCountries } from "@/lib/search-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDatabase();
    const countries = await getSupportedCountries(db);

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    console.error("API Countries Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi nội bộ khi lấy danh mục quốc gia",
      },
      { status: 500 }
    );
  }
}
