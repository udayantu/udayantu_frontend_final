import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Users,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getPendingActions,
  processCSAction,
  getCSEscalations,
  resolveEscalation,
  getCSActionStats,
  type CSPendingAction,
  type CSEscalation,
} from '@/lib/csMediationService';
import { createInterviewOutcomePacket, sendPacket } from '@/lib/packetService';

interface CSActionsDashboardProps {
  userRole: 'cs' | 'admin';
  language?: 'en' | 'hi';
}

const translations = {
  en: {
    title: 'CS Actions Queue',
    subtitle: 'Manage employer requests and escalations',
    pendingActions: 'Pending Actions',
    escalations: 'Escalations',
    stats: 'Statistics',
    approve: 'Approve',
    reject: 'Reject',
    resolve: 'Resolve',
    viewDetails: 'View Details',
    notes: 'Notes',
    addNotes: 'Add notes (optional)',
    resolution: 'Resolution',
    addResolution: 'Describe how this was resolved...',
    scheduleInterview: 'Schedule Interview',
    sendOffer: 'Send Offer',
    shareCandidate: 'Share Candidate',
    requestFeedback: 'Request Feedback',
    reactivateCandidate: 'Reactivate Candidate',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    urgent: 'Urgent',
    normal: 'Normal',
    slaDeadline: 'SLA Deadline',
    employer: 'Employer',
    student: 'Student ID',
    createdAt: 'Created',
    noActions: 'No pending actions',
    noEscalations: 'No escalations',
    avgProcessingTime: 'Avg Processing Time',
    slaBreaches: 'SLA Breaches',
    hours: 'hours',
    refresh: 'Refresh',
    emitPacket: 'Emit Outcome Packet',
  },
  hi: {
    title: 'CS एक्शन कतार',
    subtitle: 'एम्प्लॉयर अनुरोध और एस्केलेशन मैनेज करें',
    pendingActions: 'बाकी एक्शन',
    escalations: 'एस्केलेशन',
    stats: 'आंकड़े',
    approve: 'स्वीकार',
    reject: 'अस्वीकार',
    resolve: 'हल करें',
    viewDetails: 'विवरण देखें',
    notes: 'नोट्स',
    addNotes: 'नोट्स जोड़ें (वैकल्पिक)',
    resolution: 'समाधान',
    addResolution: 'बताएं कि इसे कैसे हल किया गया...',
    scheduleInterview: 'इंटरव्यू शेड्यूल करें',
    sendOffer: 'ऑफर भेजें',
    shareCandidate: 'कैंडिडेट शेयर करें',
    requestFeedback: 'फीडबैक मांगें',
    reactivateCandidate: 'कैंडिडेट रीएक्टिवेट करें',
    pending: 'बाकी',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    completed: 'पूर्ण',
    open: 'खुला',
    inProgress: 'प्रगति में',
    resolved: 'हल',
    urgent: 'अर्जेंट',
    normal: 'सामान्य',
    slaDeadline: 'SLA डेडलाइन',
    employer: 'एम्प्लॉयर',
    student: 'स्टूडेंट ID',
    createdAt: 'बनाया गया',
    noActions: 'कोई बाकी एक्शन नहीं',
    noEscalations: 'कोई एस्केलेशन नहीं',
    avgProcessingTime: 'औसत प्रोसेसिंग समय',
    slaBreaches: 'SLA उल्लंघन',
    hours: 'घंटे',
    refresh: 'रिफ्रेश',
    emitPacket: 'आउटकम पैकेट भेजें',
  },
};

const actionTypeLabels = {
  en: {
    schedule_interview: 'Schedule Interview',
    send_offer: 'Send Offer',
    share_candidate: 'Share Candidate',
    request_feedback: 'Request Feedback',
    reactivate_candidate: 'Reactivate Candidate',
  },
  hi: {
    schedule_interview: 'इंटरव्यू शेड्यूल करें',
    send_offer: 'ऑफर भेजें',
    share_candidate: 'कैंडिडेट शेयर करें',
    request_feedback: 'फीडबैक मांगें',
    reactivate_candidate: 'कैंडिडेट रीएक्टिवेट करें',
  },
};

