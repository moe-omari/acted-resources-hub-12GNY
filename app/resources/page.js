"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Noto_Sans_Arabic } from 'next/font/google';
import { trackEvent } from '../../lib/analytics';
import ResourceHeader from './ResourceHeader';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const resourceSections = [
  {
    key: 'mapApp',
    titleKey: 'mapApp',
    entries: [
      { key: 'map', href: '/service-mapping' },
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
  {
    key: 'iecMaterials',
    titleKey: 'iecMaterials',
    entries: [
      { key: 'poster', href: '/resources/poster-cleaning' },
      { key: 'latrine', href: '/resources/latrine-pits-flyer' },
      { key: 'dbm', href: '/resources/dead-body-management' },
      { key: 'handwashing', href: '/resources/handwashing-flyer' },
      { key: 'psea', href: '/resources/psea-no-excuse' },
      { key: 'floodPrevention', href: '/resources/flood-prevention' },
      { key: 'vectorControl', href: '/resources/vector-control' },
      { key: 'rodentControl', href: '/resources/rodent-control' },
      { key: 'foodHygieneKids', href: '/resources/food-hygiene-children' },
      { key: 'bodyCareKids', href: '/resources/body-care-children' },
      { key: 'safeWaterChain', href: '/resources/safe-water-chain' },
      { key: 'skinDiseasesAwd', href: '/resources/skin-diseases-awd' },
      { key: 'latrineDecommission', href: '/resources/latrine-decommissioning-guidelines' },
      { key: 'washCommunityEngagement', href: '/resources/wash-community-engagement' },
      { key: 'hpFlipChart', href: '/resources/hp-flip-chart' },
      { key: 'winterizationFlyer', href: '/resources/winterization-flyer' },
      { key: 'infectionPreventionBasics', href: '/resources/infection-prevention-basics' },
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
      mapApp: 'Service Mapping App',
      wfpRegistration: 'WFP Registration for Aid',
      iecMaterials: 'IEC Materials',
    },
    resources: {
      map: {
        title: 'Service Mapping Platform',
        description: 'Explore the interactive map of critical services and response sites.',
      },
      wfpRegistration: {
        title: 'WFP Registration for Aid',
        description: 'Open the WFP beneficiary registration form for aid assistance.',
        support: 'Questions or complaints: 1800124126',
      },
      poster: {
        title: 'Poster: Cleaning of Jerry Cans',
        description: 'Awareness poster outlining proper cleaning steps for jerry cans.',
      },
      latrine: {
        title: 'Flyer: Closing Latrine Pits',
        description: 'Guidance flyer on safely closing filled latrine pits.',
      },
      dbm: {
        title: 'Dead Body Management',
        description: 'Visual reference for respectful and safe dead body management.',
      },
      handwashing: {
        title: 'Handwashing Flyer',
        description: 'Key handwashing steps to reduce disease transmission.',
      },
      psea: {
        title: 'PSEA – No Excuse',
        description: 'Protection from Sexual Exploitation and Abuse awareness material.',
      },
      floodPrevention: {
        title: 'Flood Prevention Poster',
        description: 'Preparation steps to protect shelters and belongings during heavy rains.',
      },
      vectorControl: {
        title: 'Vector Control Guide',
        description: 'Key actions to reduce disease-carrying insects around shelters.',
      },
      rodentControl: {
        title: 'Rodent Control (Arabic Poster)',
        description: 'Arabic illustrated guidance to limit rodent risks around shelters and food storage.',
      },
      foodHygieneKids: {
        title: 'Food Hygiene for Children',
        description: 'Kid-friendly tips for safe food handling and eating habits.',
      },
      bodyCareKids: {
        title: 'Body Care for Children',
        description: 'Illustrated hygiene routine that encourages children to care for themselves.',
      },
      safeWaterChain: {
        title: 'Safe Water Chain',
        description: 'Checklist for collecting, transporting, and storing safe water.',
      },
      skinDiseasesAwd: {
        title: 'Skin Diseases & AWD',
        description: 'Awareness sheet on preventing skin infections and acute watery diarrhea.',
      },
      latrineDecommission: {
        title: 'Latrine Decommissioning Guide',
        description: 'Steps to safely close open pits and retire latrines.',
      },
      washCommunityEngagement: {
        title: 'WASH Community Engagement',
        description: 'Facilitation tool to support participatory hygiene promotion.',
      },
      hpFlipChart: {
        title: 'Hygiene Promotion Flip Chart',
        description: 'Multi-topic flip chart for outreach teams and community sessions.',
      },
      winterizationFlyer: {
        title: 'Winterization Flyer',
        description: 'Protective measures for cold, windy, and wet conditions.',
      },
      infectionPreventionBasics: {
        title: 'Infection Prevention Basics',
        description: 'Core precautions to limit the spread of infection.',
      },
    },
  },
  ar: {
    hubLabel: 'بوابة موارد أكتد',
    title: 'اختر مادة لعرضها',
    subtitle: 'وصول سريع إلى أدوات التشغيل، المواد التوعوية، ومنصة خريطة الخدمات التفاعلية.',
    switchLabel: 'English',
    sections: {
      mapApp: 'منصة خريطة الخدمات',
      wfpRegistration: 'التسجيل للحصول على المساعدة من برنامج الأغذية العالمي',
      iecMaterials: 'مواد التوعية (IEC)',
    },
    resources: {
      map: {
        title: 'منصة خريطة الخدمات',
        description: 'استكشف الخريطة التفاعلية للخدمات الحيوية ومواقع الاستجابة.',
      },
      wfpRegistration: {
        title: 'التسجيل للحصول على المساعدة من برنامج الأغذية العالمي',
        description: 'افتح نموذج تسجيل المستفيدين الخاص ببرنامج الأغذية العالمي للحصول على المساعدة.',
        support: 'للأسئلة أو الشكاوى: 1800124126',
      },
      poster: {
        title: 'ملصق تنظيف جرار المياه',
        description: 'ملصق توعوي يوضح خطوات تنظيف جرار المياه بشكل آمن.',
      },
      latrine: {
        title: 'نشرة إغلاق حفر المراحيض',
        description: 'إرشادات حول إغلاق حفر المراحيض الممتلئة بطريقة آمنة.',
      },
      dbm: {
        title: 'إدارة الجثث',
        description: 'مرجع بصري سريع لإدارة الجثث بشكل محترم وآمن.',
      },
      handwashing: {
        title: 'نشرة غسل اليدين',
        description: 'خطوات غسل اليدين الأساسية لتقليل انتقال الأمراض.',
      },
      psea: {
        title: 'لا تبرير للعنف الجنسي',
        description: 'مادة توعوية حول الحماية من الاستغلال والاعتداء الجنسي.',
      },
      floodPrevention: {
        title: 'ملصق الوقاية من الفيضانات',
        description: 'خطوات للاستعداد للأمطار الغزيرة وحماية المأوى والمقتنيات.',
      },
      vectorControl: {
        title: 'دليل مكافحة النواقل',
        description: 'إرشادات للحد من الحشرات الناقلة للأمراض داخل وحول المخيم.',
      },
      rodentControl: {
        title: 'الدليل الشامل لمكافحة القوارض',
        description: 'ملصق توعوي بالعربية للحد من مخاطر القوارض حول الملاجئ ومناطق التخزين.',
      },
      foodHygieneKids: {
        title: 'نظافة الغذاء للأطفال',
        description: 'نصائح مبسطة للأطفال لتحضير وتناول الطعام بصورة آمنة.',
      },
      bodyCareKids: {
        title: 'العناية بالجسم للأطفال',
        description: 'روتين نظافة مصور يشجع الأطفال على العناية بأنفسهم.',
      },
      safeWaterChain: {
        title: 'سلسلة المياه الآمنة',
        description: 'قائمة تحقق لضمان سلامة جمع ونقل وتخزين المياه.',
      },
      skinDiseasesAwd: {
        title: 'الأمراض الجلدية والإسهال المائي الحاد',
        description: 'ورقة توعوية للوقاية من التهابات الجلد والإسهال الحاد.',
      },
      latrineDecommission: {
        title: 'دليل إغلاق الحفر المفتوحة',
        description: 'خطوات مفصلة لإغلاق الحفر المفتوحة وإخراج المراحيض من الخدمة بأمان.',
      },
      washCommunityEngagement: {
        title: 'التواصل المجتمعي في مجال المياه والإصحاح',
        description: 'أداة لدعم الأنشطة التشاركية في التوعية الصحية.',
      },
      hpFlipChart: {
        title: 'مواضيع توعوية صحية',
        description: 'مجموعة شرائح مرئية لتمرير رسائل متعددة خلال الجلسات.',
      },
      winterizationFlyer: {
        title: 'نشرة الاستعداد للشتاء',
        description: 'توصيات للحماية من الأمطار والبرد خلال موسم الشتاء.',
      },
      infectionPreventionBasics: {
        title: 'أساسيات الوقاية من العدوى',
        description: 'الاحتياطات الأساسية للحد من انتشار العدوى.',
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
                {entries.map(({ key: entryKey, href, external }) => (
                  external ? (
                    <a
                      key={entryKey}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackHubClick(key, entryKey, href, true)}
                      className="group rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">{t.resources[entryKey].title}</h4>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors text-lg">
                          {lang === 'ar' ? '←' : '→'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t.resources[entryKey].description}</p>
                      {t.resources[entryKey].support && (
                        <p className="mt-4 text-sm font-semibold text-blue-700 dark:text-blue-300">{t.resources[entryKey].support}</p>
                      )}
                    </a>
                  ) : (
                    <Link
                      key={entryKey}
                      href={href}
                      onClick={() => trackHubClick(key, entryKey, href, false)}
                      className="group rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">{t.resources[entryKey].title}</h4>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors text-lg">
                          {lang === 'ar' ? '←' : '→'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t.resources[entryKey].description}</p>
                      {t.resources[entryKey].support && (
                        <p className="mt-4 text-sm font-semibold text-blue-700 dark:text-blue-300">{t.resources[entryKey].support}</p>
                      )}
                    </Link>
                  )
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
