import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/Skin diseases and AWD.pdf'),
  type: 'pdf',
  downloadName: 'Skin Diseases and AWD.pdf',
  translations: {
    en: {
      title: 'Skin Diseases & AWD',
      description: 'Awareness sheet on preventing skin infections and acute watery diarrhea outbreaks.',
    },
    ar: {
      title: 'الأمراض الجلدية والإسهال المائي الحاد',
      description: 'ورقة توعوية للوقاية من التهابات الجلد والإسهال المائي الحاد.',
    },
  },
};

export default function SkinDiseasesAwdPage() {
  return <ResourceDetail resource={resource} />;
}
