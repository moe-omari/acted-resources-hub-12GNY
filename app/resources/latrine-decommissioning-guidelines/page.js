import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/Safe closure of open latrine pits and decommissioning Guidelines.pdf'),
  type: 'pdf',
  downloadName: 'Latrine Decommissioning Guide.pdf',
  translations: {
    en: {
      title: 'Latrine Decommissioning Guide',
      description: 'Detailed instructions for safely closing open pits and decommissioning latrines.',
    },
    ar: {
      title: 'دليل إغلاق الحفر المفتوحة',
      description: 'تعليمات تفصيلية لإغلاق الحفر المفتوحة وإخراج المراحيض من الخدمة بأمان.',
    },
  },
};

export default function LatrineDecommissioningGuidelinesPage() {
  return <ResourceDetail resource={resource} />;
}
