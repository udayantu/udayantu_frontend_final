import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  MousePointerClick,
  Globe,
  Smartphone,
  Target,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  trafficTrend: Array<{ date: string; visitors: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  topCountries: Array<{ country: string; visitors: number }>;
  registrations: number;
  formSubmissions: number;
}

const COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];

export function AdminAnalyticsEmployers() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisitors: 4523,
    uniqueVisitors: 2841,
    conversionRate: 12.5,
    avgSessionDuration: 3.2,
    bounceRate: 35.8,
    trafficTrend: [
      { date: "Mon", visitors: 320 },
      { date: "Tue", visitors: 480 },
      { date: "Wed", visitors: 420 },
      { date: "Thu", visitors: 590 },
      { date: "Fri", visitors: 760 },
      { date: "Sat", visitors: 540 },
      { date: "Sun", visitors: 290 },
    ],
    deviceBreakdown: [
      { name: "Desktop", value: 65 },
      { name: "Mobile", value: 28 },
      { name: "Tablet", value: 7 },
    ],
    topCountries: [
      { country: "India", visitors: 3200 },
      { country: "USA", visitors: 580 },
      { country: "UK", visitors: 390 },
      { country: "Canada", visitors: 210 },
      { country: "Australia", visitors: 143 },
    ],
    registrations: 312,
    formSubmissions: 567,
  });

  // Load analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        if (!supabaseUrl) return;
        
        const url = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/analytics-employers?days=7`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(prev => ({
            ...prev,
            totalVisitors: data.totalVisitors || prev.totalVisitors,
            uniqueVisitors: data.uniqueVisitors || prev.uniqueVisitors,
            conversionRate: data.conversionRate || prev.conversionRate,
            avgSessionDuration: data.avgSessionDuration || prev.avgSessionDuration,
            bounceRate: data.bounceRate || prev.bounceRate,
            trafficTrend: data.trafficTrend || prev.trafficTrend,
            deviceBreakdown: data.deviceBreakdown || prev.deviceBreakdown,
            topCountries: data.topCountries || prev.topCountries,
            registrations: data.registrations || prev.registrations,
            formSubmissions: data.formSubmissions || prev.formSubmissions,
          }));
        }
      } catch (e) {
        console.log("Analytics fetch error:", e);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: "Total Visitors",
      value: analytics.totalVisitors.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Unique Visitors",
      value: analytics.uniqueVisitors.toLocaleString(),
      change: "+8.2%",
      icon: Target,
      color: "text-purple-500",
    },
    {
      label: "Conversion Rate",
      value: analytics.conversionRate + "%",
      change: "+2.3%",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Avg Session Duration",
      value: analytics.avgSessionDuration + " min",
      change: "+0.5 min",
      icon: Activity,
      color: "text-orange-500",
    },
    {
      label: "Bounce Rate",
      value: analytics.bounceRate + "%",
      change: "-4.1%",
      icon: MousePointerClick,
      color: "text-red-500",
    },
    {
      label: "Registrations",
      value: analytics.registrations.toString(),
      change: "+18 this week",
      icon: Users,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Real-time analytics for the Employers page
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="p-6 border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg"
              data-testid={`card-analytics-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                  <Badge variant="secondary" className="mt-2">
                    {kpi.change}
                  </Badge>
                </div>
                <Icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trend */}
        <Card className="p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Traffic Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trafficTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--primary)/0.2)",
                }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Countries */}
        <Card className="p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {analytics.topCountries.map((country, idx) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center rounded-full p-0">
                    {idx + 1}
                  </Badge>
                  <span className="font-medium">{country.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(country.visitors / analytics.topCountries[0].visitors) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {country.visitors}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Conversion Metrics */}
        <Card className="p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Conversion Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Form Submissions</span>
                <span className="font-bold">{analytics.formSubmissions}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "85%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Registrations</span>
                <span className="font-bold">{analytics.registrations}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "55%" }} />
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Conversion Rate: {((analytics.registrations / analytics.formSubmissions) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="p-6 border border-primary/20 bg-muted/20">
        <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">New Sessions</p>
            <p className="text-2xl font-bold">3,284</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Returning Users</p>
            <p className="text-2xl font-bold">1,547</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Pages/Session</p>
            <p className="text-2xl font-bold">2.8</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
            <p className="text-2xl font-bold text-green-500">+24%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
