import { Component, ErrorInfo, ReactNode, lazy, Suspense, useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-extrabold text-foreground">App Loading Issue Detected</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl shadow-md hover:bg-secondary/90 text-sm"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!show || window.location.pathname.startsWith('/admin')) return null;
  
  return (
    <Suspense fallback={null}>
      <CookieConsent />
    </Suspense>
  );
};

const App = () => (
  <GlobalErrorBoundary>
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
  </GlobalErrorBoundary>
);

export default App;
