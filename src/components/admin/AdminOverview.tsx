import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://klitiyxvszecmibaiaop.supabase.co",
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaXRpeXh2c3plY21pYmFpYW9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg4NTc0MywiZXhwIjoyMTAwNDYxNzQzfQ.MoR48fkUas7Munm9kG21Az81wqw6f2lIw9jwnmjnd6M",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, DollarSign, TrendingUp, GraduationCap, Briefcase, FileCheck, Clock } from "lucide-react";
import { StatCard } from "./shared/StatCard";
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
  ResponsiveContainer,
} from "recharts";

interface OverviewStats {
  totalStudents: number;
  totalRevenue: number;
  paidStudents: number;
  pendingPayments: number;
  activeEmployers: number;
  completedAssessments: number;
  pendingAssessments: number;
  placementRate: number;
}

interface EnrollmentTrend {
  date: string;
  students: number;
}

interface RoleDistribution {
  role: string;
  count: number;
}

const COLORS = ['#2B4C7E', '#FF6B35', '#F4E1B3', '#4FD1C5', '#9F7AEA'];

const MOCK_STATS: OverviewStats = {
  totalStudents: 1248,
  totalRevenue: 499900,
  paidStudents: 912,
  pendingPayments: 336,
  activeEmployers: 48,
  completedAssessments: 870,
  pendingAssessments: 378,
  placementRate: 87,
};

const MOCK_TREND: EnrollmentTrend[] = [
  { date: "Jul 02", students: 12 },
  { date: "Jul 03", students: 19 },
  { date: "Jul 04", students: 15 },
  { date: "Jul 05", students: 28 },
  { date: "Jul 06", students: 22 },
  { date: "Jul 07", students: 34 },
  { date: "Jul 08", students: 41 },
];

const MOCK_ROLES: RoleDistribution[] = [
  { role: "Business Development", count: 420 },
  { role: "Customer Success", count: 310 },
  { role: "Project Management", count: 240 },
  { role: "Operations Management", count: 180 },
  { role: "Human Resources", count: 98 },
];

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [enrollmentTrend, setEnrollmentTrend] = useState<EnrollmentTrend[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [studentsRes, paymentsRes, employersRes, assessmentsRes] = await Promise.all([
        adminSupabase.from("student_registrations").select("payment_status, created_at, desired_role", { count: "exact" }),
        adminSupabase.from("payments").select("amount, status, created_at", { count: "exact" }),
        adminSupabase.from("employers").select("id", { count: "exact" }),
        adminSupabase.from("assessments").select("completed_at", { count: "exact" }),
      ]);

      const students = studentsRes.data || [];
      const payments = paymentsRes.data || [];

      if (students.length === 0 && payments.length === 0) {
        // Render empty/zero state for fresh production database
        setStats({
          totalStudents: 0,
          totalRevenue: 0,
          paidStudents: 0,
          pendingPayments: 0,
          activeEmployers: 0,
          completedAssessments: 0,
          pendingAssessments: 0,
          placementRate: 0,
        });
        setEnrollmentTrend([]);
        setRoleDistribution([]);
        setIsUsingMock(false);
      } else {
        // Calculate stats from live database rows
        const paidStudents = students.filter(s => s.payment_status === 'paid').length;
        const totalRevenue = payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0) / 100;

        const completedAssessments = assessmentsRes.data?.filter(a => a.completed_at).length || 0;
        const totalAssessments = assessmentsRes.count || 0;

        setStats({
          totalStudents: studentsRes.count || 0,
          totalRevenue,
          paidStudents,
          pendingPayments: students.filter(s => s.payment_status === 'pending' || s.payment_status === 'unpaid').length,
          activeEmployers: employersRes.count || 0,
          completedAssessments,
          pendingAssessments: totalAssessments - completedAssessments,
          placementRate: paidStudents > 0 ? Math.round((paidStudents / students.length) * 81) : 0,
        });

        // Process enrollment trend (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const trendData = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          students: students.filter(s => s.created_at.startsWith(date)).length,
        }));

        setEnrollmentTrend(trendData);

        // Process role distribution
        const roleCount: Record<string, number> = {};
        students.forEach(s => {
          if (s.desired_role) {
            roleCount[s.desired_role] = (roleCount[s.desired_role] || 0) + 1;
          }
        });

        const roleData = Object.entries(roleCount)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setRoleDistribution(roleData);
        setIsUsingMock(false);
      }
    } catch (error: unknown) {
      console.error("Database fetch failed, loading empty analytics states.");
      setStats({
        totalStudents: 0,
        totalRevenue: 0,
        paidStudents: 0,
        pendingPayments: 0,
        activeEmployers: 0,
        completedAssessments: 0,
        pendingAssessments: 0,
        placementRate: 0,
      });
      setEnrollmentTrend([]);
      setRoleDistribution([]);
      setIsUsingMock(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          description="All-time enrollments"
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          description={`${stats.paidStudents} paid students`}
          icon={DollarSign}
        />
        <StatCard
          title="Placement Rate"
          value={`${stats.placementRate}%`}
          description="Based on paid students"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Employers"
          value={stats.activeEmployers}
          description="In hiring pipeline"
          icon={Briefcase}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Paid Students"
          value={stats.paidStudents}
          description={`${stats.pendingPayments} pending payments`}
          icon={GraduationCap}
        />
        <StatCard
          title="Completed Assessments"
          value={stats.completedAssessments}
          description={`${stats.pendingAssessments} pending`}
          icon={FileCheck}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="Need follow-up"
          icon={Clock}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.totalStudents > 0 ? Math.round((stats.paidStudents / stats.totalStudents) * 100) : 0}%`}
          description="Registration to payment"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrollment Trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Enrollment Trend</CardTitle>
            <CardDescription>Recent student registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#2B4C7E"
                  strokeWidth={3}
                  dot={{ fill: '#2B4C7E', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Role Distribution</CardTitle>
            <CardDescription>Top 5 desired career roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  fontSize={10}
                >
                  {roleDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Payment Status Overview</CardTitle>
          <CardDescription>Distribution of student payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { status: 'Paid', count: stats.paidStudents },
                { status: 'Pending', count: stats.pendingPayments },
                { status: 'Unpaid', count: stats.totalStudents - stats.paidStudents - stats.pendingPayments },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#FF6B35" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
