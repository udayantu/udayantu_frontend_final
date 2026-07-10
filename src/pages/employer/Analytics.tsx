import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  AlertTriangle,
  TrendingUp,
  Users,
  FileCheck,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getAnalytics, type AnalyticsData } from "@/lib/analyticsApi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const Analytics = () => {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Bilingual text object
  const t = {
    en: {
      analytics: "Analytics Dashboard",
      metrics: "Key Metrics",
      timeToShortlist: "Time to Shortlist",
      hours: "hours",
      interviewAttendance: "Interview Attendance",
      percent: "%",
      offerRate: "Offer Rate",
      joiningRate: "Joining Rate",
      trends: "Hiring Trends (7 Days)",
      shortlisted: "Shortlisted",
      offered: "Offered",
      joined: "Joined",
      offerBreakdown: "Offer Status Breakdown",
      slaAlerts: "SLA Alerts",
      noAlerts: "All systems operating normally",
      deliveryDelay: "Candidate Delivery SLA exceeded (72h limit)",
      noShow: "Interview no-show rate detected",
      critical: "Critical",
      warning: "Warning",
      back: "Back to Dashboard",
    },
    hi: {
      analytics: "विश्लेषण डैशबोर्ड",
      metrics: "मुख्य मेट्रिक्स",
      timeToShortlist: "शॉर्टलिस्ट करने में समय",
      hours: "घंटे",
      interviewAttendance: "साक्षात्कार उपस्थिति",
      percent: "%",
      offerRate: "ऑफर दर",
      joiningRate: "शामिल होने की दर",
      trends: "भर्ती प्रवृत्ति (7 दिन)",
      shortlisted: "शॉर्टलिस्ट किए गए",
      offered: "प्रस्ताव दिया गया",
      joined: "शामिल",
      offerBreakdown: "ऑफर स्थिति विभाजन",
      slaAlerts: "SLA सतर्कता",
      noAlerts: "सभी प्रणालियां सामान्य रूप से काम कर रही हैं",
      deliveryDelay: "उम्मीदवार वितरण SLA अतिक्रमित (72 घंटे की सीमा)",
      noShow: "साक्षात्कार में नहीं आने की दर का पता चला",
      critical: "गंभीर",
      warning: "चेतावनी",
      back: "डैशबोर्ड पर वापस जाएं",
    },
  };

  const text = t[language];

  // Auth check
  useEffect(() => {
    if (!session?.id) {
      navigate("/employer-login");
    }
  }, [session, navigate]);

  // Load analytics
  useEffect(() => {
    if (session?.id) {
      loadAnalytics();
    }
  }, [session?.id]);

  const loadAnalytics = async () => {
    if (!session?.id) return;
    setIsLoading(true);
    try {
      const data = await getAnalytics(session.id);
      setAnalyticsData(data);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/employer-dashboard")}
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {text.analytics}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {session.companyName} - {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-2">
            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
              data-testid="button-lang-en"
            >
              English
            </Button>
            <Button
              variant={language === "hi" ? "default" : "outline"}
              onClick={() => setLanguage("hi")}
              data-testid="button-lang-hi"
            >
              हिंदी
            </Button>
          </div>
        </div>

        {/* Key Metrics - Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Time to Shortlist */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {text.timeToShortlist}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {analyticsData.metrics.timeToShortlist}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{text.hours}</p>
            </CardContent>
          </Card>

          {/* Interview Attendance */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                {text.interviewAttendance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.metrics.interviewAttendance.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{text.percent}</p>
            </CardContent>
          </Card>

          {/* Offer Rate */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {text.offerRate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.metrics.offerRate.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{text.percent}</p>
            </CardContent>
          </Card>

          {/* Joining Rate */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {text.joiningRate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {analyticsData.metrics.joiningRate.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{text.percent}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Line Chart */}
          <Card className="border">
            <CardHeader>
              <CardTitle>{text.trends}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="shortlisted"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    name={text.shortlisted}
                  />
                  <Line
                    type="monotone"
                    dataKey="offered"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                    name={text.offered}
                  />
                  <Line
                    type="monotone"
                    dataKey="joined"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name={text.joined}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Offer Status Pie Chart */}
          <Card className="border">
            <CardHeader>
              <CardTitle>{text.offerBreakdown}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.offerBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.offerBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* SLA Alerts Section */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              {text.slaAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-foreground font-semibold">
                  {text.noAlerts}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle
                        className={`w-5 h-5 mt-1 flex-shrink-0 ${
                          alert.severity === "critical"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {alert.type === "delivery_delay"
                            ? text.deliveryDelay
                            : text.noShow}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "critical" ? "destructive" : "secondary"
                      }
                      className="flex-shrink-0"
                    >
                      {alert.severity === "critical"
                        ? text.critical
                        : text.warning}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadAnalytics}
            variant="outline"
            data-testid="button-refresh-analytics"
          >
            Refresh Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
