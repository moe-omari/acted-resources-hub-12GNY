import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/الوقاية من الفيضانات.jpg'),
  type: 'image',
  downloadName: 'Flood Prevention Poster.jpg',
  translations: {
    en: {
      title: 'Flood Prevention Poster',
      description: 'Visual checklist to protect shelters and belongings before, during, and after heavy rains.',
    },
    ar: {
      title: 'ملصق الوقاية من الفيضانات',
      description: 'قائمة مرئية للاستعداد للأمطار الغزيرة وحماية المأوى والمقتنيات قبل وأثناء وبعد العاصفة.',
    },
  },
};

export default function FloodPreventionPage() {
  return <ResourceDetail resource={resource} />;
}
