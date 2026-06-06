import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/مكافحة القوارض.jpg'),
  type: 'image',
  downloadName: 'Rodent Control (Arabic).jpg',
  translations: {
    en: {
      title: 'Rodent Control Poster',
      description: 'Key actions households can take to reduce rodent risks around living and storage areas.',
    },
    ar: {
      title: 'مكافحة القوارض',
      description: 'خطوات أساسية يمكن للأسر اتباعها للحد من مخاطر القوارض حول المساكن ومناطق التخزين.',
    },
  },
};

export default function RodentControlResourcePage() {
  return <ResourceDetail resource={resource} />;
}
