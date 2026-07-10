import { Shield, CheckCircle, AlertCircle, Download, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminConfig, getAuditLogs, getConsentRecords } from "@/lib/complianceApi";

export const ComplianceStatus = () => {
  const config = getAdminConfig();
  const auditLogs = getAuditLogs();
  const consentRecords = getConsentRecords();

  const stats = {
    auditLogs: auditLogs.length,
    consentRecords: consentRecords.length,
    downloadEnabled: config.allowDataDownload,
    deleteEnabled: config.allowDataDelete,
  };

  return (
    <Card className="p-6 border bg-gradient-to-br from-primary/5 to-secondary/5" data-testid="card-compliance-status">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-bold text-lg text-foreground">Compliance & Audit Status</h3>
            <p className="text-sm text-muted-foreground">Enterprise-grade GDPR compliance</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
          <p className="text-xs text-muted-foreground">Audit Logs</p>
          <p className="text-2xl font-bold text-primary">{stats.auditLogs}</p>
          <p className="text-xs text-muted-foreground mt-1">Immutable records</p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
          <p className="text-xs text-muted-foreground">Consent Records</p>
          <p className="text-2xl font-bold text-primary">{stats.consentRecords}</p>
          <p className="text-xs text-muted-foreground mt-1">Timestamped</p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
          <p className="text-xs text-muted-foreground">Data Download</p>
          <p className={`text-xl font-bold ${stats.downloadEnabled ? "text-green-600" : "text-red-600"}`}>
            {stats.downloadEnabled ? "✓ Enabled" : "✗ Disabled"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">GDPR Right</p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
          <p className="text-xs text-muted-foreground">Data Deletion</p>
          <p className={`text-xl font-bold ${stats.deleteEnabled ? "text-green-600" : "text-red-600"}`}>
            {stats.deleteEnabled ? "✓ Enabled" : "✗ Disabled"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Right to be Forgotten</p>
        </div>
      </div>

      <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold">✓ Data Retention: 12 Months</p>
            <p className="text-xs mt-1">All candidate data automatically deleted after 12-month retention period</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold">✓ Immutable Audit Logs</p>
            <p className="text-xs mt-1">All employer actions logged with SHA256 integrity verification</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
