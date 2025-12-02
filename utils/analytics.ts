// Analytics utility for tracking Apply button clicks
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const trackDiscordClick = () => {
  // Only track if gtag is available (client-side)
  if (typeof window !== 'undefined' && window.gtag) {
    // Initialize Google Analytics with config when Apply button is clicked
    window.gtag('config', 'AW-17447817661');
    
    // Track the specific Apply button click event
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: 'apply_button_click',
      value: 1
    });
    
    console.log('Apply button click tracked');
  }
};
