// Analytics utility for tracking Discord button clicks
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const trackDiscordClick = () => {
  // Only track if gtag is available (client-side)
  if (typeof window !== 'undefined' && window.gtag) {
    // Initialize Google Analytics with config when Discord button is clicked
    window.gtag('config', 'AW-17447817661');
    
    // Track the specific Discord button click event
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: 'discord_button_click',
      value: 1
    });
    
    console.log('Discord button click tracked');
  }
};
