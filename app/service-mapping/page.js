'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Noto_Sans_Arabic } from 'next/font/google';
import { trackEvent } from '../../lib/analytics';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const DEFAULT_MAP_CENTER = [31.4, 34.32];
const DEFAULT_MAP_ZOOM = 12;
const USER_LOCATION_ZOOM = 13;
const SERVICE_FOCUS_ZOOM = 16;
const DEFAULT_GAZA_BOUNDS = [
  [31.2, 34.2],
  [31.62, 34.58],
];
const GEOLOCATION_ERROR_CODES = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};
const SITE_BOUNDARY_FILES = [
  '/maps/Site Extent - North.json',
  '/maps/Site Extent - South.json',
  '/maps/IOM_new_selected_20_Sites_GAZA_City.json',
];
const DEFAULT_BOUNDARY_STROKE = '#0f766e';
const DEFAULT_BOUNDARY_FILL = '#14b8a6';
const LOW_VISIBILITY_BOUNDARY_COLORS = new Set(['#ffea00', '#ffff00', '#ffd700']);

// Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
// });

// Fix for broken routing destination/waypoint icons
// if (typeof window !== 'undefined' && L && L.Routing && L.Routing.Control) {
//   const greenIcon = new L.Icon({
//     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
//     iconSize: [25, 41],
// iconAnchor: [12, 41],
// popupAnchor: [1, -34],
// shadowSize: [41, 41],
// });
// L.Routing.Control.prototype.options.waypointIcon = function() {
//   return greenIcon;
// };
// }

// Define marker colors for different service types
const getColorFromService = (serviceName) => {
  console.log('Service name:', serviceName);
  const lowerName = serviceName.toLowerCase();
  let color;
  if (lowerName.includes('water trucking') && lowerName.includes('distribution point')) color = '#1e90ff';
  else if (lowerName.startsWith('water trucking')) color = '#1e90ff';
  else if (lowerName.includes('health space') && lowerName.includes('clinic')) color = '#ff4444';
  else if (lowerName.startsWith('health space/clinic')) color = '#ff4444';
  else if (lowerName.includes('community kitchen')) color = '#ff8800';
  else if (lowerName.startsWith('community kitchen')) color = '#ff8800';
  else if (lowerName.includes('bakery')) color = '#b45309';
  else if (lowerName.includes('tls') || lowerName.includes('school')) color = '#9933ff';
  else if (lowerName.includes('community space')) color = '#4BB272';
  else if (
    lowerName.includes('wgss') || 
    lowerName.includes('women and girls') || 
    lowerName.startsWith('safe spaces for women and girls') ||
    lowerName.includes('للنساء والفتيات') ||
    lowerName.includes('النساء والفتيات') ||
    lowerName.includes('مساحات آمنة للنساء') ||
    lowerName.includes('مساحة آمنة للنساء')
  ) {
    color = '#ec4899'; // Pink
  }
  else if (lowerName.includes('safe space') || lowerName.includes('مساحة آمنة')) color = '#ec4899'; // Pink
  else if (lowerName.includes('nutrition center') || lowerName.includes('nutrition centre')) color = '#fbbf24';
  else if (lowerName.includes('distribution point')) color = '#545454';
  else if (lowerName.includes('social activity')) color = '#93c01f';
  else color = '#808080'; // default gray
  console.log('Assigned color:', color);
  return color;
};

const createHealthIcon = (L, color = '#ff4444') => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
      <path class="marker-glow" fill="none" stroke="var(--marker-glow-color, transparent)" stroke-width="var(--marker-glow-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-outline" fill="none" stroke="var(--marker-outline-color, transparent)" stroke-width="var(--marker-outline-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-shape" fill="${color}" stroke="var(--marker-stroke-color, #fff)" stroke-width="var(--marker-stroke-width, 1.5)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z"/>
      <image href="/assets/medical.png" x="6" y="6" width="12" height="12" style="filter: brightness(0) invert(1)" />
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'custom-marker-icon',
  });
};

const getMarkerIcon = (L, serviceName) => {
  const color = getColorFromService(serviceName);
  const type = getServiceType(serviceName);

  if (type === 'Health Space/Clinic') {
    return createHealthIcon(L, color);
  }

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
      <path class="marker-glow" fill="none" stroke="var(--marker-glow-color, transparent)" stroke-width="var(--marker-glow-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-outline" fill="none" stroke="var(--marker-outline-color, transparent)" stroke-width="var(--marker-outline-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-shape" fill="${color}" stroke="var(--marker-stroke-color, #fff)" stroke-width="var(--marker-stroke-width, 1.5)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z"/>
      <circle cx="12" cy="9" r="3" fill="#fff"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'custom-marker-icon',
  });
};

const getStripedMarkerIcon = (L, colors) => {
  console.log('Striped marker colors:', colors);
  const numStripes = colors.length;
  const uniqueId = Math.random().toString(36).substr(2, 9);

  let stops = '';
  for (let i = 0; i < numStripes; i++) {
    const startPercent = (i / numStripes) * 100;
    const endPercent = ((i + 1) / numStripes) * 100;
    stops += `<stop offset="${startPercent}%" style="stop-color:${colors[i]};stop-opacity:1" />`;
    stops += `<stop offset="${endPercent}%" style="stop-color:${colors[i]};stop-opacity:1" />`;
  }

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
      <defs>
        <linearGradient id="gradient${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
          ${stops}
        </linearGradient>
      </defs>
      <path class="marker-glow" fill="none" stroke="var(--marker-glow-color, transparent)" stroke-width="var(--marker-glow-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-outline" fill="none" stroke="var(--marker-outline-color, transparent)" stroke-width="var(--marker-outline-width, 0)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" />
      <path class="marker-shape" fill="url(#gradient${uniqueId})" stroke="var(--marker-stroke-color, #fff)" stroke-width="var(--marker-stroke-width, 1.5)" d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z"/>
      <circle cx="12" cy="9" r="3" fill="#fff"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'custom-marker-icon',
  });
};

const getUniqueServiceColors = (servicesAtLocation = []) => {
  const seenServiceTypes = new Set();
  const uniqueColors = [];

  servicesAtLocation.forEach((service) => {
    const serviceType = getServiceType(service?.name || '');
    if (seenServiceTypes.has(serviceType)) return;

    seenServiceTypes.add(serviceType);
    uniqueColors.push(getColorFromService(service?.name || ''));
  });

  return uniqueColors;
};

// Get service type from name
const getServiceType = (serviceName = '') => {
  const normalized = serviceName.toLowerCase();
  if (normalized.startsWith('water trucking')) return 'Water Trucking - Distribution Point';
  if (normalized.startsWith('health space/clinic')) return 'Health Space/Clinic';
  if (normalized.startsWith('community kitchen')) return 'Community Kitchen/Tekeya';
  if (normalized.startsWith('bakery')) return 'Bakery';
  if (normalized.startsWith('tls/school')) return 'TLS/School';
  if (normalized.startsWith('community space')) return 'Community Space';
  if (
    normalized.includes('wgss') || 
    normalized.includes('women and girls') || 
    normalized.startsWith('safe spaces for women and girls') ||
    normalized.includes('للنساء والفتيات') ||
    normalized.includes('النساء والفتيات') ||
    normalized.includes('مساحات آمنة للنساء') ||
    normalized.includes('مساحة آمنة للنساء')
  ) {
    return 'Safe Spaces for Women and Girls (WGSS)';
  }
  if (normalized.startsWith('safe space') || normalized.includes('مساحة آمنة') || normalized.includes('مساحات آمنة')) return 'Safe space';
  if (normalized.startsWith('nutrition center') || normalized.startsWith('nutrition centre')) return 'Nutrition Center';
  if (normalized.startsWith('distribution point')) return 'Distribution Point';
  if (normalized.startsWith('social activity')) return 'Social Activity';
  return 'Other';
};

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem('selectedLang') || 'ar';
};

const normalizeLookupKey = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ');
};

const normalizeServiceTranslationKey = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[|]+/g, ' - ')
    .replace(/\s*[-:()]\s*/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ');
};

const normalizeDescriptionTranslationKey = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ');
};

