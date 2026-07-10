import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Briefcase,
  FileText,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { getPackets, getPacketStats, sendPacket } from '@/lib/packetService';
import { getNotificationHistory, getBlockedAttempts } from '@/lib/notificationRouter';
import type { HandoffPacket, NotificationLog } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';

interface PacketsDashboardProps {
  userRole: 'admin' | 'ss' | 'cs' | 'content';
  language?: 'en' | 'hi';
  liteMode?: boolean;
}

const translations = {
  en: {
    title: 'Handoff Packets',
    subtitle: 'Manage candidate, interview, and assessment packets',
    candidateReady: 'Candidate Ready',
    interviewOutcome: 'Interview Outcome',
    assessmentResult: 'Assessment Result',
    blockedAttempts: 'Blocked Attempts',
    all: 'All',
    draft: 'Draft',
    pending: 'Pending',
    sent: 'Sent',
    received: 'Received',
    send: 'Send',
    view: 'View',
    noPackets: 'No packets found',
    stats: 'Statistics',
    total: 'Total Packets',
    pendingAction: 'Pending Action',
    refresh: 'Refresh',
    readiness: 'Readiness',
    attendance: 'Attendance',
    score: 'Score',
    result: 'Result',
    blocked: 'Blocked',
    reason: 'Reason',
    directContactWarning: 'Direct student↔employer contact is blocked',
  },
  hi: {
    title: 'हैंडऑफ पैकेट',
    subtitle: 'कैंडिडेट, इंटरव्यू और असेसमेंट पैकेट मैनेज करें',
    candidateReady: 'कैंडिडेट तैयार',
    interviewOutcome: 'इंटरव्यू परिणाम',
    assessmentResult: 'असेसमेंट रिज़ल्ट',
    blockedAttempts: 'ब्लॉक किए गए प्रयास',
    all: 'सभी',
    draft: 'ड्राफ्ट',
    pending: 'पेंडिंग',
    sent: 'भेजा गया',
    received: 'प्राप्त',
    send: 'भेजें',
    view: 'देखें',
    noPackets: 'कोई पैकेट नहीं मिला',
    stats: 'आंकड़े',
    total: 'कुल पैकेट',
    pendingAction: 'कार्रवाई बाकी',
    refresh: 'रिफ्रेश',
    readiness: 'तैयारी',
    attendance: 'हाज़िरी',
    score: 'स्कोर',
    result: 'परिणाम',
    blocked: 'ब्लॉक',
    reason: 'कारण',
    directContactWarning: 'सीधा स्टूडेंट↔एम्प्लॉयर संपर्क ब्लॉक है',
  },
};

export function PacketsDashboard({ userRole, language = 'hi', liteMode = false }: PacketsDashboardProps) {
  const t = translations[language];
  const [packets, setPackets] = useState<HandoffPacket[]>([]);
  const [blockedLogs, setBlockedLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getPacketStats> | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      const allPackets = userRole === 'admin' 
        ? getPackets({ limit: 100 })
        : getPackets({ viewerRole: userRole, limit: 100 });
      setPackets(allPackets);
      setStats(getPacketStats());
      setBlockedLogs(getBlockedAttempts());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  const handleSendPacket = async (packet: HandoffPacket) => {
    const result = await sendPacket(packet.id, packet.createdByRole, language);
    if (result.success) {
      toast({
        title: language === 'hi' ? 'पैकेट भेजा गया' : 'Packet Sent',
        description: language === 'hi' ? 'सफलतापूर्वक भेजा गया' : 'Successfully sent',
      });
      loadData();
    } else {
      toast({
        title: language === 'hi' ? 'भेजने में विफल' : 'Send Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Clock }> = {
      draft: { variant: 'secondary', icon: FileText },
      pending_review: { variant: 'outline', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle2 },
      sent: { variant: 'default', icon: Send },
      received: { variant: 'default', icon: CheckCircle2 },
      actioned: { variant: 'default', icon: CheckCircle2 },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPacketIcon = (type: string) => {
    switch (type) {
      case 'candidate_ready':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'interview_outcome':
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case 'assessment_result':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredPackets = activeTab === 'all' 
    ? packets 
    : packets.filter(p => p.type === activeTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{t.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">{t.pendingAction}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.byType.candidate_ready || 0}</div>
              <p className="text-xs text-muted-foreground">{t.candidateReady}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{blockedLogs.length}</div>
              <p className="text-xs text-muted-foreground">{t.blockedAttempts}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {blockedLogs.length > 0 && userRole === 'admin' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t.blockedAttempts}
            </CardTitle>
            <CardDescription className="text-red-600 text-xs">
              {t.directContactWarning}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {blockedLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs py-1 border-b last:border-0">
                  <span className="font-medium">{log.senderRole}→{log.recipientRole}</span>
                  <span className="text-muted-foreground ml-2">{log.blockedReason}</span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={liteMode ? 'flex flex-wrap' : ''}>
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="candidate_ready">{t.candidateReady}</TabsTrigger>
          <TabsTrigger value="interview_outcome">{t.interviewOutcome}</TabsTrigger>
          <TabsTrigger value="assessment_result">{t.assessmentResult}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[400px]">
            {filteredPackets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.noPackets}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPackets.map((packet) => (
                  <Card key={packet.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getPacketIcon(packet.type)}
                          <div>
                            <div className="font-medium">{packet.studentName}</div>
                            <div className="text-xs text-muted-foreground">
                              {packet.type === 'candidate_ready' && (
                                <>
                                  {t.readiness}: {(packet as any).readinessScore}% | 
                                  {t.attendance}: {(packet as any).attendance?.percentage}%
                                </>
                              )}
                              {packet.type === 'interview_outcome' && (
                                <>
                                  {(packet as any).employerName} | 
                                  {t.result}: {(packet as any).nextSteps?.action}
                                </>
                              )}
                              {packet.type === 'assessment_result' && (
                                <>
                                  {(packet as any).assessmentName} | 
                                  {t.score}: {(packet as any).overallScore}%
                                </>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(packet.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(packet.status)}
                          {packet.status === 'draft' && packet.createdByRole === userRole && (
                            <Button size="sm" onClick={() => handleSendPacket(packet)}>
                              <Send className="h-3 w-3 mr-1" />
                              {t.send}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
