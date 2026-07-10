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

    // Get query parameters
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "7");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get page visits data
    const { data: visits } = await supabase
      .from("page_visits")
      .select("*")
      .eq("page_name", "employers")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString());

    // Get conversion events data
    const { data: conversions } = await supabase
      .from("employer_conversions")
      .select("*")
      .eq("page_name", "employers")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString());

    const visitsArray = visits || [];
    const conversionsArray = conversions || [];

    // Calculate metrics
    const totalVisitors = visitsArray.length;
    const uniqueVisitors = new Set(visitsArray.map(v => v.visitor_id)).size;
    const totalSessions = new Set(visitsArray.map(v => v.session_id)).size;
    const avgSessionDuration =
      visitsArray.length > 0
        ? visitsArray.reduce((sum, v) => sum + (v.session_duration_seconds || 0), 0) /
          visitsArray.length
        : 0;
    const bounceRate =
      visitsArray.length > 0
        ? (visitsArray.filter(v => v.bounced).length / visitsArray.length) * 100
        : 0;
    const conversionRate =
      totalVisitors > 0
        ? (conversionsArray.length / totalVisitors) * 100
        : 0;

    // Device breakdown
    const deviceBreakdown = visitsArray.reduce((acc, v) => {
      const device = v.device_type || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

const totalDevices = totalVisitors || 1;
    const deviceBreakdownPercent = Object.entries(deviceBreakdown).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(((count as number) / totalDevices) * 100),
    }));

    // Top countries
    const countryCounts = visitsArray.reduce((acc, v) => {
      const country = v.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(countryCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([country, visitors]) => ({ country, visitors }));

    // Traffic trend by day
    const trafficByDay: Record<string, number> = {};
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      trafficByDay[dayName] = 0;
    }

    visitsArray.forEach(v => {
      const date = new Date(v.timestamp);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      if (dayName in trafficByDay) {
        trafficByDay[dayName]++;
      }
    });

    const trafficTrend = dayNames.slice(0, days).map(day => ({
      date: day,
      visitors: trafficByDay[day] || 0,
    }));

    // Count conversion types
    const conversionCounts = conversionsArray.reduce((acc, c) => {
      acc[c.event_type] = (acc[c.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      totalVisitors,
      uniqueVisitors,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
      bounceRate: Math.round(bounceRate * 10) / 10,
      trafficTrend,
      deviceBreakdown: deviceBreakdownPercent,
      topCountries,
      registrations: conversionCounts.registration || 0,
      formSubmissions: conversionCounts.form_submission || 0,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Analytics employers error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
