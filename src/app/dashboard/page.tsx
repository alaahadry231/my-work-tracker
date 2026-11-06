"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500">جاري التحقق...</div>
      </main>
    );
  }

  const menuItems = [
    { href: "/dashboard/add-day", label: "➕ إضافة يوم عمل", icon: "📅", desc: "تسجيل يوم شغل جديد" },
    { href: "/dashboard/add-payment", label: "💰 إضافة دفعة", icon: "💵", desc: "تسجيل دفعة مستلمة" },
    { href: "/dashboard/add-withdrawal", label: "💸 إضافة مسحوب", icon: "💸", desc: "تسجيل مبلغ سحبه صاحب العمل" },
    { href: "/dashboard/reports", label: "📊 التقارير", icon: "📊", desc: "عرض تقرير حسب صاحب العمل" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold mb-2">📋 موقعي الشخصي</h1>
          <p className="text-slate-400">سجل أيام الشغل والدفعات والمسحوبات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-sky-500/50 transition group"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-sky-400 transition">
                {item.label}
              </h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              localStorage.removeItem("admin_logged_in");
              router.push("/login");
            }}
            className="text-slate-500 hover:text-red-400 text-sm transition"
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </main>
  );
}