"use client";

import Link from 'next/link';
import { Noto_Sans_Arabic } from 'next/font/google';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '600', '700'] });

export default function NotFound() {
  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans ${notoArabic.className}`}>
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[35vw] h-[35vw] bg-rose-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main 404 Graphic & Message */}
      <div className="text-center relative z-10 max-w-lg space-y-6">
        
        {/* Glowing 404 Title */}
        <div className="relative inline-block select-none">
          <h1 className="text-9xl font-black tracking-widest text-zinc-900 leading-none">404</h1>
          <span className="absolute inset-0 text-9xl font-black tracking-widest bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent blur-[2px] opacity-80 leading-none">
            404
          </span>
          <span className="absolute inset-0 text-9xl font-black tracking-widest bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent leading-none">
            404
          </span>
        </div>

        {/* Localized Messages */}
        <div className="space-y-4">
          <div dir="rtl" className="space-y-1">
            <h2 className="text-xl font-bold text-white">عذراً، الصفحة غير موجودة!</h2>
            <p className="text-xs text-zinc-400">يبدو أن الرابط الذي حاولت الوصول إليه غير صالح أو تم نقله لمكان آخر.</p>
          </div>
          
          <div className="h-px bg-zinc-800/80 my-4 max-w-[200px] mx-auto"></div>

          <div dir="ltr" className="space-y-1">
            <h2 className="text-lg font-semibold text-zinc-300">Oops! Page Not Found</h2>
            <p className="text-xs text-zinc-400">The link you are trying to reach doesn't exist or has been moved.</p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            الرئيسية / Home
          </Link>
          <Link
            href="/service-mapping"
            className="px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            خريطة الخدمات / Service Map
          </Link>
        </div>
      </div>

      {/* ACTED Logo Stamp */}
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2">
        <img src="/assets/acted-logo.png" alt="ACTED Logo" className="h-10 w-auto opacity-50 filter brightness-110" />
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">ACTED Resource Hub</span>
      </div>
    </div>
  );
}
