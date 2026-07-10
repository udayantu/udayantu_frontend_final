import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MessageSquare,
  RefreshCw,
  Filter,
  IndianRupee,
  Download,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { complianceService } from "@/lib/complianceService";
import { ComplianceTicket, TicketType, TicketStatus } from "@/types/compliance";
import { toast } from "sonner";

interface ComplianceTicketsProps {
  userId: string;
  role: "student_success" | "customer_success" | "admin";
  language?: "en" | "hi";
}

const text = {
  en: {
    title: "Compliance Tickets",
    description: "Manage support tickets and compliance requests",
    all: "All",
    open: "Open",
    assigned: "Assigned",
    inProgress: "In Progress",
    resolved: "Resolved",
    refundRequest: "Refund Request",
    dataExport: "Data Export",
    dataDelete: "Data Delete",
    consentInquiry: "Consent Inquiry",
    papAppeal: "PAP Appeal",
    generalSupport: "General Support",
    priority: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    slaStatus: "SLA Status",
    daysRemaining: "days remaining",
    breached: "SLA Breached",
    onTrack: "On Track",
    warning: "Deadline Soon",
    assignToMe: "Assign to Me",
    resolve: "Resolve",
    resolution: "Resolution",
    noTickets: "No tickets found",
    createdBy: "Created by",
    assignedTo: "Assigned to",
  },
  hi: {
    title: "कम्प्लायंस टिकट्स",
    description: "सपोर्ट टिकट्स और कम्प्लायंस रिक्वेस्ट्स मैनेज करें",
    all: "सभी",
    open: "ओपन",
    assigned: "असाइन्ड",
    inProgress: "चल रहा है",
    resolved: "सुलझा हुआ",
    refundRequest: "रिफंड रिक्वेस्ट",
    dataExport: "डेटा एक्सपोर्ट",
    dataDelete: "डेटा डिलीट",
    consentInquiry: "सहमति पूछताछ",
    papAppeal: "PAP अपील",
    generalSupport: "सामान्य सहायता",
    priority: "प्राथमिकता",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अति-आवश्यक",
    slaStatus: "SLA स्टेटस",
    daysRemaining: "दिन बाकी",
    breached: "SLA टूटी",
    onTrack: "सही ट्रैक पर",
    warning: "डेडलाइन नज़दीक",
    assignToMe: "मुझे असाइन करें",
    resolve: "सुलझाएं",
    resolution: "समाधान",
    noTickets: "कोई टिकट नहीं मिला",
    createdBy: "बनाया",
    assignedTo: "असाइन किया",
  },
};

export function ComplianceTickets({ userId, role, language = "hi" }: ComplianceTicketsProps) {
  const t = text[language];
  const [tickets, setTickets] = useState<ComplianceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "assigned" | "resolved">("all");
  const [typeFilter, setTypeFilter] = useState<TicketType | "all">("all");
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ComplianceTicket | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    loadTickets();
  }, [activeTab, typeFilter]);

  async function loadTickets() {
    setLoading(true);
    try {
      const filters: { status?: TicketStatus; type?: TicketType; assignedTo?: string } = {};
      
      if (activeTab === "open") {
        filters.status = "open";
      } else if (activeTab === "assigned") {
        filters.assignedTo = userId;
      } else if (activeTab === "resolved") {
        filters.status = "resolved";
      }

      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }

      const data = await complianceService.getComplianceTickets(filters);
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignToMe(ticketId: string) {
    try {
      await complianceService.assignTicket(ticketId, userId, role);
      toast.success(language === "hi" ? "टिकट असाइन हुआ" : "Ticket assigned");
      await loadTickets();
    } catch {
      toast.error(language === "hi" ? "असाइन में समस्या" : "Failed to assign");
    }
  }

  async function handleResolve() {
    if (!selectedTicket || !resolution.trim()) return;

    try {
      await complianceService.resolveTicket(selectedTicket.id, resolution);
      toast.success(language === "hi" ? "टिकट सुलझा" : "Ticket resolved");
      setShowResolveDialog(false);
      setResolution("");
      setSelectedTicket(null);
      await loadTickets();
    } catch {
      toast.error(language === "hi" ? "सुलझाने में समस्या" : "Failed to resolve");
    }
  }

  function getTypeIcon(type: TicketType) {
    switch (type) {
      case "refund_request":
        return <IndianRupee className="h-4 w-4" />;
      case "data_export":
        return <Download className="h-4 w-4" />;
      case "data_delete":
        return <Trash2 className="h-4 w-4" />;
      case "consent_inquiry":
        return <MessageSquare className="h-4 w-4" />;
      case "pap_appeal":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  }

  function getTypeLabel(type: TicketType): string {
    const labels: Record<TicketType, keyof typeof t> = {
      refund_request: "refundRequest",
      data_export: "dataExport",
      data_delete: "dataDelete",
      consent_inquiry: "consentInquiry",
      pap_appeal: "papAppeal",
      general_support: "generalSupport",
    };
    return t[labels[type]] as string;
  }

  function getPriorityBadge(priority: ComplianceTicket["priority"]) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive",
    };
    return (
      <Badge variant={variants[priority]}>
        {t[priority as keyof typeof t]}
      </Badge>
    );
  }

  function getStatusBadge(status: TicketStatus) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "outline",
      assigned: "secondary",
      in_progress: "secondary",
      pending_approval: "outline",
      resolved: "default",
      closed: "default",
    };
    const icons: Record<string, JSX.Element> = {
      open: <Clock className="h-3 w-3" />,
      assigned: <User className="h-3 w-3" />,
      in_progress: <RefreshCw className="h-3 w-3" />,
      pending_approval: <Clock className="h-3 w-3" />,
      resolved: <CheckCircle2 className="h-3 w-3" />,
      closed: <CheckCircle2 className="h-3 w-3" />,
    };
    return (
      <Badge variant={variants[status]} className="gap-1">
        {icons[status]}
        {status.replace("_", " ")}
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

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TicketType | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="refund_request">{t.refundRequest}</SelectItem>
                <SelectItem value="data_export">{t.dataExport}</SelectItem>
                <SelectItem value="data_delete">{t.dataDelete}</SelectItem>
                <SelectItem value="consent_inquiry">{t.consentInquiry}</SelectItem>
                <SelectItem value="pap_appeal">{t.papAppeal}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t.all}</TabsTrigger>
            <TabsTrigger value="open">{t.open}</TabsTrigger>
            <TabsTrigger value="assigned">{t.assigned}</TabsTrigger>
            <TabsTrigger value="resolved">{t.resolved}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t.noTickets}</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getTypeIcon(ticket.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {language === "hi" ? ticket.subjectHi : ticket.subject}
                            </span>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getTypeLabel(ticket.type)} • {t.createdBy}: {ticket.createdBy}
                          </p>
                          {ticket.assignedTo && (
                            <p className="text-sm text-muted-foreground">
                              {t.assignedTo}: {ticket.assignedTo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getSLABadge(ticket.slaDeadline)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {ticket.description}
                    </p>

                    {ticket.resolution && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm">
                          <strong>{t.resolution}:</strong> {ticket.resolution}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {ticket.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignToMe(ticket.id)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          {t.assignToMe}
                        </Button>
                      )}
                      {(ticket.status === "assigned" || ticket.status === "in_progress") &&
                        ticket.assignedTo === userId && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowResolveDialog(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {t.resolve}
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.resolve}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.resolution}</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder={language === "hi" ? "समाधान लिखें..." : "Write resolution..."}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              {t.resolve}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
