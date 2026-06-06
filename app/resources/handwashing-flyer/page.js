import ResourceDetail from '../ResourceDetail';

const resource = {
  file: '/Handwashing%20flyer%202.pdf',
  type: 'pdf',
  downloadName: 'Handwashing Flyer 2.pdf',
  translations: {
    en: {
      title: 'Handwashing Flyer 2',
      description: 'Essential handwashing steps to reduce disease transmission.',
    },
    ar: {
      title: 'نشرة غسل اليدين',
      description: 'خطوات غسل اليدين الأساسية لتقليل انتقال الأمراض.',
    },
  },
};

export default function HandwashingFlyerPage() {
  return <ResourceDetail resource={resource} />;
}
