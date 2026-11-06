import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employer = searchParams.get("employer");

    if (!employer) {
      return NextResponse.json({ error: "employer مطلوب" }, { status: 400 });
    }

    // 1. جلب أيام العمل
    const days = await sql`
      select work_date, location, notes
      from work_days
      where employer = ${employer}
      order by work_date desc
    `;

    // 2. جلب الدفعات
    const payments = await sql`
      select trans_date, amount, notes
      from transactions
      where employer = ${employer} and type = 'payment'
      order by trans_date desc
    `;

    // 3. جلب المسحوبات
    const withdrawals = await sql`
      select trans_date, amount, notes
      from transactions
      where employer = ${employer} and type = 'withdrawal'
      order by trans_date desc
    `;

    // حساب الإجماليات
    const totalDays = days.length;
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);

    return NextResponse.json({
      employer,
      total_days: totalDays,
      total_payments: totalPayments,
      total_withdrawals: totalWithdrawals,
      days,
      payments,
      withdrawals,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}