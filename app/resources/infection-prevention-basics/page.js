import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/الوقاية من العدوى - الاحتياطات الاساسية.pdf'),
  type: 'pdf',
  downloadName: 'Infection Prevention Basics.pdf',
  translations: {
    en: {
      title: 'Infection Prevention Basics',
      description: 'Core precautions and reminders to limit the spread of infections in crowded settings.',
    },
    ar: {
      title: 'أساسيات الوقاية من العدوى',
      description: 'الاحتياطات الأساسية والتنبيهات للحد من انتشار العدوى في البيئات المزدحمة.',
    },
  },
};

export default function InfectionPreventionBasicsPage() {
  return <ResourceDetail resource={resource} />;
}
