"use client";

import { Noto_Sans_Arabic } from 'next/font/google';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

export default function ResourceHeader({ lang = 'en', onLangChange }) {
  const showSwitcher = typeof onLangChange === 'function';

  return (
    <header
      className="shadow-md border-b border-gray-200 dark:border-zinc-800 px-2 sm:px-6 py-2"
      style={{ backgroundColor: '#1b1464' }}
    >
      <div className="flex items-center gap-2 sm:gap-4 w-full max-w-6xl mx-auto">
        <img src="/acted-logo.png" alt="ACTED Logo" className="h-10 sm:h-16 w-auto flex-shrink-0" />
        <h1 className="flex-1 text-center text-base sm:text-2xl font-bold text-white truncate">
          {lang === 'ar' ? 'بوابة الموارد' : 'Resources Hub'}
        </h1>
        {showSwitcher ? (
          <div className="flex-shrink-0 w-[110px] sm:w-[170px] flex justify-end">
            <button
              type="button"
              onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
              className="inline-flex items-center gap-2 rounded-full bg-white text-[#1b1464] px-3 py-2 font-semibold text-xs sm:text-sm shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={lang === 'ar' ? 'تغيير اللغة' : 'Change language'}
            >
              <img src="/translate.png" alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className={lang === 'en' ? notoArabic.className : ''}>
                {lang === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 w-[110px] sm:w-[170px]" />
        )}
      </div>
    </header>
  );
}
