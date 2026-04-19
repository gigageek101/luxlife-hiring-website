declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

const AW_ID = 'AW-17447817661';

// Replace with your conversion label from Google Ads (see instructions below)
const MARKETING_QUALIFIED_LABEL = 'ykWMCM_Y7J4cEL2j4v9A';

export const trackDiscordClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', AW_ID);
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: 'apply_button_click',
      value: 1
    });
    console.log('Apply button click tracked');
  }
};

export const trackMarketingQualifiedLead = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', AW_ID);
    window.gtag('event', 'conversion', {
      send_to: `${AW_ID}/${MARKETING_QUALIFIED_LABEL}`,
    });
    console.log('Marketing qualified lead conversion tracked');
  }
};
