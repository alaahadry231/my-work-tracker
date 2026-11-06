"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";

export default function PackageImagePage() {
  const [packageName, setPackageName] = useState("");
  const [packageCode, setPackageCode] = useState("");
  const [packageRate, setPackageRate] = useState("");
  const [options, setOptions] = useState<string[]>([""]);

  const [bgImage, setBgImage] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.length > 0 ? newOptions : [""]);
  };

  const handleDownload = async () => {
    if (!cardRef.current || !bgImage) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `package-${packageCode || "image"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error:", err);
      alert("تعذر تحميل الصورة");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-bold">🖼️ إنشاء صورة بكج</h1>
        <Link href="/dashboard" className="md:hidden text-slate-400 hover:text-sky-400">← رجوع</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* فورم البيانات */}
        <div className="space-y-4 bg-slate-900 rounded-2xl border border-slate-800 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 text-sky-400">1. أدخل البيانات</h2>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">رفع خلفية البطاقة (صورة القالب)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-slate-900 hover:file:bg-sky-400"
            />
            {bgImage && <p className="text-green-400 text-xs mt-2">✅ تم رفع الصورة</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">اسم البكج</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="مثلاً: دوري الأبطال"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-2">كود البكج</label>
              <input
                type="text"
                value={packageCode}
                onChange={(e) => setPackageCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">الريت</label>
              <input
                type="text"
                value={packageRate}
                onChange={(e) => setPackageRate(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">الخيارات</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`الخيار ${i + 1}`}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition"
            >
              + إضافة خيار
            </button>
          </div>
        </div>

        {/* معاينة الصورة */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold mb-4 text-sky-400">2. معاينة البطاقة</h2>
            
            {!bgImage ? (
              <div className="aspect-[4/5] bg-slate-950 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                ارفع صورة الخلفية عشان تشوف المعاينة
              </div>
            ) : (
              <div 
                ref={cardRef}
                className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl font-sans"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* 👇 التصميم الجديد */}
                <div className="absolute inset-0 flex flex-col justify-between text-white pb-8" dir="rtl">
                  
                  {/* مساحة فارغة فوق عشان الحصان يبين */}
                  <div className="h-1/3"></div>

                  {/* الكود والريت (في المنتصف) */}
                  <div className="flex justify-center gap-4 mt-auto">
                    <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                      <span className="text-sm text-slate-300">الكود:</span>
                      <span className="font-bold text-2xl text-yellow-400">{packageCode || "0000"}</span>
                    </div>
                    <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                      <span className="text-sm text-slate-300">الريت:</span>
                      <span className="font-bold text-2xl text-yellow-400">{packageRate || "0"}</span>
                    </div>
                  </div>

                  {/* الخيارات (تحت) */}
                  <div className="mt-8 mx-6">
                    <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2">
                        {/* 👇 اسم البكج بجانب كلمة الخيارات باللون الأزرق */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">الخيارات</span>
                          {packageName && (
                            <>
                              <span className="text-slate-500">|</span>
                              <span className="text-lg font-bold text-sky-400">{packageName}</span>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-yellow-400 font-bold">{options.filter(o => o).length}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {options.filter(o => o).map((opt, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-green-500 font-bold text-base mt-0.5">✓</span>
                            <span className="leading-snug">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || !bgImage}
            className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold transition shadow-lg"
          >
            {downloading ? "جاري التحميل..." : "📥 تحميل الصورة"}
          </button>
        </div>

      </div>
    </div>
  );
}