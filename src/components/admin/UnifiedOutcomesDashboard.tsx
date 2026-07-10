/**
 * Unified Outcomes Dashboard
 * Mobile-friendly charts with Hindi labels, cohort filters, and SLA alerts
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  Clock,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Filter,
  Bell,
  IndianRupee,
} from "lucide-react";
import { outcomesService } from "@/lib/outcomesService";
import {
  UnifiedOutcomesData,
  CohortFilters,
  OutcomesRole,
  SLAAlert,
  KPI_LABELS,
  COHORT_FILTER_LABELS,
  SLA_ALERT_LABELS,
  DASHBOARD_LABELS,
  EXPORT_LABELS,
} from "@/types/outcomes";

interface UnifiedOutcomesDashboardProps {
  role: OutcomesRole;
  language?: "en" | "hi";
  liteMode?: boolean;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"];

const STATUS_COLORS: Record<string, string> = {
  enrolled: "#3b82f6",
  in_training: "#f59e0b",
  ready: "#10b981",
  interviewing: "#8b5cf6",
  offered: "#ec4899",
  joined: "#22c55e",
  alumni: "#6366f1",
};

export function UnifiedOutcomesDashboard({
  role,
  language = "hi",
  liteMode = false,
}: UnifiedOutcomesDashboardProps) {
  const [data, setData] = useState<UnifiedOutcomesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CohortFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const t = DASHBOARD_LABELS[language];
  const kpiLabels = KPI_LABELS[language];
  const filterLabels = COHORT_FILTER_LABELS[language];
  const alertLabels = SLA_ALERT_LABELS[language];
  const exportLabels = EXPORT_LABELS[language];

  useEffect(() => {
    loadData();
  }, [filters, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await outcomesService.getUnifiedOutcomes(filters, role);
      setData(result);
    } catch (error) {
      console.error("Failed to load outcomes data:", error);
      toast({
        title: language === "hi" ? "डेटा लोड नहीं हुआ" : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const result = await outcomesService.exportData(
        {
          includeRawData: true,
          includePII: role === "admin",
          format,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            end: new Date().toISOString().split("T")[0],
          },
        },
        role
      );

      const blob = new Blob([result.content], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: exportLabels.success,
      });
    } catch (error) {
      toast({
        title: exportLabels.error,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    await outcomesService.resolveAlert(alertId);
    loadData();
    toast({
      title: language === "hi" ? "अलर्ट हल किया गया" : "Alert resolved",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t.noData}</p>
      </Card>
    );
  }

  const kpiCards = [
    {
      key: "timeToShortlist",
      label: kpiLabels.timeToShortlist,
      value: `${data.kpis.timeToShortlist}${language === "hi" ? " घंटे" : "h"}`,
      icon: Clock,
      color: "text-blue-500",
      description: language === "hi" ? "तैयार से शॉर्टलिस्ट" : "Ready to shortlist",
    },
    {
      key: "interviewAttendance",
      label: kpiLabels.interviewAttendance,
      value: `${data.kpis.interviewAttendance}%`,
      icon: Users,
      color: "text-green-500",
      description: language === "hi" ? "इंटरव्यू में उपस्थित" : "Attended interviews",
    },
    {
      key: "offerRate",
      label: kpiLabels.offerRate,
      value: `${data.kpis.offerRate}%`,
      icon: Briefcase,
      color: "text-purple-500",
      description: language === "hi" ? "ऑफर मिला" : "Received offers",
    },
    {
      key: "joiningRate",
      label: kpiLabels.joiningRate,
      value: `${data.kpis.joiningRate}%`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      description: language === "hi" ? "ज्वाइन किया" : "Joined company",
    },
    {
      key: "medianLPA",
      label: kpiLabels.medianLPA,
      value: `₹${data.kpis.medianLPA} LPA`,
      icon: IndianRupee,
      color: "text-orange-500",
      description: language === "hi" ? "औसत पैकेज" : "Median package",
    },
    {
      key: "timeToOffer",
      label: kpiLabels.timeToOffer,
      value: `${data.kpis.timeToOffer} ${t.days}`,
      icon: TrendingUp,
      color: "text-indigo-500",
      description: language === "hi" ? "तैयार से ऑफर" : "Ready to offer",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t.filters}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t.refreshData}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {exportLabels.exportCSV}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{filterLabels.role}</label>
              <Select
                value={filters.role?.[0] || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, role: val === "all" ? undefined : [val] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={filterLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filterLabels.all}</SelectItem>
                  <SelectItem value="Software Developer">Software Developer</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{filterLabels.city}</label>
              <Select
                value={filters.city?.[0] || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, city: val === "all" ? undefined : [val] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={filterLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filterLabels.all}</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{filterLabels.degree}</label>
              <Select
                value={filters.degree?.[0] || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, degree: val === "all" ? undefined : [val] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={filterLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filterLabels.all}</SelectItem>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="B.Sc">B.Sc</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{filterLabels.month}</label>
              <Select
                value={filters.month?.[0] || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, month: val === "all" ? undefined : [val] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={filterLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filterLabels.all}</SelectItem>
                  <SelectItem value="2026-01">Jan 2026</SelectItem>
                  <SelectItem value="2025-12">Dec 2025</SelectItem>
                  <SelectItem value="2025-11">Nov 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
              >
                {filterLabels.clearFilters}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {data.alerts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              {alertLabels.alertsTitle} ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {language === "hi" ? alert.titleHi : alert.title}
                      </p>
                      <p className="text-sm opacity-80">
                        {language === "hi" ? alert.messageHi : alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-8 sm:ml-0">
                    <Badge variant="outline" className="capitalize">
                      {alertLabels[alert.severity as keyof typeof alertLabels]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      {alertLabels.resolve}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.key}
              className="p-4 border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {!liteMode && (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="trends">{t.trends}</TabsTrigger>
            <TabsTrigger value="breakdown">{t.breakdown}</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg">
                  {language === "hi" ? "30 दिनों का ट्रेंड" : "30-Day Trend"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--primary)/0.2)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="shortlisted"
                      name={language === "hi" ? "शॉर्टलिस्ट" : "Shortlisted"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interviewed"
                      name={language === "hi" ? "इंटरव्यू" : "Interviewed"}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="offered"
                      name={language === "hi" ? "ऑफर" : "Offered"}
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="joined"
                      name={language === "hi" ? "ज्वाइन" : "Joined"}
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">
                    {language === "hi" ? "स्टेटस पाई चार्ट" : "Status Distribution"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={data.breakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) =>
                          `${language === "hi" ? entry.statusHi : entry.status}: ${entry.percentage}%`
                        }
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.breakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          language === "hi" ? props.payload.statusHi : name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">
                    {language === "hi" ? "स्टेटस बार चार्ट" : "Status Bar Chart"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.breakdown}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        type="category"
                        dataKey={language === "hi" ? "statusHi" : "status"}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          language === "hi" ? "संख्या" : "Count",
                        ]}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {data.breakdown.map((entry, index) => (
                          <Cell
                            key={`bar-${index}`}
                            fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="text-xs text-muted-foreground text-right">
        {t.lastUpdated}: {new Date(data.lastUpdated).toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}
      </div>
    </div>
  );
}
