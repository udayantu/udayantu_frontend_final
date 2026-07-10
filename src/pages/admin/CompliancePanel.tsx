import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminConfig, updateAdminConfig, getAuditLogs, exportAuditLogsCSV, getConsentRecords } from "@/lib/complianceApi";

const CompliancePanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [config, setConfig] = useState(getAdminConfig());
  const [retentionDays, setRetentionDays] = useState(config.defaultRetentionDays);
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());
  const [consentRecords, setConsentRecords] = useState(getConsentRecords());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAuditLogs(getAuditLogs());
    setConsentRecords(getConsentRecords());
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    try {
      const updated = updateAdminConfig({
        ...config,
        defaultRetentionDays: parseInt(retentionDays.toString()),
      });
      setConfig(updated);
      toast({
        title: "Success",
        description: "Compliance settings updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportAuditLogs = () => {
    try {
      const csv = exportAuditLogsCSV(auditLogs);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Audit logs exported",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Export failed",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-6 h-6 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Compliance & Privacy</h1>
              </div>
              <p className="text-muted-foreground">Manage GDPR, consent, and data retention settings</p>
            </div>
          </div>

          {/* Feature Toggles */}
          <Card className="p-6 mb-6 border">
            <h2 className="text-xl font-bold text-foreground mb-4">Feature Controls</h2>
            <div className="space-y-4">
              {/* Consent Enabled */}
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border">
                <div>
                  <Label className="font-semibold text-foreground">Consent Recording</Label>
                  <p className="text-sm text-muted-foreground">Record all data processing consents</p>
                </div>
                <Checkbox
                  checked={config.consentEnabled}
                  onCheckedChange={() => handleToggle("consentEnabled")}
                  data-testid="checkbox-consent-enabled"
                />
              </div>

              {/* Audit Logging */}
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border">
                <div>
                  <Label className="font-semibold text-foreground">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all employer actions immutably</p>
                </div>
                <Checkbox
                  checked={config.auditLoggingEnabled}
                  onCheckedChange={() => handleToggle("auditLoggingEnabled")}
                  data-testid="checkbox-audit-enabled"
                />
              </div>

              {/* Data Download */}
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border">
                <div>
                  <Label className="font-semibold text-foreground">Allow Data Download</Label>
                  <p className="text-sm text-muted-foreground">Candidates can download their data (GDPR right)</p>
                </div>
                <Checkbox
                  checked={config.allowDataDownload}
                  onCheckedChange={() => handleToggle("allowDataDownload")}
                  data-testid="checkbox-download-enabled"
                />
              </div>

              {/* Data Deletion */}
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border">
                <div>
                  <Label className="font-semibold text-foreground">Allow Data Deletion</Label>
                  <p className="text-sm text-muted-foreground">Candidates can request deletion (right to be forgotten)</p>
                </div>
                <Checkbox
                  checked={config.allowDataDelete}
                  onCheckedChange={() => handleToggle("allowDataDelete")}
                  data-testid="checkbox-delete-enabled"
                />
              </div>
            </div>
          </Card>

          {/* Data Retention */}
          <Card className="p-6 mb-6 border">
            <h2 className="text-xl font-bold text-foreground mb-4">Data Retention Policy</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="retention-days" className="font-semibold text-foreground">
                  Default Retention Period (Days)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">How long candidate data is retained</p>
                <Input
                  id="retention-days"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="max-w-xs"
                  data-testid="input-retention-days"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {retentionDays} days (~{Math.round(retentionDays / 30)} months)
                </p>
              </div>

              {/* Warning */}
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold">GDPR Compliance</p>
                    <p className="mt-1">Ensure retention period complies with GDPR and local privacy regulations. After expiry, data should be automatically deleted.</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Audit Logs */}
          <Card className="p-6 mb-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Audit Logs</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportAuditLogs}
                className="gap-2"
                data-testid="button-export-logs"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-muted-foreground">No audit logs yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Timestamp</th>
                      <th className="text-left py-2 px-2">Action</th>
                      <th className="text-left py-2 px-2">Target</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-secondary/5" data-testid={`row-audit-${log.id}`}>
                        <td className="py-2 px-2 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-2">{log.actionType}</td>
                        <td className="py-2 px-2">{log.targetType}</td>
                        <td className="py-2 px-2">
                          <span className={log.immutable ? "text-green-600" : "text-red-600"} data-testid={`status-log-${log.id}`}>
                            {log.immutable ? "✓ Verified" : "✗ Failed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditLogs.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing 10 of {auditLogs.length} logs. Export to see all.</p>
                )}
              </div>
            )}
          </Card>

          {/* Consent Records */}
          <Card className="p-6 mb-6 border">
            <h2 className="text-xl font-bold text-foreground mb-4">Consent Records</h2>
            <p className="text-sm text-muted-foreground mb-4">Total records: {consentRecords.length}</p>

            {consentRecords.length === 0 ? (
              <p className="text-muted-foreground">No consent records yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {consentRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="p-3 bg-secondary/5 rounded-lg border text-sm" data-testid={`card-consent-${record.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{record.consentType}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold ${record.status === "accepted" ? "text-green-600" : "text-red-600"}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
                {consentRecords.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing 5 of {consentRecords.length} records</p>
                )}
              </div>
            )}
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="w-full"
            data-testid="button-save-config"
          >
            {isSaving ? "Saving..." : "Save Compliance Settings"}
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompliancePanel;
