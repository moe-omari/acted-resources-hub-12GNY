"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResourceHeader from './ResourceHeader';
import { Noto_Sans_Arabic } from 'next/font/google';
import { trackEvent } from '../../lib/analytics';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem('selectedLang') || 'ar';
};

const interfaceText = {
  en: {
    viewerLabel: 'Resource Viewer',
    backLabel: '← Back to resources',
    downloadLabel: 'Download',
  },
  ar: {
    viewerLabel: 'عارض الموارد',
    backLabel: 'العودة إلى الموارد →',
    downloadLabel: 'تحميل',
  },
};

export default function ResourceDetail({ resource }) {
  const [lang, setLang] = useState(() => getStoredLanguage());
  const isArabic = lang === 'ar';
  const copy = resource.translations[lang] ?? resource.translations.en;
  const ui = interfaceText[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('selectedLang', lang);
  }, [lang]);

  useEffect(() => {
    trackEvent('resource_detail_view', {
      resource_title: resource.translations.en?.title || resource.translations.ar?.title || 'resource',
      resource_file: resource.downloadName || resource.file,
      resource_type: resource.type,
    });
  }, [resource]);

  return (
    <div
      className={`min-h-screen bg-zinc-50 dark:bg-black text-gray-900 dark:text-gray-100 ${
        isArabic ? `rtl ${notoArabic.className}` : ''
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{ fontFamily: isArabic ? undefined : 'Branding, sans-serif' }}
    >
      <ResourceHeader lang={lang} onLangChange={setLang} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">{ui.viewerLabel}</p>
            <h1 className="text-3xl font-bold mt-2">{copy.title}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{copy.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              {ui.backLabel}
            </Link>
            <a
              href={resource.file}
              download={resource.downloadName}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {ui.downloadLabel}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
          {resource.type === 'pdf' ? (
            <iframe
              src={`${resource.file}#toolbar=1&navpanes=0`}
              title={copy.title}
              className="w-full min-h-[80vh]"
            />
          ) : (
            <img
              src={resource.file}
              alt={copy.title}
              className="w-full h-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
}
