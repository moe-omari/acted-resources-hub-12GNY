import ResourceDetail from '../ResourceDetail';

const resource = {
  file: encodeURI('/WASH Community Engagement.pdf'),
  type: 'pdf',
  downloadName: 'WASH Community Engagement.pdf',
  translations: {
    en: {
      title: 'WASH Community Engagement',
      description: 'Facilitator tool that supports participatory hygiene promotion and feedback loops.',
    },
    ar: {
      title: 'التواصل المجتمعي في مجال المياه والإصحاح',
      description: 'أداة للمنشطين لدعم التوعية التشاركية وجمع الملاحظات من المجتمع.',
    },
  },
};

export default function WashCommunityEngagementPage() {
  return <ResourceDetail resource={resource} />;
}
