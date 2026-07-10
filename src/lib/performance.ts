/**
 * Performance Monitoring and Core Web Vitals Tracking
 */

/**
 * Measure and report Core Web Vitals
 */
export function initPerformanceMonitoring() {
  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            'web_vitals.lcp': lastEntry.renderTime || lastEntry.loadTime,
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('LCP observer error:', e);
    }

    // FID - First Input Delay (or INP - Interaction to Next Paint)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any;
          console.log('FID:', fidEntry.processingDuration);
          if (window.gtag) {
            window.gtag('event', 'page_view', {
              'web_vitals.fid': fidEntry.processingDuration,
            });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('FID observer error:', e);
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            clsScore += clsEntry.value;
            console.log('CLS:', clsScore);
            if (window.gtag) {
              window.gtag('event', 'page_view', {
                'web_vitals.cls': clsScore,
              });
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('CLS observer error:', e);
    }
  }

  // Measure initial page load time
  window.addEventListener('load', () => {
    const perfData = (window.performance as any).timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page Load Time:', pageLoadTime + 'ms');
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        value: pageLoadTime,
      });
    }
  });
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  // Preload fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600&display=swap';
  link.type = 'font/woff2';
  document.head.appendChild(link);
}

/**
 * Enable resource hints
 */
export function enableResourceHints() {
  // DNS prefetch
  const dnsPrefetch = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://api.supabase.co'];
  dnsPrefetch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preconnect
  const preconnect = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://api.supabase.co'];
  preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
