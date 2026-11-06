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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch(`/api/reports?employer=${encodeURIComponent(employer.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">📊 التقارير</h1>
        <Link href="/dashboard" className="md:hidden text-slate-400 hover:text-sky-400">← رجوع</Link>
      </div>

      <form onSubmit={handleSearch} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-end mb-8 shadow-lg">
        <div className="flex-1 w-full">
          <label className="block text-sm text-slate-400 mb-2">اسم صاحب العمل</label>
          <input
            type="text"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            placeholder="مثلاً: زاهر"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition whitespace-nowrap"
        >
          {loading ? "جاري البحث..." : "🔍 عرض التقرير"}
        </button>
      </form>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center mb-8">{error}</div>}

      {report && (
        <div className="space-y-8">
          {/* الإجماليات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-slate-400 text-sm mb-1">أيام العمل</div>
                <div className="text-4xl font-bold text-sky-400">{report.total_days}</div>
              </div>
              <div className="text-5xl opacity-20">📅</div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-slate-400 text-sm mb-1">إجمالي الدفعات</div>
                <div className="text-3xl font-bold text-green-400">{report.total_payments.toLocaleString("en-US")} <span className="text-sm">ل.س</span></div>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-slate-400 text-sm mb-1">إجمالي المسحوبات</div>
                <div className="text-3xl font-bold text-red-400">{report.total_withdrawals.toLocaleString("en-US")} <span className="text-sm">ل.س</span></div>
              </div>
              <div className="text-5xl opacity-20">💸</div>
            </div>
          </div>

          {/* التفاصيل (عمودين على الكمبيوتر) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* الأيام */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-slate-800/50 p-4 border-b border-slate-800 font-bold text-lg text-sky-400">📅 سجل الأيام</div>
              <div className="flex-1 overflow-y-auto max-h-[400px]">
                {report.days.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">لا توجد أيام مسجلة</div>
                ) : (
                  <table className="w-full text-right">
                    <thead className="bg-slate-950/50 text-slate-400 text-sm sticky top-0">
                      <tr>
                        <th className="p-3 font-normal">التاريخ</th>
                        <th className="p-3 font-normal">المكان / ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {report.days.map((day, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 text-white font-medium">{formatDate(day.work_date)}</td>
                          <td className="p-3 text-slate-400 text-sm">
                            {day.location && <span className="mr-2">📍 {day.location}</span>}
                            {day.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* العمليات المالية */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-slate-800/50 p-4 border-b border-slate-800 font-bold text-lg text-green-400">💰 سجل الدفعات والمسحوبات</div>
              <div className="flex-1 overflow-y-auto max-h-[400px]">
                {report.payments.length === 0 && report.withdrawals.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">لا توجد عمليات مالية</div>
                ) : (
                  <table className="w-full text-right">
                    <thead className="bg-slate-950/50 text-slate-400 text-sm sticky top-0">
                      <tr>
                        <th className="p-3 font-normal">التاريخ</th>
                        <th className="p-3 font-normal">النوع / ملاحظات</th>
                        <th className="p-3 font-normal">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {report.payments.map((p, i) => (
                        <tr key={`p-${i}`} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 text-white font-medium">{formatDate(p.trans_date)}</td>
                          <td className="p-3 text-slate-400 text-sm">
                            <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs ml-2">دفعة</span>
                            {p.notes}
                          </td>
                          <td className="p-3 text-green-400 font-bold">{Number(p.amount).toLocaleString("en-US")}</td>
                        </tr>
                      ))}
                      {report.withdrawals.map((w, i) => (
                        <tr key={`w-${i}`} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 text-white font-medium">{formatDate(w.trans_date)}</td>
                          <td className="p-3 text-slate-400 text-sm">
                            <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs ml-2">مسحوب</span>
                            {w.notes}
                          </td>
                          <td className="p-3 text-red-400 font-bold">{Number(w.amount).toLocaleString("en-US")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}