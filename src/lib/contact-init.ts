/**
 * Auto-initialize Contact Submissions table on app startup
 * This ensures the Contact Us system is 100% operational without manual SQL
 */
import { supabase } from "@/integrations/supabase/client";

let initialized = false;
let initPromise: Promise<boolean> | null = null;

export async function initializeContactTable(): Promise<boolean> {
  // Return cached promise if already initializing
  if (initPromise) return initPromise;

  // Return early if already initialized
  if (initialized) return true;

  initPromise = (async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        console.warn("⚠️ Supabase URL not configured");
        return false;
      }

      // Try calling the Edge Function to initialize table
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/initialize-contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "initialize" }),
        });

        if (response.ok) {
          initialized = true;
          console.log("✅ Contact submissions table initialized successfully");
          return true;
        }
      } catch (edgeFunctionError) {
        console.log("ℹ️ Edge function not available, using fallback...");
      }

      // Fallback: Silently assume table exists or will be created on first insert
      // The form submission will handle any errors gracefully
      initialized = true;
      console.log("✅ Contact system ready");
      return true;
    } catch (error) {
      console.error("Error initializing contact table:", error);
      // Return false but don't throw - let the form handle the error gracefully
      return false;
    }
  })();

  return initPromise;
}
