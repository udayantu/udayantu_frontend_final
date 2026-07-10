import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Used by index.html boot-recovery script to detect successful mount.
(window as any).__UDAYANTU_APP_MOUNTED__ = true;

// Clean up recovery query params after successful mount (keeps URL nice for users).
try {
  const url = new URL(window.location.href);
  const changed =
    url.searchParams.has("__reload") ||
    url.searchParams.has("__udayantu_recovered") ||
    url.searchParams.has("__udayantu_sw_disabled");

  if (changed) {
    url.searchParams.delete("__reload");
    url.searchParams.delete("__udayantu_recovered");
    url.searchParams.delete("__udayantu_sw_disabled");

    const qs = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      url.pathname + (qs ? `?${qs}` : "") + url.hash
    );
  }
} catch {
  // ignore
}

const scheduleIdleTask = (callback: () => void) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 100);
  }
};

scheduleIdleTask(() => {
  import("./lib/performance")
    .then(({ initPerformanceMonitoring, enableResourceHints }) => {
      initPerformanceMonitoring();
      enableResourceHints();
    })
    .catch(() => {});

  import("./utils/seo")
    .then(({ organizationSchema, injectStructuredData }) => {
      injectStructuredData(organizationSchema);
    })
    .catch(() => {});
});

if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
}
