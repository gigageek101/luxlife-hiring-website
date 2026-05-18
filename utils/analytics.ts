declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

const AW_ID = 'AW-18076661811';

// Set this to the conversion label from the new Google Ads account once created
const MARKETING_QUALIFIED_LABEL = '';

export const trackDiscordClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
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
    const params: Record<string, string> = MARKETING_QUALIFIED_LABEL
      ? { send_to: `${AW_ID}/${MARKETING_QUALIFIED_LABEL}` }
      : { send_to: AW_ID };
    window.gtag('event', 'conversion', params);
    console.log('Marketing qualified lead conversion tracked');
  }
};
