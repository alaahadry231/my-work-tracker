import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const months = await sql`
      select m.*, 
             (select coalesce(sum(amount), 0) from mico_deposits where month_id = m.id) as total_deposits
      from mico_months m 
      order by m.created_at desc
    `;
    const targets = await sql`select * from mico_targets order by sort_order asc`;
    return NextResponse.json({ months, targets });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "add_month") {
      const { month_name } = body;
      const openMonth = await sql`select id from mico_months where status = 'open'`;
      if (openMonth.length > 0) {
        return NextResponse.json({ error: "في شهر مفتوح حالياً. لازم تسكره قبل ما تضيف شهر جديد." }, { status: 400 });
      }
      const result = await sql`insert into mico_months (month_name) values (${month_name}) returning *`;
      return NextResponse.json({ data: result[0] });
    }

    if (action === "add_deposit") {
      const { month_id, amount, deposit_date, notes } = body;
      const month = await sql`select status from mico_months where id = ${month_id}`;
      if (month.length === 0 || month[0].status !== "open") {
        return NextResponse.json({ error: "الشهر مغلق أو غير موجود" }, { status: 400 });
      }
      const result = await sql`
        insert into mico_deposits (month_id, amount, deposit_date, notes)
        values (${month_id}, ${amount}, ${deposit_date}, ${notes || ""})
        returning *
      `;
      return NextResponse.json({ data: result[0] });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { month_id } = body;
    await sql`update mico_months set status = 'closed' where id = ${month_id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 👇 دالة الحذف
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const depositId = searchParams.get("deposit_id");
    const monthId = searchParams.get("month_id");

    // حذف وارد
    if (depositId) {
      await sql`delete from mico_deposits where id = ${depositId}`;
      return NextResponse.json({ success: true });
    }

    // حذف شهر كامل (مع كل وارداته)
    if (monthId) {
      // حذف الواردات أولاً (عشان ما يصير خطأ في القيود)
      await sql`delete from mico_deposits where month_id = ${monthId}`;
      // بعدها حذف الشهر
      await sql`delete from mico_months where id = ${monthId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "deposit_id أو month_id مطلوب" }, { status: 400 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}