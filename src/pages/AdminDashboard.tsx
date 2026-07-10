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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Users, FileText, Shield, BarChart3, UserCheck, TrendingUp, Package, Phone, Award, Calendar, Briefcase, BookOpen, Mail, DollarSign, ChevronDown, MessageSquare, Settings, ClipboardList, ShieldCheck, LogOut } from "lucide-react";
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
import AdminBlogs from "@/components/admin/AdminBlogs";
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
  const [isSecureAdminLoggedIn, setIsSecureAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initializing default secure credentials
    if (!localStorage.getItem("udayantu_admin_email")) {
      localStorage.setItem("udayantu_admin_email", "udayantu10x@gmail.com");
    }
    if (!localStorage.getItem("udayantu_admin_password")) {
      localStorage.setItem("udayantu_admin_password", "Love2ai@123");
    }

    // Check secure admin session state
    const session = sessionStorage.getItem("udayantu_admin_session");
    if (session === "active") {
      setIsSecureAdminLoggedIn(true);
    }
    setIsInitializing(false);
  }, []);

  const handleSecureLogin = () => {
    const targetEmail = localStorage.getItem("udayantu_admin_email") || "udayantu10x@gmail.com";
    const targetPassword = localStorage.getItem("udayantu_admin_password") || "Love2ai@123";

    if (loginEmail.trim() === targetEmail && loginPassword === targetPassword) {
      sessionStorage.setItem("udayantu_admin_session", "active");
      setIsSecureAdminLoggedIn(true);
      toast({
        title: "Access Granted",
        description: "Successfully authenticated administrative portal session.",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid email address or secure password.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCredentials = () => {
    if (!newEmail && !newPassword) {
      toast({
        title: "Validation Error",
        description: "Specify a new email or password to update admin credentials.",
        variant: "destructive",
      });
      return;
    }

    if (newEmail) {
      localStorage.setItem("udayantu_admin_email", newEmail.trim());
      toast({
        title: "Admin Email Updated",
        description: `Login email address successfully updated to "${newEmail}"`,
      });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast({
          title: "Weak Password",
          description: "Secret password should be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }
      localStorage.setItem("udayantu_admin_password", newPassword);
      toast({
        title: "Admin Password Updated",
        description: "Portal verification password successfully changed.",
      });
    }

    setNewEmail("");
    setNewPassword("");
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#06182C]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (!isSecureAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06182C] px-4 font-sans select-none">
        <div className="relative w-full max-w-md">
          {/* Neon background accent glows */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#FF5A1F] rounded-full blur-[80px] opacity-25 animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-500 rounded-full blur-[80px] opacity-20 animate-pulse" />

          <Card className="border border-white/10 bg-slate-950/85 backdrop-blur-xl text-white rounded-3xl p-8 shadow-2xl relative z-10">
            <CardHeader className="text-center p-0 pb-6 space-y-2">
              <div className="w-16 h-16 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#FF5A1F]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">Secure Admin Portal</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Enter your administrative credentials to verify portal access.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-slate-300 font-semibold text-xs">Admin Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@udayantu.com"
                    className="pl-10 bg-slate-900/60 border-slate-800 focus:border-[#FF5A1F] text-white rounded-xl h-10"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSecureLogin(); }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-slate-300 font-semibold text-xs">Security Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-900/60 border-slate-800 focus:border-[#FF5A1F] text-white rounded-xl h-10"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSecureLogin(); }}
                  />
                </div>
              </div>

              <Button
                onClick={handleSecureLogin}
                className="w-full bg-[#FF5A1F] hover:bg-[#e04f1a] text-white rounded-xl font-bold h-10 shadow-lg shadow-[#FF5A1F]/20 mt-4 transition-all"
              >
                Verify & Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canViewUsers = true;
  const canViewAudit = true;

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
          <TabsTrigger value="blogs" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-[#A2B6CF] hover:text-white hover:bg-white/5 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-blogs">
            <BookOpen className="w-4.5 h-4.5" />
            Blog Writing
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
          <LogOut 
            className="w-4 h-4 text-[#A2B6CF] hover:text-red-400 cursor-pointer transition-colors" 
            onClick={() => {
              sessionStorage.removeItem("udayantu_admin_session");
              setIsSecureAdminLoggedIn(false);
              toast({ title: "Logged Out", description: "Secure admin session terminated." });
            }}
          />
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

          <TabsContent value="settings" className="mt-0 outline-none space-y-6">
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

            <Card className="border border-[#e2e8f0] rounded-2xl bg-white p-6 shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-[#1E3A63] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FF5A1F]" />
                  Admin Security Settings
                </CardTitle>
                <CardDescription>Change the administrative email and login password for admin.udayantu.com.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="change-email" className="text-xs font-semibold text-slate-700">New Admin Email</Label>
                    <Input
                      id="change-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. udayantu10x@gmail.com"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="change-pass" className="text-xs font-semibold text-slate-700">New Password</Label>
                    <Input
                      id="change-pass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleUpdateCredentials}
                    className="bg-[#FF5A1F] hover:bg-[#e04f1a] text-white rounded-xl h-10 px-6 font-bold transition-all"
                  >
                    Update Credentials
                  </Button>
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

          <TabsContent value="blogs" className="mt-0 outline-none">
            <AdminBlogs />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
