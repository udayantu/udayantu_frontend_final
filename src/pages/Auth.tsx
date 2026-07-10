import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Smartphone, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Bilingual Support - Complete translations for Auth flow
  const text = {
    en: {
      invalidPhone: "Invalid Phone Number",
      invalidPhoneDesc: "Please enter a valid 10-digit Indian mobile number",
      error: "Error",
      errorTry: "Please try again",
      otpSent: "OTP Sent Successfully",
      otpSentDesc: "Please check your phone for the 6-digit OTP code",
      devMode: "Development Mode",
      devOtp: "Your OTP is",
      failedOTP: "Failed to Send OTP",
      failedOTPDesc: "Please try again or contact support",
      invalidOTP: "Invalid OTP",
      invalidOTPDesc: "Please enter the complete 6-digit OTP",
      verifyFailed: "Verification Failed",
      verifyFailedDesc: "Invalid OTP. Please check and try again.",
      authFailed: "Authentication failed. Please try again.",
      authResponse: "Authentication response invalid. Please try again.",
      loginSuccess: "Login Successful!",
      loginSuccessDesc: "Redirecting to your dashboard...",
      mobileNumber: "Mobile Number",
      enter10Digit: "Enter 10-digit mobile number",
      otpSentTo: "OTP sent to this number",
      checking: "We'll check if you're already registered",
      enterOTP: "Enter OTP",
      enter6Digit: "Enter the 6-digit OTP sent to your mobile",
      changeMobile: "Change mobile number",
      checking2: "Checking",
      verifyOTP: "Verify & Continue",
      continue: "Continue",
      backHome: "Back to Home",
      verifyMobile: "Verify your mobile number",
      enterMobileToStart: "Enter your mobile number to continue",
    },
    hi: {
      invalidPhone: "अमान्य फोन नंबर",
      invalidPhoneDesc: "कृपया एक वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें",
      error: "त्रुटि",
      errorTry: "कृपया पुनः प्रयास करें",
      otpSent: "OTP सफलतापूर्वक भेजा गया",
      otpSentDesc: "कृपया अपने फोन पर 6-अंकीय OTP कोड की जांच करें",
      devMode: "विकास मोड",
      devOtp: "आपका OTP है",
      failedOTP: "OTP भेजने में विफल",
      failedOTPDesc: "कृपया पुनः प्रयास करें या सहायता के लिए संपर्क करें",
      invalidOTP: "अमान्य OTP",
      invalidOTPDesc: "कृपया पूर्ण 6-अंकीय OTP दर्ज करें",
      verifyFailed: "सत्यापन विफल",
      verifyFailedDesc: "अमान्य OTP। कृपया जांचें और पुनः प्रयास करें।",
      authFailed: "प्रमाणीकरण विफल। कृपया पुनः प्रयास करें।",
      authResponse: "प्रमाणीकरण प्रतिक्रिया अमान्य। कृपया पुनः प्रयास करें।",
      loginSuccess: "लॉगिन सफल!",
      loginSuccessDesc: "आपके डैशबोर्ड पर रीडायरेक्ट हो रहा है...",
      mobileNumber: "मोबाइल नंबर",
      enter10Digit: "10-अंकीय मोबाइल नंबर दर्ज करें",
      otpSentTo: "इस नंबर पर OTP भेजा गया",
      checking: "हम जांच करेंगे कि क्या आप पहले से पंजीकृत हैं",
      enterOTP: "OTP दर्ज करें",
      enter6Digit: "अपने मोबाइल पर भेजे गए 6-अंकीय OTP को दर्ज करें",
      changeMobile: "मोबाइल नंबर बदलें",
      checking2: "जांच रहे हैं",
      verifyOTP: "सत्यापित करें और जारी रखें",
      continue: "जारी रखें",
      backHome: "होम पर वापस जाएं",
      verifyMobile: "अपने मोबाइल नंबर को सत्यापित करें",
      enterMobileToStart: "जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें",
    },
  };

  const t = text[language];

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  // Check if user exists in the system
  const checkUserExists = async (phoneNumber: string): Promise<{ exists: boolean; hasUserId: boolean }> => {
    try {
      const { data, error } = await supabase
        .from('student_registrations')
        .select('user_id')
        .eq('phone', phoneNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking user:', error);
        return { exists: false, hasUserId: false };
      }

      return { 
        exists: !!data, 
        hasUserId: !!data?.user_id 
      };
    } catch (error) {
      console.error('Unexpected error in checkUserExists:', error);
      return { exists: false, hasUserId: false };
    }
  };

  // Handle initial phone number submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: t.invalidPhone,
        description: t.invalidPhoneDesc,
        variant: "destructive",
      });
      return;
    }

    setIsCheckingUser(true);
    
    try {
      const { exists, hasUserId } = await checkUserExists(phone);

      // Always use OTP for authentication - more secure
      setIsNewUser(!exists);
      await handleSendOTP();
    } catch (error: any) {
      console.error('Phone submit error:', error);
      toast({
        title: t.error,
        description: error.message || t.errorTry,
        variant: "destructive",
      });
    } finally {
      setIsCheckingUser(false);
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

  const handleSendOTP = async () => {
    setLoading(true);
    
    try {
      const phoneNumber = `+91${phone}`;
      const appVerifier = getRecaptchaVerifier();
      
      const confirmResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
      setConfirmationResult(confirmResult);

      setOtpSent(true);
      toast({
        title: t.otpSent,
        description: t.otpSentDesc + " via Firebase",
      });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: t.failedOTP,
        description: error.message || t.failedOTPDesc,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: t.invalidOTP,
        description: t.invalidOTPDesc,
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: t.error,
        description: "No active verification code found. Please re-send OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const firebaseUser = userCredential.user;

      const mockUser = {
        id: firebaseUser.uid,
        phone: firebaseUser.phoneNumber || phone,
        email: `student_${phone}@udayantu.app`,
        user_metadata: {
          phone: firebaseUser.phoneNumber || phone,
          verified: true
        }
      };

      localStorage.setItem("udayantu_mock_user", JSON.stringify(mockUser));
      window.dispatchEvent(new Event("storage"));

      toast({
        title: t.loginSuccess,
        description: t.loginSuccessDesc,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: t.verifyFailed,
        description: error.message || t.verifyFailedDesc,
        variant: "destructive",
      });
      setOtp(""); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 pt-24">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-3xl font-bold text-primary">UdaYantu</CardTitle>
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors text-xs font-medium"
                data-testid="button-toggle-language"
              >
                {language === "en" ? "हिंदी" : "English"}
              </button>
            </div>
            <CardDescription className="text-base">
              {otpSent 
                ? t.verifyMobile
                : t.enterMobileToStart}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={otpSent ? handleVerifyOTP : handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">
                  {t.mobileNumber}
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border rounded-md bg-muted">
                    <span className="text-sm font-medium">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.enter10Digit}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    disabled={loading || otpSent}
                    maxLength={10}
                    className="flex-1"
                    data-testid="input-phone"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {otpSent ? t.otpSentTo : t.checking}
                </p>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base">
                    {t.enterOTP}
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
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
                    {t.enter6Digit}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="w-full"
                    data-testid="button-change-mobile"
                  >
                    {t.changeMobile}
                  </Button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isCheckingUser}
                size="lg"
              >
                {(loading || isCheckingUser) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingUser ? t.checking2 : "Please wait..."}
                  </>
                ) : otpSent ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t.verifyOTP}
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    {t.continue}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground"
                data-testid="button-back-home"
              >
                {t.backHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
