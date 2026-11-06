import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employer = searchParams.get("employer");

    if (!employer) {
      return NextResponse.json({ error: "employer مطلوب" }, { status: 400 });
    }

    // عدد أيام العمل
    const daysResult = await sql`
      select count(*)::int as total_days
      from work_days
      where employer = ${employer}
    `;

    // إجمالي الدفعات
    const paymentsResult = await sql`
      select coalesce(sum(amount), 0)::int as total_payments
      from transactions
      where employer = ${employer} and type = 'payment'
    `;

    // إجمالي المسحوبات
    const withdrawalsResult = await sql`
      select coalesce(sum(amount), 0)::int as total_withdrawals
      from transactions
      where employer = ${employer} and type = 'withdrawal'
    `;

    const totalDays = daysResult[0].total_days;
    const totalPayments = paymentsResult[0].total_payments;
    const totalWithdrawals = withdrawalsResult[0].total_withdrawals;
    const net = totalPayments - totalWithdrawals;

    return NextResponse.json({
      employer,
      total_days: totalDays,
      total_payments: totalPayments,
      total_withdrawals: totalWithdrawals,
      net,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}