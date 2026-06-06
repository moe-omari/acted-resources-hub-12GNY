import ResourceDetail from '../ResourceDetail';

const resource = {
  file: '/Dead%20Body%20Management.jpg',
  type: 'image',
  downloadName: 'Dead Body Management.jpg',
  translations: {
    en: {
      title: 'Dead Body Management',
      description: 'Quick-reference visual for respectful and safe dead body management.',
    },
    ar: {
      title: 'كيفية التعامل مع الجثث',
      description: 'مرجع بصري سريع لإدارة الجثث بشكل محترم وآمن.',
    },
  },
};

export default function DeadBodyManagementPage() {
  return <ResourceDetail resource={resource} />;
}
