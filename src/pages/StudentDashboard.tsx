import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  User, 
  CreditCard, 
  FileText, 
  BookOpen, 
  Award, 
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Play,
  Trophy,
  Flame,
  Zap,
  Target,
  ArrowRight,
  Smartphone,
  Calendar,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssessmentTaker } from "@/components/student/AssessmentTaker";
import { ProfileEditor } from "@/components/student/ProfileEditor";
import { OnboardingWizard } from "@/components/student/OnboardingWizard";
import { ReadinessCard, type ToolsProficiency, type MentorNote } from "@/components/student/ReadinessCard";
import { AssessmentsPanel, type AssessmentItem } from "@/components/student/AssessmentsPanel";
import { InterviewTimeline, type Interview } from "@/components/student/InterviewTimeline";
import { TransparencySection, type GuaranteeItem } from "@/components/student/TransparencySection";
import { ConsentCenter, RefundDashboard, DataRequestPanel } from "@/components/compliance";
import { useStudentReadiness } from "@/hooks/useStudentReadiness";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentData {
  id?: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  payment_status?: string;
  desired_role?: string;
  role_recommendation?: string;
  final_role?: string;
  assessments_progress?: Record<string, unknown>;
  created_at?: string;
  [key: string]: unknown;
}

interface Assessment {
  id: string;
  type: string;
  score?: number;
  completed_at?: string;
  [key: string]: unknown;
}

