"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddPaymentPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [employer, setEmployer] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trans_date: date,
          employer: employer.trim(),
          amount: parseFloat(amount),
          type: "payment",
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "فشل الحفظ");
        setSaving(false);
        return;
      }

      setMessage("✅ تم حفظ الدفعة بنجاح!");
      setEmployer("");
      setAmount("");
      setNotes("");
    } catch {
      setMessage("❌ تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-sky-400 text-2xl">←</Link>
          <h1 className="text-2xl font-bold">💰 إضافة دفعة</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">التاريخ *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">اسم صاحب العمل *</label>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="مثلاً: أبو أحمد"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">المبلغ (ل.س) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">ملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل إضافية..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              message.includes("✅") 
                ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-900 font-bold transition"
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ الدفعة"}
          </button>
        </form>
      </div>
    </main>
  );
}