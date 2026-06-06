import ResourceDetail from '../ResourceDetail';

const resource = {
  file: '/50x70%20poster%20cleaning%20of%20jerry%20cans%201.67g.pdf',
  type: 'pdf',
  downloadName: 'Poster - Cleaning of Jerry Cans.pdf',
  translations: {
    en: {
      title: 'Poster: Cleaning of Jerry Cans',
      description: 'Step-by-step instructions on cleaning and maintaining safe jerry cans.',
    },
    ar: {
      title: 'ملصق تنظيف الجالونات',
      description: 'ملصق توعوي يوضح خطوات تنظيف جالونات المياه بشكل آمن.',
    },
  },
};

export default function PosterCleaningPage() {
  return <ResourceDetail resource={resource} />;
}
