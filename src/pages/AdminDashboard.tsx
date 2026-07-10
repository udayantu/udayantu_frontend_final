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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Initializing default secure credentials
    if (!localStorage.getItem("udayantu_admin_email")) {
      localStorage.setItem("udayantu_admin_email", "udayantu10x@gmail.com");
    }
    if (!localStorage.getItem("udayantu_admin_password")) {
      localStorage.setItem("udayantu_admin_password", "Love2ai@123");
    }

    // Clear old browser-cached mock local storage keys once
    const clearMockKeys = [
      "udayantu_students", 
      "udayantu_teachers", 
      "udayantu_mentor_sessions", 
      "udayantu_employers", 
      "udayantu_payments", 
      "udayantu_courses", 
      "udayantu_assessments",
      "udayantu_contact_submissions",
      "udayantu_outcomes_cache"
    ];
    clearMockKeys.forEach(key => {
      localStorage.removeItem(key);
    });

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
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (!isSecureAdminLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-sans overflow-hidden">
        {/* Left Column: Premium Dark blue gradient and feature list */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden select-none">
          {/* Code grids background detail */}
          <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
          
          {/* Header: Logo, Brand name, and Subtitle */}
          <div className="relative z-10 flex items-center gap-3.5 select-none">
            <img 
              src={logoImage} 
              alt="UdaYantu Logo" 
              className="h-16 w-auto object-contain" 
            />
            <div>
              <div className="text-2xl font-black tracking-tight leading-tight">
                Uda<span className="text-[#EA580C]">Yantu</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Admin Portal
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="my-auto space-y-6 relative z-10 max-w-lg">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-[#EA580C]" />
              Secure. Smart. Built for Impact.
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Empowering Businesses. Transforming <span className="text-[#EA580C]">Talent.</span>
            </h1>

            <p className="text-slate-300 text-base leading-relaxed font-medium">
              Welcome to the UdaYantu Admin Portal. Access powerful tools, insights, and controls to manage and scale with confidence.
            </p>

            {/* Feature items */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/85">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-center text-[#EA580C]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Enterprise Secure</h3>
                <p className="text-xs text-slate-400 leading-normal">Bank-level encryption to protect your data</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-center text-[#EA580C]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Real-time Insights</h3>
                <p className="text-xs text-slate-400 leading-normal">Actionable dashboards for smarter decisions</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-center text-[#EA580C]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Built for Scale</h3>
                <p className="text-xs text-slate-400 leading-normal">Designed to grow with your organization</p>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="relative z-10 text-xs text-slate-500 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} UdaYantu Technologies
          </div>
        </div>

        {/* Right Column: Light Screen with Login Card */}
        <div className="w-full md:w-1/2 bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-12 min-h-screen relative">
          {/* Soft background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <Card className="border border-slate-100/90 bg-white/95 backdrop-blur-xl rounded-[24px] p-8 shadow-xl relative">
              <CardHeader className="text-center p-0 pb-6 space-y-2">
                {/* Logo integration as requested */}
                <div className="flex justify-center mb-2">
                  <img 
                    src={logoImage} 
                    alt="UdaYantu Logo" 
                    className="h-16 w-auto object-contain" 
                  />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Welcome Back</CardTitle>
                <CardDescription className="text-slate-500 text-sm font-medium">
                  Sign in to continue to your admin dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4 font-sans">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-700 font-bold text-xs">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@udayantu.com"
                      className="pl-10 bg-white border-slate-200 focus:border-[#EA580C] text-slate-800 rounded-xl h-11 shadow-sm font-medium"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSecureLogin(); }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-700 font-bold text-xs">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white border-slate-200 focus:border-[#EA580C] text-slate-800 rounded-xl h-11 shadow-sm font-medium"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSecureLogin(); }}
                    />
                    {/* Show/Hide eye icon toggle */}
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C] accent-[#EA580C]"
                      defaultChecked 
                    />
                    <span className="text-xs text-slate-600 font-bold">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => toast({ title: "Reset Link Sent", description: "If the email is valid, you'll receive reset instructions." })}
                    className="text-xs text-[#EA580C] font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  onClick={handleSecureLogin}
                  className="w-full bg-[#EA580C] hover:bg-[#d94f06] text-white rounded-xl font-bold h-11 shadow-md shadow-[#EA580C]/10 mt-6 transition-all gap-1.5 flex items-center justify-center"
                >
                  Sign In to Dashboard <span className="text-lg">→</span>
                </Button>

                {/* Divider OR */}
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google Authentication */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast({ title: "Information", description: "Google Sign-In is only enabled for enterprise users. Please use your email/password." })}
                  className="w-full bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold h-11 transition-all flex items-center justify-center gap-2"
                >
                  {/* Google Color Icon SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.92-2.77 3.5-4.51 6.76-4.51z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"/>
                    <path fill="#FBBC05" d="M5.24 14.75c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 7.18C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.82l3.85-3.07z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.56 1.22-4.26 1.22-3.26 0-5.84-1.74-6.76-4.51L1.39 17C3.37 20.91 7.35 23 12 23z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Secure subtext */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-4">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure login protected by 256-bit encryption
                </div>
              </CardContent>
            </Card>

            {/* Footer info links */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-2 mt-6">
              <button 
                type="button" 
                onClick={() => toast({ title: "Support Contacted", description: "An email was dispatched to support@udayantu.com. Our staff will respond within 24 hours." })}
                className="hover:text-slate-600 transition-colors"
              >
                Need help? <span className="text-[#EA580C] hover:underline">Contact Support</span>
              </button>
              <button type="button" className="hover:text-slate-600 transition-colors">Cookie Settings</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canViewUsers = true;
  const canViewAudit = true;

  return (
    <Tabs defaultValue="overview" className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sleek left sidebar layout */}
      <div className="w-full md:w-64 bg-white text-slate-800 flex flex-col h-auto md:h-screen md:sticky md:top-0 border-r border-slate-200/80 shadow-md z-20">
        <div className="p-5 border-b border-slate-100 flex items-center justify-center bg-slate-50/50">
          <img 
            src={logoImage} 
            alt="UdaYantu Logo" 
            className="h-16 w-auto object-contain" 
          />
        </div>

        <TabsList className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden p-3.5 h-auto md:flex-1 bg-transparent border-none text-left items-start justify-start select-none">
          <TabsTrigger value="overview" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-overview">
            <BarChart3 className="w-4.5 h-4.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="students" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-students">
            <Users className="w-4.5 h-4.5" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-teachers">
            <Award className="w-4.5 h-4.5" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="sessions" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-sessions">
            <Calendar className="w-4.5 h-4.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="ready" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-ready">
            <UserCheck className="w-4.5 h-4.5" />
            Ready Pool
          </TabsTrigger>
          <TabsTrigger value="packets" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-packets">
            <Package className="w-4.5 h-4.5" />
            Study Packets
          </TabsTrigger>
          <TabsTrigger value="csactions" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-csactions">
            <Phone className="w-4.5 h-4.5" />
            CS Actions
          </TabsTrigger>
          <TabsTrigger value="assessments" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-assessments">
            <FileText className="w-4.5 h-4.5" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="employers" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-employers">
            <Briefcase className="w-4.5 h-4.5" />
            Employers
          </TabsTrigger>
          <TabsTrigger value="contacts" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-contacts">
            <Mail className="w-4.5 h-4.5" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="outcomes" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-outcomes">
            <UserCheck className="w-4.5 h-4.5" />
            Placements
          </TabsTrigger>
          <TabsTrigger value="payments" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-payments">
            <DollarSign className="w-4.5 h-4.5" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="courses" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-courses">
            <BookOpen className="w-4.5 h-4.5" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-integrations">
            <TrendingUp className="w-4.5 h-4.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-reports">
            <ClipboardList className="w-4.5 h-4.5" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="compliance" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-compliance">
            <Lock className="w-4.5 h-4.5" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="data" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-data">
            <BarChart3 className="w-4.5 h-4.5" />
            Data Tools
          </TabsTrigger>
          <TabsTrigger value="communications" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-communications">
            <MessageSquare className="w-4.5 h-4.5" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="blogs" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-blogs">
            <BookOpen className="w-4.5 h-4.5" />
            Blog Writing
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full justify-start text-left gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white transition-all text-xs font-semibold bg-transparent border-none" data-testid="tab-settings">
            <Settings className="w-4.5 h-4.5" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* Dynamic User Profile Footer matching the screenshot */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-sm uppercase">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-[#1E3A63] leading-tight truncate max-w-[110px]" title="Pradeep">
                Pradeep
              </p>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[110px]">
                Owner
              </p>
            </div>
          </div>
          <LogOut 
            className="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" 
            onClick={() => {
              if (confirm("Are you sure you want to log out from the Admin Portal?")) {
                sessionStorage.removeItem("udayantu_admin_session");
                setIsSecureAdminLoggedIn(false);
                toast({ title: "Logged Out", description: "Secure admin session terminated." });
              }
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