// Shared translations for every service label to keep UI output consistent across languages
const rawServiceTranslations = [
  {
    key: 'Community Space',
    en: 'Community Space',
    ar: 'مساحة مجتمعية',
  },
  {
    key: 'Bakery',
    en: 'Bakery',
    ar: 'مخبز',
  },
  {
    key: 'Safe space',
    en: 'Safe space',
    ar: 'مساحة آمنة',
  },
  {
    key: 'Safe Spaces for Women and Girls (WGSS)',
    en: 'Safe Spaces for Women and Girls (WGSS)',
    ar: 'مساحات آمنة للنساء والفتيات (WGSS)',
    aliases: ['Safe Spaces for Women and Girls', 'مساحات آمنة للنساء والفتيات', 'مساحة آمنة للنساء والفتيات', 'Safe Spaces for women and girls (WGSS)', 'مساحات آمنة للنساء والفتيات (WGSS)']
  },
  {
    key: 'Community Kitchen/Tekeya',
    en: 'Community Kitchen/Tekeya',
    ar: 'مطبخ مجتمعي',
  },
  {
    key: 'Community Kitchen ( Abo Zaid)',
    en: 'Community Kitchen (Abo Zaid)',
    ar: 'مطبخ مجتمعي (أبو زيد)',
  },
  {
    key: 'Community Kitchen ( Thaqafa w Fakr Al hor )',
    en: 'Community Kitchen (Thaqafa w Fakr Al Hor)',
    ar: 'مطبخ مجتمعي (ثقافة وفكر الحر)',
  },
  {
    key: 'Community Kitchen (Tekeya) - Al-Fares Al-Shahem',
    en: 'Community Kitchen (Tekeya) - Al-Fares Al-Shahem',
    ar: 'مطبخ مجتمعي (تكية) - الفارس الشهم',
  },
  {
    key: 'Community Kitchen (Tekeya) - Rahma Around the world',
    en: 'Community Kitchen (Tekeya) - Rahma Around the World',
    ar: 'مطبخ مجتمعي (تكية) - رحمة حول العالم',
  },
  {
    key: 'Community Kitchen (Tekeya) - WCK',
    en: 'Community Kitchen (Tekeya) - World Central Kitchen (WCK)',
    ar: 'مطبخ مجتمعي (تكية) - WCK',
  },
  {
    key: 'Community Kitchen (Tekeya) - Wafaa Al-Mohsineen',
    en: 'Community Kitchen (Tekeya) - Wafaa Al-Mohsineen',
    ar: 'مطبخ مجتمعي (تكية) - وفاء المحسنين',
  },
  {
    key: 'Community Kitchen - Dar Al-Kitab & Al-Sunna',
    en: 'Community Kitchen - Dar Al-Kitab & Al-Sunna',
    ar: 'مطبخ مجتمعي - دار الكتاب والسنة',
  },
  {
    key: 'Community Kitchen - Future Youth Kitchen',
    en: 'Community Kitchen - Future Youth Kitchen',
    ar: 'مطبخ مجتمعي - مطبخ شباب المستقبل',
  },
  {
    key: 'Community Kitchen - Tekeya',
    en: 'Community Kitchen - Tekeya',
    ar: 'مطبخ مجتمعي (تكية)',
    aliases: ['Community Kitchen Tekeya'],
  },
  {
    key: 'Community Kitchen - Tekeya (WCK)',
    en: 'Community Kitchen - Tekeya (World Central Kitchen - WCK)',
    ar: 'مطبخ مجتمعي (تكية) - WCK',
  },
  {
    key: 'Community Kitchen - Tekeya - Al-Aydy Al-Raheema',
    en: 'Community Kitchen - Tekeya - Al-Aydy Al-Raheema',
    ar: 'مطبخ مجتمعي (تكية) - الأيادي الرحيمة',
  },
  {
    key: 'Community Kitchen - Tekeya - Basmat Amal Site',
    en: 'Community Kitchen - Tekeya - Basmat Amal Site',
    ar: 'مطبخ مجتمعي (تكية) - موقع بسمة أمل',
  },
  {
    key: 'Community Kitchen - Tekeya - WCK',
    en: 'Community Kitchen - Tekeya - World Central Kitchen (WCK)',
    ar: 'مطبخ مجتمعي (تكية) - WCK',
  },
  {
    key: 'Community Kitchen - Tekeya - WCK - Save Youth Future Society (SYFS)',
    en: 'Community Kitchen - Tekeya - World Central Kitchen (WCK) - Save Youth Future Society (SYFS)',
    ar: 'مطبخ مجتمعي (تكية) - WCK - جمعية شباب المستقبل (SYFS)',
  },
  {
    key: 'Community Kitchen - WCK',
    en: 'Community Kitchen - World Central Kitchen (WCK)',
    ar: 'مطبخ مجتمعي - WCK',
  },
  {
    key: 'Distribution Point',
    en: 'Distribution Point',
    ar: 'نقطة توزيع',
  },
  {
    key: 'Health Space/Clinic',
    en: 'Health Space/Clinic',
    ar: 'مساحة صحية / عيادة',
    aliases: ['Health Space/Clinic '],
  },
  {
    key: 'Health Space/Clinic (Ard Al-Insan)',
    en: 'Health Space/Clinic - Ard Al-Insan',
    ar: 'مساحة صحية / عيادة - أرض الإنسان',
  },
  {
    key: 'Health Space/Clinic - Abdelshafi Org',
    en: 'Health Space/Clinic - Abdelshafi Organization',
    ar: 'مساحة صحية / عيادة - مؤسسة عبد الشافي',
  },
  {
    key: 'Health Space/Clinic - IMC',
    en: 'Health Space/Clinic - International Medical Corps (IMC)',
    ar: 'مساحة صحية / عيادة - اللجنة الطبية الدولية (IMC)',
  },
  {
    key: 'Health Space/Clinic - Lavender Clinic',
    en: 'Health Space/Clinic - Lavender Clinic',
    ar: 'مساحة صحية / عيادة - عيادة لافندر',
  },
  {
    key: 'Health Space/Clinic - PRCS',
    en: 'Health Space/Clinic - Palestine Red Crescent Society (PRCS)',
    ar: 'مساحة صحية / عيادة - الهلال الأحمر الفلسطيني',
  },
  {
    key: 'Health Space/Clinic - Project Hoppe',
    en: 'Health Space/Clinic - Project Hoppe',
    ar: 'مساحة صحية / عيادة - مشروع هوبه',
  },
  {
    key: 'Health Space/Clinic - Rahma Around the world',
    en: 'Health Space/Clinic - Rahma Around the World',
    ar: 'مساحة صحية / عيادة - رحمة حول العالم',
  },
  {
    key: 'Health Space/Clinic - Al-Shifa Hospital - phone need to edit',
    en: 'Health Space/Clinic - Al-Shifa Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الشفاء',
  },
  {
    key: 'Health Space/Clinic - Public Aid Hospital',
    en: 'Health Space/Clinic - Public Aid Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الإغاثة العامة',
  },
  {
    key: 'Health Space/Clinic - IMC Field Hospital',
    en: 'Health Space/Clinic - IMC Field Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى ميداني (اللجنة الطبية الدولية)',
  },
  {
    key: 'Health Space/Clinic - Al-Aqsa Hospital',
    en: 'Health Space/Clinic - Al-Aqsa Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الأقصى',
  },
  {
    key: 'Health Space/Clinic - Al-Awda Hospital - Nuseirat',
    en: 'Health Space/Clinic - Al-Awda Hospital - Nuseirat',
    ar: 'مساحة صحية / عيادة - مستشفى العودة - النصيرات',
  },
  {
    key: 'Health Space/Clinic - ICRC Field Hospital',
    en: 'Health Space/Clinic - ICRC Field Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى ميداني (اللجنة الدولية للصليب الأحمر)',
  },
  {
    key: 'Health Space/Clinic - UK Med Field Hospital',
    en: 'Health Space/Clinic - UK Med Field Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى ميداني UK Med',
  },
  {
    key: 'Health Space/Clinic - Nasser Hospital',
    en: 'Health Space/Clinic - Nasser Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى ناصر',
  },
  {
    key: 'Health Space/Clinic - MSF B Field Hospital Al-Zuwaida',
    en: 'Health Space/Clinic - MSF B Field Hospital Al-Zuwaida',
    ar: 'مساحة صحية / عيادة - مستشفى ميداني أطباء بلا حدود (بلجيكا) - الزوايدة',
  },
  {
    key: 'Health Space/Clinic - PRCS Saraya Field Hospital Gaza City',
    en: 'Health Space/Clinic - PRCS Saraya Field Hospital Gaza City',
    ar: 'مساحة صحية / عيادة - مستشفى السرايا الميداني للهلال الأحمر الفلسطيني - غزة',
  },
  {
    key: 'Health Space/Clinic - PRCS Al-Quds Hospital Gaza City',
    en: 'Health Space/Clinic - PRCS Al-Quds Hospital Gaza City',
    ar: 'مساحة صحية / عيادة - مستشفى القدس للهلال الأحمر الفلسطيني - غزة',
  },
  {
    key: 'Health Space/Clinic - Patient Friends Benevolent Society',
    en: 'Health Space/Clinic - Patient Friends Benevolent Society',
    ar: 'مساحة صحية / عيادة - جمعية أصدقاء المريض الخيرية',
  },
  {
    key: 'Health Space/Clinic - Kuwaiti Field Hospital Heal Palestine',
    en: 'Health Space/Clinic - Kuwaiti Field Hospital Heal Palestine',
    ar: 'مساحة صحية / عيادة - المستشفى الميداني الكويتي (Heal Palestine)',
  },
  {
    key: 'Health Space/Clinic - PRCS field hospital Mawasi Khan Younis',
    en: 'Health Space/Clinic - PRCS Field Hospital Mawasi Khan Younis',
    ar: 'مساحة صحية / عيادة - مستشفى الهلال الأحمر الميداني - مواصي خان يونس',
  },
  {
    key: 'Health Space/Clinic - Al-Amal Hospital',
    en: 'Health Space/Clinic - Al-Amal Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الأمل',
  },
  {
    key: 'Health Space/Clinic - MSF Belgium - PHCC',
    en: 'Health Space/Clinic - MSF Belgium - PHCC',
    ar: 'مساحة صحية / عيادة - أطباء بلا حدود (بلجيكا) - مركز رعاية صحية أولية',
  },
  {
    key: 'Health Space/Clinic - Kamal Adwan',
    en: 'Health Space/Clinic - Kamal Adwan Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى كمال عدوان',
  },
  {
    key: 'Health Space/Clinic - Al Karama',
    en: 'Health Space/Clinic - Al Karama Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الكرامة',
  },
  {
    key: 'Health Space/Clinic - Mohamed Al Durrah Hospital',
    en: 'Health Space/Clinic - Mohamed Al Durrah Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى محمد الدرة',
  },
  {
    key: 'Health Space/Clinic - Al-Rantisi',
    en: 'Health Space/Clinic - Al-Rantisi Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الرنتيسي',
  },
  {
    key: 'Health Space/Clinic - Al Helou International Hospital',
    en: 'Health Space/Clinic - Al Helou International Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الحلو الدولي',
  },
  {
    key: 'Health Space/Clinic - Al Wafaa Rehabilitation Hospital',
    en: 'Health Space/Clinic - Al Wafaa Rehabilitation Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الوفاء للتأهيل',
  },
  {
    key: 'Health Space/Clinic - Assahaba Medical Complex',
    en: 'Health Space/Clinic - Assahaba Medical Complex',
    ar: 'مساحة صحية / عيادة - مجمع الصحابة الطبي',
  },
  {
    key: 'Health Space/Clinic - Al Ahli Arab Hospital',
    en: 'Health Space/Clinic - Al Ahli Arab Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الأهلي العربي',
  },
  {
    key: 'Health Space/Clinic - Haifa Charity Hospital',
    en: 'Health Space/Clinic - Haifa Charity Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى حيفا الخيري',
  },
  {
    key: 'Health Space/Clinic - St. John\'s Eye Hospital',
    en: 'Health Space/Clinic - St. John\'s Eye Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى سانت جون للعيون',
  },
  {
    key: 'Health Space/Clinic - Yaffa Hospital',
    en: 'Health Space/Clinic - Yaffa Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى يافا',
  },
  {
    key: 'Health Space/Clinic - Dar Essalam Hospital',
    en: 'Health Space/Clinic - Dar Essalam Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى دار السلام',
  },
  {
    key: 'Health Space/Clinic - Al-Khair Hospital',
    en: 'Health Space/Clinic - Al-Khair Hospital',
    ar: 'مساحة صحية / عيادة - مستشفى الخير',
  },
  {
    key: 'Health Space/Clinic - UNRWA',
    en: 'Health Space/Clinic - UNRWA',
    ar: 'مساحة صحية / عيادة - الأونروا',
  },
  {
    key: 'Health Space/Clinic Hospitals',
    en: 'Health Facilities / Hospitals',
    ar: 'مستشفيات / مساحات صحية',
  },
  {
    key: 'Nutrition Center',
    en: 'Nutrition Center',
    ar: 'مركز تغذية',
    aliases: ['Nutrition Centre'],
  },
  {
    key: 'Nutrition Center - Ard Al-Insan x IRC',
    en: 'Nutrition Center - Ard Al-Insan x IRC',
    ar: 'مركز تغذية - أرض الإنسان x IRC',
  },
  {
    key: 'Nutrition Center - Ard Al-Insan x WFP',
    en: 'Nutrition Center - Ard Al-Insan x WFP',
    ar: 'مركز تغذية - أرض الإنسان x برنامج الأغذية العالمي',
  },
  {
    key: 'Nutrition Center - Save the Children',
    en: 'Nutrition Center - Save the Children',
    ar: 'مركز تغذية - منظمة إنقاذ الطفل',
  },
  {
    key: 'Nutrition Center - WFP/UNICEF',
    en: 'Nutrition Center - WFP / UNICEF',
    ar: 'مركز تغذية - برنامج الأغذية العالمي / اليونيسف',
  },
  {
    key: 'Social Activity',
    en: 'Social Activity',
    ar: 'نشاط اجتماعي',
  },
  {
    key: 'TLS/School',
    en: 'Temporary Learning Space / School',
    ar: 'مساحة تعليمية مؤقتة / مدرسة',
  },
  {
    key: 'TLS/School ( AL Amal )',
    en: 'Temporary Learning Space / School - Al Amal',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - الأمل',
  },
  {
    key: 'TLS/School ( Al Mansy )',
    en: 'Temporary Learning Space / School - Al Mansy',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - المنسي',
  },
  {
    key: 'TLS/School (ECCD/SCI)',
    en: 'Temporary Learning Space / School (ECCD / Save the Children)',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - التنمية المبكرة / إنقاذ الطفل',
  },
  {
    key: 'TLS/School - Al-Amal',
    en: 'Temporary Learning Space / School - Al-Amal',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - الأمل',
  },
  {
    key: 'TLS/School - Al-Sahabah Organization',
    en: 'Temporary Learning Space / School - Al-Sahabah Organization',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - مؤسسة الصحابة',
  },
  {
    key: 'TLS/School - Dar Al-Kitab & Al-Sunna',
    en: 'Temporary Learning Space / School - Dar Al-Kitab & Al-Sunna',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - دار الكتاب والسنة',
  },
  {
    key: 'TLS/School - UN',
    en: 'Temporary Learning Space / School - United Nations',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - الأمم المتحدة',
  },
  {
    key: 'TLS/School - UNICEF',
    en: 'Temporary Learning Space / School - UNICEF',
    ar: 'مساحة تعليمية مؤقتة / مدرسة - اليونيسف',
  },
  {
    key: 'Water Trucking Distribution (MSF)',
    en: 'Water Trucking Distribution - Medecins Sans Frontieres (MSF)',
    ar: 'توزيع مياه - أطباء بلا حدود (MSF)',
  },
  {
    key: 'Water Trucking Distribution (We World)',
    en: 'Water Trucking Distribution - WeWorld',
    ar: 'توزيع مياه - وي وورلد',
  },
  {
    key: 'Water Trucking Distribution (Ø§ØµØ¯Ù‚Ø§Ø¡ Ø§Ù„Ø¨ÙŠØ¦Ø©)',
    en: 'Water Trucking Distribution - Friends of the Environment',
    ar: 'توزيع مياه - أصدقاء البيئة',
  },
  {
    key: 'Water Trucking - Distribution Point',
    en: 'Water Trucking - Distribution Point',
    ar: 'نقطة توزيع مياه',
    aliases: ['Water Trucking - Distribution point ', 'Water Trucking - distribution point'],
  },
  {
    key: 'Water Trucking - Distribution Point (Acted)',
    en: 'Water Trucking - Distribution Point - ACTED',
    ar: 'نقطة توزيع مياه - أكتد',
  },
  {
    key: 'Water Trucking - Distribution Point (MSF)',
    en: 'Water Trucking - Distribution Point - MSF',
    ar: 'نقطة توزيع مياه - أطباء بلا حدود',
  },
  {
    key: 'Water Trucking - Distribution Point - Al-Mukhtar Faisal',
    en: 'Water Trucking - Distribution Point - Al-Mukhtar Faisal',
    ar: 'نقطة توزيع مياه - المختار فيصل',
  },
  {
    key: 'Water Trucking - Distribution Point - Al-Ruhamaa` Site',
    en: 'Water Trucking - Distribution Point - Al-Ruhamaa Site',
    ar: 'نقطة توزيع مياه - موقع الرحماء',
  },
  {
    key: 'Water Trucking - Distribution Point - Basmat Amal Site',
    en: 'Water Trucking - Distribution Point - Basmat Amal Site',
    ar: 'نقطة توزيع مياه - موقع بسمة أمل',
  },
];

const servicesProvidedTranslations = rawServiceTranslations.reduce((acc, { key, en, ar, aliases = [] }) => {
  const keys = [key, ...aliases];
  keys.forEach((serviceKey) => {
    acc.en[serviceKey] = en || key;
    acc.ar[serviceKey] = ar || en || key;
    acc.en[normalizeServiceTranslationKey(serviceKey)] = en || key;
    acc.ar[normalizeServiceTranslationKey(serviceKey)] = ar || en || key;
  });
  return acc;
}, { en: {}, ar: {} });

const rawServiceNameTranslations = [
  { key: 'Al-AmalSchool  (Ya Hala)', en: 'Al-Amal School (Ya Hala)', ar: 'مدرسة الأمل (يا هلا)' },
  { key: 'Najah Despite Hope  Initiative', en: 'Najah Despite Hope Initiative', ar: 'مبادرة نجاح رغم الأمل' },
  { key: 'Al-Amal Medical  Institute Point', en: 'Al-Amal Medical Institute Point', ar: 'نقطة معهد الأمل الطبي' },
  { key: 'Hot Food Distribution  Point', en: 'Hot Food Distribution Point', ar: 'نقطة توزيع الطعام الساخن' },
  { key: 'Water Desalination  Station', en: 'Water Desalination Station', ar: 'محطة تحلية المياه' },
  { key: 'Potable Water  Distribution Point', en: 'Potable Water Distribution Point', ar: 'نقطة توزيع المياه الصالحة للشرب' },
  { key: 'Medical Point', en: 'Medical Point', ar: 'نقطة طبية' },
  { key: 'Educational Point', en: 'Educational Point', ar: 'نقطة تعليمية' },
  { key: 'Great Gaza Minds  School', en: 'Great Gaza Minds School', ar: 'مدرسة عقول غزة العظيمة' },
  { key: 'Educational Point:  Amal & Noor', en: 'Educational Point: Amal & Noor', ar: 'نقطة تعليمية: أمل ونور' },
  { key: 'Saline Water  Distribution Point', en: 'Saline Water Distribution Point', ar: 'نقطة توزيع المياه المالحة' },
  { key: 'Takiyya', en: 'Takiyya', ar: 'تكية' },
  { key: 'Aid distribution center', en: 'Aid Distribution Center', ar: 'مركز توزيع المساعدات' },
  { key: 'Nutrition Centre', en: 'Nutrition Center', ar: 'مركز تغذية' },
  { key: 'Bakery for bread in Bakar Yunis', en: 'Bakery for Bread in Bakar Yunis', ar: 'مخبز الخبز في بكر يونس' },
];

const serviceNameTranslations = rawServiceNameTranslations.reduce((acc, { key, en, ar }) => {
  acc.en[key] = en || key;
  acc.ar[key] = ar || en || key;
  acc.en[normalizeServiceTranslationKey(key)] = en || key;
  acc.ar[normalizeServiceTranslationKey(key)] = ar || en || key;
  return acc;
}, { en: {}, ar: {} });

