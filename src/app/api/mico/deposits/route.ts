import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthId = searchParams.get("month_id");

    if (!monthId) {
      return NextResponse.json({ error: "month_id مطلوب" }, { status: 400 });
    }

    const data = await sql`
      select * from mico_deposits 
      where month_id = ${monthId} 
      order by deposit_date desc, created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch deposits error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}