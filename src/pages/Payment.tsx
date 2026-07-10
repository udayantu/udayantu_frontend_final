import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGA4 } from "@/hooks/useGA4";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CreditCard, 
  Shield, 
  CheckCircle2, 
  Lock,
  RefreshCw,
  Zap,
  TrendingUp,
  Award,
  Heart,
  AlertCircle
} from "lucide-react";
import { PaymentSuccessModal } from "@/components/payment/PaymentSuccessModal";

declare global {
  interface Window {
    Razorpay: {
      new (options: Record<string, unknown>): {
        on: (event: string, callback: (response: Record<string, unknown>) => void) => void;
        open: () => void;
      };
    };
  }
}

interface PaymentConfig {
  pricing?: {
    baseAmount?: number;
  };
  gst?: {
    percent?: number;
  };
  [key: string]: unknown;
}

interface StudentRegistration {
  full_name?: string;
  email?: string;
  phone?: string;
  payment_status?: string;
  [key: string]: unknown;
}

export default function Payment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { trackEvent, trackConversion } = useGA4();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [registration, setRegistration] = useState<StudentRegistration | null>(null);
  const [sessionHealthy, setSessionHealthy] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Record<string, unknown> | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Bilingual Support - Complete translations for Payment flow
  const text = {
    en: {
      authRequired: "Authentication Required",
      authRequiredDesc: "Please log in or register to continue",
      loading: "Loading payment details",
      verifying: "Verifying your session",
      sessionExpired: "Session Expired",
      sessionExpiredDesc: "Your session has expired. Please log in again to continue with payment.",
      returnHome: "Return to Home",
      admissionFee: "Complete Your Admission",
      oneTime: "One-time admission fee. Your ticket to job placement with dignity.",
      moneyBack: "Money-Back Guarantee",
      moneyBackDesc: "If not selected for a job! Get your admission fee back in 180 days. We stand behind our placement promise!",
      jobReady: "Job Ready",
      jobReadyDesc: "Expert mentoring & training",
      careerGrowth: "Career Growth",
      careerGrowthDesc: "100% placement guarantee",
      dignityFirst: "Dignity First",
      dignityFirstDesc: "Respectful, transparent process",
      paymentBreakdown: "Payment Breakdown",
      transparentPricing: "Transparent pricing with GST included. Secure Razorpay processing.",
      courseFee: "Admission Fee",
      gst: "GST",
      totalAmount: "Total Amount",
      confirmation: "I confirm that this is an",
      admissionOnly: "admission fee only",
      separateOfferings: "Training, development programs, and job placement services are separate offerings with their own terms.",
      processingPayment: "Processing Payment",
      paySecurely: "Pay",
      securely: "Securely",
      sessionVerified: "Session verified — ready for secure payment",
      pciDss: "PCI-DSS",
      ssl256: "256-Bit SSL",
      razorpay: "Razorpay",
      careMission: "We genuinely care about your success",
      verificationFailed: "Verification Failed",
      paymentFailed: "Payment Failed",
      errorInitiate: "Error",
      failedInitiate: "Failed to initiate payment",
      alreadyPaid: "Already Paid",
      alreadyPaidDesc: "You have already completed the payment.",
      courseRegistration: "Course Registration Payment",
    },
    hi: {
      authRequired: "प्रमाणीकरण आवश्यक",
      authRequiredDesc: "कृपया लॉगिन या पंजीकरण करें",
      loading: "भुगतान विवरण लोड हो रहे हैं",
      verifying: "आपके सत्र को सत्यापित किया जा रहा है",
      sessionExpired: "सत्र समाप्त",
      sessionExpiredDesc: "आपका सत्र समाप्त हो गया है। भुगतान जारी रखने के लिए कृपया फिर से लॉगिन करें।",
      returnHome: "होम पर लौटें",
      admissionFee: "अपना प्रवेश पूरा करें",
      oneTime: "एकबारी प्रवेश शुल्क। नौकरी प्लेसमेंट के लिए आपका टिकट।",
      moneyBack: "मनी-बैक गारंटी",
      moneyBackDesc: "अगर नौकरी के लिए चयनित नहीं हुए! 180 दिनों में अपनी प्रवेश फीस वापस पाएं। हम अपने प्लेसमेंट प्रतिश्रुति के पीछे खड़े हैं!",
      jobReady: "नौकरी के लिए तैयार",
      jobReadyDesc: "विशेषज्ञ सलाह और प्रशिक्षण",
      careerGrowth: "कैरियर विकास",
      careerGrowthDesc: "100% प्लेसमेंट गारंटी",
      dignityFirst: "पहले सम्मान",
      dignityFirstDesc: "सम्मानजनक, पारदर्शी प्रक्रिया",
      paymentBreakdown: "भुगतान विवरण",
      transparentPricing: "GST सहित पारदर्शी मूल्य निर्धारण। सुरक्षित Razorpay प्रसंस्करण।",
      courseFee: "प्रवेश शुल्क",
      gst: "GST",
      totalAmount: "कुल राशि",
      confirmation: "मैं पुष्टि करता हूं कि यह एक",
      admissionOnly: "प्रवेश शुल्क केवल",
      separateOfferings: "प्रशिक्षण, विकास कार्यक्रम, और नौकरी प्लेसमेंट सेवाएं अलग हैं।",
      processingPayment: "भुगतान प्रसंस्करण",
      paySecurely: "सुरक्षित रूप से भुगतान करें",
      securely: "सुरक्षित रूप से",
      sessionVerified: "सत्र सत्यापित - सुरक्षित भुगतान के लिए तैयार",
      pciDss: "PCI-DSS",
      ssl256: "256-बिट SSL",
      razorpay: "Razorpay",
      careMission: "हम आपकी सफलता के बारे में सच में परवाह करते हैं",
      verificationFailed: "सत्यापन विफल",
      paymentFailed: "भुगतान विफल",
      errorInitiate: "त्रुटि",
      failedInitiate: "भुगतान शुरू करने में विफल",
      alreadyPaid: "पहले से भुगतान किया गया",
      alreadyPaidDesc: "आपने पहले से ही भुगतान पूरा कर लिया है।",
      courseRegistration: "पाठ्यक्रम पंजीकरण भुगतान",
    },
  };

  const t = text[language];

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: t.authRequired,
        description: t.authRequiredDesc,
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast, language]);

  useEffect(() => {
    const checkSessionHealth = async () => {
      if (!user) {
        setSessionHealthy(false);
        setSessionChecking(false);
        return;
      }

      try {
        setSessionChecking(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
        }

        if (user) {
          setSessionHealthy(true);
          console.log('Session verified via useAuth for user:', user.id);
        } else if (!session) {
          console.error('No session found');
          setSessionHealthy(false);
          toast({
            title: "Session Expired",
            description: "Please log in again to continue",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 2000);
        } else {
          setSessionHealthy(true);
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Session check error";
        console.error(msg);
        if (user) {
          console.log('Error in session check, but user exists - allowing through');
          setSessionHealthy(true);
        } else {
          setSessionHealthy(false);
          toast({
            title: "Authentication Error",
            description: "Unable to verify your session. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setSessionChecking(false);
      }
    };

    checkSessionHealth();
  }, [user, toast, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !sessionHealthy) return;

      try {
        const { data: configData } = await supabase
          .from('configs')
          .select('config')
          .single();
        setConfig((configData?.config as PaymentConfig) || {});

        const { data: regData } = await supabase
          .from('student_registrations')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setRegistration(regData);

        if (regData?.payment_status === 'paid') {
          toast({
            title: t.alreadyPaid,
            description: t.alreadyPaidDesc,
          });
          navigate("/dashboard");
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error fetching data";
        console.error(msg);
      }
    };

    fetchData();
  }, [user, sessionHealthy, toast, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: t.authRequired,
        description: t.authRequiredDesc,
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Track payment initiation
    trackEvent('begin_checkout', {
      value: totalAmount,
      currency: 'INR',
      items: [{ item_name: t.courseRegistration, price: totalAmount }]
    });

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(t.failedInitiate);
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-payment-order'
      );

      if (orderError) throw new Error((orderError as Record<string, unknown>).message as string || 'Failed to create payment order');

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UdaYantu',
        description: 'Course Registration Payment',
        order_id: orderData.order_id,
        handler: async function (response: Record<string, unknown>) {
          try {
            const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError) throw new Error((verifyError as Record<string, unknown>).message as string || 'Payment verification failed');

            setPaymentResult({
              transactionId: response.razorpay_payment_id,
              amount: totalAmount,
              userName: registration?.full_name || 'Student',
              userEmail: registration?.email || '',
              invoiceNumber: `INV-${Date.now()}-${user.id.slice(0, 8)}`,
            });

            setShowSuccessModal(true);
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Verification failed";
            toast({
              title: "Verification Failed",
              description: msg,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: registration?.full_name,
          email: registration?.email,
          contact: registration?.phone,
        },
        theme: {
          color: '#0EA5E9',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: Record<string, unknown>) {
        const errDescription = (response.error as Record<string, unknown>)?.description as string;
        toast({
          title: t.paymentFailed,
          description: errDescription || "Payment could not be processed. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      });

      razorpay.open();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to initiate payment";
      console.error(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || sessionChecking || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-medium">
            {sessionChecking ? t.verifying : t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!sessionHealthy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md border-0 bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t.sessionExpired}
            </CardTitle>
            <CardDescription>
              {t.sessionExpiredDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-return-home">
              {t.returnHome}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const baseAmount = (config.pricing?.baseAmount as number) || 5321;
  const gstPercent = (config.gst?.percent as number) || 18;
  const gstAmount = Math.round((baseAmount * gstPercent) / 100);
  const totalAmount = baseAmount + gstAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute top-20 right-4 z-20">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
          data-testid="button-toggle-language-payment"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 md:pb-20 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-6 px-5 md:px-8 py-3 md:py-4 rounded-full bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm md:text-base font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">
              🎓 Secure Your Future Today
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 dark:from-blue-100 dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent mb-4">
            {t.admissionFee}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            {t.oneTime}
          </p>
        </div>

        {/* Trust Banner - Premium */}
        <div className="mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 backdrop-blur-sm p-6 md:p-8">
          <div className="flex items-center gap-4 mb-3">
            <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {t.moneyBack}
            </p>
          </div>
          <p className="text-green-800 dark:text-green-200 max-w-2xl ml-10">
            {t.moneyBackDesc}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Benefits Cards */}
          {[
            { icon: Award, label: t.jobReady, desc: t.jobReadyDesc },
            { icon: TrendingUp, label: t.careerGrowth, desc: t.careerGrowthDesc },
            { icon: Heart, label: t.dignityFirst, desc: t.dignityFirstDesc }
          ].map((item, i) => (
            <Card key={i} className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <item.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold mb-1">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Payment Card - Premium Design */}
        <Card className="mb-8 border-0 bg-gradient-to-br from-primary/5 via-background to-background backdrop-blur-sm shadow-xl overflow-hidden">
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>
          
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">Payment Breakdown</CardTitle>
            </div>
            <CardDescription className="text-base">
              Transparent pricing with GST included. Secure Razorpay processing.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Pricing Details - Modern Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Base Amount */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <p className="text-xs text-muted-foreground font-semibold mb-2">{t.courseFee}</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{baseAmount.toLocaleString()}
                </p>
              </div>

              {/* GST */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <p className="text-xs text-muted-foreground font-semibold mb-2">GST ({gstPercent}%)</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{gstAmount.toLocaleString()}
                </p>
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/40 col-span-full md:col-span-1">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <Separator className="bg-primary/10" />

            {/* Consent Checkbox - Enhanced */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-secondary/50 hover:border-primary/30 transition-colors">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                  className="mt-1"
                />
                <Label
                  htmlFor="consent"
                  className="text-sm leading-relaxed cursor-pointer font-medium"
                >
                  I confirm that this is an <strong>admission fee only</strong>. Training, development programs, and job placement services are separate offerings with their own terms.
                </Label>
              </div>
            </div>

            {/* Payment Button - Premium */}
            <Button 
              onClick={handlePayment} 
              disabled={loading || !sessionHealthy || !consentChecked}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="mr-3 h-5 w-5" />
                  Pay ₹{totalAmount.toLocaleString()} Securely
                </>
              )}
            </Button>
            
            {sessionHealthy && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Session verified — ready for secure payment</span>
              </div>
            )}

            {/* Security Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold">PCI-DSS</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold">256-Bit SSL</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold">Razorpay</span>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Footer Message */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center space-y-2">
          <p className="flex items-center justify-center gap-2 font-semibold text-lg">
            <Heart className="h-5 w-5 text-red-500 animate-pulse" />
            We genuinely care about your success
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your admission fee is just the beginning. We're committed to your 100% job placement with mentors who have successfully placed thousands of graduates.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {paymentResult && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          transactionId={paymentResult.transactionId as string}
          amount={paymentResult.amount as number}
          userName={paymentResult.userName as string}
          userEmail={paymentResult.userEmail as string}
          invoiceNumber={paymentResult.invoiceNumber as string}
        />
      )}
    </div>
  );
}
