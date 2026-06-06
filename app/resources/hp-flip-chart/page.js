import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/Flip Chart for different HP topics.pdf'),
  type: 'pdf',
  downloadName: 'Hygiene Promotion Flip Chart.pdf',
  translations: {
    en: {
      title: 'Hygiene Promotion Flip Chart',
      description: 'Multi-topic flip chart with ready-to-use visuals for community outreach.',
    },
    ar: {
      title: 'مواضيع توعوية صحية',
      description: 'شرائح مرئية جاهزة للاستخدام في جلسات التوعية المجتمعية حول عدة مواضيع.',
    },
  },
};

export default function HpFlipChartPage() {
  return <ResourceDetail resource={resource} />;
}
