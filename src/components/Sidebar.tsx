"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/dashboard", label: "الرئيسية", icon: "📋" },
    { href: "/dashboard/add-day", label: "إضافة يوم عمل", icon: "📅" },
    { href: "/dashboard/add-payment", label: "إضافة دفعة", icon: "💰" },
    { href: "/dashboard/add-withdrawal", label: "إضافة مسحوب", icon: "💸" },
    { href: "/dashboard/reports", label: "التقارير", icon: "📊" },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 min-h-screen p-4 flex flex-col fixed right-0 top-0 bottom-0 z-20 hidden md:flex">
      <div className="text-center py-6 mb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold">موقعي الشخصي</h2>
        <p className="text-xs text-slate-500 mt-1">سجل الأعمال</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            localStorage.removeItem("admin_logged_in");
            router.push("/login");
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition font-bold"
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}