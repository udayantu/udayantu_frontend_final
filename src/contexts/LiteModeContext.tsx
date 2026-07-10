import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface LiteModeContextType {
  liteMode: boolean;
  setLiteMode: (enabled: boolean) => void;
  toggleLiteMode: () => void;
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(undefined);

const LITE_MODE_KEY = "udayantu_lite_mode";

interface LiteModeProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
}

export function LiteModeProvider({ children, defaultEnabled = false }: LiteModeProviderProps) {
  const [liteMode, setLiteModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultEnabled;
    
    const stored = localStorage.getItem(LITE_MODE_KEY);
    if (stored !== null) {
      return stored === "true";
    }
    
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (connection) {
      if (connection.saveData) return true;
      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") return true;
    }
    
    return defaultEnabled;
  });

  useEffect(() => {
    localStorage.setItem(LITE_MODE_KEY, String(liteMode));
  }, [liteMode]);

  const setLiteMode = (enabled: boolean) => {
    setLiteModeState(enabled);
  };

  const toggleLiteMode = () => {
    setLiteModeState((prev) => !prev);
  };

  return (
    <LiteModeContext.Provider value={{ liteMode, setLiteMode, toggleLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode() {
  const context = useContext(LiteModeContext);
  if (context === undefined) {
    throw new Error("useLiteMode must be used within a LiteModeProvider");
  }
  return context;
}

export function useLiteModeOptional() {
  const context = useContext(LiteModeContext);
  return context ?? { liteMode: false, setLiteMode: () => {}, toggleLiteMode: () => {} };
}
