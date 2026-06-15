"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Noto_Sans_Arabic } from 'next/font/google';
import ResourceHeader from '../resources/ResourceHeader';
import { trackEvent } from '../../lib/analytics';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem('selectedLang') || 'ar';
};

const pageTranslations = {
  en: {
    hubLabel: 'ACTED Awareness Library',
    title: 'IEC Educational Materials',
    subtitle: 'Access and download our operational flyers, awareness posters, and hygiene promotion materials.',
    searchPlaceholder: 'Search by title or description...',
    noResults: 'No materials found matching your search.',
    viewBtn: 'View Material',
    downloadBtn: 'Download',
    backBtn: '← Back to Home',
    loading: 'Loading materials...',
    allFilter: 'All Materials',
    pdfFilter: 'PDF Documents',
    imageFilter: 'Images / Flyers',
    typeLabels: {
      pdf: 'PDF Document',
      image: 'Flyer/Image',
    },
    categories: {
      wash: 'WASH & Hygiene',
      health: 'Health & Infection Prevention',
      protection: 'Protection & Safety',
      vector: 'Vector Control',
      unmapped: 'Other Materials',
    },
  },
  ar: {
    hubLabel: 'مكتبة أكتد للتوعية',
    title: 'المواد التثقيفية والتوعوية (IEC)',
    subtitle: 'تصفح، اعرض وحمّل النشرات الإرشادية والملصقات التوعوية وأدلة تعزيز النظافة الصحية.',
    searchPlaceholder: 'ابحث عن العنوان أو الوصف...',
    noResults: 'لم يتم العثور على مواد تطابق بحثك.',
    viewBtn: 'عرض المادة',
    downloadBtn: 'تحميل المادة',
    backBtn: 'العودة للرئيسية →',
    loading: 'جاري تحميل المواد التثقيفية...',
    allFilter: 'الكل',
    pdfFilter: 'ملفات PDF',
    imageFilter: 'صور / ملصقات',
    typeLabels: {
      pdf: 'ملف PDF',
      image: 'ملصق / صورة',
    },
    categories: {
      wash: 'المياه والإصحاح البيئي',
      health: 'الصحة والوقاية من العدوى',
      protection: 'الحماية والسلامة',
      vector: 'مكافحة النواقل والقوارض',
      unmapped: 'مواد أخرى',
    },
  },
};

const CATEGORY_ORDER = ['wash', 'health', 'protection', 'vector', 'unmapped'];

export default function IecMaterialsPage() {
  const [lang, setLang] = useState(() => getStoredLanguage());
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const t = pageTranslations[lang];
  const isArabic = lang === 'ar';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('selectedLang', lang);
  }, [lang]);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const res = await fetch('/api/iec-materials');
        if (res.ok) {
          const data = await res.json();
          setMaterials(data);
        }
      } catch (err) {
        console.error('Failed to load materials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((item) => {
    const translation = item.translations[lang] || item.translations.en || {};
    const title = (translation.title || '').toLowerCase();
    const description = (translation.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = title.includes(query) || description.includes(query);
    const matchesFilter = filterCategory === 'all' || (item.category || 'unmapped') === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

  const groupedMaterials = filteredMaterials.reduce((acc, item) => {
    const cat = item.category || 'unmapped';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = CATEGORY_ORDER;

  const handleDownloadTrack = (item) => {
    trackEvent('resource_download', {
      resource_key: item.key,
      resource_title: item.translations.en?.title || item.translations.ar?.title || item.key,
      resource_file: item.downloadName || item.file,
      resource_type: item.type,
    });
  };

  return (
    <div
      className={`min-h-screen bg-zinc-50 dark:bg-black text-gray-900 dark:text-gray-100 ${isArabic ? `rtl ${notoArabic.className}` : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{ fontFamily: isArabic ? undefined : 'Branding, sans-serif' }}
    >
      <ResourceHeader lang={lang} onLangChange={setLang} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {t.hubLabel}
            </span>
            <h2 className="text-3xl font-extrabold mt-1 text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t.subtitle}
            </p>
          </div>
          <Link
            href="/resources"
            className="self-start sm:self-center inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            {t.backBtn}
          </Link>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <span className={`absolute inset-y-0 ${isArabic ? 'left-3' : 'right-3'} flex items-center pr-3 pointer-events-none text-gray-400`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                isArabic ? 'pl-10' : 'pr-10'
              }`}
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {t.allFilter}
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {t.categories[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          /* Premium Skeleton Loader */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-24"></div>
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-8"></div>
                </div>
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mt-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex-1"></div>
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{t.noResults}</p>
          </div>
        ) : (
          /* Materials Categories */
          <div className="space-y-16">
            {CATEGORY_ORDER.map((catKey) => {
              if (filterCategory !== 'all' && filterCategory !== catKey) return null;
              
              const catMaterials = groupedMaterials[catKey];
              if (!catMaterials || catMaterials.length === 0) return null;
              
              return (
                <div key={catKey} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {t.categories[catKey]}
                    </h3>
                    <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {catMaterials.map((item) => {
                      const copy = item.translations[lang] || item.translations.en || {};
                      return (
                        <div
                          key={item.key}
                          className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                          {/* Backdrop Glow */}
                          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          
                          <div>
                            {/* Badge */}
                            <div className="flex items-center justify-between mb-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                                item.type === 'pdf'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                  : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              }`}>
                                {t.typeLabels[item.type]}
                              </span>
                              <span className="text-gray-400 dark:text-gray-600">
                                {item.type === 'pdf' ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                )}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {copy.title}
                            </h3>
                            
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                              {copy.description}
                            </p>
                          </div>

                          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Link
                              href={item.href}
                              className="flex-1 inline-flex justify-center items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                            >
                              {t.viewBtn}
                            </Link>
                            <a
                              href={item.file}
                              download={item.downloadName}
                              onClick={() => handleDownloadTrack(item)}
                              className="flex-1 inline-flex justify-center items-center rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all"
                            >
                              {t.downloadBtn}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
