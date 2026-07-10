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
  Play,
  TrendingUp,
  User,
  Users,
  Volume2,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import {
  getMediatedCandidates,
  updateCandidatePipelineStage,
  requestCSAction,
  escalateToCS,
  type MediatedCandidate,
} from '@/lib/csMediationService';

interface CandidatePipelineProps {
  employerId: string;
  employerName: string;
  language?: 'en' | 'hi';
  liteMode?: boolean;
}

const translations = {
  en: {
    title: 'Candidate Pipeline',
    subtitle: 'Manage candidates through hiring stages',
    new: 'New',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    offered: 'Offered',
    joined: 'Joined',
    rejected: 'Rejected',
    fitScore: 'Fit Score',
    skills: 'Skills',
    mentorSummary: 'Mentor Summary',
    evidence: 'Evidence',
    skillClip: 'Skill Clip',
    voiceSample: 'Voice Sample',
    scheduleInterview: 'Schedule Interview',
    sendOffer: 'Send Offer',
    markJoined: 'Mark as Joined',
    reject: 'Reject',
    shortlist: 'Shortlist',
    escalateToCS: 'Escalate to CS',
    readiness: 'Readiness',
    notReady: 'Not Ready',
    partiallyReady: 'Partially Ready',
    ready: 'Ready',
    highlyReady: 'Highly Ready',
    agingDays: 'days in stage',
    slaOnTrack: 'On Track',
    slaAtRisk: 'At Risk',
    slaBreached: 'SLA Breached',
    pendingApproval: 'Pending CS Approval',
    csWillSchedule: 'Customer Success will schedule the interview',
    csWillSendOffer: 'Customer Success will process and send the offer',
    noDirectContact: 'Direct contact with students is not permitted',
    actionQueued: 'Action queued for CS approval',
    escalationReason: 'Reason for escalation',
    submitEscalation: 'Submit Escalation',
    escalationSent: 'Escalation sent to Customer Success',
    noCandidates: 'No candidates in this stage',
    location: 'Location',
    degree: 'Degree',
    viewDetails: 'View Details',
  },
  hi: {
    title: 'कैंडिडेट पाइपलाइन',
    subtitle: 'हायरिंग स्टेज के माध्यम से कैंडिडेट मैनेज करें',
    new: 'नया',
    shortlisted: 'शॉर्टलिस्ट',
    interview: 'इंटरव्यू',
    offered: 'ऑफर',
    joined: 'शामिल',
    rejected: 'अस्वीकृत',
    fitScore: 'फिट स्कोर',
    skills: 'कौशल',
    mentorSummary: 'मेंटर सारांश',
    evidence: 'एविडेंस',
    skillClip: 'स्किल क्लिप',
    voiceSample: 'वॉयस सैंपल',
    scheduleInterview: 'इंटरव्यू शेड्यूल करें',
    sendOffer: 'ऑफर भेजें',
    markJoined: 'शामिल के रूप में मार्क करें',
    reject: 'अस्वीकार',
    shortlist: 'शॉर्टलिस्ट करें',
    escalateToCS: 'CS को एस्केलेट करें',
    readiness: 'तैयारी',
    notReady: 'तैयार नहीं',
    partiallyReady: 'आंशिक रूप से तैयार',
    ready: 'तैयार',
    highlyReady: 'बहुत तैयार',
    agingDays: 'दिन इस स्टेज में',
    slaOnTrack: 'सही चल रहा है',
    slaAtRisk: 'जोखिम में',
    slaBreached: 'SLA पार',
    pendingApproval: 'CS अनुमोदन बाकी',
    csWillSchedule: 'Customer Success इंटरव्यू शेड्यूल करेगी',
    csWillSendOffer: 'Customer Success ऑफर प्रोसेस और भेजेगी',
    noDirectContact: 'स्टूडेंट से सीधा संपर्क अनुमति नहीं है',
    actionQueued: 'CS अनुमोदन के लिए कतार में',
    escalationReason: 'एस्केलेशन का कारण',
    submitEscalation: 'एस्केलेशन जमा करें',
    escalationSent: 'Customer Success को एस्केलेशन भेजा गया',
    noCandidates: 'इस स्टेज में कोई कैंडिडेट नहीं',
    location: 'स्थान',
    degree: 'डिग्री',
    viewDetails: 'विवरण देखें',
  },
};

const stageOrder: MediatedCandidate['pipelineStage'][] = [
  'new',
  'shortlisted',
  'interview',
  'offered',
  'joined',
];

