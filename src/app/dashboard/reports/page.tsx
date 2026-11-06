"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

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
  const [downloading, setDownloading] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

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

  // 👇 دالة جديدة لتحميل PDF باستخدام html2canvas-pro و jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      const element = reportRef.current;
      
      // استخدام html2canvas-pro لتحويل العنصر إلى صورة
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a", // لون الخلفية الغامق
      });

      const imgData = canvas.toDataURL("image/png");
      
      // إنشاء ملف PDF باستخدام jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // حساب النسبة لملء عرض الصفحة
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`تقرير_${report?.employer}.pdf`);

    } catch (err) {
      console.error("PDF Error:", err);
      alert("تعذر تحميل ملف PDF");
    } finally {
      setDownloading(false);
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
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-bold">📊 التقارير</h1>
        <Link href="/dashboard" className="md:hidden text-slate-400 hover:text-sky-400">← رجوع</Link>
      </div>

      {/* فورم البحث */}
      <form onSubmit={handleSearch} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-end mb-8 shadow-lg print:hidden">
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

      {/* التقرير */}
      {report && (
        <div className="space-y-6">
          
          {/* زر التحميل */}
          <div className="flex justify-end print:hidden">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold transition shadow-lg"
            >
              {downloading ? "جاري التحميل..." : "📄 تحميل التقرير PDF"}
            </button>
          </div>

          {/* محتوى التقرير اللي بينحمل */}
          <div ref={reportRef} className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 space-y-8">
            
            <div className="text-center border-b border-slate-800 pb-6">
              <h2 className="text-3xl font-bold mb-2">تقرير حساب</h2>
              <p className="text-xl text-sky-400 font-bold">{report.employer}</p>
              <p className="text-sm text-slate-500 mt-2">تاريخ الطباعة: {new Date().toLocaleDateString("en-GB")}</p>
            </div>

            {/* الإجماليات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm mb-1">أيام العمل</div>
                  <div className="text-4xl font-bold text-sky-400">{report.total_days}</div>
                </div>
                <div className="text-5xl opacity-20">📅</div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm mb-1">إجمالي الدفعات</div>
                  <div className="text-3xl font-bold text-green-400">{report.total_payments.toLocaleString("en-US")} <span className="text-sm">ل.س</span></div>
                </div>
                <div className="text-5xl opacity-20">💰</div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm mb-1">إجمالي المسحوبات</div>
                  <div className="text-3xl font-bold text-red-400">{report.total_withdrawals.toLocaleString("en-US")} <span className="text-sm">ل.س</span></div>
                </div>
                <div className="text-5xl opacity-20">💸</div>
              </div>
            </div>

            {/* التفاصيل */}
            <div className="space-y-8">
              
              {/* الأيام */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800/50 p-4 border-b border-slate-800 font-bold text-lg text-sky-400">📅 سجل الأيام</div>
                <table className="w-full text-right">
                  <thead className="bg-slate-950/50 text-slate-400 text-sm">
                    <tr>
                      <th className="p-3 font-normal">التاريخ</th>
                      <th className="p-3 font-normal">المكان</th>
                      <th className="p-3 font-normal">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.days.length === 0 ? (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500">لا توجد أيام مسجلة</td></tr>
                    ) : (
                      report.days.map((day, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 text-white font-medium">{formatDate(day.work_date)}</td>
                          <td className="p-3 text-slate-400 text-sm">{day.location || "-"}</td>
                          <td className="p-3 text-slate-400 text-sm">{day.notes || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* العمليات المالية */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800/50 p-4 border-b border-slate-800 font-bold text-lg text-green-400">💰 سجل الدفعات والمسحوبات</div>
                <table className="w-full text-right">
                  <thead className="bg-slate-950/50 text-slate-400 text-sm">
                    <tr>
                      <th className="p-3 font-normal">التاريخ</th>
                      <th className="p-3 font-normal">النوع</th>
                      <th className="p-3 font-normal">المبلغ</th>
                      <th className="p-3 font-normal">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.payments.length === 0 && report.withdrawals.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-500">لا توجد عمليات مالية</td></tr>
                    ) : (
                      <>
                        {report.payments.map((p, i) => (
                          <tr key={`p-${i}`} className="hover:bg-slate-800/30 transition">
                            <td className="p-3 text-white font-medium">{formatDate(p.trans_date)}</td>
                            <td className="p-3 text-sm"><span className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs">دفعة</span></td>
                            <td className="p-3 text-green-400 font-bold">{Number(p.amount).toLocaleString("en-US")}</td>
                            <td className="p-3 text-slate-400 text-sm">{p.notes || "-"}</td>
                          </tr>
                        ))}
                        {report.withdrawals.map((w, i) => (
                          <tr key={`w-${i}`} className="hover:bg-slate-800/30 transition">
                            <td className="p-3 text-white font-medium">{formatDate(w.trans_date)}</td>
                            <td className="p-3 text-sm"><span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs">مسحوب</span></td>
                            <td className="p-3 text-red-400 font-bold">{Number(w.amount).toLocaleString("en-US")}</td>
                            <td className="p-3 text-slate-400 text-sm">{w.notes || "-"}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}