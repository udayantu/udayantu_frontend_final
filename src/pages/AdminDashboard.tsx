import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRBAC } from "@/hooks/useAdminRBAC";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Users, FileText, Shield, BarChart3, UserCheck, TrendingUp, Package, Phone, Award, Calendar, Briefcase, BookOpen, Mail, DollarSign, ChevronDown, MessageSquare, Settings, ClipboardList } from "lucide-react";
import { AdminCourses } from "@/components/admin/AdminCourses";
import { AdminStudents } from "@/components/admin/AdminStudents";
import { AdminEmployers } from "@/components/admin/AdminEmployers";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminIntegrations } from "@/components/admin/AdminAnalytics";
import { AdminRoles } from "@/components/admin/AdminRoles";
import { AdminAssessments } from "@/components/admin/AdminAssessments";
import { AdminOverview } from "@/components/admin/AdminOverview";
import AdminContacts from "@/pages/admin/AdminContacts";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { UserManagement, RBACauditLogs } from "@/components/admin/rbac";
import { DataParityCheck } from "@/components/admin/DataParityCheck";
import { ReadyCandidates } from "@/components/admin/ReadyCandidates";
import { UnifiedOutcomesDashboard } from "@/components/admin/UnifiedOutcomesDashboard";
import { OutcomesParityCheck } from "@/components/admin/OutcomesParityCheck";
import { ConsentCenter, RefundDashboard, ComplianceTickets, DataRequestPanel } from "@/components/compliance";
import { PacketsDashboard } from "@/components/admin/PacketsDashboard";
import { CSActionsDashboard } from "@/components/admin/CSActionsDashboard";
import { AdminTeachers } from "@/components/admin/AdminTeachers";
import { AdminMentorSessions } from "@/components/admin/AdminMentorSessions";
import { AdminCommunications } from "@/components/admin/AdminCommunications";
import { AdminReports } from "@/components/admin/AdminReports";
import logoImage from "@/assets/udayantu-logo-uploaded.png";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { 
    currentUser: rbacUser, 
    isLoading: rbacLoading,
    checkPermission,
    getRoleLabel,
  } = useAdminRBAC();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;

      // Dev Mode Bypass on Localhost
      const isLocalhost = 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.startsWith("192.168.") ||
        window.location.hostname.startsWith("10.");

      if (isLocalhost) {
        console.log("Dev Mode: Bypassing auth and admin role check on local network.");
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Access Denied",
            description: "You don't have admin access",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: "Failed to verify admin access",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading, navigate, toast]);

  if (authLoading || loading || rbacLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const canViewUsers = checkPermission("manage_users");
  const canViewAudit = checkPermission("view_audit_logs");

  return (
    <Tabs defaultValue="overview" className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sleek left sidebar layout */}
      <div className="w-full md:w-64 bg-[#06182C] text-white flex flex-col h-auto md:h-screen md:sticky md:top-0 border-r border-[#0b1e36]/30 shadow-xl z-20">
        <div className="p-5 border-b border-white/10 flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="UdaYantu Logo" 
            className="h-16 w-auto object-contain" 
          />
        </div>

        <TabsList className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden p-3.5 h-auto md:flex-1 bg-transparent border-none text-left items-start justify-start select-none">
          <TabsTrigger value="overview" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-overview">
            <BarChart3 className="w-4.5 h-4.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-students">
            <Users className="w-4.5 h-4.5" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-teachers">
            <Award className="w-4.5 h-4.5" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="sessions" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-sessions">
            <Calendar className="w-4.5 h-4.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="ready" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-ready">
            <UserCheck className="w-4.5 h-4.5" />
            Ready Pool
          </TabsTrigger>
          <TabsTrigger value="packets" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-packets">
            <Package className="w-4.5 h-4.5" />
            Study Packets
          </TabsTrigger>
          <TabsTrigger value="csactions" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-csactions">
            <Phone className="w-4.5 h-4.5" />
            CS Actions
          </TabsTrigger>
          <TabsTrigger value="assessments" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-assessments">
            <FileText className="w-4.5 h-4.5" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="employers" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-employers">
            <Briefcase className="w-4.5 h-4.5" />
            Employers
          </TabsTrigger>
          <TabsTrigger value="contacts" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-contacts">
            <Mail className="w-4.5 h-4.5" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="outcomes" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-outcomes">
            <UserCheck className="w-4.5 h-4.5" />
            Placements
          </TabsTrigger>
          <TabsTrigger value="payments" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-payments">
            <DollarSign className="w-4.5 h-4.5" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="courses" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-courses">
            <BookOpen className="w-4.5 h-4.5" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-integrations">
            <TrendingUp className="w-4.5 h-4.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-reports">
            <ClipboardList className="w-4.5 h-4.5" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="compliance" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-compliance">
            <Lock className="w-4.5 h-4.5" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="data" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-data">
            <BarChart3 className="w-4.5 h-4.5" />
            Data Tools
          </TabsTrigger>
          <TabsTrigger value="communications" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-communications">
            <MessageSquare className="w-4.5 h-4.5" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-settings">
            <Settings className="w-4.5 h-4.5" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* Dynamic User Profile Footer matching the screenshot */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-transparent select-none">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-slate-700 flex items-center justify-center font-bold text-sm uppercase">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white leading-tight truncate max-w-[110px]" title={rbacUser?.fullName || "Pradeep K. C."}>
                {rbacUser?.fullName || "Pradeep K. C."}
              </p>
              <p className="text-xs text-[#A2B6CF] font-medium truncate max-w-[110px]">
                {rbacUser ? getRoleLabel(rbacUser.role) : "Super Admin"}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#A2B6CF] hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] overflow-y-auto">


        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <TabsContent value="overview" className="mt-0 outline-none">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="courses" className="mt-0 outline-none">
            <AdminCourses />
          </TabsContent>

          <TabsContent value="students" className="mt-0 outline-none">
            <AdminStudents />
          </TabsContent>

          <TabsContent value="ready" className="mt-0 outline-none">
            <ReadyCandidates 
              userRole={rbacUser?.role || "main_admin"}
              userId={user?.id || ""}
              onScheduleInterview={(studentId, studentName) => {
                toast({
                  title: "Schedule Interview",
                  description: `Opening interview scheduler for ${studentName}`,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="packets" className="mt-0 outline-none">
            <PacketsDashboard 
              userRole={rbacUser?.role === "student_success" ? "ss" : 
                        rbacUser?.role === "customer_success" ? "cs" :
                        rbacUser?.role === "content_expert" ? "content" : "admin"}
              language="en"
            />
          </TabsContent>

          <TabsContent value="csactions" className="mt-0 outline-none">
            <CSActionsDashboard 
              userRole={rbacUser?.role === "customer_success" ? "cs" : "admin"}
              language="en"
            />
          </TabsContent>

          <TabsContent value="roles" className="mt-0 outline-none">
            <AdminRoles />
          </TabsContent>

          <TabsContent value="assessments" className="mt-0 outline-none">
            <AdminAssessments />
          </TabsContent>

          <TabsContent value="employers" className="mt-0 outline-none">
            <AdminEmployers />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 outline-none">
            <AdminContacts />
          </TabsContent>

          <TabsContent value="payments" className="mt-0 outline-none">
            <AdminPayments />
          </TabsContent>

          <TabsContent value="integrations" className="mt-0 outline-none">
            <AdminIntegrations />
          </TabsContent>

          <TabsContent value="compliance" className="mt-0 outline-none">
            <div className="space-y-6">
              <ComplianceStatus />
              <Tabs defaultValue="tickets" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  <TabsTrigger value="data-requests">Data Requests</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tickets">
                  <ComplianceTickets
                    userId={user?.id || ""}
                    role={rbacUser?.role === "student_success" ? "student_success" : 
                          rbacUser?.role === "customer_success" ? "customer_success" : "admin"}
                    language="en"
                  />
                </TabsContent>
                <TabsContent value="refunds">
                  <RefundDashboard
                    role={rbacUser?.role === "student_success" ? "student_success" : 
                          rbacUser?.role === "customer_success" ? "customer_success" : "admin"}
                    language="en"
                  />
                </TabsContent>
                <TabsContent value="data-requests">
                  <DataRequestPanel
                    userId={user?.id || ""}
                    userType="student"
                    role={rbacUser?.role === "student_success" ? "student_success" : 
                          rbacUser?.role === "customer_success" ? "customer_success" : "admin"}
                    language="en"
                  />
                </TabsContent>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Full Compliance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Manage all compliance and GDPR settings from the dedicated compliance panel.
                      </p>
                      <Button onClick={() => navigate("/admin/compliance")} data-testid="button-go-compliance">
                        Go to Compliance Panel
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {canViewUsers && (
            <TabsContent value="users" className="mt-0 outline-none">
              <UserManagement />
            </TabsContent>
          )}

          {canViewAudit && (
            <TabsContent value="audit" className="mt-0 outline-none">
              <RBACauditLogs />
            </TabsContent>
          )}

          <TabsContent value="data" className="mt-0 outline-none">
            <div className="space-y-6">
              <DataParityCheck />
              <OutcomesParityCheck language="en" />
            </div>
          </TabsContent>

          <TabsContent value="outcomes" className="mt-0 outline-none">
            <UnifiedOutcomesDashboard 
              role={rbacUser?.role === "student_success" ? "student_success" : 
                    rbacUser?.role === "customer_success" ? "customer_success" : "admin"}
              language="en"
            />
          </TabsContent>

          <TabsContent value="teachers" className="mt-0 outline-none">
            <AdminTeachers />
          </TabsContent>

          <TabsContent value="sessions" className="mt-0 outline-none">
            <AdminMentorSessions />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none">
            <Card className="border border-slate-100 rounded-2xl bg-white p-6 shadow-xs">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-[#1E3A63] flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure portal variables, SMS gateways, and local persistence cache.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-xs font-semibold text-slate-600">
                <p>Configure automated messaging triggers, auth configurations, API endpoints, and cache states.</p>
                <div className="flex gap-2.5 pt-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    localStorage.clear();
                    toast({ title: "Cache cleared", description: "Browser localStorage cache reset." });
                  }} className="h-9 rounded-xl">Clear Cache</Button>
                  <Button size="sm" className="bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90 h-9 rounded-xl">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="mt-0 outline-none">
            <AdminCommunications />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 outline-none">
            <AdminReports />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