export function CSActionsDashboard({ userRole, language = 'hi' }: CSActionsDashboardProps) {
  const t = translations[language];
  const actionLabels = actionTypeLabels[language];
  const { toast } = useToast();

  const [actions, setActions] = useState<CSPendingAction[]>([]);
  const [escalations, setEscalations] = useState<CSEscalation[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getCSActionStats> | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAction, setSelectedAction] = useState<CSPendingAction | null>(null);
  const [selectedEscalation, setSelectedEscalation] = useState<CSEscalation | null>(null);
  const [notes, setNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      setActions(getPendingActions());
      setEscalations(getCSEscalations());
      setStats(getCSActionStats());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (action: CSPendingAction) => {
    const result = processCSAction(action.id, 'cs_user', true, notes);
    if (result.success) {
      toast({
        title: language === 'hi' ? 'स्वीकृत' : 'Approved',
        description: language === 'hi' ? 'एक्शन स्वीकृत किया गया' : 'Action approved',
      });

      if (action.type === 'schedule_interview' || action.type === 'send_offer' || action.type === 'share_candidate') {
        const packet = createInterviewOutcomePacket({
          studentId: action.studentId,
          studentName: action.studentName || 'Candidate',
          employerId: action.employerId,
          employerName: action.employerName,
          interviewId: `int_${Date.now()}`,
          createdBy: 'cs_user',
          feedback: {
            technicalScore: 0,
            communicationScore: 0,
            cultureFitScore: 0,
            overallScore: 0,
            strengths: [],
            improvements: [],
            notes: `Action ${action.type} approved. ${notes}`,
          },
          reskillTags: [],
          nextSteps: {
            action: action.type === 'send_offer' ? 'selected' : 
                   action.type === 'share_candidate' ? 'selected' : 'next_round',
            details: notes || 'Proceeding with candidate',
          },
        });

        const sendResult = await sendPacket(packet.id, 'cs', language);
        if (sendResult.success) {
          toast({
            title: language === 'hi' ? 'पैकेट भेजा गया' : 'Packet Sent',
            description: language === 'hi' ? 'SS और Admin को सूचित किया गया' : 'SS and Admin notified',
          });
        }
      }

      setSelectedAction(null);
      setNotes('');
      loadData();
    }
  };

  const handleReject = (action: CSPendingAction) => {
    const result = processCSAction(action.id, 'cs_user', false, notes);
    if (result.success) {
      toast({
        title: language === 'hi' ? 'अस्वीकृत' : 'Rejected',
        description: language === 'hi' ? 'एक्शन अस्वीकृत किया गया' : 'Action rejected',
      });
      setSelectedAction(null);
      setNotes('');
      loadData();
    }
  };

  const handleResolveEscalation = () => {
    if (!selectedEscalation || !resolution.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया समाधान दर्ज करें' : 'Please enter a resolution',
        variant: 'destructive',
      });
      return;
    }

    const result = resolveEscalation(selectedEscalation.id, 'cs_user', resolution);
    if (result.success) {
      toast({
        title: language === 'hi' ? 'हल किया गया' : 'Resolved',
        description: language === 'hi' ? 'एस्केलेशन हल किया गया' : 'Escalation resolved',
      });
      setSelectedEscalation(null);
      setResolution('');
      loadData();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; className?: string }> = {
      urgent: { variant: 'destructive' },
      high: { variant: 'destructive', className: 'bg-orange-500' },
      medium: { variant: 'secondary' },
      low: { variant: 'outline' },
    };
    const { variant, className } = config[priority] || config.medium;
    return (
      <Badge variant={variant} className={className}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: typeof Clock }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      completed: { variant: 'default', icon: CheckCircle },
      open: { variant: 'secondary', icon: AlertCircle },
      in_progress: { variant: 'outline', icon: Clock },
      resolved: { variant: 'default', icon: CheckCircle },
    };
    const { variant, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {t[status as keyof typeof t] || status}
      </Badge>
    );
  };

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  const pendingActions = actions.filter(a => a.status === 'pending');
  const openEscalations = escalations.filter(e => e.status === 'open' || e.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t.pendingActions}</div>
              <div className="text-3xl font-bold text-primary">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t.approved}</div>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t.avgProcessingTime}</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.avgProcessingTime} {t.hours}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t.slaBreaches}</div>
              <div className={`text-3xl font-bold ${stats.slaBreaches > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.slaBreaches}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="w-4 h-4" />
            {t.pendingActions}
            <Badge variant="secondary" className="ml-1">{pendingActions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="escalations" className="gap-1">
            <AlertTriangle className="w-4 h-4" />
            {t.escalations}
            <Badge variant="secondary" className="ml-1">{openEscalations.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingActions.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noActions}</p>
            </Card>
          ) : (
            pendingActions.map(action => (
              <Card key={action.id} className={isOverdue(action.slaDeadline) ? 'border-red-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {actionLabels[action.type as keyof typeof actionLabels]}
                        </Badge>
                        {getPriorityBadge(action.priority)}
                        {isOverdue(action.slaDeadline) && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            SLA Breached
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{t.employer}:</span> {action.employerName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{t.student}:</span> {action.studentId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.slaDeadline}: {new Date(action.slaDeadline).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedAction(action)}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {t.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedAction(action);
                          setNotes('');
                        }}
                        className="gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        {t.reject}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="escalations" className="mt-4 space-y-4">
          {openEscalations.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noEscalations}</p>
            </Card>
          ) : (
            openEscalations.map(escalation => (
              <Card key={escalation.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(escalation.status)}
                        <Badge variant={escalation.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                          {escalation.urgency === 'urgent' ? t.urgent : t.normal}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">{escalation.employerName}</div>
                      <p className="text-sm text-muted-foreground">{escalation.reason}</p>
                      <div className="text-xs text-muted-foreground">
                        {t.createdAt}: {new Date(escalation.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedEscalation(escalation)}
                      className="gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {t.resolve}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        {selectedAction && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionLabels[selectedAction.type as keyof typeof actionLabels]}
              </DialogTitle>
              <DialogDescription>
                {t.employer}: {selectedAction.employerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.student}</p>
                  <p className="font-medium">{selectedAction.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.slaDeadline}</p>
                  <p className={`font-medium ${isOverdue(selectedAction.slaDeadline) ? 'text-red-600' : ''}`}>
                    {new Date(selectedAction.slaDeadline).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedAction.details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Details</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedAction.details, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t.addNotes}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedAction)}
                >
                  {t.reject}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedAction)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t.approve}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!selectedEscalation} onOpenChange={() => setSelectedEscalation(null)}>
        {selectedEscalation && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.escalations}</DialogTitle>
              <DialogDescription>
                {selectedEscalation.employerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issue</p>
                <p className="text-foreground">{selectedEscalation.reason}</p>
              </div>

              <div>
                <Label htmlFor="resolution">{t.resolution}</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  placeholder={t.addResolution}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEscalation(null)}>
                  Cancel
                </Button>
                <Button onClick={handleResolveEscalation}>
                  {t.resolve}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default CSActionsDashboard;
