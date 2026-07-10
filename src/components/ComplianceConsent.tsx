import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Download, Trash2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recordConsent, getConsentRecords, downloadCandidateData, deleteCandidateData, getAdminConfig } from "@/lib/complianceApi";

interface ComplianceConsentProps {
  candidateId?: string;
  studentId?: string;
  employerId?: string;
  showBanner?: boolean;
}

export const ComplianceConsent = ({
  candidateId,
  studentId,
  employerId,
  showBanner = false,
}: ComplianceConsentProps) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [consentChoices, setConsentChoices] = useState({
    data_processing: false,
    communication: false,
    analytics: false,
    marketing: false,
  });
  const [adminConfig, setAdminConfig] = useState(getAdminConfig());

  useEffect(() => {
    setAdminConfig(getAdminConfig());
  }, []);

  const handleConsentAccept = (type: keyof typeof consentChoices) => {
    setConsentChoices(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmitConsent = () => {
    if (candidateId && studentId && employerId) {
      try {
        Object.entries(consentChoices).forEach(([type, accepted]) => {
          recordConsent(
            candidateId,
            studentId,
            employerId,
            type as any,
            accepted ? "accepted" : "rejected"
          );
        });

        toast({
          title: "Success",
          description: "Consent preferences saved",
        });
        setShowDialog(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save consent",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadData = () => {
    if (!candidateId || !employerId) return;

    try {
      if (!adminConfig.allowDataDownload) {
        toast({
          title: "Not Available",
          description: "Data download is not enabled by UdaYantu admin",
          variant: "destructive",
        });
        return;
      }

      const data = downloadCandidateData(candidateId, employerId);
      const blob = new Blob([data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `candidate-data-${candidateId}-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Your data has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteData = () => {
    if (!candidateId || !employerId) return;

    if (!window.confirm("Are you sure? This will permanently delete all your data. This action cannot be undone.")) {
      return;
    }

    try {
      if (!adminConfig.allowDataDelete) {
        toast({
          title: "Not Available",
          description: "Data deletion is not enabled by UdaYantu admin",
          variant: "destructive",
        });
        return;
      }

      const success = deleteCandidateData(candidateId, employerId);
      if (success) {
        toast({
          title: "Success",
          description: "Your data will be deleted according to our retention policy",
        });
        setShowDataDialog(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete data",
        variant: "destructive",
      });
    }
  };

  if (!showBanner && !candidateId) return null;

  return (
    <>
      {/* Compliance Banner - Enterprise Grade */}
      {showBanner && (
        <Card className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-4 p-4 md:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg shadow-xl max-w-6xl mx-auto" data-testid="banner-compliance">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Data Privacy & Compliance</h3>
                  <p className="text-xs text-muted-foreground">GDPR & India Privacy Act Compliant</p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 pl-11">
                Your data is protected and retained for 12 months maximum. All employer actions are logged immutably for your protection.{" "}
                <button
                  onClick={() => setShowDialog(true)}
                  className="font-semibold text-primary hover:text-primary/80 underline transition-colors"
                  data-testid="button-view-consent"
                >
                  Review consent options
                </button>
                {" "}or{" "}
                {candidateId && (
                  <button
                    onClick={() => setShowDataDialog(true)}
                    className="font-semibold text-primary hover:text-primary/80 underline transition-colors"
                    data-testid="button-data-link"
                  >
                    manage your data
                  </button>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {candidateId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDataDialog(true)}
                  className="gap-2 whitespace-nowrap"
                  data-testid="button-data-options"
                >
                  <Download className="w-4 h-4" />
                  My Data
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowDialog(true)}
                className="gap-2 whitespace-nowrap bg-primary hover:bg-primary/90"
                data-testid="button-manage-consent"
              >
                <Lock className="w-4 h-4" />
                Manage
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Consent Dialog - Enterprise Grade */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-consent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              Privacy & Data Consent
            </DialogTitle>
            <DialogDescription className="text-base">
              Manage your consent preferences. You have full control over how your data is processed. All changes are recorded and timestamped.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data Processing */}
            <Card className="p-4 border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="data-processing"
                  checked={consentChoices.data_processing}
                  onCheckedChange={() => handleConsentAccept("data_processing")}
                  data-testid="checkbox-data-processing"
                />
                <div className="flex-1">
                  <Label htmlFor="data-processing" className="font-semibold cursor-pointer">
                    Data Processing & Storage
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow us to process and store your data for recruitment purposes. Data is encrypted and secured.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Retention: 12 months</p>
                </div>
              </div>
            </Card>

            {/* Communication */}
            <Card className="p-4 border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="communication"
                  checked={consentChoices.communication}
                  onCheckedChange={() => handleConsentAccept("communication")}
                  data-testid="checkbox-communication"
                />
                <div className="flex-1">
                  <Label htmlFor="communication" className="font-semibold cursor-pointer">
                    Communication
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive emails and messages about job opportunities and interview updates.
                  </p>
                </div>
              </div>
            </Card>

            {/* Analytics */}
            <Card className="p-4 border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="analytics"
                  checked={consentChoices.analytics}
                  onCheckedChange={() => handleConsentAccept("analytics")}
                  data-testid="checkbox-analytics"
                />
                <div className="flex-1">
                  <Label htmlFor="analytics" className="font-semibold cursor-pointer">
                    Analytics & Improvement
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us improve our platform by sharing anonymous usage data.
                  </p>
                </div>
              </div>
            </Card>

            {/* Marketing */}
            <Card className="p-4 border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="marketing"
                  checked={consentChoices.marketing}
                  onCheckedChange={() => handleConsentAccept("marketing")}
                  data-testid="checkbox-marketing"
                />
                <div className="flex-1">
                  <Label htmlFor="marketing" className="font-semibold cursor-pointer">
                    Marketing Communications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive special offers and updates about new features from UdaYantu.
                  </p>
                </div>
              </div>
            </Card>

            {/* Audit Log Note - Enhanced */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Immutable & Auditable
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 ml-6">
                  All consent records are timestamped with SHA256 integrity verification. Your choices are logged immutably and cannot be altered retroactively. Compliant with GDPR Article 7 requirements.
                </p>
              </div>
            </Card>
            <Card className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Data Retention: Automatically deleted after 12 months</span>
              </p>
            </Card>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)} 
              className="flex-1"
              data-testid="button-cancel-consent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitConsent} 
              className="flex-1 bg-primary hover:bg-primary/90" 
              data-testid="button-save-consent"
            >
              Save & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Management Dialog - Enterprise Grade */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-data-management">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              Your Data
            </DialogTitle>
            <DialogDescription className="text-base">
              Exercise your GDPR rights: download all your data or request deletion under the right to be forgotten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Retention Info */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold">Data Retention: 12 Months</p>
                  <p className="text-xs mt-1 opacity-90">Your data is automatically deleted 12 months after it's collected.</p>
                </div>
              </div>
            </Card>

            {/* Download Data */}
            <div className="space-y-2">
              <Button
                onClick={handleDownloadData}
                disabled={!adminConfig.allowDataDownload}
                variant={adminConfig.allowDataDownload ? "outline" : "ghost"}
                className="w-full gap-2 h-11"
                data-testid="button-download-data"
              >
                <Download className="w-4 h-4" />
                <span>Download My Data</span>
                <span className="text-xs ml-auto">(GDPR Right)</span>
              </Button>
              {!adminConfig.allowDataDownload && (
                <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-100">Download is currently disabled by UdaYantu admin</p>
                </div>
              )}
            </div>

            {/* Delete Data */}
            <div className="space-y-2">
              <Button
                onClick={handleDeleteData}
                disabled={!adminConfig.allowDataDelete}
                variant={adminConfig.allowDataDelete ? "destructive" : "ghost"}
                className="w-full gap-2 h-11"
                data-testid="button-delete-data"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete My Data</span>
                <span className="text-xs ml-auto">(Right to be Forgotten)</span>
              </Button>
              {!adminConfig.allowDataDelete && (
                <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-100">Deletion is currently disabled by UdaYantu admin</p>
                </div>
              )}
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setShowDataDialog(false)} 
            className="w-full"
            data-testid="button-close-data"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
