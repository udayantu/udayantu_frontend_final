import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  RefreshCw,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import { complianceService } from "@/lib/complianceService";
import { RefundCase, RefundEligibilityItem, PAPEligibility, REFUND_SLA_DAYS } from "@/types/compliance";
import { toast } from "sonner";

interface RefundDashboardProps {
  studentId?: string;
  studentName?: string;
  role: "student" | "student_success" | "customer_success" | "admin";
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    title: "Refund & PAP Status",
    description: "Track your placement guarantee and refund eligibility",
    papStatus: "Placement Assurance Program",
    refundEligibility: "Refund Eligibility",
    eligibilityChecklist: "Eligibility Checklist",
    requestRefund: "Request Refund",
    pendingCases: "Pending Cases",
    allCases: "All Cases",
    slaStatus: "SLA Status",
    daysRemaining: "days remaining",
    breached: "SLA Breached",
    onTrack: "On Track",
    warning: "Deadline Soon",
    timeline: "Timeline",
    appeal: "File Appeal",
    appealNote: "Appeal Note",
    submitAppeal: "Submit Appeal",
    noRefundCases: "No refund cases found",
    createRequest: "Submit Request",
    reason: "Reason for refund",
    amount: "Amount",
    status: "Status",
    requested: "Requested",
    under_review: "Under Review",
    approved: "Approved",
    processing: "Processing",
    completed: "Completed",
    denied: "Denied",
    appealed: "Appealed",
    not_applicable: "Not Applicable",
    eligible: "Eligible",
    daysInProgram: "Days in Program",
    placementDeadline: "Placement Deadline",
    programComplete: "Program Complete",
    attendance: "Attendance",
    assessments: "Assessments",
    conduct: "Conduct",
    verified: "Verified",
    pending: "Pending",
    assignTo: "Assign To",
    resolve: "Resolve Case",
    resolution: "Resolution",
  },
  hi: {
    title: "रिफंड और PAP स्टेटस",
    description: "प्लेसमेंट गारंटी और रिफंड योग्यता ट्रैक करें",
    papStatus: "प्लेसमेंट सहायता प्रोग्राम",
    refundEligibility: "रिफंड योग्यता",
    eligibilityChecklist: "योग्यता चेकलिस्ट",
    requestRefund: "रिफंड रिक्वेस्ट करें",
    pendingCases: "पेंडिंग केसेस",
    allCases: "सभी केसेस",
    slaStatus: "SLA स्टेटस",
    daysRemaining: "दिन बाकी",
    breached: "SLA टूटी",
    onTrack: "सही ट्रैक पर",
    warning: "डेडलाइन नज़दीक",
    timeline: "टाइमलाइन",
    appeal: "अपील करें",
    appealNote: "अपील नोट",
    submitAppeal: "अपील भेजें",
    noRefundCases: "कोई रिफंड केस नहीं मिला",
    createRequest: "रिक्वेस्ट भेजें",
    reason: "रिफंड का कारण",
    amount: "राशि",
    status: "स्टेटस",
    requested: "रिक्वेस्ट भेजी",
    under_review: "समीक्षा में",
    approved: "मंजूर",
    processing: "प्रोसेसिंग",
    completed: "पूरा हुआ",
    denied: "अस्वीकार",
    appealed: "अपील की गई",
    not_applicable: "लागू नहीं",
    eligible: "योग्य",
    daysInProgram: "प्रोग्राम में दिन",
    placementDeadline: "प्लेसमेंट डेडलाइन",
    programComplete: "प्रोग्राम पूरा",
    attendance: "उपस्थिति",
    assessments: "टेस्ट",
    conduct: "व्यवहार",
    verified: "वेरीफाइड",
    pending: "पेंडिंग",
    assignTo: "असाइन करें",
    resolve: "केस सुलझाएं",
    resolution: "समाधान",
  },
};

