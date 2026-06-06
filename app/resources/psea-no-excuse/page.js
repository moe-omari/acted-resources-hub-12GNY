import ResourceDetail from '../ResourceDetail';

const resource = {
  file: '/PSEA%20No%20Excuse.pdf',
  type: 'pdf',
  downloadName: 'PSEA No Excuse.pdf',
  translations: {
    en: {
      title: 'PSEA – No Excuse',
      description: 'Awareness and reporting guidance on Protection from Sexual Exploitation and Abuse.',
    },
    ar: {
      title: 'لا تبرير للعنف الجنسي',
      description: 'مادة توعوية حول الحماية من الاستغلال والاعتداء الجنسي.',
    },
  },
};

export default function PseaNoExcusePage() {
  return <ResourceDetail resource={resource} />;
}