const LITE_MODE_KEY = "udayantu_lite_mode";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [registration, setRegistration] = useState<StudentData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attemptData, setAttemptData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("hi");
  const [liteMode, setLiteMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LITE_MODE_KEY) === "true";
  });

  const toggleLiteMode = () => {
    const newValue = !liteMode;
    setLiteMode(newValue);
    localStorage.setItem(LITE_MODE_KEY, String(newValue));
  };

  const { readinessData, readyPacketEmitted, loading: readinessLoading } = useStudentReadiness({
    studentId: registration?.id || "",
    studentName: registration?.full_name || "",
    paymentStatus: registration?.payment_status || "",
    currentStatus: registration?.status || "",
  });

  const getInterviewsData = (): Interview[] => {
    return [];
  };

  const getGuaranteesData = (): GuaranteeItem[] => {
    const isPaid = registration?.payment_status === "paid";
    const assessmentCount = Object.keys(registration?.assessments_progress || {}).length;
    
    return [
      {
        id: "placement",
        title: language === "hi" ? "प्लेसमेंट गारंटी" : "Placement Guarantee",
        description: language === "hi" 
          ? "6 महीने के भीतर नौकरी या पूर्ण रिफंड" 
          : "Job within 6 months or full refund",
        status: registration?.status === "joined" ? "fulfilled" : isPaid ? "active" : "in_progress",
      },
      {
        id: "training",
        title: language === "hi" ? "प्रशिक्षण पूर्णता" : "Training Completion",
        description: language === "hi" 
          ? "सभी मॉड्यूल और मूल्यांकन पूरे करें" 
          : "Complete all modules and assessments",
        status: assessmentCount >= 4 ? "fulfilled" : assessmentCount > 0 ? "in_progress" : "active",
        progress: (assessmentCount / 4) * 100,
      },
      {
        id: "mentorship",
        title: language === "hi" ? "मेंटरशिप सहायता" : "Mentorship Support",
        description: language === "hi" 
          ? "समर्पित मेंटर द्वारा मार्गदर्शन" 
          : "Guidance from dedicated mentor",
        status: isPaid ? "active" : "in_progress",
      },
      {
        id: "interview_prep",
        title: language === "hi" ? "साक्षात्कार तैयारी" : "Interview Preparation",
        description: language === "hi" 
          ? "मॉक इंटरव्यू और फीडबैक" 
          : "Mock interviews and feedback",
        status: ["ready", "interviewing"].includes(registration?.status || "") ? "in_progress" : 
                registration?.status === "offered" || registration?.status === "joined" ? "fulfilled" : "active",
      },
    ];
  };

  // Bilingual Support
  const text = {
    en: {
      authError: "Authentication Required",
      authErrorDesc: "Please log in to continue",
      loading: "Loading your dashboard...",
      regNotFound: "Registration Not Found",
      regNotFoundDesc: "Please complete your registration first.",
      goHome: "Go to Home",
      welcome: "Welcome Back",
      trackProgress: "Track your progress and master your skills",
      signOut: "Sign Out",
      status: "Status",
      assessments: "Assessments",
      yourRole: "Your Role",
      payment: "Payment",
      overview: "Overview",
      training: "Training",
      profile: "Profile",
      pending: "Pending",
      readiness: "Readiness",
      interviews: "Interviews",
      transparency: "Guarantees",
      liteMode: "Lite Mode",
      liteModeDesc: "Text-first, faster loading",
      readyForPlacement: "Ready for Placement",
    },
    hi: {
      authError: "प्रमाणीकरण आवश्यक",
      authErrorDesc: "जारी रखने के लिए कृपया लॉगिन करें",
      loading: "आपका डैशबोर्ड लोड हो रहा है...",
      regNotFound: "पंजीकरण नहीं मिला",
      regNotFoundDesc: "कृपया पहले अपना पंजीकरण पूरा करें।",
      goHome: "होम पर जाएं",
      welcome: "स्वागत है वापसी",
      trackProgress: "अपनी प्रगति ट्रैक करें और अपने कौशल में माहिर बनें",
      signOut: "साइन आउट",
      status: "स्थिति",
      assessments: "मूल्यांकन",
      yourRole: "आपकी भूमिका",
      payment: "भुगतान",
      overview: "सारांश",
      training: "प्रशिक्षण",
      profile: "प्रोफ़ाइल",
      pending: "लंबित",
      readiness: "तैयारी",
      interviews: "साक्षात्कार",
      transparency: "गारंटी",
      liteMode: "लाइट मोड",
      liteModeDesc: "टेक्स्ट-फर्स्ट, तेज़ लोडिंग",
      readyForPlacement: "प्लेसमेंट के लिए तैयार",
    },
  };

  const t = text[language];

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: t.authError,
        description: t.authErrorDesc,
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast, language]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        const { data: regData, error: regError } = await supabase
          .from('student_registrations')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (regError) throw regError;
        setRegistration((regData as unknown) as StudentData);

        if (regData?.payment_status !== 'paid') {
          toast({
            title: "Book Your Slot Now. Get Job Ready.",
            description: "Complete your payment to access the dashboard",
            variant: "destructive",
          });
          navigate("/payment");
          return;
        }

        const { data: assessData, error: assessError } = await supabase
          .from('assessments')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (assessError) throw assessError;
        setAssessments(assessData || []);

        const { data: attemptsData } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('student_id', user.id);

        const attemptsMap: Record<string, unknown> = {};
        attemptsData?.forEach(attempt => {
          attemptsMap[attempt.assessment_type] = attempt;
        });
        setAttemptData(attemptsMap);

        const completedAssessments = assessData?.filter(a => a.completed_at && ['aptitude', 'psychometric', 'gk'].includes(a.type)) || [];
        if (completedAssessments.length === 3 && !regData?.role_recommendation) {
          await generateRoleRecommendation(completedAssessments, (regData as unknown) as StudentData);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load data";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, toast]);

  const generateRoleRecommendation = async (completedAssessments: Assessment[], regData: StudentData) => {
    try {
      const aptitude = completedAssessments.find(a => a.type === 'aptitude');
      const psychometric = completedAssessments.find(a => a.type === 'psychometric');
      const gk = completedAssessments.find(a => a.type === 'gk');

      if (!aptitude || !psychometric || !gk) return;

      toast({
        title: "Analyzing Your Results",
        description: "Generating personalized role recommendation...",
      });

      const { data, error } = await supabase.functions.invoke('recommend-role', {
        body: {
          aptitudeScore: aptitude.score,
          psychometricProfile: ((aptitude as unknown as Record<string, unknown>)?.analysis as Record<string, unknown>)?.personalityProfile || {},
          gkScore: gk.score,
          desiredRole: regData.desired_role,
        },
      });

      if (error) throw error;

      await supabase
        .from('student_registrations')
        .update({
          role_recommendation: data.recommendedRole,
        })
        .eq('id', regData.id);

      setShowRecommendation(true);
      setRegistration({ ...regData, role_recommendation: data.recommendedRole });

      toast({
        title: "Role Recommendation Ready!",
        description: `Based on your comprehensive assessment results`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error generating recommendation";
      console.error(message);
      toast({
        title: "Recommendation Error",
        description: "Unable to generate recommendation. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      unpaid: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.regNotFound}</h1>
          <p className="text-muted-foreground mb-6">
            {t.regNotFoundDesc}
          </p>
          <Button onClick={() => navigate("/")}>{t.goHome}</Button>
        </div>
      </div>
    );
  }

  const isProfileIncomplete = registration && (
    !registration.full_name ||
    !registration.email ||
    !registration.qualification ||
    !registration.desired_role ||
    !registration.state ||
    !registration.district ||
    !registration.location
  );

  const assessmentProgress = Object.keys(registration.assessments_progress || {}).length;
  const totalAssessments = 4;
  const progressPercentage = (assessmentProgress / totalAssessments) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Header */}
        <div className="relative mb-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent backdrop-blur-sm"></div>
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                {t.welcome}, {registration.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-lg text-muted-foreground">
                {t.trackProgress}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {readyPacketEmitted && (
                <Badge variant="default" className="gap-1 bg-green-600" data-testid="badge-ready-packet">
                  <CheckCircle2 className="h-3 w-3" />
                  {t.readyForPlacement}
                </Badge>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background/50">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="lite-mode" className="text-xs text-muted-foreground cursor-pointer">
                  {t.liteMode}
                </Label>
                <Switch 
                  id="lite-mode" 
                  checked={liteMode} 
                  onCheckedChange={toggleLiteMode}
                  data-testid="switch-lite-mode"
                />
              </div>
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                data-testid="button-toggle-language"
              >
                {language === "en" ? "हिंदी" : "English"}
              </button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="backdrop-blur-sm border-primary/20 hover:bg-primary/5"
                data-testid="button-signout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t.signOut}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Status Card */}
          <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Zap className="h-4 w-4" />
                {t.status}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground capitalize">{registration.status}</div>
              <div className="mt-2">{getPaymentStatusBadge(registration.payment_status || '')}</div>
            </CardContent>
          </Card>

          {/* Assessments Card */}
          <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-4 w-4" />
                {t.assessments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{assessmentProgress}/{totalAssessments}</div>
              <Progress value={progressPercentage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Role Card */}
          <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Target className="h-4 w-4" />
                {t.yourRole}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground truncate">
                {registration.role_recommendation || registration.desired_role || t.pending}
              </div>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                <CreditCard className="h-4 w-4" />
                {t.payment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {registration.payment_status === 'paid' ? '₹5,321' : '₹0'}
              </div>
              <div className="mt-2">{getPaymentStatusBadge(registration.payment_status || '')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-muted/40 backdrop-blur-sm border border-primary/10">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">{t.overview}</TabsTrigger>
            <TabsTrigger value="readiness" className="text-xs sm:text-sm">{t.readiness}</TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm">{t.assessments}</TabsTrigger>
            <TabsTrigger value="interviews" className="text-xs sm:text-sm">{t.interviews}</TabsTrigger>
            <TabsTrigger value="transparency" className="text-xs sm:text-sm">{t.transparency}</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">{t.profile}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Your Learning Path
                </CardTitle>
                <CardDescription>
                  Complete these steps to start your training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Registration Complete</h4>
                    <p className="text-sm text-muted-foreground">You've successfully registered</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-primary/10">
                  {registration.payment_status === 'paid' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      {registration.payment_status === 'paid' 
                        ? 'Payment completed successfully'
                        : 'Complete payment to continue'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-primary/10">
                  {assessmentProgress > 0 ? (
                    <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Complete Assessments</h4>
                    <p className="text-sm text-muted-foreground">
                      {assessmentProgress} of {totalAssessments} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-primary/10">
                  <div className="h-6 w-6 rounded-full border-2 border-muted flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Start Training</h4>
                    <p className="text-sm text-muted-foreground">
                      Begin your personalized training modules
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            {activeAssessment ? (
              <AssessmentTaker
                assessmentType={activeAssessment as 'aptitude' | 'psychometric' | 'gk' | 'final_role'}
                roleType={registration.role_recommendation || registration.desired_role}
                onComplete={() => {
                  setActiveAssessment(null);
                  window.location.reload();
                }}
              />
            ) : (
              <>
                <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Take Assessments</CardTitle>
                    <CardDescription>
                      Complete all assessments to get your role recommendation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Aptitude Test */}
                    <div className="group flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          Aptitude Test
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Test your logical reasoning and problem-solving skills
                        </p>
                      </div>
                      {assessments.some(a => a.type === 'aptitude' && a.completed_at) ? (
                        <Badge variant="default" className="ml-2">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => setActiveAssessment('aptitude')}
                          disabled={registration.payment_status !== 'paid'}
                          className="ml-2"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                    </div>

                    {/* Psychometric Test */}
                    <div className="group flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <User className="h-5 w-5 text-purple-500" />
                          Psychometric Test
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Understand your personality and work style
                        </p>
                      </div>
                      {assessments.some(a => a.type === 'psychometric' && a.completed_at) ? (
                        <Badge variant="default" className="ml-2">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => setActiveAssessment('psychometric')}
                          disabled={registration.payment_status !== 'paid'}
                          className="ml-2"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                    </div>

                    {/* GK Test */}
                    <div className="group flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Award className="h-5 w-5 text-amber-500" />
                          General Knowledge Test
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Test your business and industry knowledge
                        </p>
                      </div>
                      {assessments.some(a => a.type === 'gk' && a.completed_at) ? (
                        <Badge variant="default" className="ml-2">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => setActiveAssessment('gk')}
                          disabled={registration.payment_status !== 'paid'}
                          className="ml-2"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                    </div>

                    {/* Final Role Test */}
                    {registration.role_recommendation && (
                      <div className="group flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2 text-foreground">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Final Role Test ({registration.role_recommendation})
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Advanced test for your recommended role
                          </p>
                        </div>
                        {assessments.some(a => a.type === 'final_role' && a.completed_at) ? (
                          <Badge variant="default" className="ml-2">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => setActiveAssessment('final_role')}
                            disabled={registration.payment_status !== 'paid'}
                            className="ml-2"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assessment History */}
                <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Assessment History</CardTitle>
                    <CardDescription>
                      View your completed assessments and scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No assessments completed yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assessments.map((assessment) => (
                          <div
                            key={assessment.id}
                            className="p-4 rounded-lg bg-background/50 border border-primary/10 flex justify-between items-center"
                          >
                            <div>
                              <h5 className="font-semibold capitalize text-foreground">{assessment.type} Test</h5>
                              <p className="text-sm text-muted-foreground">
                                Completed on {new Date(assessment.completed_at || '').toLocaleDateString()}
                              </p>
                            </div>
                            {assessment.score && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{assessment.score}%</div>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="readiness" className="space-y-4">
            {readinessData && (
              <ReadinessCard
                toolsProficiency={readinessData.toolsProficiency}
                languageLevel={readinessData.languageLevel}
                attendanceStreak={readinessData.attendanceStreak}
                totalSessions={readinessData.totalSessions}
                mentorNotes={readinessData.mentorNotes}
                language={language}
                liteMode={liteMode}
              />
            )}
          </TabsContent>

          <TabsContent value="interviews" className="space-y-4">
            <InterviewTimeline
              interviews={getInterviewsData()}
              onRequestReschedule={(id) => {
                toast({
                  title: language === "hi" ? "अनुरोध भेजा गया" : "Request Sent",
                  description: language === "hi" 
                    ? "आपकी SS टीम जल्द ही संपर्क करेगी" 
                    : "Your SS team will contact you shortly",
                });
              }}
              onContactSupport={() => navigate("/contact")}
              language={language}
              liteMode={liteMode}
            />
          </TabsContent>

          <TabsContent value="transparency" className="space-y-4">
            <TransparencySection
              guarantees={getGuaranteesData()}
              papEligible={registration.payment_status === "paid"}
              papStatus={registration.status === "joined" ? "completed" : 
                        ["ready", "interviewing", "offered"].includes(registration.status || "") ? "in_progress" : "not_started"}
              refundStatus={registration.payment_status === "paid" ? "not_applicable" : "eligible"}
              daysInProgram={Math.floor((new Date().getTime() - new Date(registration.created_at || "").getTime()) / (1000 * 60 * 60 * 24))}
              onViewPolicyDetails={() => window.open("/terms", "_blank")}
              onContactSupport={() => navigate("/contact")}
              language={language}
              liteMode={liteMode}
            />
            <RefundDashboard
              studentId={registration.id}
              studentName={registration.full_name}
              role="student"
              language={language}
              liteMode={liteMode}
            />
            <ConsentCenter
              userId={user?.id || ""}
              userType="student"
              language={language}
              liteMode={liteMode}
            />
            <DataRequestPanel
              userId={user?.id || ""}
              userType="student"
              language={language}
              liteMode={liteMode}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            {editingProfile ? (
              <>
                <ProfileEditor userId={user?.id || ''} />
                <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
              </>
            ) : (
              <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button variant="outline" onClick={() => setEditingProfile(true)}>
                    Edit Profile
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-foreground">{registration.full_name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{registration.email}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{registration.phone}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                      <p className="text-xs text-muted-foreground">Desired Role</p>
                      <p className="font-semibold text-foreground">{registration.desired_role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
