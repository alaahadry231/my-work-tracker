"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // كلمة السر (مؤقتاً، بعدين ننقلها لمتغير بيئة)
    const ADMIN_PASSWORD = "123456";

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_logged_in", "true");
      router.push("/dashboard");
    } else {
      setError("كلمة السر غير صحيحة");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">موقعي الشخصي</h1>
          <p className="text-slate-400 text-sm">أدخل كلمة السر للدخول</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="w-full px-4 py-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-center transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
          >
            دخول
          </button>
        </form>
      </div>
    </main>
  );
}