const rawOrganizationTranslations = [
  { key: 'Maahad Al Amal for Orphans', en: 'Maahad Al Amal for Orphans', ar: 'معهد الأمل للأيتام' },
  { key: 'Turkish Phoenix Project', en: 'Turkish Phoenix Project', ar: 'مشروع طائر الفينيق التركي' },
  { key: 'Juthoor', en: 'Juthoor', ar: 'جمعية جذور' },
  { key: 'WCK', en: 'World Central Kitchen (WCK)', ar: 'منظمة الغذاء العالمي (WCK)' },
  { key: 'Apple Australia', en: 'Apple Australia', ar: 'أبل أستراليا' },
  { key: 'Ambulance and Emergency', en: 'Ambulance and Emergency', ar: 'الإسعاف والطوارئ' },
  { key: 'MSF', en: 'Médecins Sans Frontières (MSF)', ar: 'منظمة أطباء بلا حدود (MSF)' },
  { key: 'SWF', en: 'SWF', ar: 'مؤسسة SWF' },
  { key: 'CRS', en: 'Catholic Relief Services (CRS)', ar: 'منظمة الإغاثة الكاثوليكية (CRS)' },
  { key: 'Cesvi', en: 'Cesvi', ar: 'منظمة تشيزفي (Cesvi)' },
  { key: 'Initiators', en: 'Initiators', ar: 'مبادرة Initiators' },
  { key: 'Acted', en: 'Acted', ar: 'آكتد' },
  { key: 'PARC', en: 'Palestinian Agricultural Relief Committees (PARC)', ar: 'جمعية التنمية الزراعية (PARC)' },
  { key: 'Rahma Worldwide', en: 'Rahma Worldwide', ar: 'منظمة رحمة حول العالم' },
  { key: 'Personal volunteering by \nlocal teachers', en: 'Personal volunteering by local teachers', ar: 'تطوع شخصي من المعلمين المحليين' },
  { key: 'Personal volunteering by \nthe Al-Ghoul family', en: 'Personal volunteering by the Al-Ghoul family', ar: 'تطوع شخصي من عائلة الغول' },
  { key: 'Personal volunteering by \nthe subh family', en: 'Personal volunteering by the Subh family', ar: 'تطوع شخصي من عائلة صبح' },
  { key: 'Project HOPE', en: 'Project HOPE', ar: 'مشروع هوپ (Project HOPE)' },
  { key: 'HEAL Palestine & WCK', en: 'HEAL Palestine & WCK', ar: 'هيل فلسطين وWCK' },
  { key: 'Personal volunteering by \nthe Al-Ghoul family', en: 'Personal volunteering by the Al-Ghoul family', ar: 'تطوع شخصي من عائلة الغول' },
  { key: 'Personal volunteering by \nthe subh family', en: 'Personal volunteering by the Subh family', ar: 'تطوع شخصي من عائلة صبح' },
  { key: 'UNRWA', en: 'UNRWA', ar: 'الأونروا' },
  { key: 'Gaza Soup Kitchen', en: 'Gaza Soup Kitchen', ar: 'مطبخ غزة الخيري' },
  { key: 'Atyaf Al-Khair', en: 'Atyaf Al-Khair', ar: 'أطياف الخير' },
  { key: 'Save the Children', en: 'Save the Children', ar: 'منظمة أنقذوا الطفل' },
  { key: 'Doctors of the World – France', en: 'Doctors of the World – France', ar: 'أطباء العالم - فرنسا' },
  { key: 'AWDA', en: 'AWDA', ar: 'جمعية العودة الصحية (AWDA)' },
  { key: 'The Qatari Committee', en: 'The Qatari Committee', ar: 'اللجنة القطرية' },
  { key: 'NECC', en: 'Near East Council of Churches (NECC)', ar: 'لجنة الشرق الأدنى الكنسية (NECC)' },
  { key: 'Oxfam', en: 'Oxfam', ar: 'أوكسفام' },
  { key: 'ICRC', en: 'International Committee of the Red Cross (ICRC)', ar: 'اللجنة الدولية للصليب الأحمر (ICRC)' },
  { key: 'Palestinian Medical Relief Society', en: 'Palestinian Medical Relief Society', ar: 'جمعية الإغاثة الطبية الفلسطينية' },
  { key: 'National Rehabilitation Association', en: 'National Rehabilitation Association', ar: 'جمعية التأهيل الوطني' },
  { key: 'Abdel Shafi Community Health Association', en: 'Abdel Shafi Community Health Association', ar: 'جمعية عبد الشافي للصحة المجتمعية' },
  { key: 'Al-Najd Developmental Forum', en: 'Al-Najd Developmental Forum', ar: 'منتدى النجد التنموي' },
  { key: 'Center for Women\'s Legal Research Counseling and Protection', en: 'Center for Women\'s Legal Research Counseling and Protection', ar: 'مركز الأبحاث والاستشارات القانونية وحماية المرأة' },
  { key: 'Culture and Free Thought Association', en: 'Culture and Free Thought Association', ar: 'جمعية الثقافة والفكر الحر' },
  { key: 'International Medical Corps', en: 'International Medical Corps', ar: 'الهيئة الطبية الدولية' },
  { key: 'Palestine Association for Development and Justice', en: 'Palestine Association for Development and Justice', ar: 'جمعية فلسطين للتنمية والعدالة' },
  { key: 'Society of women graduates', en: 'Society of Women Graduates', ar: 'جمعية الخريجات الجامعيات' },
  { key: 'WEFAQ', en: 'WEFAQ', ar: 'وفاق' },
  { key: 'Women\'s Affairs Center', en: 'Women\'s Affairs Center', ar: 'مركز شؤون المرأة' },
  { key: 'Women\'s Affairs Technical Committee', en: 'Women\'s Affairs Technical Committee', ar: 'اللجنة الفنية لشؤون المرأة' },
];

const organizationTranslations = rawOrganizationTranslations.reduce((acc, { key, en, ar }) => {
  acc.en[key] = en || key;
  acc.ar[key] = ar || en || key;
  return acc;
}, { en: {}, ar: {} });

const rawDescriptionTranslations = [
  {
    key: '"Free medical point serving\n individuals once every two\n weeks per person \n(if a person receives services, \nthey can only benefit again after two weeks)."',
    en: 'Free medical point serving individuals once every two weeks per person. If a person receives services, they can only benefit again after two weeks.',
    ar: 'نقطة طبية مجانية تقدم الخدمة للفرد مرة واحدة كل أسبوعين. إذا استفاد الشخص من الخدمة، فلا يمكنه الاستفادة مرة أخرى إلا بعد أسبوعين.',
  },
  {
    key: '"A medical point inside the shelter\n center at Salah al-Din School targeting the entire area."',
    en: 'A medical point inside the shelter center at Salah al-Din School targeting the entire area.',
    ar: 'نقطة طبية داخل مركز الإيواء في مدرسة صلاح الدين، وتخدم المنطقة بالكامل.',
  },
  {
    key: 'Unfiltered water well was repaired by Al-Baraka Association\n, and pipelines were extended to the site by the Initiative.',
    en: 'Unfiltered water well was repaired by Al-Baraka Association, and pipelines were extended to the site by the Initiative.',
    ar: 'تمت صيانة بئر مياه غير مفلترة من قبل جمعية البركة، كما قامت المبادرة بتمديد خطوط المياه إلى الموقع.',
  },
  {
    key: 'Serving 250 boys and girls,\n it started on September 27, 2024\n, and is still ongoing. The working hours are from\n 7:30 to 11:30, and it is only a morning shift.',
    en: 'Serving 250 boys and girls. It started on September 27, 2024 and is still ongoing. Working hours are from 7:30 to 11:30, and it operates only as a morning shift.',
    ar: 'يخدم 250 من البنين والبنات. بدأ في 27 سبتمبر 2024 وما زال مستمرا. ساعات العمل من 7:30 إلى 11:30، ويعمل خلال الفترة الصباحية فقط.',
  },
  {
    key: 'A bread bakery serving families in the site, operated on a paid basis,\n with a team of 8 female bakers, 1 wood supplier, and 1 supervisor. Each month, 15 families are targeted to benefit from this project, and the staff is rotated monthly.',
    en: 'A bread bakery serving families in the site on a paid basis, staffed by 8 female bakers, 1 wood supplier, and 1 supervisor. Each month, 15 families are targeted to benefit from this project, and the staff rotates monthly.',
    ar: 'مخبز خبز يخدم العائلات في الموقع مقابل رسوم، ويعمل فيه 8 خبازات وموفر حطب واحد ومشرف واحد. يستهدف المشروع شهريا 15 عائلة للاستفادة، ويتم تدوير الطاقم كل شهر.',
  },
  {
    key: 'A submersible water pump is available on site, but there is no electricity to operate it.',
    en: 'A submersible water pump is available on site, but there is no electricity to operate it.',
    ar: 'تتوفر مضخة مياه غاطسة في الموقع، لكن لا توجد كهرباء لتشغيلها.',
  },
  {
    key: 'ProvidesTakia and hot meals every other day.',
    en: 'Provides a takiya and hot meals every other day.',
    ar: 'يوفر تكية ووجبات ساخنة يوما بعد يوم.',
  },
  {
    key: 'Supplying water to displaced people residing inside the site.\nHowever, it is currently not functioning due to a lack of operational supplies.',
    en: 'Supplying water to displaced people residing inside the site. However, it is currently not functioning due to a lack of operational supplies.',
    ar: 'يوفر المياه للنازحين المقيمين داخل الموقع، لكنه لا يعمل حاليا بسبب نقص المستلزمات التشغيلية.',
  },
  {
    key: 'Targeting two shifts for both boys and girls: the first for grades 1–3, and the second for grades 4–6.',
    en: 'Targeting two shifts for both boys and girls: the first for grades 1-3, and the second for grades 4-6.',
    ar: 'يستهدف فترتين للبنين والبنات: الأولى للصفوف 1-3، والثانية للصفوف 4-6.',
  },
  {
    key: 'Supplying displaced people with water for household use.',
    en: 'Supplying displaced people with water for household use.',
    ar: 'يوفر للنازحين المياه للاستخدام المنزلي.',
  },
  {
    key: 'drinking water: 3 cups twice per week.',
    en: 'Drinking water: 3 cups twice per week.',
    ar: 'مياه شرب: 3 أكواب مرتين في الأسبوع.',
  },
  {
    key: 'Educational point for grades 1–10 (boys and girls), 3 days for each group.',
    en: 'Educational point for grades 1-10 (boys and girls), 3 days for each group.',
    ar: 'نقطة تعليمية للصفوف 1-10 للبنين والبنات، بواقع 3 أيام لكل مجموعة.',
  },
  {
    key: 'IOM distribution point in partnership with the Psychological Guidance Foundation for the distribution of mattresses and blankets.',
    en: 'IOM distribution point in partnership with the Psychological Guidance Foundation for distributing mattresses and blankets.',
    ar: 'نقطة توزيع تابعة للمنظمة الدولية للهجرة بالشراكة مع مؤسسة التوجيه النفسي لتوزيع الفرشات والبطانيات.',
  },
  {
    key: 'Educational point for grades 1–10 (boys and girls), operating 3 days per group with three shifts as follows: 7:00–10:00 (grades 1–3), 10:00–1:00 (grades 4–6), and 1:00–4:00 (grades 7–10). The school is also in need of furniture and stationery for students.',
    en: 'Educational point for grades 1-10 (boys and girls), operating 3 days per group with three shifts: 7:00-10:00 for grades 1-3, 10:00-1:00 for grades 4-6, and 1:00-4:00 for grades 7-10. The school also needs furniture and stationery for students.',
    ar: 'نقطة تعليمية للصفوف 1-10 للبنين والبنات، تعمل 3 أيام لكل مجموعة عبر ثلاث فترات: 7:00-10:00 للصفوف 1-3، و10:00-1:00 للصفوف 4-6، و1:00-4:00 للصفوف 7-10. كما تحتاج المدرسة إلى أثاث وقرطاسية للطلاب.',
  },
  {
    key: 'Community space where meetings are held, including sessions for displaced persons and other site-related activities.',
    en: 'Community space where meetings are held, including sessions for displaced persons and other site-related activities.',
    ar: 'مساحة مجتمعية تُعقد فيها الاجتماعات، بما في ذلك جلسات للنازحين وأنشطة أخرى مرتبطة بالموقع.',
  },
  {
    key: '10 cups of drinking water are distributed daily.',
    en: '10 cups of drinking water are distributed daily.',
    ar: 'يتم توزيع 10 أكواب من مياه الشرب يوميا.',
  },
  {
    key: 'A medical clinic providing wound dressing, follow-up for chronic diseases, and basic first aid services. The clinic requires support and the provision of medications.',
    en: 'A medical clinic providing wound dressing, follow-up for chronic diseases, and basic first aid services. The clinic requires support and medication supplies.',
    ar: 'عيادة طبية تقدم خدمات تضميد الجروح ومتابعة الأمراض المزمنة والإسعافات الأولية الأساسية. تحتاج العيادة إلى الدعم وتوفير الأدوية.',
  },
  {
    key: 'Screening, distribution, and referral for pregnant and lactating women and children under the age of 5.',
    en: 'Screening, distribution, and referral for pregnant and lactating women and children under the age of 5.',
    ar: 'فحوصات وتوزيع وإحالات للنساء الحوامل والمرضعات وللأطفال دون سن الخامسة.',
  },
  {
    key: 'It offers primary care with a general practitioner and targets insured diseases.',
    en: 'It offers primary care with a general practitioner and targets insured diseases.',
    ar: 'يوفر رعاية أولية مع طبيب عام، ويستهدف الأمراض المشمولة بالتأمين.',
  },
  {
    key: 'It includes general medicine, physiotherapy, dentistry, antenatal care (pregnant women), mental health services, and a medical point.',
    en: 'It includes general medicine, physiotherapy, dentistry, antenatal care for pregnant women, mental health services, and a medical point.',
    ar: 'يشمل طب عام وعلاج طبيعي وطب أسنان ورعاية ما قبل الولادة للحوامل وخدمات صحة نفسية ونقطة طبية.',
  },
];

const descriptionTranslations = rawDescriptionTranslations.reduce((acc, { key, en, ar }) => {
  acc.en[key] = en || key;
  acc.ar[key] = ar || en || key;
  acc.en[normalizeDescriptionTranslationKey(key)] = en || key;
  acc.ar[normalizeDescriptionTranslationKey(key)] = ar || en || key;
  return acc;
}, { en: {}, ar: {} });

const serviceTypeTranslations = {
  en: {
    'Water Trucking - Distribution Point': 'Water Trucking - Distribution Point',
    'Health Space/Clinic': 'Health Space/Clinic',
    'Community Kitchen/Tekeya': 'Community Kitchen/Tekeya',
    Bakery: 'Bakery',
    'TLS/School': 'TLS/School',
    'Community Space': 'Community Space',
    'Safe Spaces for Women and Girls (WGSS)': 'Safe Spaces for Women and Girls (WGSS)',
    'Safe space': 'Safe space',
    'Nutrition Center': 'Nutrition Center',
    'Distribution Point': 'Distribution Point',
    'Social Activity': 'Social Activity',
    Other: 'Other',
  },
  ar: {
    'Water Trucking - Distribution Point': 'نقطة توزيع مياه',
    'Health Space/Clinic': 'مساحة صحية / عيادة',
    'Community Kitchen/Tekeya': 'مطبخ مجتمعي',
    Bakery: 'مخبز',
    'TLS/School': 'مساحة تعليمية مؤقتة / مدرسة',
    'Community Space': 'مساحة مجتمعية',
    'Safe Spaces for Women and Girls (WGSS)': 'مساحات آمنة للنساء والفتيات (WGSS)',
    'Safe space': 'مساحة آمنة',
    'Nutrition Center': 'مركز تغذية',
    'Distribution Point': 'نقطة توزيع',
    'Social Activity': 'نشاط اجتماعي',
    Other: 'أخرى',
  },
};

