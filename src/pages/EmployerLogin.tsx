import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, MessageSquare, Building2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { EmployerRole } from "@/lib/employerAuth";
import { hasAdminForCompany } from "@/lib/employerAuth";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";

// Check if we're in demo mode
const isDemoMode = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.lovable.app'));
};

const EmployerLogin = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyAndLogin } = useEmployerAuth();

  // Form states
  const [step, setStep] = useState<"email" | "otp">("email");
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [showDemoWarning, setShowDemoWarning] = useState(true);

  // Form data
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<EmployerRole>("recruiter");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingAdmin, setHasExistingAdmin] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [demoOTP, setDemoOTP] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // English Only Text
  const t = {
    title: "Employer Portal",
    subtitle: "Access pre-trained rural talent for your organization",
    step1: "Enter Your Details",
    step2: "Verify OTP",
    email: "Email Address",
    phone: "Phone Number",
    company: "Company Name",
    role: "Your Role",
    admin: "Admin",
    recruiter: "Recruiter",
    interviewer: "Interviewer",
    sendViaEmail: "Send via Email",
    sendViaWhatsApp: "Send via WhatsApp",
    otp: "Enter OTP",
    otpSent: "OTP sent to your email/phone",
    resend: "Resend OTP",
    verify: "Verify & Login",
    next: "Send OTP",
    noOTP: "Did not receive OTP?",
    liteMode: "Lite Mode (Low Bandwidth)",
    privacy: "By logging in, you agree to our Terms of Service and Privacy Policy",
  };

  // Check if company has admin when company name changes
  useEffect(() => {
    if (companyName.trim()) {
      const adminExists = hasAdminForCompany(companyName);
      setHasExistingAdmin(adminExists);
      // Automatically assign admin role if no admin exists for the company
      if (adminExists) {
        if (role === "admin") {
          setRole("recruiter");
        }
      } else {
        setRole("admin");
      }
    }
  }, [companyName, role]);

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

  const handleSendOTP = async () => {
    setError(null);
    
    if (!emailOrPhone || !companyName) {
      setError("Please fill all fields");
      return;
    }

    if (!hasExistingAdmin && !termsAccepted) {
      setError("Please accept Terms & Conditions");
      return;
    }

    setIsLoading(true);
    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone);

    if (isPhone) {
      try {
        const phoneNumber = `+91${emailOrPhone}`;
        const appVerifier = getRecaptchaVerifier();
        const confirmResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
        setConfirmationResult(confirmResult);
        setStep("otp");
      } catch (err: any) {
        console.error("Firebase send error for Employer:", err);
        setError(err.message || "Failed to send OTP via Firebase");
      } finally {
        setIsLoading(false);
      }
    } else {
      const result = await requestOTP(emailOrPhone, method);
      setIsLoading(false);

      if (result.success) {
        if (isDemoMode()) {
          setDemoOTP(result.otp);
        }
        setStep("otp");
      } else {
        setError(result.error || "Failed to send OTP");
      }
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    }

    setIsLoading(true);
    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone);

    if (isPhone && confirmationResult) {
      try {
        const userCredential = await confirmationResult.confirm(otp);
        const firebaseUser = userCredential.user;

        const success = await verifyAndLogin(emailOrPhone, "123456", companyName, role);
        setIsLoading(false);
        if (success) {
          navigate("/employer-dashboard");
        } else {
          setError("Failed to initialize employer dashboard session");
        }
      } catch (err: any) {
        console.error("Firebase verify error for Employer:", err);
        setError(err.message || "Invalid OTP code");
        setIsLoading(false);
      }
    } else {
      const success = await verifyAndLogin(emailOrPhone, otp, companyName, role);
      setIsLoading(false);

      if (success) {
        navigate("/employer-dashboard");
      } else {
        setError("Invalid OTP");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">{t.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Login Form */}
          <Card className="p-6 border">
            {step === "email" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">{t.step1}</h2>
                </div>

                {/* Email/Phone */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    {method === "email" ? t.email : t.phone}
                  </Label>
                  <Input
                    type={method === "email" ? "email" : "tel"}
                    placeholder={method === "email" ? "employer@company.com" : "+91 98765 43210"}
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="bg-background border-border focus:ring-secondary"
                    data-testid="input-email-phone"
                    disabled={isLoading}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">{t.company}</Label>
                  <Input
                    placeholder="Your Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-background border-border focus:ring-secondary"
                    data-testid="input-company"
                    disabled={isLoading}
                  />
                </div>

                {/* Role Selection */}
                {hasExistingAdmin && (
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">{t.role}</Label>
                    <Tabs value={role} onValueChange={(val) => setRole(val as EmployerRole)}>
                      <TabsList className="grid w-full grid-cols-2 bg-muted">
                        <TabsTrigger value="recruiter" className="text-xs md:text-sm">
                          {t.recruiter}
                        </TabsTrigger>
                        <TabsTrigger value="interviewer" className="text-xs md:text-sm">
                          {t.interviewer}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-xs text-muted-foreground mt-2">Only Admin can invite new team members</p>
                  </div>
                )}

                {/* Terms & Conditions */}
                {!hasExistingAdmin && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1"
                      data-testid="checkbox-terms"
                    />
                    <label className="text-xs text-muted-foreground cursor-pointer">
                      I agree to be the Admin for this company and accept responsibility for team management
                    </label>
                  </div>
                )}

                {/* OTP Method */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("email")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      method === "email"
                        ? "border-secondary bg-secondary/10"
                        : "border-border hover:border-secondary/50"
                    }`}
                    data-testid="button-method-email"
                  >
                    <Mail className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{t.sendViaEmail}</span>
                  </button>
                  <button
                    onClick={() => setMethod("whatsapp")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      method === "whatsapp"
                        ? "border-secondary bg-secondary/10"
                        : "border-border hover:border-secondary/50"
                    }`}
                    data-testid="button-method-whatsapp"
                  >
                    <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{t.sendViaWhatsApp}</span>
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  data-testid="button-send-otp"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    t.next
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{t.step2}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">{t.otpSent}</p>
                </div>

                {/* Demo OTP Display */}
                {demoOTP && (
                  <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Demo Mode - Your OTP:</p>
                    <div className="text-2xl font-bold text-secondary tracking-widest text-center font-mono" data-testid="demo-otp-display">
                      {demoOTP}
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">(In production, you'll receive this via email/WhatsApp)</p>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">{t.otp}</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-10 h-10 md:w-12 md:h-12 border-2 border-border rounded-lg text-center font-bold"
                          data-testid={`input-otp-${i}`}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-secondary hover:bg-secondary/90"
                    data-testid="button-verify-otp"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      t.verify
                    )}
                  </Button>

                  <button
                    onClick={() => setStep("email")}
                    className="w-full px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    data-testid="button-back"
                  >
                    ← Back
                  </button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {t.noOTP}{" "}
                  <button
                    onClick={() => handleSendOTP()}
                    className="text-secondary hover:text-secondary/80 font-medium"
                    data-testid="button-resend-otp"
                  >
                    {t.resend}
                  </button>
                </p>
              </div>
            )}
          </Card>

          {/* Privacy */}
          <p className="text-xs text-center text-muted-foreground mt-6">{t.privacy}</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmployerLogin;
