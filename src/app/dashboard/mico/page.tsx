"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Month = {
  id: number;
  month_name: string;
  status: string;
  created_at: string;
};

type Deposit = {
  id: number;
  amount: number;
  deposit_date: string;
  notes: string;
};

type Target = {
  id: number;
  target_amount: number;
  completed_amount: number;
  sort_order: number;
};

export default function MicoLivePage() {
  const [months, setMonths] = useState<Month[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [activeMonth, setActiveMonth] = useState<Month | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newMonth, setNewMonth] = useState("");
  const [addingMonth, setAddingMonth] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositNotes, setDepositNotes] = useState("");
  const [addingDeposit, setAddingDeposit] = useState(false);

  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<Month | null>(null);
  const [historyDeposits, setHistoryDeposits] = useState<Deposit[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/mico");
      const data = await res.json();
      setMonths(data.months || []);
      setTargets(data.targets || []);
      
      const open = data.months.find((m: Month) => m.status === "open");
      setActiveMonth(open || null);

      if (open) {
        const depositsRes = await fetch(`/api/mico/deposits?month_id=${open.id}`);
        const depositsData = await depositsRes.json();
        setDeposits(depositsData.data || []);
      } else {
        setDeposits([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMonth(true);
    setMessage("");
    try {
      const res = await fetch("/api/mico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_month", month_name: newMonth }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewMonth("");
      await fetchData();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setAddingMonth(false);
    }
  };

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMonth) return;
    setAddingDeposit(true);
    setMessage("");
    try {
      const res = await fetch("/api/mico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_deposit",
          month_id: activeMonth.id,
          amount: parseFloat(depositAmount),
          deposit_date: depositDate,
          notes: depositNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepositAmount("");
      setDepositNotes("");
      await fetchData();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setAddingDeposit(false);
    }
  };

  const handleDeleteDeposit = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الوارد؟")) return;
    try {
      const res = await fetch(`/api/mico?deposit_id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      await fetchData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleCloseMonth = async () => {
    if (!activeMonth) return;
    if (!confirm("هل أنت متأكد من إغلاق الشهر؟ لن تتمكن من إضافة واردات جديدة عليه.")) return;
    
    try {
      const res = await fetch("/api/mico", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month_id: activeMonth.id }),
      });
      if (!res.ok) throw new Error("فشل إغلاق الشهر");
      await fetchData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const loadHistoryMonth = async (month: Month) => {
    setSelectedHistoryMonth(month);
    const res = await fetch(`/api/mico/deposits?month_id=${month.id}`);
    const data = await res.json();
    setHistoryDeposits(data.data || []);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
  
  // 1. نلاقي التارغت الحالي (آخر تارغت إحنا واصلين له أو تعديناه)
  let currentTarget = targets[0];
  let currentIndex = 0;
  for (let i = 0; i < targets.length; i++) {
    if (totalDeposits >= targets[i].target_amount) {
      currentTarget = targets[i];
      currentIndex = i;
    } else {
      break;
    }
  }

  // 2. نلاقي التارغت اللي بعده مباشرة
  const nextTarget = targets[currentIndex + 1] || null;
  
  // 3. نحسب المتبقي للجاي (التارغت الجاي - إجمالي الوارد)
  const remainingForNext = nextTarget ? nextTarget.target_amount - totalDeposits : 0;

  if (loading) {
    return <div className="text-slate-500 text-center py-20">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-bold">💰 Mico Live</h1>
        <Link href="/dashboard" className="md:hidden text-slate-400 hover:text-sky-400">← رجوع</Link>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center mb-6">
          {message}
        </div>
      )}

      {!activeMonth ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold mb-2">لا يوجد شهر مفتوح</h2>
          <p className="text-slate-400 text-sm mb-6">أضف شهر جديد عشان تبدأ تسجل وارداتك.</p>
          <form onSubmit={handleAddMonth} className="flex gap-2">
            <input
              type="text"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              placeholder="11/2026"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-center"
              required
            />
            <button
              type="submit"
              disabled={addingMonth}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
            >
              {addingMonth ? "..." : "إضافة"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* البطاقة اللي فوق (4 مربعات) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. إجمالي الوارد */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-center text-center">
              <div className="text-sm text-slate-400 mb-2">إجمالي الوارد</div>
              <div className="text-2xl font-bold text-green-400">{totalDeposits.toLocaleString("en-US")}</div>
              <div className="text-xs text-slate-500 mt-1">توكن</div>
            </div>

            {/* 2. المتبقي للجاي */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-center text-center">
              <div className="text-sm text-slate-400 mb-2">المتبقي للجاي</div>
              <div className="text-2xl font-bold text-yellow-400">{remainingForNext.toLocaleString("en-US")}</div>
              <div className="text-xs text-slate-500 mt-1">توكن</div>
            </div>

            {/* 3. المخلص */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-center text-center">
              <div className="text-sm text-slate-400 mb-2">المخلص</div>
              <div className="text-2xl font-bold text-sky-400">${currentTarget.completed_amount.toLocaleString("en-US")}</div>
              <div className="text-xs text-slate-500 mt-1">دولار</div>
            </div>

            {/* 4. التارغت الحالي */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-center text-center">
              <div className="text-sm text-slate-400 mb-2">التارغت الحالي</div>
              <div className="text-2xl font-bold text-white">{currentTarget.target_amount.toLocaleString("en-US")}</div>
              <div className="text-xs text-slate-500 mt-1">توكن</div>
            </div>
          </div>

          {/* زر إغلاق الشهر */}
          <div className="flex justify-end">
            <button
              onClick={handleCloseMonth}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm transition"
            >
              🔒 إغلاق الشهر
            </button>
          </div>

          {/* فورم إضافة وارد */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold mb-4">➕ إضافة وارد جديد</h2>
            <form onSubmit={handleAddDeposit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="المبلغ (توكن)"
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 focus:outline-none text-white"
                required
                min="1"
              />
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 focus:outline-none text-white"
                required
              />
              <input
                type="text"
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                placeholder="ملاحظات (اختياري)"
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 focus:outline-none text-white"
              />
              <button
                type="submit"
                disabled={addingDeposit}
                className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-bold transition"
              >
                {addingDeposit ? "..." : "إضافة"}
              </button>
            </form>
          </div>

          {/* جدول الواردات */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-800/50 font-bold">سجل واردات {activeMonth.month_name}</div>
            <table className="w-full text-right">
              <thead className="bg-slate-950/50 text-slate-400 text-sm">
                <tr>
                  <th className="p-3 font-normal">التاريخ</th>
                  <th className="p-3 font-normal">المبلغ</th>
                  <th className="p-3 font-normal">ملاحظات</th>
                  <th className="p-3 font-normal text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deposits.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-500">لا توجد واردات بعد</td></tr>
                ) : (
                  deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white">{formatDate(dep.deposit_date)}</td>
                      <td className="p-3 text-green-400 font-bold">{Number(dep.amount).toLocaleString("en-US")} توكن</td>
                      <td className="p-3 text-slate-400 text-sm">{dep.notes || "-"}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteDeposit(dep.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                        >
                          🗑️ حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* سجل الشهور المغلقة */}
      {months.filter(m => m.status === "closed").length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">📚 سجل الشهور المغلقة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {months.filter(m => m.status === "closed").map((month) => (
              <button
                key={month.id}
                onClick={() => loadHistoryMonth(month)}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 hover:border-sky-500/50 transition text-right"
              >
                <div className="text-lg font-bold text-sky-400">{month.month_name}</div>
                <div className="text-xs text-slate-500">مغلق</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* مودال عرض الشهر المغلق */}
      {selectedHistoryMonth && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-xl font-bold">سجل {selectedHistoryMonth.month_name}</h3>
              <button onClick={() => setSelectedHistoryMonth(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-950 text-slate-400 text-sm">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {historyDeposits.map((dep) => (
                    <tr key={dep.id}>
                      <td className="p-3 text-white">{formatDate(dep.deposit_date)}</td>
                      <td className="p-3 text-green-400 font-bold">{Number(dep.amount).toLocaleString("en-US")} توكن</td>
                      <td className="p-3 text-slate-400 text-sm">{dep.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}