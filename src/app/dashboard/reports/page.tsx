"use client";

import { useState } from "react";
import Link from "next/link";

type ReportData = {
  employer: string;
  total_days: number;
  total_payments: number;
  total_withdrawals: number;
  days: { work_date: string; location: string; notes: string }[];
  payments: { trans_date: string; amount: number; notes: string }[];
  withdrawals: { trans_date: string; amount: number; notes: string }[];
};

export default function ReportsPage() {
  const [employer, setEmployer] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"days" | "payments" | "withdrawals">("days");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);
    setActiveTab("days");

    try {
      const res = await fetch(`/api/reports?employer=${encodeURIComponent(employer.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل جلب التقرير");
        return;
      }

      setReport(data);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB"); // يعطي تاريخ بشكل 01/11/2026
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-sky-400 text-2xl">←</Link>
          <h1 className="text-2xl font-bold">📊 التقارير</h1>
        </div>

        <form onSubmit={handleSearch} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">اسم صاحب العمل</label>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="مثلاً: أبو أحمد"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
          >
            {loading ? "جاري البحث..." : "🔍 عرض التقرير"}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {report && (
          <div className="space-y-4">
            {/* الإجماليات */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-xl font-bold text-center border-b border-slate-800 pb-3 mb-4">
                📋 تقرير: {report.employer}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950 rounded-xl p-3 text-center border border-slate-800">
                  <div className="text-xl font-bold text-sky-400">{report.total_days}</div>
                  <div className="text-[10px] text-slate-500 mt-1">📅 أيام</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 text-center border border-slate-800">
                  <div className="text-xl font-bold text-green-400">{report.total_payments.toLocaleString("en-US")}</div>
                  <div className="text-[10px] text-slate-500 mt-1">💰 دفعات</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 text-center border border-slate-800">
                  <div className="text-xl font-bold text-red-400">{report.total_withdrawals.toLocaleString("en-US")}</div>
                  <div className="text-[10px] text-slate-500 mt-1">💸 مسحوبات</div>
                </div>
              </div>
            </div>

            {/* التبويبات */}
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab("days")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === "days" ? "bg-sky-500 text-slate-900" : "text-slate-400"}`}
              >
                الأيام
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === "payments" ? "bg-green-500 text-slate-900" : "text-slate-400"}`}
              >
                الدفعات
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === "withdrawals" ? "bg-red-500 text-white" : "text-slate-400"}`}
              >
                المسحوبات
              </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              {activeTab === "days" && (
                <div className="divide-y divide-slate-800">
                  {report.days.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">لا توجد أيام مسجلة</div>
                  ) : (
                    report.days.map((day, i) => (
                      <div key={i} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white font-bold">{formatDate(day.work_date)}</div>
                          {day.location && <div className="text-xs text-slate-500">📍 {day.location}</div>}
                        </div>
                        {day.notes && <div className="text-xs text-slate-400 max-w-[50%] text-left">{day.notes}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="divide-y divide-slate-800">
                  {report.payments.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">لا توجد دفعات</div>
                  ) : (
                    report.payments.map((payment, i) => (
                      <div key={i} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white font-bold">{formatDate(payment.trans_date)}</div>
                          {payment.notes && <div className="text-xs text-slate-500">{payment.notes}</div>}
                        </div>
                        <div className="text-green-400 font-bold">{Number(payment.amount).toLocaleString("en-US")} ل.س</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "withdrawals" && (
                <div className="divide-y divide-slate-800">
                  {report.withdrawals.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">لا توجد مسحوبات</div>
                  ) : (
                    report.withdrawals.map((w, i) => (
                      <div key={i} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white font-bold">{formatDate(w.trans_date)}</div>
                          {w.notes && <div className="text-xs text-slate-500">{w.notes}</div>}
                        </div>
                        <div className="text-red-400 font-bold">{Number(w.amount).toLocaleString("en-US")} ل.س</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}