export function CandidatePipeline({
  employerId,
  employerName,
  language = 'hi',
  liteMode = false,
}: CandidatePipelineProps) {
  const t = translations[language];
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<MediatedCandidate[]>([]);
  const [activeStage, setActiveStage] = useState<string>('new');
  const [selectedCandidate, setSelectedCandidate] = useState<MediatedCandidate | null>(null);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const data = getMediatedCandidates(employerId);
    setCandidates(data);
  }, [employerId]);

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(c => c.pipelineStage === stage);
  };

  const getStageCounts = () => {
    const counts: Record<string, number> = {};
    stageOrder.forEach(stage => {
      counts[stage] = candidates.filter(c => c.pipelineStage === stage).length;
    });
    return counts;
  };

  const handleStageChange = (candidateId: string, newStage: MediatedCandidate['pipelineStage']) => {
    const result = updateCandidatePipelineStage(employerId, candidateId, newStage);

    if (result.requiresCSAction) {
      setPendingActions(prev => new Set([...prev, candidateId]));
      toast({
        title: language === 'hi' ? 'अनुरोध भेजा गया' : 'Request Sent',
        description: t.actionQueued,
      });
    } else {
      setCandidates(prev =>
        prev.map(c =>
          c.id === candidateId
            ? { ...c, pipelineStage: newStage, stageUpdatedAt: new Date().toISOString(), agingDays: 0 }
            : c
        )
      );
      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'स्टेज अपडेट किया गया' : 'Stage updated',
      });
    }
  };

  const handleRequestInterview = (candidateId: string) => {
    const result = requestCSAction(
      'schedule_interview',
      employerId,
      employerName,
      candidateId,
      { requestedBy: employerName },
      'medium'
    );

    if (result.success) {
      setPendingActions(prev => new Set([...prev, candidateId]));
      toast({
        title: language === 'hi' ? 'अनुरोध भेजा गया' : 'Request Sent',
        description: t.csWillSchedule,
      });
    }
  };

  const handleRequestOffer = (candidateId: string) => {
    const result = requestCSAction(
      'send_offer',
      employerId,
      employerName,
      candidateId,
      { requestedBy: employerName },
      'medium'
    );

    if (result.success) {
      setPendingActions(prev => new Set([...prev, candidateId]));
      toast({
        title: language === 'hi' ? 'अनुरोध भेजा गया' : 'Request Sent',
        description: t.csWillSendOffer,
      });
    }
  };

  const handleEscalate = () => {
    if (!escalationReason.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया कारण दर्ज करें' : 'Please enter a reason',
        variant: 'destructive',
      });
      return;
    }

    const result = escalateToCS(employerId, employerName, escalationReason, 'normal');

    if (result.success) {
      toast({
        title: language === 'hi' ? 'भेजा गया' : 'Sent',
        description: t.escalationSent,
      });
      setShowEscalationDialog(false);
      setEscalationReason('');
    }
  };

  const getReadinessBadge = (level: MediatedCandidate['readinessLevel']) => {
    const config = {
      not_ready: { label: t.notReady, variant: 'destructive' as const, icon: AlertCircle },
      partially_ready: { label: t.partiallyReady, variant: 'secondary' as const, icon: Clock },
      ready: { label: t.ready, variant: 'default' as const, icon: CheckCircle },
      highly_ready: { label: t.highlyReady, variant: 'default' as const, icon: TrendingUp },
    };
    const { label, variant, icon: Icon } = config[level];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getSLABadge = (status: MediatedCandidate['slaStatus'], agingDays: number) => {
    const config = {
      on_track: { label: t.slaOnTrack, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
      at_risk: { label: t.slaAtRisk, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
      breached: { label: t.slaBreached, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    };
    const { label, className } = config[status];
    return (
      <Badge className={className}>
        {agingDays} {t.agingDays} • {label}
      </Badge>
    );
  };

  const stageCounts = getStageCounts();

  const renderCandidateCard = (candidate: MediatedCandidate) => {
    const isPending = pendingActions.has(candidate.id);

    return (
      <Card key={candidate.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">{candidate.displayName}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {candidate.city} • {candidate.degree}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <TrendingUp className="w-4 h-4" />
                {candidate.fitScore}%
              </div>
              {getReadinessBadge(candidate.readinessLevel)}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 3}
              </Badge>
            )}
          </div>

          {!liteMode && (
            <div className="bg-muted/50 rounded p-2 text-sm">
              <p className="text-muted-foreground text-xs mb-1">{t.mentorSummary}</p>
              <p className="text-foreground line-clamp-2">{candidate.mentorSummary}</p>
            </div>
          )}

          {!liteMode && (candidate.evidenceLinks.skillClip || candidate.evidenceLinks.voiceSample) && (
            <div className="flex gap-2">
              {candidate.evidenceLinks.skillClip && (
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Play className="w-3 h-3" />
                  {t.skillClip}
                </Button>
              )}
              {candidate.evidenceLinks.voiceSample && (
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Volume2 className="w-3 h-3" />
                  {t.voiceSample}
                </Button>
              )}
            </div>
          )}

          <div className="pt-2 border-t">
            {getSLABadge(candidate.slaStatus, candidate.agingDays)}
          </div>

          {isPending ? (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
              <Clock className="w-4 h-4" />
              {t.pendingApproval}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {candidate.pipelineStage === 'new' && (
                <Button
                  size="sm"
                  onClick={() => handleStageChange(candidate.id, 'shortlisted')}
                  className="gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  {t.shortlist}
                </Button>
              )}
              {candidate.pipelineStage === 'shortlisted' && (
                <Button
                  size="sm"
                  onClick={() => handleRequestInterview(candidate.id)}
                  className="gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  {t.scheduleInterview}
                </Button>
              )}
              {candidate.pipelineStage === 'interview' && (
                <Button
                  size="sm"
                  onClick={() => handleRequestOffer(candidate.id)}
                  className="gap-1"
                >
                  <FileText className="w-3 h-3" />
                  {t.sendOffer}
                </Button>
              )}
              {candidate.pipelineStage === 'offered' && (
                <Button
                  size="sm"
                  onClick={() => handleStageChange(candidate.id, 'joined')}
                  className="gap-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-3 h-3" />
                  {t.markJoined}
                </Button>
              )}
              {candidate.pipelineStage !== 'joined' && candidate.pipelineStage !== 'rejected' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStageChange(candidate.id, 'rejected')}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  {t.reject}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCandidate(candidate)}
                className="gap-1"
              >
                {t.viewDetails}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => setShowEscalationDialog(true)}
          variant="outline"
          className="gap-2"
        >
          <Phone className="w-4 h-4" />
          {t.escalateToCS}
        </Button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            {t.noDirectContact}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {language === 'hi'
              ? 'सभी इंटरव्यू शेड्यूलिंग और ऑफर Customer Success (CS) के माध्यम से होगी।'
              : 'All interview scheduling and offers will be handled through Customer Success (CS).'}
          </p>
        </div>
      </div>

      <Tabs value={activeStage} onValueChange={setActiveStage}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {stageOrder.map(stage => (
            <TabsTrigger key={stage} value={stage} className="gap-1">
              {t[stage as keyof typeof t] || stage}
              <Badge variant="secondary" className="ml-1 text-xs">
                {stageCounts[stage] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {stageOrder.map(stage => (
          <TabsContent key={stage} value={stage} className="mt-4">
            {getCandidatesByStage(stage).length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noCandidates}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCandidatesByStage(stage).map(renderCandidateCard)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showEscalationDialog} onOpenChange={setShowEscalationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.escalateToCS}</DialogTitle>
            <DialogDescription>
              {language === 'hi'
                ? 'Customer Success टीम को अपनी समस्या बताएं'
                : 'Describe your issue to the Customer Success team'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">{t.escalationReason}</Label>
              <Textarea
                id="reason"
                value={escalationReason}
                onChange={e => setEscalationReason(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'अपनी समस्या यहां लिखें...'
                    : 'Describe your issue here...'
                }
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEscalationDialog(false)}>
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button onClick={handleEscalate}>{t.submitEscalation}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        {selectedCandidate && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCandidate.displayName}</DialogTitle>
              <DialogDescription>
                {selectedCandidate.city} • {selectedCandidate.degree}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.fitScore}</p>
                  <p className="text-2xl font-bold text-primary">{selectedCandidate.fitScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.readiness}</p>
                  {getReadinessBadge(selectedCandidate.readinessLevel)}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{t.skills}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.map(skill => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{t.mentorSummary}</p>
                <p className="text-foreground bg-muted/50 p-3 rounded">
                  {selectedCandidate.mentorSummary}
                </p>
              </div>

              {(selectedCandidate.evidenceLinks.skillClip ||
                selectedCandidate.evidenceLinks.voiceSample) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t.evidence}</p>
                  <div className="flex gap-2">
                    {selectedCandidate.evidenceLinks.skillClip && (
                      <Button variant="outline" className="gap-2">
                        <Play className="w-4 h-4" />
                        {t.skillClip}
                      </Button>
                    )}
                    {selectedCandidate.evidenceLinks.voiceSample && (
                      <Button variant="outline" className="gap-2">
                        <Volume2 className="w-4 h-4" />
                        {t.voiceSample}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                {getSLABadge(selectedCandidate.slaStatus, selectedCandidate.agingDays)}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default CandidatePipeline;
