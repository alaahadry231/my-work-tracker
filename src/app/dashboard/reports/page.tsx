"use client";

import { useState } from "react";
import Link from "next/link";

type Report = {
  employer: string;
  total_days: number;
  total_payments: number;
  total_withdrawals: number;
  net: number;
};

export default function ReportsPage() {
  const [employer, setEmployer] = useState("");
  const [report, setReport] = useState<Report | null>(null);
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

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-md mx-auto pt-8">
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
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-xl font-bold text-center border-b border-slate-800 pb-3 mb-4">
              📋 تقرير: {report.employer}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 rounded-xl p-4 text-center border border-slate-800">
                <div className="text-2xl font-bold text-sky-400">{report.total_days}</div>
                <div className="text-xs text-slate-500 mt-1">📅 أيام العمل</div>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 text-center border border-slate-800">
                <div className="text-2xl font-bold text-green-400">{report.total_payments.toLocaleString("en-US")}</div>
                <div className="text-xs text-slate-500 mt-1">💰 إجمالي الدفعات</div>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 text-center border border-slate-800">
                <div className="text-2xl font-bold text-red-400">{report.total_withdrawals.toLocaleString("en-US")}</div>
                <div className="text-xs text-slate-500 mt-1">💸 إجمالي المسحوبات</div>
              </div>
              <div className={`rounded-xl p-4 text-center border ${
                report.net >= 0 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className={`text-2xl font-bold ${report.net >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {report.net.toLocaleString("en-US")}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {report.net >= 0 ? "✅ الصافي (إلك)" : "⚠️ الصافي (عليك)"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}