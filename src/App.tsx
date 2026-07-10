import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GA4Provider } from "@/components/GA4Provider";
import AnimatedRoutes from "@/components/AnimatedRoutes";

const CookieConsent = lazy(() => import("@/components/CookieConsent"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

const DeferredCookieConsent = () => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!show) return null;
  
  return (
    <Suspense fallback={null}>
      <CookieConsent />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DeferredCookieConsent />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <GA4Provider>
          <AnimatedRoutes />
        </GA4Provider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
