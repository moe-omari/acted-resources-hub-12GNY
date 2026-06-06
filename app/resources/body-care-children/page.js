import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/العناية بالجسم للأطفال.pdf'),
  type: 'pdf',
  downloadName: 'Body Care for Children.pdf',
  translations: {
    en: {
      title: 'Body Care for Children',
      description: 'Illustrated hygiene routine that helps children remember daily care steps.',
    },
    ar: {
      title: 'العناية بالجسم للأطفال',
      description: 'روتين نظافة مصور يساعد الأطفال على تذكر خطوات العناية اليومية بأنفسهم.',
    },
  },
};

export default function BodyCareChildrenPage() {
  return <ResourceDetail resource={resource} />;
}
