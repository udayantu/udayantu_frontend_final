import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
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
import { Download, ArrowLeft, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getOutcomeMetrics,
  getAggregatedOutcomes,
  downloadOutcomesReport,
  getAvailableFilters,
  type OutcomeFilter,
} from "@/lib/outcomesApi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const OutcomesDashboard = () => {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<OutcomeFilter>({});
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCohort, setSelectedCohort] = useState<string>("");

  if (!session) return null;

  const metrics = getOutcomeMetrics("emp_001", filters);
  const aggregated = getAggregatedOutcomes("emp_001", filters);
  const availableFilters = getAvailableFilters("emp_001");

  const handleFilterChange = (type: string, value: string) => {
    if (type === "role") {
      setSelectedRole(value);
      setFilters(prev => ({ ...prev, role: value || undefined }));
    } else if (type === "city") {
      setSelectedCity(value);
      setFilters(prev => ({ ...prev, city: value || undefined }));
    } else if (type === "language") {
      setSelectedLanguage(value);
      setFilters(prev => ({ ...prev, language: value || undefined }));
    } else if (type === "cohort") {
      setSelectedCohort(value);
      setFilters(prev => ({ ...prev, cohortMonth: value || undefined }));
    }
  };

  const handleExport = () => {
    try {
      downloadOutcomesReport("emp_001", filters);
      toast({
        title: "Success",
        description: "Outcomes report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  // Data for funnel chart
  const funnelData = [
    { name: "Delivered", value: aggregated.totalDelivered },
    { name: "Shortlisted", value: aggregated.totalShortlisted },
    { name: "Interviewed", value: aggregated.totalInterviewed },
    { name: "Offered", value: aggregated.totalOffered },
    { name: "Joined", value: aggregated.totalJoined },
  ];

  // Data for conversion rates
  const conversionData = [
    { stage: "Delivered→Shortlist", rate: aggregated.conversionRates.deliveredToShortlist },
    { stage: "Shortlist→Interview", rate: aggregated.conversionRates.shortlistToInterview },
    { stage: "Interview→Offer", rate: aggregated.conversionRates.interviewToOffer },
    { stage: "Offer→Join", rate: aggregated.conversionRates.offerToJoin },
  ];

  // Data for details table
  const chartData = metrics.map((m, idx) => ({
    id: idx,
    role: m.role || "N/A",
    delivered: m.candidatesDelivered,
    shortlisted: m.candidatesShortlisted,
    interviewed: m.candidatesInterviewed,
    offered: m.candidatesOffered,
    joined: m.candidatesJoined,
    timeToHire: m.medianTimeToHire,
    joiningRate: m.joiningRate,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-outcomes"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-bold">Outcomes Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Track hiring funnel and metrics</p>
          </div>
          <Button onClick={handleExport} className="gap-2" data-testid="button-export-outcomes">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Filters - Mobile First */}
        <Card className="bg-white dark:bg-slate-900" data-testid="card-filters-outcomes">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Role Filter */}
              <Select value={selectedRole} onValueChange={v => handleFilterChange("role", v)}>
                <SelectTrigger data-testid="select-role-outcomes">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {availableFilters.roles.map(role => (
                    <SelectItem key={role} value={role || ""}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select value={selectedCity} onValueChange={v => handleFilterChange("city", v)}>
                <SelectTrigger data-testid="select-city-outcomes">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {availableFilters.cities.map(city => (
                    <SelectItem key={city} value={city || ""}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Language Filter */}
              <Select value={selectedLanguage} onValueChange={v => handleFilterChange("language", v)}>
                <SelectTrigger data-testid="select-language-outcomes">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Languages</SelectItem>
                  {availableFilters.languages.map(lang => (
                    <SelectItem key={lang} value={lang || ""}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cohort Filter */}
              <Select value={selectedCohort} onValueChange={v => handleFilterChange("cohort", v)}>
                <SelectTrigger data-testid="select-cohort-outcomes">
                  <SelectValue placeholder="Select Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cohorts</SelectItem>
                  {availableFilters.cohortMonths.map(month => (
                    <SelectItem key={month} value={month || ""}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics - Mobile First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time to Hire */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" data-testid="card-time-to-hire">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Median Time to Hire</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                    {aggregated.averageTimeToHire}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">days</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Joining Rate */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" data-testid="card-joining-rate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Joining Rate</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-300 mt-2">
                    {aggregated.averageJoiningRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">of offers accepted</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Total Delivered */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800" data-testid="card-total-delivered">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Candidates Delivered</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                    {aggregated.totalDelivered}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">total pipeline</p>
                </div>
                <Users className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Total Joined */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800" data-testid="card-total-joined">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Candidates Joined</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-300 mt-2">
                    {aggregated.totalJoined}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">successful hires</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hiring Funnel - Vertical on Mobile */}
          <Card data-testid="card-funnel-chart">
            <CardHeader>
              <CardTitle className="text-lg">Hiring Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={funnelData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Rates */}
          <Card data-testid="card-conversion-chart">
            <CardHeader>
              <CardTitle className="text-lg">Conversion Rates (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" name="Conversion %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Outcome Distribution */}
          <Card data-testid="card-pie-chart">
            <CardHeader>
              <CardTitle className="text-lg">Current Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Shortlisted", value: aggregated.totalShortlisted },
                      { name: "Interviewed", value: aggregated.totalInterviewed },
                      { name: "Offered", value: aggregated.totalOffered },
                      { name: "Joined", value: aggregated.totalJoined },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Metrics Summary Table - Responsive */}
          <Card data-testid="card-metrics-table">
            <CardHeader>
              <CardTitle className="text-lg">Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-center py-2 px-2">TTH</th>
                    <th className="text-center py-2 px-2">Join %</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.slice(0, 5).map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 truncate">{row.role}</td>
                      <td className="text-center py-2 px-2">{row.timeToHire}d</td>
                      <td className="text-center py-2 px-2">{row.joiningRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OutcomesDashboard;