export function RefundDashboard({
  studentId,
  studentName,
  role,
  language = "hi",
  liteMode = false,
}: RefundDashboardProps) {
  const t = text[language];
  const [refundCases, setRefundCases] = useState<RefundCase[]>([]);
  const [papEligibility, setPapEligibility] = useState<PAPEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<RefundCase | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [appealNote, setAppealNote] = useState("");

  const isStudent = role === "student";
  const canManageCases = role === "admin" || role === "student_success" || role === "customer_success";

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function loadData() {
    setLoading(true);
    try {
      if (isStudent && studentId) {
        const pap = await complianceService.calculatePAPEligibility(studentId);
        setPapEligibility(pap);
        const cases = await complianceService.getRefundCases();
        setRefundCases(cases.filter((c) => c.studentId === studentId));
      } else {
        const cases = await complianceService.getRefundCases();
        setRefundCases(cases);
      }
    } catch (error) {
      console.error("Failed to load refund data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRequest() {
    if (!studentId || !studentName || !requestReason.trim()) return;

    try {
      await complianceService.createRefundCase(
        studentId,
        studentName,
        25000,
        requestReason
      );
      toast.success(language === "hi" ? "रिक्वेस्ट भेजी गई" : "Request submitted");
      setShowRequestDialog(false);
      setRequestReason("");
      await loadData();
    } catch {
      toast.error(language === "hi" ? "रिक्वेस्ट में समस्या" : "Failed to submit request");
    }
  }

  async function handleSubmitAppeal() {
    if (!selectedCase || !appealNote.trim()) return;

    try {
      await complianceService.submitRefundAppeal(
        selectedCase.id,
        appealNote,
        studentName || "Student"
      );
      toast.success(language === "hi" ? "अपील भेजी गई" : "Appeal submitted");
      setShowAppealDialog(false);
      setAppealNote("");
      setSelectedCase(null);
      await loadData();
    } catch {
      toast.error(language === "hi" ? "अपील में समस्या" : "Failed to submit appeal");
    }
  }

  async function handleVerifyItem(caseId: string, itemId: string, met: boolean) {
    try {
      await complianceService.updateEligibilityItem(caseId, itemId, met, "Admin");
      toast.success(language === "hi" ? "वेरीफाइड" : "Verified");
      await loadData();
    } catch {
      toast.error(language === "hi" ? "वेरीफाई में समस्या" : "Failed to verify");
    }
  }

  async function handleUpdateStatus(caseId: string, newStatus: RefundCase["status"]) {
    try {
      const statusLabels: Record<string, { en: string; hi: string }> = {
        under_review: { en: "Case under review", hi: "केस समीक्षा में" },
        approved: { en: "Refund approved", hi: "रिफंड मंजूर" },
        processing: { en: "Processing refund", hi: "रिफंड प्रोसेसिंग" },
        completed: { en: "Refund completed", hi: "रिफंड पूरा" },
        denied: { en: "Refund denied", hi: "रिफंड अस्वीकार" },
      };
      const label = statusLabels[newStatus] || { en: newStatus, hi: newStatus };

      await complianceService.updateRefundCase(
        caseId,
        { status: newStatus },
        "Admin",
        "admin",
        label.en,
        label.hi
      );
      toast.success(language === "hi" ? "स्टेटस अपडेट हुआ" : "Status updated");
      await loadData();
    } catch {
      toast.error(language === "hi" ? "अपडेट में समस्या" : "Failed to update");
    }
  }

  function getStatusBadge(status: RefundCase["status"]) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "outline",
      under_review: "secondary",
      approved: "default",
      processing: "secondary",
      completed: "default",
      denied: "destructive",
      appealed: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {t[status as keyof typeof t] || status}
      </Badge>
    );
  }

  function getSLABadge(deadline: string) {
    const { status, daysRemaining } = complianceService.getSLAStatus(deadline);
    if (status === "breached") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t.breached}
        </Badge>
      );
    }
    if (status === "warning") {
      return (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
          <Clock className="h-3 w-3" />
          {daysRemaining} {t.daysRemaining}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        {t.onTrack}
      </Badge>
    );
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {papEligibility && (
            <div className="flex items-center justify-between">
              <span>{t.papStatus}:</span>
              <Badge variant={papEligibility.status === "placed" ? "default" : "secondary"}>
                {papEligibility.status === "placed" ? "Placed" : papEligibility.status}
              </Badge>
            </div>
          )}
          {refundCases.length > 0 && (
            <div className="flex items-center justify-between">
              <span>{t.status}:</span>
              {getStatusBadge(refundCases[0].status)}
            </div>
          )}
          {isStudent && papEligibility?.status === "refund_eligible" && refundCases.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowRequestDialog(true)}
            >
              {t.requestRefund}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isStudent && papEligibility && (
        <Card className="border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{t.papStatus}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t.daysInProgram}</p>
                <p className="text-xl font-bold">{papEligibility.daysInProgram}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t.attendance}</p>
                <p className="text-xl font-bold">{papEligibility.attendancePercentage}%</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t.programComplete}</p>
                <Badge variant={papEligibility.programCompleted ? "default" : "secondary"}>
                  {papEligibility.programCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </Badge>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t.placementDeadline}</p>
                <p className="text-sm font-medium">
                  {new Date(papEligibility.placementDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            {papEligibility.status === "refund_eligible" && refundCases.length === 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>{t.eligible}</strong>
                  <p className="text-sm mt-1">
                    {language === "hi"
                      ? "आप रिफंड के लिए योग्य हैं। अभी रिक्वेस्ट करें।"
                      : "You are eligible for a refund. Request now."}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowRequestDialog(true)}
                  >
                    {t.requestRefund}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{canManageCases ? t.allCases : t.refundEligibility}</CardTitle>
                <CardDescription>
                  {language === "hi" ? "रिफंड केसेस और स्टेटस" : "Refund cases and status"}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline">{refundCases.length} {canManageCases ? t.allCases : ""}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {refundCases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noRefundCases}</p>
          ) : (
            <div className="space-y-4">
              {refundCases.map((refundCase) => (
                <div
                  key={refundCase.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{refundCase.studentName}</span>
                        {getStatusBadge(refundCase.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.amount}: ₹{refundCase.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      {getSLABadge(refundCase.slaDeadline)}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(refundCase.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">{t.eligibilityChecklist}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {refundCase.eligibilityChecklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {canManageCases ? (
                            <Checkbox
                              checked={item.met}
                              onCheckedChange={(checked) =>
                                handleVerifyItem(refundCase.id, item.id, checked as boolean)
                              }
                            />
                          ) : item.met ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={item.met ? "" : "text-muted-foreground"}>
                            {language === "hi" ? item.labelHi : item.label}
                          </span>
                          {item.verifiedBy && (
                            <Badge variant="outline" className="text-xs">
                              {t.verified}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">{t.timeline}</p>
                    <div className="space-y-2">
                      {refundCase.timeline.map((item, i) => (
                        <div key={item.id} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          <div>
                            <p>{language === "hi" ? item.actionHi : item.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.actor} • {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(isStudent && refundCase.status === "denied") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCase(refundCase);
                        setShowAppealDialog(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.appeal}
                    </Button>
                  )}

                  {canManageCases && (
                    <div className="flex gap-2 flex-wrap">
                      {refundCase.status === "requested" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(refundCase.id, "under_review")}
                        >
                          Start Review
                        </Button>
                      )}
                      {refundCase.status === "under_review" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(refundCase.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(refundCase.id, "denied")}
                          >
                            Deny
                          </Button>
                        </>
                      )}
                      {refundCase.status === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(refundCase.id, "processing")}
                        >
                          Process Refund
                        </Button>
                      )}
                      {refundCase.status === "processing" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(refundCase.id, "completed")}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.requestRefund}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.reason}</label>
              <Textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder={language === "hi" ? "रिफंड का कारण बताएं..." : "Explain reason for refund..."}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={!requestReason.trim()}>
              {t.createRequest}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.appeal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.appealNote}</label>
              <Textarea
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                placeholder={language === "hi" ? "अपनी अपील लिखें..." : "Write your appeal..."}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAppeal} disabled={!appealNote.trim()}>
              {t.submitAppeal}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
