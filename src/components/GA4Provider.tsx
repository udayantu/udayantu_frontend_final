import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGA4 } from '@/hooks/useGA4';

export const GA4Provider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isInitialized, trackPageView } = useGA4();

  // Track page views on route change
  useEffect(() => {
    if (isInitialized) {
      trackPageView(location.pathname + location.search);
    }
  }, [location, isInitialized, trackPageView]);

  return <>{children}</>;
};