const translateServiceType = (serviceName = '', lang = 'en') => {
  const typeKey = getServiceType(serviceName);
  return {
    key: typeKey,
    label: serviceTypeTranslations[lang]?.[typeKey] || typeKey,
  };
};

const translateServiceCategory = (serviceName = '', lang = 'en') => (
  servicesProvidedTranslations[lang]?.[serviceName]
    || servicesProvidedTranslations[lang]?.[normalizeServiceTranslationKey(serviceName)]
    || serviceTypeTranslations[lang]?.[getServiceType(serviceName)]
    || serviceName
);

const translateServiceNameValue = (service = {}, lang = 'en') => {
  const raw = service.service_name || service.name || '';
  return serviceNameTranslations[lang]?.[raw]
    || serviceNameTranslations[lang]?.[normalizeServiceTranslationKey(raw)]
    || servicesProvidedTranslations[lang]?.[raw]
    || servicesProvidedTranslations[lang]?.[normalizeServiceTranslationKey(raw)]
    || raw
    || serviceTypeTranslations[lang]?.[getServiceType(raw)];
};

const translateDescriptionValue = (value = '', lang = 'en') => {
  if (!value) return '';
  return descriptionTranslations[lang]?.[value]
    || descriptionTranslations[lang]?.[normalizeDescriptionTranslationKey(value)]
    || value;
};

const getMarkerLocationKey = (service = {}) => {
  const latitude = service?.coordinates?.latitude;
  const longitude = service?.coordinates?.longitude;
  if (latitude === undefined || longitude === undefined) return null;
  return `${latitude},${longitude}`;
};

const buildServicesLocationMap = (items = []) => {
  const locationMap = new Map();
  items.forEach((service) => {
    const key = getMarkerLocationKey(service);
    if (!key) return;
    if (!locationMap.has(key)) locationMap.set(key, []);
    locationMap.get(key).push(service);
  });
  return locationMap;
};

const convertBoundaryPlacemarkToFeature = (placemark = {}) => {
  const outerBoundary = Array.isArray(placemark?.geometry?.outerBoundary)
    ? placemark.geometry.outerBoundary
    : [];

  if (!outerBoundary.length) return null;

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [outerBoundary.map((point) => [point.longitude, point.latitude])],
    },
    properties: {
      ...placemark.properties,
      name: placemark.properties?.['Site Name'] || placemark.name || '',
      description: placemark.description || '',
      stroke: DEFAULT_BOUNDARY_STROKE,
      fill: DEFAULT_BOUNDARY_FILL,
      'stroke-opacity': 0.95,
      'fill-opacity': 0.14,
      'stroke-width': 2.5,
    },
  };
};

const normalizeBoundaryFeatureCollection = (data) => {
  if (Array.isArray(data?.features)) {
    return {
      ...data,
      features: data.features.filter((feature) => feature?.geometry),
    };
  }

  if (Array.isArray(data?.placemarks)) {
    return {
      type: 'FeatureCollection',
      features: data.placemarks
        .map(convertBoundaryPlacemarkToFeature)
        .filter(Boolean),
    };
  }

  return {
    type: 'FeatureCollection',
    features: [],
  };
};

const getBoundaryFeatureLabel = (feature = {}, translateLabel = (value) => value) => {
  const properties = feature?.properties || {};
  const rawLabel = properties.name || properties['Site Name'] || properties.X || properties.Y || '';
  return translateLabel(rawLabel) || rawLabel;
};

const getBoundaryFeatureSiteName = (feature = {}) => {
  const properties = feature?.properties || {};
  return properties.name || properties['Site Name'] || properties.X || properties.Y || '';
};

const getBoundaryFeatureStyle = (feature = {}) => {
  const properties = feature?.properties || {};
  const rawStroke = String(properties.stroke || '').toLowerCase();
  const rawFill = String(properties.fill || '').toLowerCase();
  const useOverridePalette = LOW_VISIBILITY_BOUNDARY_COLORS.has(rawStroke)
    || LOW_VISIBILITY_BOUNDARY_COLORS.has(rawFill);

  return {
    color: useOverridePalette ? DEFAULT_BOUNDARY_STROKE : (properties.stroke || DEFAULT_BOUNDARY_STROKE),
    weight: useOverridePalette ? 3 : (Number(properties['stroke-width']) || 2),
    opacity: Number(properties['stroke-opacity']) || 0.9,
    fillColor: useOverridePalette ? DEFAULT_BOUNDARY_FILL : (properties.fill || properties.stroke || DEFAULT_BOUNDARY_FILL),
    fillOpacity: useOverridePalette ? 0.2 : (Number(properties['fill-opacity']) || 0.12),
  };
};

const groupServicesForDetailsPanel = (servicesAtLocation = []) => {
  const groupedServices = new Map();

  servicesAtLocation.forEach((service) => {
    const groupKey = [
      normalizeLookupKey(service?.name || ''),
      normalizeLookupKey(service?.service_name || service?.name || ''),
      normalizeLookupKey(service?.Org || service?.org || ''),
      normalizeDescriptionTranslationKey(service?.description || service?.desc || ''),
      normalizeLookupKey(service?.location || service?.governorate || service?.area || ''),
      normalizeLookupKey(service?.focal || ''),
      normalizeLookupKey(service?.['focal phone number'] || ''),
    ].join('|');

    if (!groupedServices.has(groupKey)) {
      groupedServices.set(groupKey, {
        ...service,
        siteNames: [],
        sourceIds: [],
      });
    }

    const groupedService = groupedServices.get(groupKey);

    if (service?.siteName && !groupedService.siteNames.includes(service.siteName)) {
      groupedService.siteNames.push(service.siteName);
    }

    if (service?.id !== undefined && service?.id !== null) {
      groupedService.sourceIds.push(service.id);
    }
  });

  return [...groupedServices.values()];
};

const createMarkerForServices = (L, mapInstance, servicesAtLoc, onClick) => {
  const lat = servicesAtLoc[0].coordinates.latitude;
  const lng = servicesAtLoc[0].coordinates.longitude;
  let icon;
  const allHealth = servicesAtLoc.every((service) => getServiceType(service.name) === 'Health Space/Clinic');

  if (servicesAtLoc.length === 1) {
    icon = getMarkerIcon(L, servicesAtLoc[0].name);
  } else if (allHealth) {
    icon = createHealthIcon(L);
  } else {
    const colors = getUniqueServiceColors(servicesAtLoc);
    icon = getStripedMarkerIcon(L, colors);
  }

  const hasHealthClinic = servicesAtLoc.some((service) => getServiceType(service.name) === 'Health Space/Clinic');
  if (!mapInstance || !mapInstance._container) return null;
  const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);

  if (hasHealthClinic) {
    const tagHealthClass = () => {
      const element = marker.getElement();
      if (element) element.classList.add('marker-health');
    };
    if (marker.getElement()) tagHealthClass();
    else marker.once('add', tagHealthClass);
  }

  marker.on('click', onClick);
  return marker;
};

