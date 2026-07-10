import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const useGA4 = () => {
  const [gaId, setGaId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch GA4 ID from configs
  useEffect(() => {
    const fetchGA4Config = async () => {
      try {
        const { data } = await supabase
          .from('configs')
          .select('config')
          .single();

        if (data?.config && typeof data.config === 'object' && 'analytics' in data.config) {
          const analytics = data.config.analytics as any;
          if (analytics?.gaId) {
            setGaId(analytics.gaId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch GA4 config:', error);
      }
    };

    fetchGA4Config();
  }, []);

  // Initialize GA4 script
  useEffect(() => {
    if (!gaId || isInitialized) return;

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      send_page_view: false, // We'll handle page views manually
    });

    setIsInitialized(true);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="${gaId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [gaId, isInitialized]);

  // Track page view
  const trackPageView = (path: string, title?: string) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  };

  // Track custom event
  const trackEvent = (
    eventName: string,
    parameters?: {
      [key: string]: any;
    }
  ) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag('event', eventName, parameters);
  };

  // Track conversion
  const trackConversion = (conversionName: string, value?: number, currency?: string) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag('event', 'conversion', {
      send_to: `${gaId}/${conversionName}`,
      value: value,
      currency: currency || 'INR',
    });
  };

  return {
    isInitialized,
    trackPageView,
    trackEvent,
    trackConversion,
  };
};
