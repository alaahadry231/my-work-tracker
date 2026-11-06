import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET: جلب كل الدفعات والمسحوبات
export async function GET() {
  try {
    const data = await sql`select * from transactions order by trans_date desc`;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: إضافة دفعة أو مسحوب
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trans_date, employer, amount, type, notes } = body;

    if (!trans_date || !employer || !amount || !type) {
      return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
    }

    if (type !== "payment" && type !== "withdrawal") {
      return NextResponse.json({ error: "نوع العملية غير صحيح" }, { status: 400 });
    }

    const result = await sql`
      insert into transactions (trans_date, employer, amount, type, notes)
      values (${trans_date}, ${employer}, ${amount}, ${type}, ${notes || ""})
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}