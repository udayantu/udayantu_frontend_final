import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileText,
  RefreshCw,
} from "lucide-react";
import { complianceService } from "@/lib/complianceService";
import { DataRequest } from "@/types/compliance";
import { toast } from "sonner";

interface DataRequestPanelProps {
  userId: string;
  userType: "student" | "employer";
  role?: "student" | "employer" | "student_success" | "customer_success" | "admin";
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    title: "Your Data Rights",
    description: "Export or delete your personal data",
    exportData: "Export My Data",
    deleteData: "Delete My Data",
    exportDesc: "Download all your data in a portable format",
    deleteDesc: "Permanently delete all your data from our systems",
    pending: "Pending",
    approved: "Approved",
    processing: "Processing",
    completed: "Completed",
    rejected: "Rejected",
    noRequests: "No data requests",
    requestedOn: "Requested on",
    confirmDelete: "Confirm Data Deletion",
    deleteWarning: "This action cannot be undone. All your personal data will be permanently deleted.",
    cancel: "Cancel",
    confirm: "Confirm Delete",
    dataPackageReady: "Your data package is ready for download",
    download: "Download",
    gdprInfo: "Under GDPR and India's Digital Personal Data Protection Act, you have the right to access and delete your data.",
    slaNote: "Requests are processed within 30 days",
    adminTitle: "Data Requests",
    adminDesc: "Manage user data export and deletion requests",
    approve: "Approve",
    reject: "Reject",
    process: "Process",
  },
  hi: {
    title: "आपके डेटा अधिकार",
    description: "अपना डेटा डाउनलोड या डिलीट करें",
    exportData: "डेटा डाउनलोड करें",
    deleteData: "डेटा मिटाएं",
    exportDesc: "अपना पूरा डेटा डाउनलोड करें",
    deleteDesc: "अपना सारा डेटा हमेशा के लिए मिटाएं",
    pending: "प्रोसेस में",
    approved: "मंजूर",
    processing: "प्रोसेसिंग",
    completed: "पूरा हुआ",
    rejected: "अस्वीकार",
    noRequests: "कोई डेटा रिक्वेस्ट नहीं",
    requestedOn: "रिक्वेस्ट की तारीख",
    confirmDelete: "डेटा डिलीट की पुष्टि करें",
    deleteWarning: "यह काम वापस नहीं हो सकता। आपका सारा डेटा हमेशा के लिए मिट जाएगा।",
    cancel: "रद्द करें",
    confirm: "हां, मिटाएं",
    dataPackageReady: "आपका डेटा पैकेज तैयार है",
    download: "डाउनलोड",
    gdprInfo: "GDPR और भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट के तहत आपको अपना डेटा देखने और मिटाने का अधिकार है।",
    slaNote: "रिक्वेस्ट 30 दिनों में प्रोसेस होती हैं",
    adminTitle: "डेटा रिक्वेस्ट्स",
    adminDesc: "यूज़र डेटा एक्सपोर्ट और डिलीट रिक्वेस्ट्स मैनेज करें",
    approve: "मंजूर करें",
    reject: "अस्वीकार करें",
    process: "प्रोसेस करें",
  },
};

