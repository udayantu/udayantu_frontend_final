import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  IndianRupee,
  RefreshCw,
  HelpCircle,
  ExternalLink
} from "lucide-react";

type GuaranteeStatus = "active" | "fulfilled" | "in_progress" | "expired";
type RefundStatus = "not_applicable" | "eligible" | "requested" | "processing" | "completed" | "denied";

interface GuaranteeItem {
  id: string;
  title: string;
  description: string;
  status: GuaranteeStatus;
  deadline?: string;
  progress?: number;
}

interface TransparencySectionProps {
  guarantees: GuaranteeItem[];
  papEligible: boolean;
  papStatus: "not_started" | "in_progress" | "completed";
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundRequestDate?: string;
  daysInProgram: number;
  onViewPolicyDetails: () => void;
  onContactSupport: () => void;
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    transparency: "Guarantee & Support",
    transparencyDesc: "Your protection and program commitments",
    guaranteeChecklist: "Our Guarantees",
    papStatus: "PAP Status",
    papDesc: "Placement Assistance Program",
    refundStatus: "Refund Status",
    active: "Active",
    fulfilled: "Fulfilled",
    in_progress: "In Progress",
    expired: "Expired",
    not_applicable: "Not Applicable",
    eligible: "Eligible",
    requested: "Requested",
    processing: "Processing",
    completed: "Completed",
    denied: "Denied",
    not_started: "Not Started",
    daysInProgram: "Days in Program",
    viewPolicy: "View Full Policy",
    contactSupport: "Contact Support",
    refundAmount: "Refund Amount",
    requestedOn: "Requested on",
    papInfo: "You're eligible for placement assistance until you get placed",
    papComplete: "Congratulations! You've been successfully placed",
    papNotStarted: "Complete training to activate placement assistance",
  },
  hi: {
    transparency: "गारंटी और मदद",
    transparencyDesc: "आपके वादे और सुरक्षा",
    guaranteeChecklist: "हमारी गारंटी",
    papStatus: "PAP स्टेटस",
    papDesc: "जॉब दिलाने का प्रोग्राम",
    refundStatus: "रिफंड स्टेटस",
    active: "चालू",
    fulfilled: "पूरा हुआ",
    in_progress: "चल रहा है",
    expired: "खत्म",
    not_applicable: "लागू नहीं",
    eligible: "पात्र",
    requested: "मांगा गया",
    processing: "चल रहा है",
    completed: "हो गया",
    denied: "मना",
    not_started: "शुरू नहीं",
    daysInProgram: "प्रोग्राम में दिन",
    viewPolicy: "पूरी पॉलिसी देखो",
    contactSupport: "मदद चाहिए",
    refundAmount: "रिफंड राशि",
    requestedOn: "कब मांगा",
    papInfo: "जब तक जॉब नहीं मिलती, हम मदद करेंगे",
    papComplete: "बधाई! आपको जॉब मिल गई!",
    papNotStarted: "पहले ट्रेनिंग पूरी करो",
  },
};

export function TransparencySection({
  guarantees,
  papEligible,
  papStatus,
  refundStatus,
  refundAmount,
  refundRequestDate,
  daysInProgram,
  onViewPolicyDetails,
  onContactSupport,
  language = "hi",
  liteMode = false,
}: TransparencySectionProps) {
  const t = text[language];

  const getGuaranteeStatusBadge = (status: GuaranteeStatus) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {t.fulfilled}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t.in_progress}
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            {t.expired}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <Shield className="h-3 w-3" />
            {t.active}
          </Badge>
        );
    }
  };

  const getRefundStatusBadge = () => {
    switch (refundStatus) {
      case "completed":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {t.completed}
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            {t.processing}
          </Badge>
        );
      case "requested":
        return (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <Clock className="h-3 w-3" />
            {t.requested}
          </Badge>
        );
      case "eligible":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
            <IndianRupee className="h-3 w-3" />
            {t.eligible}
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {t.denied}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            {t.not_applicable}
          </Badge>
        );
    }
  };

  const getPapStatusInfo = () => {
    if (papStatus === "completed") {
      return { text: t.papComplete, icon: CheckCircle2, color: "text-green-600" };
    }
    if (papStatus === "in_progress") {
      return { text: t.papInfo, icon: Clock, color: "text-blue-600" };
    }
    return { text: t.papNotStarted, icon: AlertCircle, color: "text-muted-foreground" };
  };

  const papInfo = getPapStatusInfo();
  const PapIcon = papInfo.icon;

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.transparency}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>{t.papStatus}:</span>
            <Badge variant={papStatus === "completed" ? "default" : "secondary"}>
              {t[papStatus]}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.refundStatus}:</span>
            {getRefundStatusBadge()}
          </div>
          <div className="flex items-center justify-between">
            <span>{t.daysInProgram}:</span>
            <span className="font-semibold">{daysInProgram}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={onViewPolicyDetails}
          >
            {t.viewPolicy}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-500/10 to-slate-600/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          {t.transparency}
        </CardTitle>
        <CardDescription>{t.transparencyDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {t.guaranteeChecklist}
          </h4>
          <div className="space-y-2">
            {guarantees.map((guarantee) => (
              <div 
                key={guarantee.id}
                className="flex items-start justify-between p-3 rounded-lg bg-background/50 border border-primary/10"
                data-testid={`guarantee-item-${guarantee.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {guarantee.status === "fulfilled" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : guarantee.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm">{guarantee.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {guarantee.description}
                  </p>
                  {guarantee.progress !== undefined && guarantee.status === "in_progress" && (
                    <div className="mt-2 ml-6">
                      <Progress value={guarantee.progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">{guarantee.progress}%</span>
                    </div>
                  )}
                </div>
                {getGuaranteeStatusBadge(guarantee.status)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t.papStatus}</span>
              <Badge variant={papStatus === "completed" ? "default" : 
                            papStatus === "in_progress" ? "secondary" : "outline"}>
                {t[papStatus]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t.papDesc}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${papInfo.color}`}>
              <PapIcon className="h-3 w-3" />
              {papInfo.text}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t.refundStatus}</span>
              {getRefundStatusBadge()}
            </div>
            {refundAmount !== undefined && ["requested", "processing", "completed"].includes(refundStatus) && (
              <div className="text-lg font-bold flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {refundAmount.toLocaleString("en-IN")}
              </div>
            )}
            {refundRequestDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {t.requestedOn}: {new Date(refundRequestDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{daysInProgram}</div>
              <div className="text-xs text-muted-foreground">{t.daysInProgram}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewPolicyDetails}
              data-testid="button-view-policy"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              {t.viewPolicy}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onContactSupport}
              data-testid="button-contact-support-transparency"
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              {t.contactSupport}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { GuaranteeItem, GuaranteeStatus, RefundStatus };
