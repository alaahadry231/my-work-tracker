"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddWithdrawalPage() {
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
          type: "withdrawal",
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "فشل الحفظ");
        setSaving(false);
        return;
      }

      setMessage("✅ تم حفظ المسحوب بنجاح!");
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <Link href="/dashboard" className="md:hidden text-slate-400 hover:text-sky-400 text-2xl">←</Link>
        <h1 className="text-3xl font-bold">💸 إضافة مسحوب</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-lg">
        <div>
          <label className="block text-sm text-slate-400 mb-2">التاريخ *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-none text-white transition"
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
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-none text-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">المبلغ (ل.س) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="20000"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-none text-white transition"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">السبب / ملاحظات</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثلاً: جبت غراض للشغل"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-none text-white transition"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm text-center font-bold ${
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
          className="w-full px-6 py-4 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold text-lg transition"
        >
          {saving ? "جاري الحفظ..." : "💾 حفظ المسحوب"}
        </button>
      </form>
    </div>
  );
}