export function DataRequestPanel({
  userId,
  userType,
  role = "student",
  language = "hi",
  liteMode = false,
}: DataRequestPanelProps) {
  const t = text[language];
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === "admin" || role === "student_success" || role === "customer_success";

  useEffect(() => {
    loadRequests();
  }, [userId]);

  async function loadRequests() {
    setLoading(true);
    try {
      if (isAdmin) {
        const allRequests = await complianceService.getDataRequests();
        setRequests(allRequests);
      } else {
        const userRequests = await complianceService.getDataRequests({ userId });
        setRequests(userRequests);
      }
    } catch (error) {
      console.error("Failed to load data requests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportRequest() {
    setSubmitting(true);
    try {
      await complianceService.createDataRequest(userId, userType, "export");
      toast.success(language === "hi" ? "एक्सपोर्ट रिक्वेस्ट भेजी गई" : "Export request submitted");
      await loadRequests();
    } catch {
      toast.error(language === "hi" ? "रिक्वेस्ट में समस्या" : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRequest() {
    setSubmitting(true);
    try {
      await complianceService.createDataRequest(userId, userType, "delete");
      toast.success(language === "hi" ? "डिलीट रिक्वेस्ट भेजी गई" : "Delete request submitted");
      setShowDeleteConfirm(false);
      await loadRequests();
    } catch {
      toast.error(language === "hi" ? "रिक्वेस्ट में समस्या" : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      await complianceService.approveDataRequest(requestId, userId);
      toast.success(language === "hi" ? "मंजूर किया" : "Approved");
      await loadRequests();
    } catch {
      toast.error(language === "hi" ? "मंजूरी में समस्या" : "Approval failed");
    }
  }

  async function handleProcess(requestId: string) {
    try {
      await complianceService.processDataRequest(requestId, userId, "data_package_ready");
      toast.success(language === "hi" ? "प्रोसेस किया" : "Processed");
      await loadRequests();
    } catch {
      toast.error(language === "hi" ? "प्रोसेसिंग में समस्या" : "Processing failed");
    }
  }

  function getStatusBadge(status: DataRequest["status"]) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "secondary",
      processing: "secondary",
      completed: "default",
      rejected: "destructive",
    };
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="h-3 w-3" />,
      approved: <CheckCircle2 className="h-3 w-3" />,
      processing: <RefreshCw className="h-3 w-3 animate-spin" />,
      completed: <CheckCircle2 className="h-3 w-3" />,
      rejected: <AlertTriangle className="h-3 w-3" />,
    };
    return (
      <Badge variant={variants[status]} className="gap-1">
        {icons[status]}
        {t[status as keyof typeof t]}
      </Badge>
    );
  }

  const hasPendingExport = requests.some(
    (r) => r.requestType === "export" && ["pending", "approved", "processing"].includes(r.status)
  );
  const hasPendingDelete = requests.some(
    (r) => r.requestType === "delete" && ["pending", "approved", "processing"].includes(r.status)
  );

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
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
            <Shield className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleExportRequest}
            disabled={hasPendingExport || submitting}
          >
            <Download className="h-4 w-4 mr-2" />
            {t.exportData}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={hasPendingDelete || submitting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t.deleteData}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t.adminTitle}</CardTitle>
              <CardDescription>{t.adminDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noRequests}</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {request.requestType === "export" ? (
                      <Download className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Trash2 className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {request.requestType === "export" ? t.exportData : t.deleteData}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.userId} • {t.requestedOn}: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.status === "pending" && (
                      <Button size="sm" onClick={() => handleApprove(request.id)}>
                        {t.approve}
                      </Button>
                    )}
                    {request.status === "approved" && (
                      <Button size="sm" onClick={() => handleProcess(request.id)}>
                        {t.process}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <p>{t.gdprInfo}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.slaNote}</p>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{t.exportData}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t.exportDesc}</p>
            <Button
              onClick={handleExportRequest}
              disabled={hasPendingExport || submitting}
              className="w-full"
            >
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {t.exportData}
            </Button>
          </div>

          <div className="p-4 border rounded-lg border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="font-medium">{t.deleteData}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t.deleteDesc}</p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={hasPendingDelete || submitting}
              className="w-full"
            >
              {t.deleteData}
            </Button>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium">{language === "hi" ? "आपकी रिक्वेस्ट्स" : "Your Requests"}</p>
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {request.requestType === "export" ? (
                    <Download className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {request.requestType === "export" ? t.exportData : t.deleteData}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  {request.status === "completed" && request.requestType === "export" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      {t.download}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t.confirmDelete}
            </DialogTitle>
            <DialogDescription>{t.deleteWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest} disabled={submitting}>
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
