import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/Winterization Flayer .pdf'),
  type: 'pdf',
  downloadName: 'Winterization Flyer.pdf',
  translations: {
    en: {
      title: 'Winterization Flyer',
      description: 'Key protection actions for cold, rainy, and windy conditions.',
    },
    ar: {
      title: 'نشرة الاستعداد للشتاء',
      description: 'أهم إجراءات الحماية خلال الأجواء الباردة والممطرة والعاصفة.',
    },
  },
};

export default function WinterizationFlyerPage() {
  return <ResourceDetail resource={resource} />;
}
