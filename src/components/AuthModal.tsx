import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { indianStatesDistricts, qualifications } from "@/data/indianStates";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

// Service-role client used only for public registration (bypasses RLS)
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://ptlgpjixohgmhvrqfmdw.supabase.co",
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bGdwaml4b2hnbWh2cnFmbWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxODUyNywiZXhwIjoyMDk5MTk0NTI3fQ.nAb2dflkC_7U-tZ1U9RMfCMM58_Q9YE-cksNGern6yo",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
import { useToast } from "@/hooks/use-toast";
import { sendOtp, verifyOtp } from "@/lib/api";
import { signInWithPhoneNumber, RecaptchaVerifier, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, Globe } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Step 1 Schema
const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().length(10, "Mobile number must be 10 digits"),
  qualification: z.string().min(1, "Please select your qualification"),
  desiredRole: z.string().min(1, "Please select your desired role"),
});

// Step 2 Schema
const step2Schema = z.object({
  email: z.string().email("Please enter a valid email"),
  state: z.string().min(1, "Please select your state"),
  district: z.string().min(1, "Please select your district"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "register" | "login";
}

// Comprehensive Bilingual Support
const bilingualText = {
  en: {
    registerTitle: "Register Now",
    loginTitle: "Sign In",
    registerDesc: "Take the first step towards your dream career",
    loginDesc: "Welcome back! Continue your journey",
    register: "Register",
    login: "Login",
    fullName: "Full Name *",
    enterFullName: "Enter your full name",
    mobileNumber: "Mobile Number *",
    enter10Digit: "Enter 10-digit mobile number",
    qualification: "Your Qualification *",
    selectQualification: "Select your qualification",
    desiredRole: "Select Desired Role *",
    selectRole: "Select your desired role",
    continue: "Continue",
    sendingOtp: "Sending OTP...",
    terms: "By continuing, you agree to our Terms & Conditions and Privacy Policy",
    enterOtp: "Enter OTP sent to {phone}",
    didntReceive: "Didn't receive OTP? Check your SMS inbox",
    changeNumber: "Change Number",
    verifyOtp: "Verify OTP",
    verifying: "Verifying...",
    email: "Email Address *",
    enterEmail: "Enter your email address",
    state: "Select State *",
    selectState: "Select your state",
    district: "Select District *",
    selectDistrict: "Select your district",
    selectDistrictFirst: "Please select state first",
    completeReg: "Complete Registration",
    completing: "Completing Registration...",
    sendOtp: "Send OTP",
    required: "* Required fields",
  },
  hi: {
    registerTitle: "अभी पंजीकृत करें",
    loginTitle: "साइन इन करें",
    registerDesc: "अपने सपनों की करियर की ओर पहला कदम उठाएं",
    loginDesc: "वापस स्वागत है! अपनी यात्रा जारी रखें",
    register: "पंजीकरण",
    login: "लॉगिन",
    fullName: "पूरा नाम *",
    enterFullName: "अपना पूरा नाम दर्ज करें",
    mobileNumber: "मोबाइल नंबर *",
    enter10Digit: "10-अंकीय मोबाइल नंबर दर्ज करें",
    qualification: "आपकी योग्यता *",
    selectQualification: "अपनी योग्यता चुनें",
    desiredRole: "वांछित भूमिका चुनें *",
    selectRole: "अपनी वांछित भूमिका चुनें",
    continue: "जारी रखें",
    sendingOtp: "OTP भेज रहे हैं...",
    terms: "जारी रखकर, आप हमारी शर्तें और गोपनीयता नीति से सहमत हैं",
    enterOtp: "{phone} पर भेजे गए OTP दर्ज करें",
    didntReceive: "OTP नहीं मिला? अपने SMS इनबॉक्स की जांच करें",
    changeNumber: "नंबर बदलें",
    verifyOtp: "OTP सत्यापित करें",
    verifying: "सत्यापन जारी है...",
    email: "ईमेल पता *",
    enterEmail: "अपना ईमेल पता दर्ज करें",
    state: "राज्य चुनें *",
    selectState: "अपना राज्य चुनें",
    district: "जिला चुनें *",
    selectDistrict: "अपना जिला चुनें",
    selectDistrictFirst: "पहले राज्य चुनें",
    completeReg: "पंजीकरण पूरा करें",
    completing: "पंजीकरण पूरा किया जा रहा है...",
    sendOtp: "OTP भेजें",
    required: "* आवश्यक क्षेत्र",
  },
};

export const AuthModal = ({ open, onOpenChange, defaultTab = "register" }: AuthModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const t = bilingualText[language];
  
  // Registration flow states
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  
  // Location states
  const [selectedState, setSelectedState] = useState<string>("");
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Login states
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]);

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: "",
      mobile: "",
      qualification: "",
      desiredRole: "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      email: "",
      state: "",
      district: "",
    },
  });

  // Check if user exists by phone
  const checkUserExists = async (phone: string) => {
    try {
      const { data } = await adminSupabase
        .from('student_registrations')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  const getRecaptchaVerifier = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          firebaseAuth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {
              console.warn("reCAPTCHA expired, resetting...");
              if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
              }
            }
          }
        );
      } catch (err) {
        console.error("Error setting up RecaptchaVerifier:", err);
      }
    }
    return (window as any).recaptchaVerifier;
  };

  // Step 1: Continue to OTP
  const handleStep1Submit = async (data: Step1Data) => {
    const exists = await checkUserExists(data.mobile);
    if (exists) {
      toast({
        title: "You already have an account!",
        description: "Please use the login tab to sign in.",
      });
      setLoginPhone(data.mobile);
      setActiveTab("login");
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneNumber = `+91${data.mobile}`;
      const appVerifier = getRecaptchaVerifier();
      
      const confirmResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
      setConfirmationResult(confirmResult);

      setStep1Data(data);
      setRegStep(3);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${data.mobile}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message || "Failed to dispatch verification code.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!step1Data) return;
    if (!confirmationResult) {
      toast({
        title: "Verification Error",
        description: "No verification challenge found. Please re-send OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const firebaseUser = userCredential.user;

      const mockUser = {
        id: firebaseUser.uid,
        phone: firebaseUser.phoneNumber || step1Data.mobile,
        email: `student_${step1Data.mobile}@udayantu.app`,
        user_metadata: {
          phone: firebaseUser.phoneNumber || step1Data.mobile,
          verified: true
        }
      };

      localStorage.setItem("udayantu_mock_user", JSON.stringify(mockUser));
      window.dispatchEvent(new Event("storage"));

      setRegStep(2);
      toast({
        title: "Phone Verified",
        description: "Please complete your profile to finish registration",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitStep2Placeholder = async (data: Step2Data) => {
    if (!step1Data) return;

    setIsSubmitting(true);
    try {
      // Update user profile in database
      let user = null;
      const mockUserStr = localStorage.getItem("udayantu_mock_user");
      if (mockUserStr) {
        user = JSON.parse(mockUserStr);
        // Save fields to sandbox profile
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: data.fullName,
            email: data.email,
            desired_role: data.desiredRole
          }
        };
        localStorage.setItem("udayantu_mock_user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      } else {
        const { data: userData } = await supabase.auth.getUser();
        user = userData.user;
      }
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save to student_registrations or user profile table
      // For now, just navigate to dashboard
      toast({
        title: "Registration Complete",
        description: "Welcome to UdaYantu!",
      });
      
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // This function exists in the file but we'll reference the existing one
  const handleVerifyOtpOriginal = async () => {
    // Placeholder - the original function handles step 2 submission
  };

  // Handle Login OTP verification
  const handleLoginVerifyOtp = async () => {
    if (loginOtp.length !== 6) return;
    
    setIsSubmitting(true);
    try {
      const data = await verifyOtp(loginPhone, loginOtp);

      if (data.session?.access_token && data.session?.refresh_token) {
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (signInError) {
          console.log('Session set error:', signInError.message);
        }
      }

      toast({
        title: data.demoMode ? "Demo Login" : "Login Successful",
        description: data.demoMode ? "Demo mode - redirecting to dashboard" : "Welcome back!",
      });
      
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Original verify logic kept for compatibility - will be replaced above
  const handleVerifyOtpLegacy = async () => {
    if (otp.length !== 6 || !step1Data) return;

    setIsSubmitting(true);
    try {
      const data = await verifyOtp(step1Data.mobile, otp);

      if (data.session?.access_token && data.session?.refresh_token) {
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (signInError) {
          console.log('Session set error:', signInError.message);
        }
      }

      toast({
        title: "Verified Successfully!",
        description: data.demoMode ? "Demo mode - complete your profile" : "Now complete your profile details",
      });
      
      setRegStep(2);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Complete Registration
  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    setIsSubmitting(true);
    try {
      // Check if email is already in use by another account
      const { data: existingEmailUser } = await adminSupabase
        .from("student_registrations")
        .select("phone")
        .eq("email", data.email)
        .neq("phone", step1Data.mobile)
        .maybeSingle();

      if (existingEmailUser) {
        toast({
          title: "Email Already in Use",
          description: "This email address is already associated with another account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error: upsertError } = await adminSupabase
        .from("student_registrations")
        .upsert({
          full_name: step1Data.fullName,
          email: data.email,
          phone: step1Data.mobile,
          qualification: step1Data.qualification,
          desired_role: step1Data.desiredRole,
          state: data.state,
          district: data.district,
          location: `${data.district}, ${data.state}`,
          status: 'registered',
          user_id: localStorage.getItem("udayantu_mock_user") ? JSON.parse(localStorage.getItem("udayantu_mock_user") || "{}").id : null
        }, {
          onConflict: 'phone'
        });

      if (upsertError) {
        throw new Error('Failed to complete registration: ' + upsertError.message);
      }

      toast({
        title: "Registration Complete!",
        description: "Redirecting to payment...",
      });

      resetRegistrationForms();
      onOpenChange(false);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/payment";
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login: Send OTP
  const handleLoginSendOTP = async () => {
    if (!loginPhone || loginPhone.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prevent login if user does not exist in student_registrations
      const exists = await checkUserExists(loginPhone);
      if (!exists) {
        toast({
          title: "Account Not Found",
          description: "This mobile number is not registered. Please sign up first.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const phoneNumber = `+91${loginPhone}`;
      const appVerifier = getRecaptchaVerifier();
      
      const confirmResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
      setConfirmationResult(confirmResult);

      setLoginOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${loginPhone}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message || "Failed to dispatch verification code.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login: Verify OTP
  const handleLoginVerifyOTP = async () => {
    if (loginOtp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Verification Error",
        description: "No verification challenge found. Please re-send OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await confirmationResult.confirm(loginOtp);
      const firebaseUser = userCredential.user;

      const mockUser = {
        id: firebaseUser.uid,
        phone: firebaseUser.phoneNumber || loginPhone,
        email: `student_${loginPhone}@udayantu.app`,
        user_metadata: {
          phone: firebaseUser.phoneNumber || loginPhone,
          verified: true
        }
      };

      localStorage.setItem("udayantu_mock_user", JSON.stringify(mockUser));
      window.dispatchEvent(new Event("storage"));

      onOpenChange(false);

      let paymentStatus = "unpaid";
      try {
        const { data: regData } = await supabase
          .from("student_registrations")
          .select("payment_status")
          .eq("phone", loginPhone)
          .maybeSingle();
        if (regData?.payment_status) {
          paymentStatus = regData.payment_status;
        }
      } catch (e) {
        console.log("Supabase select skipped, using default status:", e);
      }

      if (paymentStatus === 'paid') {
        toast({
          title: "Welcome back!",
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        toast({
          title: "Book Your Slot Now!",
          description: "Complete your payment to access the dashboard",
        });
        setTimeout(() => navigate("/payment"), 500);
      }

      setLoginPhone("");
      setLoginOtp("");
      setLoginOtpSent(false);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
      setLoginOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setDistricts(indianStatesDistricts[state] || []);
    step2Form.setValue("district", "");
  };

  const resetRegistrationForms = () => {
    step1Form.reset();
    step2Form.reset();
    setRegStep(1);
    setOtp("");
    setStep1Data(null);
    setSelectedState("");
    setDistricts([]);
  };

  const resetAllForms = () => {
    resetRegistrationForms();
    setLoginPhone("");
    setLoginOtp("");
    setLoginOtpSent(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = result.user;

      // Check if user already exists by email in student_registrations
      let dbUser = null;
      if (firebaseUser.email) {
        const { data } = await supabase
          .from("student_registrations")
          .select("*")
          .eq("email", firebaseUser.email)
          .maybeSingle();
        dbUser = data;
      }

      const mockUser = {
        id: firebaseUser.uid,
        phone: firebaseUser.phoneNumber || "",
        email: firebaseUser.email || "",
        user_metadata: {
          full_name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          avatar_url: firebaseUser.photoURL || "",
          verified: true
        }
      };

      localStorage.setItem("udayantu_mock_user", JSON.stringify(mockUser));
      window.dispatchEvent(new Event("storage"));

      if (dbUser) {
        toast({
          title: "Welcome Back!",
          description: `Logged in as ${firebaseUser.displayName || 'User'}`,
        });
        onOpenChange(false);
        if (dbUser.payment_status === 'paid') {
          navigate("/dashboard");
        } else {
          navigate("/payment");
        }
      } else {
        toast({
          title: "Signed in with Google",
          description: "Please complete your profile to finish registration",
        });
        
        // Auto-fill available details
        step1Form.setValue("fullName", firebaseUser.displayName || "");
        step2Form.setValue("email", firebaseUser.email || "");
        
        // Go to registration tab and set step to 1
        setActiveTab("register");
        setRegStep(1);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const states = Object.keys(indianStatesDistricts).sort();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetAllForms();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold">
              {activeTab === "register" ? t.registerTitle : t.loginTitle}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "register" ? t.registerDesc : t.loginDesc}
            </DialogDescription>
          </div>
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium ml-2"
            data-testid="button-toggle-auth-language"
            title="Toggle language"
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "हिंदी" : "EN"}
          </button>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">{t.register}</TabsTrigger>
            <TabsTrigger value="login">{t.login}</TabsTrigger>
          </TabsList>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="mt-6">
            {regStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.fullName}</Label>
                  <Input
                    id="fullName"
                    {...step1Form.register("fullName")}
                    placeholder={t.enterFullName}
                    className={step1Form.formState.errors.fullName ? "border-destructive" : ""}
                    data-testid="input-full-name"
                  />
                  {step1Form.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">{t.mobileNumber}</Label>
                  <Input
                    id="mobile"
                    {...step1Form.register("mobile")}
                    placeholder={t.enter10Digit}
                    maxLength={10}
                    className={step1Form.formState.errors.mobile ? "border-destructive" : ""}
                    data-testid="input-mobile"
                  />
                  {step1Form.formState.errors.mobile && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.mobile.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">{t.qualification}</Label>
                  <Controller
                    name="qualification"
                    control={step1Form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={step1Form.formState.errors.qualification ? "border-destructive" : ""} data-testid="select-qualification">
                          <SelectValue placeholder={t.selectQualification} />
                        </SelectTrigger>
                        <SelectContent>
                          {qualifications.map((qual) => (
                            <SelectItem key={qual} value={qual}>
                              {qual}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {step1Form.formState.errors.qualification && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.qualification.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredRole">{t.desiredRole}</Label>
                  <Controller
                    name="desiredRole"
                    control={step1Form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={step1Form.formState.errors.desiredRole ? "border-destructive" : ""} data-testid="select-role">
                          <SelectValue placeholder={t.selectRole} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Business Development">Business Development</SelectItem>
                          <SelectItem value="Customer Success">Customer Success</SelectItem>
                          <SelectItem value="Project Management">Project Management</SelectItem>
                          <SelectItem value="Operations Management">Operations Management</SelectItem>
                          <SelectItem value="Product Management">Product Management</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                          <SelectItem value="Marketing Management">Marketing Management</SelectItem>
                          <SelectItem value="Customer Support">Customer Support</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {step1Form.formState.errors.desiredRole && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.desiredRole.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} data-testid="button-register-continue">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.sendingOtp}
                    </>
                  ) : (
                    <>
                      {t.continue}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-slate-50 border-border text-slate-700 font-semibold h-11 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.92-2.77 3.5-4.51 6.76-4.51z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"/>
                    <path fill="#FBBC05" d="M5.24 14.75c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 7.18C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.82l3.85-3.07z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.56 1.22-4.26 1.22-3.26 0-5.84-1.74-6.76-4.51L1.39 17C3.37 20.91 7.35 23 12 23z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  {t.terms}
                </p>
              </form>
            )}

            {regStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="otp" className="text-base text-center block" data-testid="label-enter-otp">
                    {t.enterOtp.replace("{phone}", step1Data?.mobile || "")}
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isSubmitting}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t.didntReceive}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setRegStep(1);
                      setOtp("");
                    }}
                    className="w-full"
                    size="lg"
                    data-testid="button-change-number"
                  >
                    {t.changeNumber}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleVerifyOTP}
                    className="w-full" 
                    size="lg" 
                    disabled={isSubmitting || otp.length !== 6}
                    data-testid="button-verify-otp"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.verifying}
                      </>
                    ) : (
                      t.verifyOtp
                    )}
                  </Button>
                </div>
              </div>
            )}

            {regStep === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...step2Form.register("email")}
                    placeholder={t.enterEmail}
                    className={step2Form.formState.errors.email ? "border-destructive" : ""}
                    data-testid="input-email"
                  />
                  {step2Form.formState.errors.email && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{t.state}</Label>
                  <Controller
                    name="state"
                    control={step2Form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleStateChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className={step2Form.formState.errors.state ? "border-destructive" : ""} data-testid="select-state">
                          <SelectValue placeholder={t.selectState} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {step2Form.formState.errors.state && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t.district}</Label>
                  <Controller
                    name="district"
                    control={step2Form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedState}
                      >
                        <SelectTrigger className={step2Form.formState.errors.district ? "border-destructive" : ""} data-testid="select-district">
                          <SelectValue
                            placeholder={
                              selectedState ? t.selectDistrict : t.selectDistrictFirst
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {step2Form.formState.errors.district && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.district.message}</p>
                  )}
                </div>

                <Button
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                  data-testid="button-complete-registration"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.completing}
                    </>
                  ) : (
                    t.completeReg
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="mt-6">
            <div className="space-y-4">
              {!loginOtpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="loginPhone">{t.mobileNumber}</Label>
                    <Input
                      id="loginPhone"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder={t.enter10Digit}
                      maxLength={10}
                      disabled={isSubmitting}
                      data-testid="input-login-phone"
                    />
                  </div>

                  <Button 
                    onClick={handleLoginSendOTP}
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || loginPhone.length !== 10}
                    data-testid="button-login-send-otp"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.sendingOtp}
                      </>
                    ) : (
                      t.sendOtp
                    )}
                  </Button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-slate-50 border-border text-slate-700 font-semibold h-11 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.92-2.77 3.5-4.51 6.76-4.51z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"/>
                      <path fill="#FBBC05" d="M5.24 14.75c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 7.18C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.82l3.85-3.07z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.56 1.22-4.26 1.22-3.26 0-5.84-1.74-6.76-4.51L1.39 17C3.37 20.91 7.35 23 12 23z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <Label htmlFor="loginOtp" className="text-base text-center block">
                      Enter OTP sent to {loginPhone}
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={loginOtp}
                        onChange={setLoginOtp}
                        disabled={isSubmitting}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Didn't receive OTP? Check your SMS inbox
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setLoginOtpSent(false);
                        setLoginOtp("");
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Change Number
                    </Button>
                    <Button 
                      onClick={handleLoginVerifyOTP}
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting || loginOtp.length !== 6}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