export default function Home() {
    // State for marker info panel
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null);
  const [showMarkerPanel, setShowMarkerPanel] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [visibleServiceTypesInViewport, setVisibleServiceTypesInViewport] = useState(new Set());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSiteName, setSelectedSiteName] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [coordinatesLoaded, setCoordinatesLoaded] = useState(false);
  const [lang, setLang] = useState('ar');
  const [isMobile, setIsMobile] = useState(false);
  const [activeMarkerKey, setActiveMarkerKey] = useState(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showMapHelp, setShowMapHelp] = useState(true);
  const [dynamicSiteTranslations, setDynamicSiteTranslations] = useState({});
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerPanelHideTimeout = useRef(null);
  const markersRef = useRef(new Map());
  const activeMarkerKeyRef = useRef(null);
  const boundaryLayersRef = useRef([]);
  const baseLayersRef = useRef({ street: null, satellite: null });
  const userMarkerRef = useRef(null);
  const hasCenteredOnUserRef = useRef(false);
  const mapContainerRef = useRef(null);
  const routingControlRef = useRef(null);
  const prevFiltersRef = useRef({ location: null, site: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('selectedLang', lang);
  }, [lang]);

  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setLang(getStoredLanguage());
    
    // Check for "site" and "service" URL parameter to auto-filter map
    const urlParams = new URLSearchParams(window.location.search);
    const siteParam = urlParams.get('site');
    if (siteParam) {
      setSelectedSiteName(siteParam);
    }
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      setSelectedServiceName(serviceParam);
    }
    const embedParam = urlParams.get('embedded');
    if (embedParam === 'true') {
      setIsEmbedded(true);
    }
  }, []);

  useEffect(() => {
    if (leafletReady && coordinatesLoaded) {
      setLoading(false);
    }
  }, [leafletReady, coordinatesLoaded]);

  const closeMarkerPanel = useCallback(() => {
    setActiveMarkerKey(null);
    setSelectedService(null);
    setShowMarkerPanel(false);
    if (routingControlRef.current && mapRef.current) {
      try {
        mapRef.current.removeControl(routingControlRef.current);
      } catch (e) {
        console.warn(e);
      }
      routingControlRef.current = null;
      setRoutingControl(null);
    }
    if (markerPanelHideTimeout.current) {
      clearTimeout(markerPanelHideTimeout.current);
    }
    markerPanelHideTimeout.current = setTimeout(() => {
      setSelectedMarkerInfo(null);
      markerPanelHideTimeout.current = null;
    }, 300);
  }, []);

  const applyMarkerHighlight = useCallback((targetKey) => {
    markersRef.current.forEach((marker, markerKey) => {
      const element = marker.getElement();
      if (!element) return;
      if (markerKey === targetKey) {
        element.classList.add('selected-marker');
        marker.setZIndexOffset(500);
      } else {
        element.classList.remove('selected-marker');
        marker.setZIndexOffset(0);
      }
    });
  }, [markersRef]);

  const openMarkerPanel = (info) => {
    if (markerPanelHideTimeout.current) {
      clearTimeout(markerPanelHideTimeout.current);
      markerPanelHideTimeout.current = null;
    }
    setSelectedMarkerInfo(info);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => setShowMarkerPanel(true));
    } else {
      setShowMarkerPanel(true);
    }
  };

  const showRouteToDestination = useCallback((destinationLatLng) => {
    const L = leafletRef.current;
    if (!L || !mapRef.current || !mapRef.current._container) return;

    if (routingControlRef.current) {
      try {
        mapRef.current.removeControl(routingControlRef.current);
      } catch (e) {
        console.warn(e);
      }
      routingControlRef.current = null;
      setRoutingControl(null);
    }

    if (!userLocation) return;

    const newRoutingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        destinationLatLng,
      ],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: false,
      lineOptions: { styles: [{ color: '#3b82f6', opacity: 0.8, weight: 5 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      show: false,
      createMarker: () => null,
    }).addTo(mapRef.current);

    routingControlRef.current = newRoutingControl;
    setRoutingControl(newRoutingControl);
  }, [userLocation]);

  useEffect(() => {
    return () => {
      if (markerPanelHideTimeout.current) {
        clearTimeout(markerPanelHideTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    applyMarkerHighlight(activeMarkerKey);
  }, [activeMarkerKey, applyMarkerHighlight]);

  useEffect(() => {
    activeMarkerKeyRef.current = activeMarkerKey;
  }, [activeMarkerKey]);

  const t = useMemo(() => ({
    // Debug: Log all site names in translation dictionaries (browser only)
    en: {
      appTitle: 'Service Mapping App',
      sites: 'Sites',
      services: 'Services',
      yourLocation: 'Your Location',
      loading: 'Loading location...',
      geolocationError: 'Unable to access your location. Focusing on Gaza Strip.',
      geolocationInsecure: 'Location access requires HTTPS. Focusing on Gaza Strip.',
      geolocationPermissionDenied: 'Location permission denied. Focusing on Gaza Strip.',
      geolocationUnavailable: 'Location unavailable. Focusing on Gaza Strip.',
      geolocationTimeout: 'Location request timed out. Focusing on Gaza Strip.',
      selected: 'Selected',
      switchToArabic: 'العربية',
      switchToEnglish: 'English',
      legend: 'Legend',
      mapView: 'Map view',
      satelliteView: 'Satellite view',
      mapHelpTitle: 'How To Use This Map',
      mapHelpIntro: 'Use these basics to move around the map and explore services quickly.',
      mapHelpItems: [
        'Zoom in and out using the map controls or your mouse wheel / touch gestures.',
        'Click any marker to open its details and view service information for that point.',
        'Enable your location to see the route to a point after clicking a marker.',
        'Use the dropdown filters to narrow the data by location, site name, or service name.',
        'On mobile, use the blue filter button to open the filters and services panel.',
      ],
      closeHelp: 'Close help',
      filterLocation: 'Select Site Location',
      filterSiteName: 'Select Site Name',
      filterServiceName: 'Select Service Name',
      infoLabels: {
        name: 'Name',
        serviceName: 'Service Name',
        site: 'Site Name',
        org: 'Organization',
        description: 'Description',
        location: 'Location',
        focalPhone: 'Focal Phone',
      },
      // Add site name translations
      siteNames: {
        'AL Amal college': 'AL Amal college',
        'AL-BAWASIL': 'AL-BAWASIL',
        'AL-FAROUQ': 'AL-FAROUQ',
        'AL-Haya2': 'AL-Haya2',
        'AL-NAKHEEL & ALZAYTOON': 'AL-NAKHEEL & ALZAYTOON',
        'AL-QUDS': 'AL-QUDS',
        'Ahel Al khair': 'Ahel Al khair',
        'Al Qastal camp': 'Al Qastal camp',
        'Al-Aila Al-Muqaddasa School Shelter': 'Al-Aila Al-Muqaddasa School Shelter',
        'Al-Fedaa site': 'Al-Fedaa site',
        'Al-Jawad Site': 'Al-Jawad Site',
        'Al-Jawhari': 'Al-Jawhari',
        'Al-Majida School Wasila Bani Ammar': 'Al-Majida School Wasila Bani Ammar',
        "Al-Mu'tasim Billah Shelter Center": "Al-Mu'tasim Billah Shelter Center",
        'Al-Rageen': 'Al-Rageen',
        'Al-Rahma Site': 'Al-Rahma Site',
        'Al-Salam Site': 'Al-Salam Site',
        'Al-Shaheed Jameel': 'Al-Shaheed Jameel',
        'Al-rimal Al-Thahabiea': 'Al-rimal Al-Thahabiea',
        'Alwaad': 'Alwaad',
        'Aman 3': 'Aman 3',
        'Amir Al-Mansi School': 'Amir Al-Mansi School',
        'An Naser School Site': 'An Naser School Site',
        'Ayam Almassrah site': 'Ayam Almassrah site',
        'Elboraq school': 'Elboraq school',
        'Esaad Al-Tufoola': 'Esaad Al-Tufoola',
        'Haratuna Site': 'Haratuna Site',
        'Housing the building of the insurance and per': 'Housing the building of the insurance and per',
        'Hsan Selema School': 'Hsan Selema School',
        'Jesser Alhayat Site': 'Jesser Alhayat Site',
        'Mukhayam Alshabab Walriyda': 'Mukhayam Alshabab Walriyda',
        'Nisr Al-Shamali': 'Nisr Al-Shamali',
        'Palestine Secondary School for Boys Shelter': 'Palestine Secondary School for Boys Shelter',
        'WIJDAN COMMUNITY': 'WIJDAN COMMUNITY',
        'Watan': 'Watan',
        'Yafa': 'Yafa',
        'Al-Farra Site': 'Al-Farra Site',
        'Al-Shorbaji': 'Al-Shorbaji',
        'Al-Hayat': 'Al-Hayat',
        'Al Jalaa Site': 'Al Jalaa Site',
        'Al-Shahri': 'Al-Shahri',
        'Al-Zaharna site': 'Al-Zaharna site',
        'Al-Quds Site (Abdeen Area)': 'Al-Quds (Abdeen Area)',
        'Al-Nakheel & Al-Zytoon Site': 'Al-Nakheel & Al-Zytoon Site',
        'Al-Fedaa Site': 'Al-Fedaa Site',
        'Al Amal college Site': 'Al Amal college Site',
        'Amir Al-Mansi School Site': 'Amir Al-Mansi School Site',
        'Al Waad Site': 'Al Waad Site',
        'Al Haya 2 Site': 'Al Haya 2 Site',
        'Watan Site': 'Watan Site',
        'Al Buraq School Site': 'Al Buraq School Site',
        'Insurance and Pensions Site': 'Insurance and Pensions Site',
        'Palestine Secondary School Site': 'Palestine Secondary School Site',
        'Esaad Altofola Site': 'Esaad Altofola Site',
        'Ayam Almassrah Site': 'Ayam Almassrah Site',
        'Al Quds- Abdin Area': 'Al Quds- Abdin Area',
        'Al-Nakheel and alzytoon': 'Al-Nakheel and alzytoon',
        'Albwasil': 'Albwasil',
        'Wijdan community': 'Wijdan community',
        'Al faruq': 'Al faruq',
        'Wijdan Site': 'Wijdan Site',
        'Yafa Site': 'Yafa Site',
        'Al-Karam': 'Al-Karama',
        'Al-Farooq Site (Abu Farooq Area)': 'Al-Farooq Site (Abu Farooq Area)',
        'Shady Site': 'Shady Site',
        'Al-Mosalla Site': 'Al-Mosalla Site',
        'Al-Quds Site (Al-Hayat Area)': 'Al-Quods Site (Al-Hayat Area)',
        'Al-Shahri Site': 'Al-Shahri Site',
        'Al-Jawhari Site': 'Al-Jawhari Site',
        'Al-Rimal Al-Thahabiea Site': 'Al-Rimal Al-Thahabiea Site',
        'Al-Shaheed Jameel Site': 'Al-Shaheed Jameel Site',
        'Al-Malaab Site': 'Al-Malaab Site',
        'Al Nour Site': 'Al Nour Site',
        'Atfalouna': 'Atfalouna',
        'Hanoon Site': 'Hanoon Site',
        'Al-Farooq Site (Al-Hayat Area)': 'Al-Farooq Site (Al-Hayat Area)',
        'Garb Al-Shaleh Site': 'Garb Al-Shaleh Site',
        'Ministry of Labor': 'Ministry of Labor'
      },
      services_provided: servicesProvidedTranslations.en,
      legend_services: { ...serviceTypeTranslations.en },
      locations: {
        North: 'North',
        South: 'South',
      },
      governorates: {
        "Khanyounis": "Khanyounis",
        "Deir Al-Balah": "Deir Al-Balah"
      },
      areas: {
        "Schools area": "Schools Area",
        "Al-Shifa area": "Al-Shifa Area",
        "Al-Rimal middle area": "Al-Rimal Middle Area",
        "Mawasi Khanyounis": "Mawasi Khanyounis",
        "Mawasi Al-Qarara": "Mawasi Al-Qarara",
        "Al-Bassa": "Al-Bassa"
      },
      focal: "Focal Person"
    },
    ar: {
      appTitle: 'تطبيق خريطة الخدمات',
      sites: 'المواقع',
      services: 'الخدمات',
      yourLocation: 'موقعك',
      loading: 'جاري تحميل الموقع...',
      geolocationError: 'تعذر الوصول إلى موقعك. سيتم التركيز على قطاع غزة.',
      geolocationInsecure: 'الوصول إلى الموقع يتطلب HTTPS. سيتم التركيز على قطاع غزة.',
      geolocationPermissionDenied: 'تم رفض إذن الموقع. سيتم التركيز على قطاع غزة.',
      geolocationUnavailable: 'الموقع غير متاح. سيتم التركيز على قطاع غزة.',
      geolocationTimeout: 'انتهت مهلة طلب الموقع. سيتم التركيز على قطاع غزة.',
      selected: 'المحدد',
      switchToArabic: 'العربية',
      switchToEnglish: 'English',
      legend: 'دليل الألوان',
      mapView: 'عرض الخريطة',
      satelliteView: 'عرض الأقمار الصناعية',
      mapHelpTitle: 'كيفية استخدام هذه الخريطة',
      mapHelpIntro: 'استخدم هذه الإرشادات السريعة للتنقل في الخريطة واستكشاف الخدمات بسهولة.',
      mapHelpItems: [
        'يمكنك التكبير والتصغير باستخدام أدوات الخريطة أو عجلة الفأرة أو إيماءات اللمس.',
        'اضغط على أي علامة لفتح التفاصيل وعرض معلومات الخدمات الموجودة في تلك النقطة.',
        'فعّل الموقع على جهازك لرؤية المسار إلى النقطة بعد الضغط على العلامة.',
        'استخدم قوائم التصفية لتحديد البيانات حسب المنطقة أو اسم الموقع أو اسم الخدمة.',
        'على الجوال، استخدم زر التصفية الأزرق لفتح لوحة التصفية والخدمات.',
      ],
      closeHelp: 'إغلاق الإرشادات',
      filterLocation: 'المنطقة',
      filterSiteName: 'اختر اسم الموقع',
      filterServiceName: 'اختر اسم الخدمة',
      infoLabels: {
        name: 'نوع الخدمة',
        serviceName: 'اسم الخدمة',
        site: 'اسم الموقع',
        org: 'الجهة المنفذة',
        description: 'الوصف',
        location: 'الموقع',
        focalPhone: 'رقم هاتف المسؤول',
      },
      // Add site name translations in Arabic
      siteNames: {
        "AL Amal college": "كلية الأمل",
        "Al Amal college Site": "موقع كلية الأمل",
        "AL-BAWASIL": "البواسل",
        "Albwasil": "البواسل",
        "AL-FAROUQ": "الفاروق",
        "Al faruq": "الفاروق",
        "AL-Haya2": "الحياة 2",
        "Al Haya 2 Site": "موقع الحياة 2",
        "AL-NAKHEEL & ALZAYTOON": "النخيل والزيتون",
        "Al-Nakheel and alzytoon": "موقع النخيل والزيتون",
        "AL-QUDS": "القدس",
        "Al Quds- Abdin Area": "موقع القدس - منطقة عابدين",
        "Ahel Al khair": "أهل الخير",
        "Al Qastal camp": "مخيم القسطل",
        "Al-Aila Al-Muqaddasa School Shelter": "مركز إيواء مدرسة العائلة المقدسة",
        "Ahali AL Junaina": "أهالي الجنينة",
        "Ajyal Al-Karama site": "أجيال الكرامة",
        "Al-Amoody": "العمودي",
        "AL Awda": "العودة",
        "AL Karama Site": "موقع الكرامة",
        "Al Nour Site": "موقع النور",
        "AL Rayyan": "الريان",
        "AL Tahrir Site": "موقع التحرير",
        "AL Zaytoon Site": "موقع الزيتون",
        "Al_joura": "الجورة",
        "Al_Najjar community": "تجمع النجار",
        "Alaa Abdeen": "علاء عابدين",
        "Al-Akli Site": "موقع العكلي",
        "Al-Amal and haya": "الأمل والحياة",
        "Al-Amal site": "موقع الأمل",
        "Al-Aqqad": "العقاد",
        "Al-Bader": "البدر",
        "Al-Bayari": "البياري",
        "Al-Bayyari": "البياري",
        "Al-Durra": "الدرة",
        "Al-Farooq Site (Abu Farooq Area)": "موقع الفاروق (منطقة أبو فاروق)",
        "Al-Farooq Site (Al-Hayat Area)": "موقع الفاروق (منطقة الحياة)",
        "Al-Farra Site": "موقع الفرا",
        "Al-Fedaa site": "موقع الفداء",
        "Al-Fedaa Site": "موقع الفداء",
        "Al Jalaa Site": "موقع الجلاء",
        "Al-Hayat": "الحياة",
        "Al-Hurya Site": "موقع الحرية",
        "Al-Ihsan Site": "موقع الإحسان",
        "Al-Jawhari": "الجوهري",
        "Al-Jawad Site": "موقع الجواد",
        "Al-Jawhari Site": "موقع الجوهري",
        "Al-Karam": "الكرم",
        "Al-Karam Site": "موقع الكرم",
        "Al-Karama": "الكرامة",
        "Al-Kareem": "الكريم",
        "Al-Malaab Site": "موقع الملعب",
        "Al-Majida School Wasila Bani Ammar": "مدرسة الماجدة وسيلة بني عمار",
        "Al-Mosalla Site": "موقع المصلى",
        "Al-Mostafa": "المصطفى",
        "Al-Mu'tasim Billah Shelter Center": "مركز إيواء المعتصم بالله",
        "ALMuktar faisal": "المختار فيصل",
        "Alnahda site": "موقع النهضة",
        "Al-Nakheel and Al-Zytoon Site": "موقع النخيل والزيتون",
        "Al-Nour": "النور",
        "Al-Quds": "القدس",
        "Al-Quds Site (Abdeen Area)": "موقع القدس (منطقة عابدين)",
        "Al-Quds Site (Al-Hayat Area)": "موقع القدس (منطقة الحياة)",
        "Al-rimal Al-Thahabiea": "الرمال الذهبية",
        "Al-Rageen": "الراجعين",
        "Al-Rahma Site": "موقع الرحمة",
        "Al-Rimal Al-Thahabiea Site": "موقع الرمال الذهبية",
        "Al-Salam Site": "موقع السلام",
        "Al-Shaer": "الشاعر",
        "Al-Shaheed Jameel": "الشهيد جميل",
        "Al-Shaheed Jameel Site": "موقع الشهيد جميل",
        "Al-Shahri": "الشحري",
        "Al-Shorbaji": "الشربجي",
        "Al-Zaharna site": "موقع الزهارنة",
        "Al-Suniyah": "السنية",
        "Al-Wafa": "الوفاء",
        "Alwaad": "الوعد",
        "Al Waad Site": "موقع الوعد",
        "Al-wehda": "الوحدة",
        "Al-Zahraa": "الزهراء",
        "Amir Al-Mansi School": "مدرسة أمير المنسي",
        "Atfalouna": "أطفالنا",
        "Amir Al-Mansi School Site": "موقع مدرسة أمير المنسي",
        "Aman 3": "أمان 3",
        "An Naser School Site": "موقع مدرسة النصر",
        "Arada": "عرادة",
        "Ard -Aljawafa Site": "موقع أرض الجوافة",
        "Asia": "آسيا",
        "Asqalan": "عسقلان",
        "Ayam Almassrah site": "موقع أيام المسرح",
        "Ayam Almassrah Site": "موقع أيام المسرح",
        "Ayash site": "موقع عياش",
        "Basant": "بيسنت",
        "Bilal Bin Rabah": "بلال بن رباح",
        "Elboraq school": "مدرسة البراق",
        "Al Buraq School Site": "موقع مدرسة البراق",
        "Esaad Al-Tufoola": "إسعاد الطفولة",
        "Esaad Altofola Site": "موقع إسعاد الطفولة",
        "Garb Al-Shaleh Site": "موقع غرب الشاليه",
        "Ghawar Site": "موقع غوار",
        "Hanoon Site": "موقع حنون",
        "Hayat Site": "موقع حياة",
        "Housing the building of the insurance and per": "موقع التأمين والمعاشات",
        "Haratuna Site": "موقع حارتنا",
        "Hsan Selema School": "مدرسة حسان سلامة",
        "Insurance and Pensions Site": "موقع التأمين والمعاشات",
        "Ministry of Labor": "وزارة العمل",
        "Jesser Alhayat Site": "موقع جسر الحياة",
        "Misk and Laian": "مسك وليان",
        "Mukhayam Alshabab Walriyda": "مخيم الشباب والرياضة",
        "Musadar Al-Bahar": "مصدر البحر",
        "Nisr Al-Shamali": "النصر الشمالي",
        "Palestine Secondary School for Boys Shelter": "موقع مدرسة فلسطين الثانوية للبنين",
        "Palestine Secondary School Site": "موقع مدرسة فلسطين الثانوية",
        "Pioneer Site": "موقع بيونير",
        "Shady Site": "موقع شادي",
        "Shams": "شمس",
        "Smile": "ابتسامة",
        "WIJDAN COMMUNITY": "مجتمع وجدان",
        "Wijdan community": "مجتمع وجدان",
        "Wajed Site": "موقع واجد",
        "Watan": "وطن",
        "Watan Site": "موقع وطن",
        "Wijdan Site": "موقع وجدان",
        "Yafa": "يافا",
        "Yafa Site": "موقع يافا",
        "Zorub": "زعرب",
        
      },
      services_provided: servicesProvidedTranslations.ar,
      legend_services: { ...serviceTypeTranslations.ar },
      locations: {
        North: 'شمال',
        South: 'جنوب',
      },
      governorates: {
        "Khanyounis": "خان يونس",
        "Deir Al-Balah": "دير البلح",
        "Gaza City": "مدينة غزة",
        "Al-Nuseirat": "النصيرات",
        "Rafah": "رفح",
        "Al-Zawaida": "الزوايدة",
      },
      areas: {
        "Schools area": "منطقة المدارس",
        "Al-Shifa area": "منطقة الشفاء",
        "Al-Rimal middle area": "منطقة الرمال الوسطى",
        "Mawasi Khanyounis": "مواصي خان يونس",
        "Mawasi Al-Qarara": "مواصي القرارة",
        "Al-Bassa": "البصة"
      },
      focal: "الشخص المسؤول"
    },
  }), []);

  const translateLocation = useCallback((location) => {
    if (!location) return '';
    return t[lang].locations?.[location] || location;
  }, [lang, t]);

  const siteNameLookup = useMemo(() => {
    const baseLookup = Object.entries(t[lang].siteNames).reduce((acc, [key, value]) => {
      acc[key] = value;
      acc[normalizeLookupKey(key)] = value;
      return acc;
    }, {});
    
    Object.entries(dynamicSiteTranslations || {}).forEach(([engName, transObj]) => {
      const translatedVal = transObj[lang] || transObj.en || engName;
      baseLookup[engName] = translatedVal;
      baseLookup[normalizeLookupKey(engName)] = translatedVal;
    });
    
    return baseLookup;
  }, [lang, t, dynamicSiteTranslations]);

  const organizationLookup = useMemo(() => Object.entries(organizationTranslations[lang]).reduce((acc, [key, value]) => {
    acc[key] = value;
    acc[normalizeLookupKey(key)] = value;
    return acc;
  }, {}), [lang]);

  const translateSiteName = useCallback((siteName) => {
    if (!siteName) return '';
    return siteNameLookup[siteName] || siteNameLookup[normalizeLookupKey(siteName)] || siteName;
  }, [siteNameLookup]);

  const translateOrganization = useCallback((organization) => {
    if (!organization) return '';
    return organizationLookup[organization] || organizationLookup[normalizeLookupKey(organization)] || organization;
  }, [organizationLookup]);

  // Load user location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('embedded') === 'true') {
        setGeoError('geolocationUnavailable'); // Fail silently
        return;
      }
      if (!window.isSecureContext) {
        setGeoError('geolocationInsecure');
        return;
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setGeoError(null);
        },
        (error) => {
          const errorCode = typeof error?.code === 'number' ? error.code : null;
          const errorMessage = error?.message || 'Unknown geolocation failure';

          if (errorCode === GEOLOCATION_ERROR_CODES.PERMISSION_DENIED) {
            console.warn(`Geolocation permission denied or location disabled. Code: ${errorCode}. Message: ${errorMessage}`);
            setGeoError('geolocationPermissionDenied');
          }
          else if (errorCode === GEOLOCATION_ERROR_CODES.POSITION_UNAVAILABLE) {
            console.warn(`Geolocation position unavailable. Code: ${errorCode}. Message: ${errorMessage}`);
            setGeoError('geolocationUnavailable');
          }
          else if (errorCode === GEOLOCATION_ERROR_CODES.TIMEOUT) {
            console.warn(`Geolocation request timed out. Code: ${errorCode}. Message: ${errorMessage}`);
            setGeoError('geolocationTimeout');
          }
          else {
            console.error(`Geolocation error. Code: ${errorCode ?? 'unknown'}. Message: ${errorMessage}`);
            setGeoError('geolocationError');
          }
        }
        , {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
    } else {
      // Geolocation not available, use default location
      console.log('Geolocation not supported');
      setGeoError('geolocationUnavailable');
    }
  }, []);

  // Track mobile breakpoint for responsive UI
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 1024px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  // Load coordinates from JSON
  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        // Fetch dynamic site translations first
        try {
          const transRes = await fetch('/maps/site_translations.json');
          if (transRes.ok) {
            const transData = await transRes.json();
            setDynamicSiteTranslations(transData);
          }
        } catch (err) {
          console.warn('Failed to load dynamic site translations:', err);
        }

        const response = await fetch('/maps/coordinates.json');
        const data = await response.json();

        const normalizeText = (value) => {
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length ? trimmed : '';
          }
          return value ?? '';
        };

        const normalizedData = data
          .map((service, index) => {
            const coordinates = service?.coordinates || {};
            const latitude = Number(coordinates.latitude);
            const longitude = Number(coordinates.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              return null;
            }

            const normalizedServiceName = normalizeText(service.name)
              || normalizeText(service.service_name)
              || `Service ${service.id ?? index + 1}`;
            const normalizedLocation = normalizeText(service.location) || null;
            const normalizedSiteName = normalizeText(service['site name'])
              || normalizeText(service.siteName)
              || '';
            const normalizedOrg = normalizeText(service.Org)
              || normalizeText(service.org)
              || '';
            const normalizedDescription = normalizeText(service.description)
              || normalizeText(service.desc)
              || '';

            return {
              ...service,
              name: normalizedServiceName,
              service_name: normalizedServiceName,
              Org: normalizedOrg,
              org: normalizedOrg,
              description: normalizedDescription,
              desc: normalizedDescription,
              location: normalizedLocation,
              governorate: normalizedLocation,
              area: normalizedLocation,
              siteName: normalizedSiteName,
              coordinates: {
                ...coordinates,
                latitude,
                longitude,
              },
            };
          })
          .filter(Boolean);

        setServices(normalizedData);
      } catch (error) {
        console.error('Error loading coordinates:', error);
      } finally {
        setCoordinatesLoaded(true);
      }
    };
    loadCoordinates();
  }, []);

  // Load Leaflet only in the browser
  useEffect(() => {
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet-routing-machine');
      leafletRef.current = L;

      // Fix default icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Optional: fix routing waypoint icon
      if (L.Routing && L.Routing.Control) {
        const greenIcon = new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        L.Routing.Control.prototype.options.waypointIcon = function () {
          return greenIcon;
        };
      }

      setLeafletReady(true);
    })();
  }, []);

  // Initialize map (wait for Leaflet to load)
  useEffect(() => {
    const L = leafletRef.current;
    if (!leafletReady || loading || !L || mapRef.current || !mapContainerRef.current) return;

    const initialCenter = userLocation || DEFAULT_MAP_CENTER;
    const initialZoom = userLocation ? USER_LOCATION_ZOOM : DEFAULT_MAP_ZOOM;
    const mapInstance = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);

    if (!userLocation) {
      mapInstance.fitBounds(DEFAULT_GAZA_BOUNDS, {
        padding: [24, 24],
      });
    }

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    });

    streetLayer.addTo(mapInstance);
    baseLayersRef.current = { street: streetLayer, satellite: satelliteLayer };
    setIsSatelliteView(false);

    // Fetch static boundaries
    const staticBoundariesPromises = SITE_BOUNDARY_FILES.map((filePath) => 
      fetch(filePath)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load boundary file: ${filePath}`);
          return response.json();
        })
        .then((data) => normalizeBoundaryFeatureCollection(data))
        .catch((err) => {
          console.error(err);
          return null;
        })
    );

    // Fetch dynamic boundaries
    const dynamicBoundaryFiles = Object.entries(dynamicSiteTranslations || {})
      .filter(([_, t]) => t.boundaryFile)
      .map(([siteName, t]) => ({ siteName, filePath: t.boundaryFile }));

    const dynamicBoundariesPromises = dynamicBoundaryFiles.map(({ siteName, filePath }) =>
      fetch(filePath)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load dynamic boundary file: ${filePath}`);
          return response.json();
        })
        .then((data) => {
          const normalized = normalizeBoundaryFeatureCollection(data);
          normalized.features.forEach((feature) => {
            if (!feature.properties) feature.properties = {};
            if (!feature.properties.name) {
              feature.properties.name = siteName;
            }
          });
          return normalized;
        })
        .catch((err) => {
          console.error(err);
          return null;
        })
    );

    Promise.all([...staticBoundariesPromises, ...dynamicBoundariesPromises])
      .then((boundaryCollections) => {
        if (!mapRef.current || mapRef.current !== mapInstance || !mapInstance._container) {
          return;
        }
        boundaryCollections.forEach((normalizedCollection) => {
          if (!normalizedCollection || !normalizedCollection.features.length) return;

          const boundaryLayer = L.geoJSON(normalizedCollection, {
            filter: (feature) => {
              const siteName = getBoundaryFeatureSiteName(feature);
              if (!siteName) return false;

              const hasServices = services.some(s => {
                const sName = s.siteName || s['site name'] || '';
                return sName === siteName || normalizeLookupKey(sName) === normalizeLookupKey(siteName);
              });

              const hasTranslation = dynamicSiteTranslations && (
                dynamicSiteTranslations[siteName] !== undefined ||
                dynamicSiteTranslations[normalizeLookupKey(siteName)] !== undefined ||
                Object.keys(dynamicSiteTranslations).some(k => normalizeLookupKey(k) === normalizeLookupKey(siteName))
              );

              return hasServices || hasTranslation;
            },
            style: getBoundaryFeatureStyle,
            onEachFeature: (feature, layer) => {
              const label = getBoundaryFeatureLabel(feature, translateSiteName);
              if (label) {
                layer.bindPopup(label);
                layer.bindTooltip(label, {
                  permanent: true,
                  direction: 'center',
                  className: 'bg-transparent border-none shadow-none text-teal-800 dark:text-teal-200 font-bold text-xs sm:text-sm whitespace-nowrap pointer-events-none'
                });
              }
              layer.on('click', () => {
                const siteName = getBoundaryFeatureSiteName(feature);
                trackEvent('site_boundary_click', {
                  site_name: siteName,
                });
              });
            },
          });

          boundaryLayersRef.current.push(boundaryLayer);
          boundaryLayer.addTo(mapInstance);
        });
      })
      .catch((error) => {
        console.error('Error drawing site boundaries:', error);
      });

    markersRef.current = new Map();

    mapRef.current = mapInstance;
    setMapReady(true);
    return () => {
      if (routingControlRef.current) {
        try {
          mapInstance.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn("Error removing routing control:", e);
        }
        routingControlRef.current = null;
      }
      if (userMarkerRef.current) {
        try {
          mapInstance.removeLayer(userMarkerRef.current);
        } catch (e) {
          console.warn(e);
        }
        userMarkerRef.current = null;
      }
      boundaryLayersRef.current.forEach((layer) => {
        try {
          mapInstance.removeLayer(layer);
        } catch (e) {
          console.warn(e);
        }
      });
      boundaryLayersRef.current = [];
      markersRef.current.forEach((marker) => {
        if (marker) {
          try {
            marker.off();
            mapInstance.removeLayer(marker);
          } catch (e) {
            console.warn(e);
          }
        }
      });
      markersRef.current.clear();
      if (baseLayersRef.current.street) {
        try { mapInstance.removeLayer(baseLayersRef.current.street); } catch (e) {}
      }
      if (baseLayersRef.current.satellite) {
        try { mapInstance.removeLayer(baseLayersRef.current.satellite); } catch (e) {}
      }
      baseLayersRef.current = { street: null, satellite: null };
      try {
        mapInstance.remove();
      } catch (e) {
        console.warn(e);
      }
      mapRef.current = null;
      hasCenteredOnUserRef.current = false;
      setIsSatelliteView(false);
      setMapReady(false);
    };
  }, [leafletReady, loading, services, translateSiteName, userLocation]);

  const filteredServices = useMemo(() => services.filter((service) => (
    (!selectedLocation || service.location === selectedLocation) &&
    (!selectedSiteName || service.siteName === selectedSiteName) &&
    (!selectedServiceName || service.name === selectedServiceName)
  )), [services, selectedLocation, selectedSiteName, selectedServiceName]);
  const mapServices = filteredServices;

  // Auto-center map on selected site
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    if (selectedSiteName && filteredServices.length > 0) {
      const L = leafletRef.current;
      const mapInstance = mapRef.current;
      
      const timeoutId = setTimeout(() => {
        const bounds = L.latLngBounds(filteredServices.map(s => [s.coordinates.latitude, s.coordinates.longitude]));
        if (bounds.isValid()) {
          mapInstance.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 1.5 });
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedSiteName, filteredServices, mapReady]);

  const currentServices = useMemo(() => filteredServices.map((service) => {
    const { key: serviceTypeKey, label: serviceTypeLabel } = translateServiceType(service.name, lang);
    return {
      ...service,
      serviceTypeKey,
      serviceTypeLabel,
      translatedName: translateServiceCategory(service.name, lang),
      translatedServiceName: translateServiceNameValue(service, lang),
    };
  }), [filteredServices, lang]);

  const updateLegendFromViewport = useCallback(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;
    try {
      const bounds = mapInstance.getBounds();
      const visibleTypes = new Set();
      filteredServices.forEach((service) => {
        const lat = service?.coordinates?.latitude;
        const lng = service?.coordinates?.longitude;
        if (lat !== undefined && lng !== undefined && bounds.contains([lat, lng])) {
          const type = getServiceType(service.name);
          if (type) {
            visibleTypes.add(type);
          }
        }
      });
      setVisibleServiceTypesInViewport(visibleTypes);
    } catch (e) {
      console.warn('Error updating legend from viewport:', e);
    }
  }, [filteredServices]);

  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapReady || !mapInstance) return;

    mapInstance.on('moveend', updateLegendFromViewport);
    updateLegendFromViewport();

    return () => {
      mapInstance.off('moveend', updateLegendFromViewport);
    };
  }, [mapReady, updateLegendFromViewport]);

  const visibleLegendItems = useMemo(() => {
    const allLegendItems = [
      { type: 'Water Trucking - Distribution Point', color: '#1e90ff' },
      { type: 'Health Space/Clinic', color: '#ff4444' },
      { type: 'Community Kitchen/Tekeya', color: '#ff8800' },
      { type: 'Bakery', color: '#b45309' },
      { type: 'TLS/School', color: '#9933ff' },
      { type: 'Community Space', color: '#4BB272' },
      { type: 'Safe Spaces for Women and Girls (WGSS)', color: '#ec4899' },
      { type: 'Safe space', color: '#ec4899' },
      { type: 'Nutrition Center', color: '#fbbf24' },
      { type: 'Distribution Point', color: '#545454' },
      { type: 'Social Activity', color: '#93c01f' },
      { type: 'Other', color: '#808080' },
    ];
    return allLegendItems.filter(item => visibleServiceTypesInViewport.has(item.type));
  }, [visibleServiceTypesInViewport]);

  const locationOptions = useMemo(() => {
    const serviceLocs = services.map((s) => s.location).filter(Boolean);
    const dynamicLocs = Object.values(dynamicSiteTranslations || {}).map((s) => s.location).filter(Boolean);
    return [...new Set([...serviceLocs, ...dynamicLocs])];
  }, [services, dynamicSiteTranslations]);

  const siteNameOptions = useMemo(() => {
    const serviceSites = selectedLocation
      ? services.filter((s) => s.location === selectedLocation).map((s) => s.siteName).filter(Boolean)
      : services.map((s) => s.siteName).filter(Boolean);
      
    const dynamicSites = Object.entries(dynamicSiteTranslations || {}).map(([siteCode, site]) => {
      if (selectedLocation && site.location !== selectedLocation) return null;
      return siteCode;
    }).filter(Boolean);

    return [...new Set([...serviceSites, ...dynamicSites])];
  }, [services, dynamicSiteTranslations, selectedLocation]);

  const serviceNameOptions = useMemo(() => {
    const scopedServices = services.filter((service) => (
      (!selectedLocation || service.location === selectedLocation) &&
      (!selectedSiteName || service.siteName === selectedSiteName)
    ));
    return [...new Set(scopedServices.map((service) => service.name).filter(Boolean))];
  }, [services, selectedLocation, selectedSiteName]);

  const hasActiveFilters = Boolean(selectedLocation || selectedSiteName || selectedServiceName);
  const isArabic = lang === 'ar';

  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f3f4f6',
      color: '#1b1464',
      border: 'none',
      minHeight: 44,
      boxShadow: state.isFocused ? '0 0 0 1px #1b1464' : base.boxShadow,
      textAlign: isArabic ? 'right' : 'left',
    }),
    valueContainer: (base) => ({
      ...base,
      textAlign: isArabic ? 'right' : 'left',
    }),
    input: (base) => ({
      ...base,
      textAlign: isArabic ? 'right' : 'left',
    }),
    placeholder: (base) => ({
      ...base,
      textAlign: isArabic ? 'right' : 'left',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1b1464',
      fontWeight: 'bold',
      textAlign: isArabic ? 'right' : 'left',
    }),
    menu: (base) => ({ ...base, zIndex: 9999, textAlign: isArabic ? 'right' : 'left' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#1b1464'
        : state.isFocused
          ? '#e0e7ff'
          : '#fff',
      color: state.isSelected
        ? '#fff'
        : '#1b1464',
      cursor: 'pointer',
      textAlign: isArabic ? 'right' : 'left',
    }),
    indicatorsContainer: (base) => ({ ...base, color: '#1b1464' }),
    dropdownIndicator: (base) => ({ ...base, color: '#1b1464' }),
  }), [isArabic]);

  useEffect(() => {
    boundaryLayersRef.current.forEach((boundaryLayer) => {
      boundaryLayer.eachLayer((layer) => {
        const label = getBoundaryFeatureLabel(layer.feature, translateSiteName);
        if (label) {
          layer.bindPopup(label);
          if (layer.getTooltip()) {
            layer.setTooltipContent(label);
          } else {
            layer.bindTooltip(label, {
              permanent: true,
              direction: 'center',
              className: 'bg-transparent border-none shadow-none text-teal-800 dark:text-teal-200 font-bold text-xs sm:text-sm whitespace-nowrap pointer-events-none'
            });
          }
        }
      });
    });
  }, [lang, translateSiteName]);

  useEffect(() => {
    const L = leafletRef.current;
    const mapInstance = mapRef.current;
    if (!mapReady || !L || !mapInstance || !mapInstance._container) return;

    markersRef.current.forEach((marker) => {
      if (marker) {
        marker.off();
        mapInstance.removeLayer(marker);
      }
    });
    markersRef.current.clear();

    const locationMap = buildServicesLocationMap(mapServices);

    for (const [key, servicesAtLoc] of locationMap.entries()) {
      const lat = servicesAtLoc[0].coordinates.latitude;
      const lng = servicesAtLoc[0].coordinates.longitude;
      const marker = createMarkerForServices(L, mapInstance, servicesAtLoc, () => {
        if (activeMarkerKeyRef.current === key) {
          closeMarkerPanel();
          return;
        }

        setActiveMarkerKey(key);
        setSelectedService(null);
        openMarkerPanel({
          servicesAtLoc,
          lat,
          lng,
        });
        
        mapInstance.flyTo(L.latLng(lat, lng), Math.max(mapInstance.getZoom(), SERVICE_FOCUS_ZOOM), { duration: 1.0 });

        [...new Set(servicesAtLoc.map((service) => getServiceType(service.name)).filter(Boolean))].forEach((serviceType) => {
          trackEvent('marker_click', {
            service_type: serviceType,
            marker_service_count: servicesAtLoc.length,
          });
        });
      });

      if (marker) {
        markersRef.current.set(key, marker);
      }
    }

    applyMarkerHighlight(activeMarkerKeyRef.current);

    if (!selectedMarkerInfo) return;

    const selectedKey = `${selectedMarkerInfo.lat},${selectedMarkerInfo.lng}`;
    const nextServicesAtLocation = locationMap.get(selectedKey);
    if (nextServicesAtLocation?.length) {
      setSelectedMarkerInfo((currentInfo) => {
        if (!currentInfo) return currentInfo;

        const currentIds = currentInfo.servicesAtLoc.map((service) => service.id).join('|');
        const nextIds = nextServicesAtLocation.map((service) => service.id).join('|');

        if (currentInfo.lat === selectedMarkerInfo.lat
          && currentInfo.lng === selectedMarkerInfo.lng
          && currentIds === nextIds) {
          return currentInfo;
        }

        return {
          ...currentInfo,
          servicesAtLoc: nextServicesAtLocation,
        };
      });
    } else {
      closeMarkerPanel();
    }
  }, [applyMarkerHighlight, closeMarkerPanel, mapReady, mapServices, selectedMarkerInfo, showRouteToDestination]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapRef.current._container || !leafletRef.current) return;
    const mapInstance = mapRef.current;

    if (!userLocation) {
      if (userMarkerRef.current) {
        mapInstance.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      hasCenteredOnUserRef.current = false;
      return;
    }

    const L = leafletRef.current;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
      userMarkerRef.current.setPopupContent(`<b>${t[lang].yourLocation}</b>`);
      if (userMarkerRef.current.getTooltip()) {
        userMarkerRef.current.setTooltipContent(t[lang].yourLocation);
      } else {
        userMarkerRef.current.bindTooltip(t[lang].yourLocation, {
          permanent: true,
          direction: 'top',
          className: 'bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-xs shadow-md border-none pointer-events-none'
        });
      }
    } else {
      userMarkerRef.current = L.marker(userLocation, { title: 'Your Location' })
        .addTo(mapInstance)
        .bindPopup(`<b>${t[lang].yourLocation}</b>`)
        .bindTooltip(t[lang].yourLocation, {
          permanent: true,
          direction: 'top',
          className: 'bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-xs shadow-md border-none pointer-events-none'
        });
    }

    if (!hasCenteredOnUserRef.current) {
      if (!selectedSiteName && !selectedLocation) {
        mapInstance.flyTo(userLocation, Math.max(mapInstance.getZoom(), USER_LOCATION_ZOOM));
      }
      hasCenteredOnUserRef.current = true;
    }
  }, [userLocation, mapReady, selectedSiteName, selectedLocation, t, lang]);

  // Automatically zoom to selected location/site bounds when filters change
  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapRef.current._container || !leafletRef.current) return;
    
    const prevLocation = prevFiltersRef.current.location;
    const prevSite = prevFiltersRef.current.site;
    const prevService = prevFiltersRef.current.service;
    
    if (selectedLocation !== prevLocation || selectedSiteName !== prevSite || selectedServiceName !== prevService) {
      prevFiltersRef.current = { location: selectedLocation, site: selectedSiteName, service: selectedServiceName };
      
      const L = leafletRef.current;
      const mapInstance = mapRef.current;
      
      const timeoutId = setTimeout(() => {
        if (selectedLocation || selectedSiteName || selectedServiceName) {
          // First, if selectedSiteName is set, see if we can find its boundary polygon bounds
          let siteBoundaryBounds = null;
          if (selectedSiteName && !selectedServiceName) {
            for (const boundaryLayer of boundaryLayersRef.current) {
              boundaryLayer.eachLayer((layer) => {
                if (layer.feature) {
                  const siteName = getBoundaryFeatureSiteName(layer.feature);
                  if (siteName === selectedSiteName) {
                    siteBoundaryBounds = layer.getBounds();
                  }
                }
              });
              if (siteBoundaryBounds) break;
            }
          }

          if (siteBoundaryBounds) {
            // Fit to the site polygon boundary exactly with tight padding!
            mapInstance.fitBounds(siteBoundaryBounds, {
              padding: [20, 20],
              maxZoom: 16,
              duration: 1.5
            });
          } else {
            // Fallback to filtered services markers
            if (!filteredServices || filteredServices.length === 0) return;
            
            const coordinatesList = filteredServices
              .map((s) => s.coordinates)
              .filter((coords) => coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude));
              
            if (coordinatesList.length === 0) return;
            
            let isSingleLocation = true;
            const first = coordinatesList[0];
            for (let i = 1; i < coordinatesList.length; i++) {
              if (Math.abs(coordinatesList[i].latitude - first.latitude) > 0.0001 ||
                  Math.abs(coordinatesList[i].longitude - first.longitude) > 0.0001) {
                isSingleLocation = false;
                break;
              }
            }
            
            if (isSingleLocation) {
              const latLng = L.latLng(first.latitude, first.longitude);
              mapInstance.flyTo(latLng, SERVICE_FOCUS_ZOOM, { duration: 1.5 });
            } else {
              const bounds = L.latLngBounds(
                coordinatesList.map((coords) => L.latLng(coords.latitude, coords.longitude))
              );
              // Tight padding for snug fit to edges!
              mapInstance.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16,
                duration: 1.5
              });
            }
          }
        } else {
          // Filters cleared: reset view to original state
          const initialCenter = userLocation || DEFAULT_MAP_CENTER;
          const initialZoom = userLocation ? USER_LOCATION_ZOOM : DEFAULT_MAP_ZOOM;
          if (userLocation) {
            mapInstance.flyTo(initialCenter, initialZoom, { duration: 1.5 });
          } else {
            mapInstance.fitBounds(DEFAULT_GAZA_BOUNDS, {
              padding: [24, 24],
            });
          }
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedLocation, selectedSiteName, selectedServiceName, filteredServices, mapReady, userLocation]);

  // Update marker popups when language changes
  useEffect(() => {
    if (!mapRef.current || !mapServices.length) return;

    const locationMap = buildServicesLocationMap(mapServices);

    // Update all markers' popups with new language
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker && layer.getPopup()) {
        const latlng = layer.getLatLng();
        const key = Object.keys([...locationMap.entries()].reduce((acc, [k, v]) => {
          if (v[0]?.coordinates.latitude === latlng.lat && v[0]?.coordinates.longitude === latlng.lng) {
            acc[k] = v;
          }
          return acc;
        }, {}))[0];

        if (key) {
          const servicesAtLoc = locationMap.get(key);
          const popupContent = servicesAtLoc.map(s => {
            const translatedName = translateServiceCategory(s.name, lang);
            const translatedServiceName = translateServiceNameValue(s, lang);
            const translatedDescription = translateDescriptionValue(s.description || s.desc || '', lang);
            const translatedSiteName = translateSiteName(s.siteName);
            const translatedLocation = translateLocation(s.location || s.governorate || s.area || '');
            const serviceTypeLabel = translateServiceType(s.name, lang).label;
            const focalLine = s.focal ? `<br/><b>${t[lang].focal}:</b> ${s.focal}` : '';
            const focalPhoneLine = s['focal phone number'] ? `<br/><b>Focal Phone:</b> ${s['focal phone number']}` : '';
            const serviceNameLine = translatedServiceName ? `<br/><small>${translatedServiceName}</small>` : '';
            const descriptionLine = translatedDescription ? `<br/><small>${translatedDescription}</small>` : '';
            const siteNameLine = translatedSiteName ? `<br/><small>${translatedSiteName}</small>` : '';
            const locationLine = translatedLocation ? `<br/><small>${translatedLocation}</small>` : '';
            return `<b>${translatedName}</b>${serviceNameLine}${descriptionLine}${siteNameLine}${locationLine}<br/><small>${serviceTypeLabel}</small>${focalLine}${focalPhoneLine}`;
          }).join('<hr/>');
          layer.setPopupContent(popupContent);
        }
      }
    });
  }, [lang, mapServices, t, translateLocation, translateSiteName]);

  // Import L for the new effect
  useEffect(() => {
    (async () => {
      const L = (await import('leaflet')).default;
      window.L = L;
    })();
  }, []);

  const toggleBaseLayer = useCallback(() => {
    const mapInstance = mapRef.current;
    const { street, satellite } = baseLayersRef.current;
    if (!mapInstance || !street || !satellite) return;

    setIsSatelliteView((prev) => {
      if (prev) {
        if (mapInstance.hasLayer(satellite)) mapInstance.removeLayer(satellite);
        if (!mapInstance.hasLayer(street)) street.addTo(mapInstance);
      } else {
        if (mapInstance.hasLayer(street)) mapInstance.removeLayer(street);
        if (!mapInstance.hasLayer(satellite)) satellite.addTo(mapInstance);
      }
      return !prev;
    });
  }, []);
  const handleServiceClick = (service) => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;

    if (selectedService?.id === service.id) {
      setSelectedService(null);
      setActiveMarkerKey(null);
      if (routingControlRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn(e);
        }
        routingControlRef.current = null;
        setRoutingControl(null);
      }
      return;
    }

    const destinationKey = `${service.coordinates.latitude},${service.coordinates.longitude}`;
    setActiveMarkerKey(destinationKey);

    setSelectedService(service);
    trackEvent('service_selected', {
      service_id: service.id,
      service_name: service.name,
      site: service.siteName,
      service_type: getServiceType(service.name),
    });

    const destinationLatLng = L.latLng(service.coordinates.latitude, service.coordinates.longitude);
    mapRef.current.flyTo(destinationLatLng, Math.max(mapRef.current.getZoom(), SERVICE_FOCUS_ZOOM));

    if (routingControlRef.current) {
      try {
        mapRef.current.removeControl(routingControlRef.current);
      } catch (e) {
        console.warn(e);
      }
      routingControlRef.current = null;
      setRoutingControl(null);
    }
    showRouteToDestination(destinationLatLng);

    // Auto-close mobile panel after 500ms on service selection
    if (isMobile) {
      setTimeout(() => setShowMobilePanel(false), 100);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 transition-all duration-300">
        <div className="flex flex-col items-center max-w-sm w-full space-y-6 text-center">
          {/* Logo container with pulsing glow */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-600/10 dark:bg-blue-500/15 blur-xl animate-pulse w-24 h-24"></div>
            <img 
              src="/assets/acted-logo.png" 
              alt="ACTED Logo" 
              className="relative h-14 sm:h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(27,20,100,0.15)] dark:drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)] animate-[pulse_2.5s_infinite]" 
            />
          </div>

          {/* Premium Spinner and Text */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-12 h-12">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-800"></div>
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full border-4 border-t-[#1b1464] dark:border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            
            <p className="text-base sm:text-lg font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 animate-[pulse_1.5s_infinite]">
              {lang === 'ar' ? 'جاري تجهيز خريطة الخدمات...' : 'Preparing the service map...'}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {lang === 'ar' ? 'يرجى الانتظار لحظة' : 'Please wait a moment'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderMarkerInfoContent = () => {
    if (!selectedMarkerInfo) return null;
    const labels = t[lang].infoLabels;
    const groupedServicesAtLocation = groupServicesForDetailsPanel(selectedMarkerInfo.servicesAtLoc);
    const formatValue = (value) => {
      if (value === undefined || value === null) return '';
      const trimmed = String(value).trim();
      return trimmed.length ? trimmed : '';
    };
    const primaryServiceType = translateServiceType(groupedServicesAtLocation[0]?.name, lang).label;
    const uniqueMarkerSiteNames = [...new Set(groupedServicesAtLocation.flatMap((service) => service.siteNames || []))];
    const translatedPrimarySiteName = uniqueMarkerSiteNames.length === 1
      ? translateSiteName(uniqueMarkerSiteNames[0])
      : '';
    return (
      <>
        <button
          className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-[1301] bg-gray-200 dark:bg-zinc-700 rounded-full w-10 h-10 flex items-center justify-center`}
          onClick={closeMarkerPanel}
        >
          <span aria-label="Close">✕</span>
        </button>
        <div className="p-6 pt-12 pb-24 space-y-4">
          <h2 className="text-xl font-bold mb-1">{primaryServiceType || translatedPrimarySiteName}</h2>
          {translatedPrimarySiteName && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{translatedPrimarySiteName}</p>
          )}
          <p className="text-xs mb-2">{selectedMarkerInfo.lat}, {selectedMarkerInfo.lng}</p>
          {groupedServicesAtLocation.map((s) => {
            const translatedName = translateServiceCategory(s.name, lang);
            const translatedServiceName = translateServiceNameValue(s, lang);
            const translatedSiteName = [...new Set((s.siteNames || []).map((siteName) => translateSiteName(siteName)).filter(Boolean))].join(', ');
            const translatedOrg = translateOrganization(s.Org || s.org);
            const translatedDescription = translateDescriptionValue(formatValue(s.description || s.desc), lang);
            const translatedLocation = translateLocation((s.location || s.governorate || s.area || '').trim());
            const fields = [
              { label: labels.name, value: formatValue(translatedName), emphasis: true },
              { label: labels.serviceName, value: formatValue(translatedServiceName) },
              { label: labels.site, value: formatValue(translatedSiteName) },
              { label: labels.org, value: formatValue(translatedOrg) },
              { label: labels.description, value: formatValue(translatedDescription), multiline: true },
              { label: labels.location, value: formatValue(translatedLocation) },
            ].filter(field => field.value);
            return (
              <div key={(s.sourceIds || [s.id]).join('|')} className="mb-4 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 bg-white/80 dark:bg-zinc-800/40">
                <dl className="space-y-3 text-sm">
                  {fields.map((field, fieldIdx) => (
                    <div key={fieldIdx}>
                      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{field.label}</dt>
                      <dd className={`${field.emphasis ? 'text-base font-semibold text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'}${field.multiline ? ' whitespace-pre-line' : ''}`}>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
          
          {userLocation && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && leafletRef.current) {
                    showRouteToDestination(leafletRef.current.latLng(selectedMarkerInfo.lat, selectedMarkerInfo.lng));
                  }
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                {lang === 'ar' ? 'عرض مسار الوصول للموقع' : 'Get Directions'}
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div
      className={`flex flex-col h-screen bg-zinc-50 dark:bg-black${lang === 'ar' ? ' rtl' : ''} ${lang === 'ar' ? notoArabic.className : ''}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ fontFamily: lang === 'ar' ? undefined : 'Branding, sans-serif' }}
    >
      {!isEmbedded && (
        <header className="shadow-md border-b border-gray-200 dark:border-zinc-800 px-2 sm:px-6 py-2" style={{ backgroundColor: '#1b1464' }}>
          <div className="flex items-center gap-2 sm:gap-4 w-full max-w-6xl mx-auto">
            <Link href="/">
              <img src="/assets/acted-logo.png" alt="ACTED Logo" className="h-10 sm:h-16 w-auto flex-shrink-0 cursor-pointer" />
            </Link>
            <h1 className="flex-1 text-center text-base sm:text-2xl font-bold text-white truncate">{t[lang].appTitle}</h1>
            <div className="flex-shrink-0 w-[110px] sm:w-[170px] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const nextLang = lang === 'en' ? 'ar' : 'en';
                  setLang(nextLang);
                  trackEvent('language_change', { language: nextLang });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#1b1464] px-3 py-2 font-semibold text-xs sm:text-sm shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label={lang === 'ar' ? 'تغيير اللغة' : 'Change language'}
              >
                <img src="/assets/translate.png" alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className={!isMobile && lang === 'en' ? notoArabic.className : ''}>
                  {isMobile ? (lang === 'en' ? 'AR' : 'EN') : (lang === 'en' ? 'العربية' : 'English')}
                </span>
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4 overflow-hidden">
        {/* Map Section */}
        <div
          className="flex-1 rounded-lg shadow-lg overflow-hidden lg:min-h-0 min-h-64 relative"
          style={{
            minHeight: '0',
            height: '100%',
            ...(isMobile ? { height: 'calc(100dvh - 64px)' } : {}) // 64px header height
          }}
        >
          <div ref={mapContainerRef} className="h-full w-full"></div>
          {showMapHelp && (
            <div className={`absolute left-1/2 top-1/2 z-[1100] w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-xl ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className={`flex-1 text-sm sm:text-base font-bold text-gray-900 dark:text-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t[lang].mapHelpTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMapHelp(false)}
                  className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
                  aria-label={t[lang].closeHelp}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <div className="mt-2">
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">{t[lang].mapHelpIntro}</p>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                  {t[lang].mapHelpItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <button
            onClick={toggleBaseLayer}
            className="absolute top-4 right-4 z-[1100] bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-white px-3 py-2 rounded-full shadow-md border border-gray-200 dark:border-zinc-800 text-xs font-semibold"
            aria-pressed={isSatelliteView}
          >
            {isSatelliteView ? t[lang].satelliteView : t[lang].mapView}
          </button>
          {/* Legend */}
          {/* Floating Button for Mobile */}
          {isMobile && (
            <button
              onClick={() => setShowMobilePanel(v => !v)}
              className="fixed bottom-6 left-6 z-[1100] bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Show Details"
            >
              <img src="/assets/filtersvg.svg" alt="Filter" className="w-7 h-7 filter brightness-0 invert" />
            </button>
          )}
          {visibleLegendItems.length > 0 && (
            <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-white dark:bg-zinc-900 p-2 lg:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-[1000] max-w-xs lg:max-w-none">
              <p className="font-bold text-xs lg:text-sm mb-1 lg:mb-2 text-gray-900 dark:text-white">{t[lang].legend}</p>
              <div className="space-y-0.5 lg:space-y-1 text-xs grid grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-0">
                {visibleLegendItems.map((item) => (
                  <div key={item.type} className="flex items-center gap-1 lg:gap-2">
                    <div className="w-2 lg:w-3 h-2 lg:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 dark:text-gray-300 truncate text-xs">{t[lang].legend_services[item.type] || item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Details/Panel Section */}
        <div className="relative w-full lg:w-80 flex-shrink-0 min-h-0 flex flex-col lg:h-full">
          {/* Overlay for mobile panel */}
          {isMobile && showMobilePanel && (
            <div
              className="fixed inset-0 z-[1199] bg-transparent"
              onClick={() => setShowMobilePanel(false)}
              aria-label="Close details panel"
            />
          )}
          <div
            className={`w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 dark:bg-zinc-900 overflow-y-auto max-h-96 lg:max-h-none lg:h-full lg:min-h-0 transition-transform duration-300 ${isMobile ? 'fixed left-0 right-0 bottom-0 z-[1200]' : ''}`}
            style={isMobile ? {
              transform: showMobilePanel ? 'translateY(0)' : 'translateY(100%)',
              maxHeight: '70dvh',
              borderRadius: '1rem 1rem 0 0',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
              background: 'var(--background, #fff)',
            } : { height: '100%' }}
            onClick={e => {
              if (isMobile) e.stopPropagation();
            }}
          >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t[lang].sites}</h2>
          {userLocation && (
            <div 
              onClick={() => {
                if (mapRef.current && mapReady) {
                  mapRef.current.flyTo(userLocation, USER_LOCATION_ZOOM);
                }
              }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>{t[lang].yourLocation}</span>
                <span className="text-xs text-blue-500 font-normal">📍 {lang === 'ar' ? 'عرض على الخريطة' : 'Show on map'}</span>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </p>
            </div>
          )}
          {geoError && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t[lang][geoError] || t[lang].geolocationError}
              </p>
            </div>
          )}
          {/* Location Dropdown */}
          <div className="mb-4">
            <Select
              isRtl={isArabic}
              value={selectedLocation ? { value: selectedLocation, label: translateLocation(selectedLocation) } : null}
              onChange={option => {
                const locationValue = option ? option.value : null;
                setSelectedLocation(locationValue);
                setSelectedSiteName(null);
                setSelectedServiceName(null);
                setSelectedService(null);
              }}
              options={locationOptions.map(location => ({ value: location, label: translateLocation(location) }))}
              placeholder={t[lang].filterLocation}
              isClearable
              instanceId="service-mapping-location-select"
              styles={selectStyles}
              aria-label="Location Dropdown"
            />
          </div>

          {/* Site Name Dropdown */}
          <div className="mb-4">
            <Select
              isRtl={isArabic}
              value={selectedSiteName ? { value: selectedSiteName, label: translateSiteName(selectedSiteName) } : null}
              onChange={option => {
                const siteNameValue = option ? option.value : null;
                setSelectedSiteName(siteNameValue);
                setSelectedServiceName(null);
                setSelectedService(null);
                if (siteNameValue) {
                  trackEvent('site_dropdown_select', {
                    site_name: siteNameValue,
                    location: selectedLocation || 'all',
                  });
                } else {
                  trackEvent('site_dropdown_clear', {
                    location: selectedLocation || 'all',
                  });
                }
              }}
              options={siteNameOptions.map(siteName => ({ value: siteName, label: translateSiteName(siteName) }))}
              placeholder={t[lang].filterSiteName}
              isClearable
              isDisabled={!siteNameOptions.length}
              instanceId="service-mapping-site-name-select"
              styles={selectStyles}
              aria-label="Site Name Dropdown"
            />
          </div>

          {/* Service Name Dropdown */}
          <div className="mb-4">
            <Select
              isRtl={isArabic}
              value={selectedServiceName ? {
                value: selectedServiceName,
                label: translateServiceNameValue({ name: selectedServiceName, service_name: selectedServiceName }, lang),
              } : null}
              onChange={option => {
                const serviceNameValue = option ? option.value : null;
                setSelectedServiceName(serviceNameValue);
                setSelectedService(null);
                if (serviceNameValue) {
                  trackEvent('service_dropdown_select', {
                    service_name: serviceNameValue,
                    location: selectedLocation || 'all',
                    site_name: selectedSiteName || 'all',
                  });
                } else {
                  trackEvent('service_dropdown_clear', {
                    location: selectedLocation || 'all',
                    site_name: selectedSiteName || 'all',
                  });
                }
              }}
              options={serviceNameOptions.map(serviceName => ({
                value: serviceName,
                label: translateServiceNameValue({ name: serviceName, service_name: serviceName }, lang),
              }))}
              placeholder={t[lang].filterServiceName}
              isClearable
              isDisabled={!serviceNameOptions.length}
              instanceId="service-mapping-service-name-select"
              styles={selectStyles}
              aria-label="Service Name Dropdown"
            />
          </div>


          {/* Services List */}
          {hasActiveFilters && (
            <>
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t[lang].services}</h3>
              {currentServices.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === 'ar' ? 'لا توجد خدمات مطابقة للتصفية الحالية.' : 'No services match the current filters.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {currentServices.map((service) => {
                  const translatedOrg = translateOrganization(service.Org || service.org);
                  const serviceColor = getColorFromService(service.name);
                  const isSelected = selectedService?.id === service.id;
                  const isHovered = hoveredCardId === service.id;
                  const contrastColor = isSelected ? (serviceColor.toLowerCase() === '#fbbf24' ? '#000000' : '#ffffff') : undefined;

                    return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      onMouseEnter={() => setHoveredCardId(service.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      className={`w-full p-3 rounded-lg transition-all border border-gray-200/50 dark:border-zinc-800/50 text-gray-900 dark:text-white ${isArabic ? 'text-right' : 'text-left'} ${
                        isSelected
                          ? 'scale-[1.02] shadow-md ring-2 ring-emerald-500 dark:ring-emerald-400 font-bold'
                          : ''
                      }`}
                      style={{
                        borderInlineStart: `5px solid ${serviceColor}`,
                        backgroundColor: isSelected ? serviceColor : (isHovered ? `${serviceColor}2e` : `${serviceColor}15`),
                        color: contrastColor,
                      }}
                    >
                      <p className="font-semibold text-sm">{service.translatedName}</p>
                      <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                        {translateSiteName(service.siteName)}
                      </p>
                      {translatedOrg && (
                        <p className={`text-xs ${isSelected ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'}`}>
                          {translatedOrg}
                        </p>
                      )}
                    </button>
                  );
                  })}
                </div>
              )}
            </>
          )}
          {/* Selected Service Info */}
          {selectedService && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">{t[lang].selected}</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{translateServiceCategory(selectedService.name, lang)}</p>
            </div>
          )}
          </div>

          {/* Desktop marker info panel overlay */}
          {!isMobile && selectedMarkerInfo && (
            <>
              <div
                className="absolute inset-0 z-[1299] bg-transparent"
                style={{ pointerEvents: showMarkerPanel ? 'auto' : 'none' }}
                onClick={closeMarkerPanel}
                aria-label="Close marker info panel"
              />
              <div
                className="absolute inset-0 z-[1300] bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-800 transition-transform duration-300 overflow-y-auto rounded-lg"
                style={{
                  transform: showMarkerPanel ? 'translateX(0)' : (lang === 'ar' ? 'translateX(-100%)' : 'translateX(100%)'),
                  boxShadow: '0 0 24px rgba(0,0,0,0.15)',
                  pointerEvents: showMarkerPanel ? 'auto' : 'none',
                }}
              >
                {renderMarkerInfoContent()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile marker info panel */}
      {isMobile && selectedMarkerInfo && (
        <>
          <div
            className="fixed left-0 right-0 bottom-0 z-[1299] bg-transparent"
            style={{
              height: '70dvh',
              pointerEvents: showMarkerPanel ? 'auto' : 'none',
            }}
            onClick={closeMarkerPanel}
            aria-label="Close marker info panel"
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-[1300] bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-800 transition-transform duration-300 overflow-y-auto overscroll-contain"
            style={{
              transform: showMarkerPanel ? 'translateY(0)' : 'translateY(100%)',
              height: '85dvh',
              maxHeight: '85dvh',
              borderRadius: '1rem 1rem 0 0',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {renderMarkerInfoContent()}
          </div>
        </>
      )}
    </div>
  );
}