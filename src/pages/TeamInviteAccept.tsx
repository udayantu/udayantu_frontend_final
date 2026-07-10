import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { getInviteByToken, verifyTeamInvite, addTeamMember } from "@/lib/employerTeamStorage";
import { saveEmployerSession, EmployerSession } from "@/lib/employerAuth";
import { useToast } from "@/hooks/use-toast";

const TeamInviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [step, setStep] = useState<"invite" | "otp" | "success" | "error">("invite");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const text = {
    en: {
      title: "Join Team",
      subtitle: "Accept your team invitation and get started",
      loading: "Loading invitation...",
      invalid: "Invalid or expired invitation",
      step1: "Verify Invitation",
      step2: "Enter OTP",
      step3: "Welcome!",
      role: "Role",
      company: "Company",
      email: "Email",
      otp: "Enter OTP sent to your email",
      accept: "Accept Invitation",
      verify: "Verify & Join",
      resend: "Resend OTP",
      success: "Successfully joined the team!",
      redirecting: "Redirecting to dashboard...",
      recruiter: "Recruiter",
      interviewer: "Interviewer",
      next: "Next",
    },
    hi: {
      title: "टीम में शामिल हों",
      subtitle: "अपने टीम आमंत्रण को स्वीकार करें",
      loading: "आमंत्रण लोड किया जा रहा है...",
      invalid: "अमान्य या समाप्त आमंत्रण",
      step1: "आमंत्रण सत्यापित करें",
      step2: "OTP दर्ज करें",
      step3: "स्वागत है!",
      role: "भूमिका",
      company: "कंपनी",
      email: "ईमेल",
      otp: "अपने ईमेल पर भेजा गया OTP दर्ज करें",
      accept: "आमंत्रण स्वीकार करें",
      verify: "सत्यापित करें और शामिल हों",
      resend: "OTP फिर से भेजें",
      success: "टीम में सफलतापूर्वक शामिल!",
      redirecting: "डैशबोर्ड पर रीडायरेक्ट हो रहे हैं...",
      recruiter: "भर्तीकर्ता",
      interviewer: "साक्षात्कारकर्ता",
      next: "आगे",
    },
  };

  const t = text[language];

  // Load invitation
  useEffect(() => {
    if (token) {
      const invite = getInviteByToken(token);
      if (invite) {
        setInviteData(invite);
        setStep("invite");
      } else {
        setStep("error");
        setError(t.invalid);
      }
    }
  }, [token]);

  const handleAccept = () => {
    setIsLoading(true);
    setStep("otp");
    setIsLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    }

    setIsLoading(true);

    try {
      const verified = verifyTeamInvite(inviteData.token, otp);
      if (!verified) {
        setError(language === "en" ? "Invalid OTP" : "अमान्य OTP");
        setIsLoading(false);
        return;
      }

      // Add team member
      const memberId = `team_${Math.random().toString(36).substr(2, 9)}`;
      addTeamMember({
        id: memberId,
        companyId: verified.companyId,
        email: verified.email,
        name: verified.email.split("@")[0],
        role: verified.role,
        status: "active",
        invitedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        invitedBy: verified.invitedBy,
      });

      // Create session
      const session: EmployerSession = {
        id: memberId,
        email: verified.email,
        phone: "+91",
        companyName: verified.companyId,
        role: verified.role,
        verified: true,
        createdAt: new Date().toISOString(),
        isDemo: true,
      };

      saveEmployerSession(session);
      setStep("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/employer-dashboard");
      }, 2000);
    } catch (err) {
      setError("Failed to join team");
    } finally {
      setIsLoading(false);
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

          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted transition-colors"
              data-testid="button-toggle-language"
            >
              {language === "en" ? "हिंदी" : "English"}
            </button>
          </div>

          {/* Error State */}
          {step === "error" && (
            <Card className="p-8 border text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <h2 className="text-xl font-bold text-destructive mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/employers")} variant="outline">
                Back to Employers
              </Button>
            </Card>
          )}

          {/* Invite Details */}
          {(step === "invite" || step === "otp") && inviteData && (
            <Card className="p-6 border space-y-5">
              <div className="space-y-3">
                <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.company}</Label>
                    <p className="font-semibold text-foreground">{inviteData.companyId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.email}</Label>
                    <p className="font-semibold text-foreground">{inviteData.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.role}</Label>
                    <Badge variant="secondary" className="mt-1">
                      {inviteData.role === "recruiter" ? t.recruiter : t.interviewer}
                    </Badge>
                  </div>
                </div>
              </div>

              {step === "invite" && (
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  data-testid="button-accept-invite"
                >
                  {t.accept}
                </Button>
              )}

              {step === "otp" && (
                <div className="space-y-4">
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

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleVerify}
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

                  <Button
                    onClick={() => setStep("invite")}
                    variant="outline"
                    className="w-full"
                    data-testid="button-back"
                  >
                    ← Back
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Success State */}
          {step === "success" && (
            <Card className="p-8 border text-center">
              <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">{t.success}</h2>
              <p className="text-muted-foreground mb-6">{t.redirecting}</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto" />
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeamInviteAccept;
