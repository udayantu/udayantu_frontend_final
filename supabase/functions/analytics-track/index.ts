import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const {
      page,
      visitor_id,
      session_id,
      device_type,
      browser,
      os,
      country,
      city,
      referrer,
      timestamp,
    } = body;

    const { error } = await supabase.from("page_visits").insert({
      page_name: page,
      visitor_id,
      session_id,
      device_type: device_type || "unknown",
      browser: browser || "unknown",
      os: os || "unknown",
      country: country || "unknown",
      city: city || "unknown",
      referrer: referrer || "",
      timestamp: timestamp || new Date().toISOString(),
      bounced: false,
      session_duration_seconds: 0,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Analytics track error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
