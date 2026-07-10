import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
} from "lucide-react";
import { useAdminRBAC } from "@/hooks/useAdminRBAC";
import { RoleChangeAudit, ROLE_LABELS, AdminRole } from "@/lib/rbac/types";
import { verifyAuditLogIntegrity, exportAuditLogsCSV } from "@/lib/rbac/rbacApi";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function RBACauditLogs() {
  const [logs, setLogs] = useState<RoleChangeAudit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { getAuditLogs, getRoleLabel, checkPermission } = useAdminRBAC();
  const { toast } = useToast();

  const canViewAudit = checkPermission("view_audit_logs");

  const loadLogs = () => {
    const allLogs = getAuditLogs();
    setLogs(allLogs);
  };

  useEffect(() => {
    if (canViewAudit) {
      loadLogs();
    }
  }, [canViewAudit]);

  const filteredLogs = logs.filter(
    (log) =>
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.changedByEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.previousRole && getRoleLabel(log.previousRole).toLowerCase().includes(searchTerm.toLowerCase())) ||
      getRoleLabel(log.newRole).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No Data",
        description: "No audit logs to export",
        variant: "destructive",
      });
      return;
    }

    const csv = exportAuditLogsCSV(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rbac_audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Export Complete",
      description: `Exported ${filteredLogs.length} audit log entries`,
    });
  };

  if (!canViewAudit) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            You don't have permission to view audit logs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Role Change Audit Trail
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Immutable log of all role assignments and changes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
              data-testid="button-export-audit"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, role, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-audit"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadLogs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Integrity Verified
            </Badge>
            <span className="text-xs text-muted-foreground">
              All logs are hash-verified for tamper detection
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role Change</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Integrity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const isVerified = verifyAuditLogIntegrity(log);

                    return (
                      <TableRow
                        key={log.id}
                        data-testid={`row-audit-${log.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {format(new Date(log.timestamp), "PP")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.timestamp), "p")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{log.userEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {log.userId.slice(0, 12)}...
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.previousRole ? (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {getRoleLabel(log.previousRole)}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground mr-2">
                                New
                              </span>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              {getRoleLabel(log.newRole)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{log.changedByEmail}</p>
                        </TableCell>
                        <TableCell>
                          <p
                            className="text-sm max-w-[200px] truncate"
                            title={log.reason}
                          >
                            {log.reason}
                          </p>
                        </TableCell>
                        <TableCell>
                          {isVerified ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Tampered
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Immutable Audit Trail
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                All role changes are cryptographically hashed and cannot be
                modified. Each entry includes timestamp, IP address, and device
                information for compliance purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
