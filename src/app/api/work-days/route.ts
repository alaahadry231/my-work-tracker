import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET: جلب كل أيام العمل
export async function GET() {
  try {
    const data = await sql`select * from work_days order by work_date desc`;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: إضافة يوم عمل جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { work_date, employer, location, notes } = body;

    if (!work_date || !employer) {
      return NextResponse.json({ error: "التاريخ واسم صاحب العمل مطلوبين" }, { status: 400 });
    }

    const result = await sql`
      insert into work_days (work_date, employer, location, notes)
      values (${work_date}, ${employer}, ${location || ""}, ${notes || ""})
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}