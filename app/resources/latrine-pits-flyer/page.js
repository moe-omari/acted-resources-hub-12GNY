import ResourceDetail from '../ResourceDetail';

const resource = {
  file: '/close_of_latrines_pits_flyer%20-%20plus%20acted.pdf',
  type: 'pdf',
  downloadName: 'Close of Latrine Pits Flyer.pdf',
  translations: {
    en: {
      title: 'Close of Latrine Pits Flyer',
      description: 'Operational guidance for properly closing filled or inactive latrine pits.',
    },
    ar: {
      title: 'نشرة إغلاق حفر المراحيض',
      description: 'إرشادات حول إغلاق حفر المراحيض الممتلئة بطريقة آمنة.',
    },
  },
};

export default function LatrinePitsFlyerPage() {
  return <ResourceDetail resource={resource} />;
}
