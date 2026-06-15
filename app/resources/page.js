"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Noto_Sans_Arabic } from 'next/font/google';
import { trackEvent } from '../../lib/analytics';
import ResourceHeader from './ResourceHeader';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const resourceSections = [
  {
    key: 'coreServices',
    titleKey: 'coreServices',
    entries: [
      { key: 'map', href: '/service-mapping', highlight: true },
      { key: 'iecMaterials', href: '/iec-materials', highlight: true },
    ],
  },
  {
    key: 'wfpRegistration',
    titleKey: 'wfpRegistration',
    entries: [
      {
        key: 'wfpRegistration',
        href: 'https://pal.beneficiaryregistration.cbt.wfp.org/form/landing',
        external: true,
      },
    ],
  },
];

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem('selectedLang') || 'ar';
};

const translations = {
  en: {
    hubLabel: 'ACTED Resource Hub',
    title: 'Choose a resource to explore',
    subtitle: 'Access operational tools, awareness materials, and the live service mapping experience in one place.',
    switchLabel: 'العربية',
    sections: {
      coreServices: 'Interactive Platforms & Awareness',
      wfpRegistration: 'WFP Registration for Aid',
    },
    resources: {
      map: {
        title: 'Service Mapping Platform',
        description: 'Explore the interactive map of critical services, response sites, and local service providers.',
      },
      iecMaterials: {
        title: 'IEC Educational Materials',
        description: 'Access the complete catalog of educational flyers, awareness posters, and hygiene guidelines.',
      },
      wfpRegistration: {
        title: 'WFP Registration for Aid',
        description: 'Open the WFP beneficiary registration form for aid assistance.',
        support: 'Questions or complaints: 1800124126',
      },
    },
  },
  ar: {
    hubLabel: 'بوابة موارد أكتد',
    title: 'اختر مادة لعرضها',
    subtitle: 'وصول سريع إلى أدوات التشغيل، المواد التوعوية، ومنصة خريطة الخدمات التفاعلية.',
    switchLabel: 'English',
    sections: {
      coreServices: 'الخدمات التفاعلية والتوعية',
      wfpRegistration: 'التسجيل للحصول على المساعدة من برنامج الأغذية العالمي',
    },
    resources: {
      map: {
        title: 'منصة خريطة الخدمات',
        description: 'استكشف الخريطة التفاعلية للخدمات الحيوية، مواقع الاستجابة، ومزودي الخدمات المحليين.',
      },
      iecMaterials: {
        title: 'المواد التثقيفية والتوعوية',
        description: 'تصفح وحمل النشرات التثقيفية وملصقات التوعية وإرشادات النظافة الصحية والوقاية.',
      },
      wfpRegistration: {
        title: 'التسجيل للحصول على المساعدة من برنامج الأغذية العالمي',
        description: 'افتح نموذج تسجيل المستفيدين الخاص ببرنامج الأغذية العالمي للحصول على المساعدة.',
        support: 'للأسئلة أو الشكاوى: 1800124126',
      },
    },
  },
};

export default function ResourcesLandingPage() {
  const [lang, setLang] = useState(() => getStoredLanguage());
  const [isMobile, setIsMobile] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('selectedLang', lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const trackHubClick = (sectionKey, entryKey, href, external = false) => {
    trackEvent('resource_hub_link_click', {
      section: sectionKey,
      resource_key: entryKey,
      destination: href,
      destination_type: external ? 'external' : 'internal',
    });
  };

  return (
    <div
      className={`min-h-screen bg-zinc-50 dark:bg-black text-gray-900 dark:text-gray-100 ${lang === 'ar' ? `rtl ${notoArabic.className}` : ''}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ fontFamily: lang === 'ar' ? undefined : 'Branding, sans-serif' }}
    >
      <ResourceHeader lang={lang} onLangChange={setLang} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">{t.hubLabel}</p>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">{t.title}</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center">{t.subtitle}</p>

        <div className="space-y-10">
          {resourceSections.map(({ key, titleKey, entries }) => (
            <section key={key}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.sections[titleKey]}</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {entries.map(({ key: entryKey, href, external, highlight }) => {
                  const cardStyle = highlight
                    ? "group relative rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-md transition-all hover:-translate-y-1.5 hover:shadow-xl overflow-hidden border-t-4 border-t-blue-600"
                    : "group rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg";

                  return external ? (
                    <a
                      key={entryKey}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackHubClick(key, entryKey, href, true)}
                      className={cardStyle}
                    >
                      {/* Accent glow for highlighted cards */}
                      {highlight && (
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t.resources[entryKey].title}</h4>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors text-lg font-bold">
                          {lang === 'ar' ? '←' : '→'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.resources[entryKey].description}</p>
                      {t.resources[entryKey].support && (
                        <p className="mt-4 text-xs font-semibold text-blue-700 dark:text-blue-300">{t.resources[entryKey].support}</p>
                      )}
                    </a>
                  ) : (
                    <Link
                      key={entryKey}
                      href={href}
                      onClick={() => trackHubClick(key, entryKey, href, false)}
                      className={cardStyle}
                    >
                      {/* Accent glow for highlighted cards */}
                      {highlight && (
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      )}

                      <div className="flex items-center justify-between">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t.resources[entryKey].title}</h4>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors text-lg font-bold">
                          {lang === 'ar' ? '←' : '→'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.resources[entryKey].description}</p>
                      {t.resources[entryKey].support && (
                        <p className="mt-4 text-xs font-semibold text-blue-700 dark:text-blue-300">{t.resources[entryKey].support}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
