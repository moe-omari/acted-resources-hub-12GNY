import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/Safe water chain.pdf'),
  type: 'pdf',
  downloadName: 'Safe Water Chain.pdf',
  translations: {
    en: {
      title: 'Safe Water Chain',
      description: 'Checklist covering collection, transport, and storage steps that keep water safe.',
    },
    ar: {
      title: 'سلسلة المياه الآمنة',
      description: 'قائمة تحقق تغطي خطوات جمع ونقل وتخزين المياه للحفاظ على سلامتها.',
    },
  },
};

export default function SafeWaterChainPage() {
  return <ResourceDetail resource={resource} />;
}
