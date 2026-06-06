import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/مكافحة ناقلات الامراض.pdf'),
  type: 'pdf',
  downloadName: 'Vector Control Guide.pdf',
  translations: {
    en: {
      title: 'Vector Control Guide',
      description: 'Key measures to limit mosquito and fly breeding around communal shelters.',
    },
    ar: {
      title: 'دليل مكافحة النواقل',
      description: 'إجراءات عملية للحد من تكاثر البعوض والذباب حول المواقع والمآوي.',
    },
  },
};

export default function VectorControlPage() {
  return <ResourceDetail resource={resource} />;
}
