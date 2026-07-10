import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        const mockUserStr = localStorage.getItem("udayantu_mock_user");
        if (mockUserStr) {
          const parsed = JSON.parse(mockUserStr);
          setUser(parsed);
          setSession({ access_token: "mock-token", user: parsed } as any);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    } catch (e) {
      console.error("Auth fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          const mockUserStr = localStorage.getItem("udayantu_mock_user");
          if (mockUserStr) {
            const parsed = JSON.parse(mockUserStr);
            setUser(parsed);
            setSession({ access_token: "mock-token", user: parsed } as any);
          } else {
            setSession(null);
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    fetchSession();

    // Listen to storage events to refresh session across tabs
    const handleStorageChange = () => {
      fetchSession();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem("udayantu_mock_user");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.dispatchEvent(new Event("storage"));
  };

  return { user, session, loading, signOut };
};
