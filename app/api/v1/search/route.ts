import { getDatabase } from "@/lib/db";
import { searchZipCodes } from "@/lib/search-service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const country = searchParams.get("country") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type") as "all" | "code" | "place" | undefined;

    const db = await getDatabase();
    const data = await searchZipCodes(db, {
      query,
      country,
      limit,
      type,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API Search Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi nội bộ khi tra cứu mã bưu chính",
      },
      { status: 500 }
    );
  }
}
