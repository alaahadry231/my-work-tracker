import Link from "next/link";

export default function Dashboard() {
  const menuItems = [
    { href: "/dashboard/add-day", label: "إضافة يوم عمل", icon: "📅", desc: "تسجيل يوم شغل جديد", color: "border-sky-500/30 hover:bg-sky-500/10" },
    { href: "/dashboard/add-payment", label: "إضافة دفعة", icon: "💰", desc: "تسجيل دفعة مستلمة", color: "border-green-500/30 hover:bg-green-500/10" },
    { href: "/dashboard/add-withdrawal", label: "إضافة مسحوب", icon: "💸", desc: "تسجيل مبلغ سحبه صاحب العمل", color: "border-red-500/30 hover:bg-red-500/10" },
    { href: "/dashboard/reports", label: "التقارير", icon: "📊", desc: "عرض تقرير حسب صاحب العمل", color: "border-purple-500/30 hover:bg-purple-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">👋 أهلاً بك</h1>
        <p className="text-slate-400 text-lg">اختر الإجراء الذي تريد القيام به اليوم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bg-slate-900 rounded-3xl border-2 p-8 transition group shadow-lg ${item.color}`}
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-right">{item.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{item.label}</h3>
            <p className="text-slate-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}