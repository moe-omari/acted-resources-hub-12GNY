export const GA_MEASUREMENT_ID = 'G-VN16BF2Y57';

export const trackEvent = (action, params = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', action, params);
};

export const trackPageView = ({ path, title } = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const pagePath = path || `${window.location.pathname}${window.location.search}`;
  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_path: pagePath,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
};