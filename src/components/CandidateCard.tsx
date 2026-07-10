import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Award,
  Volume2,
  Film,
  Gem,
} from "lucide-react";
import { getFitScoreColor, getFitScoreLabel } from "@/utils/fitScoringAlgorithm";
import { useToast } from "@/hooks/use-toast";
import { CandidateNotes } from "@/components/CandidateNotes";
import { getCandidateNotes } from "@/lib/candidateNotesApi";
import { saveSilverMedalist } from "@/lib/talentPoolApi";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { logAuditAction, getAdminConfig } from "@/lib/complianceApi";

export interface CandidateData {
  id: string;
  studentId: string;
  degree: string;
  city: string;
  language: string[];
  tools: string[];
  attendance: number;
  mentorNotes: string;
  fitScore: number;
  skills: string[];
  certificates: {
    name: string;
    issuer: string;
    date: string;
    image?: string;
  }[];
  evidence: {
    skillClips?: string[];
    voiceSamples?: string[];
  };
}

interface CandidateCardProps {
  candidate: CandidateData;
  onAction: (
    studentId: string,
    action: "shortlist" | "schedule" | "reject",
    reason?: string
  ) => Promise<void>;
}

export const CandidateCard = ({
  candidate,
  onAction,
}: CandidateCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: "shortlist" | "schedule" | "reject" | null;
    reason: string;
  }>({ type: null, reason: "" });
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const { toast } = useToast();
  const { session } = useEmployerAuth();
  const candidateNotes = getCandidateNotes(candidate.id);
  const decisionTags = candidateNotes.flatMap(n => n.tags);

  const handleAction = async () => {
    if (!actionModal.type) return;

    setIsLoading(true);
    try {
      await onAction(candidate.studentId, actionModal.type, actionModal.reason);
      
      // If rejecting, show option to save as Silver Medalist
      if (actionModal.type === "reject" && candidate.fitScore >= 60) {
        setShowSavePrompt(true);
      }
      
      toast({
        title: "Success",
        description: `Candidate ${actionModal.type}ed successfully. UdaYantu admin will contact the student.`,
      });
      setActionModal({ type: null, reason: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsSilverMedalist = () => {
    if (session?.id) {
      saveSilverMedalist(candidate, actionModal.reason, session.id);
      toast({
        title: "Success",
        description: "Candidate added to Silver Medalists talent pool",
      });
      setShowSavePrompt(false);
    }
  };

  const fitScoreColor = getFitScoreColor(candidate.fitScore);
  const fitScoreLabel = getFitScoreLabel(candidate.fitScore);

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        {/* Header with Fit Score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">
              {candidate.degree}
            </h3>
            <p className="text-sm text-muted-foreground">{candidate.city}</p>
          </div>
          <div className="text-right">
            <div
              className={`${fitScoreColor} text-white rounded-lg px-3 py-2 text-center`}
            >
              <div className="text-xl font-bold">{candidate.fitScore}%</div>
              <div className="text-xs">{fitScoreLabel}</div>
            </div>
          </div>
        </div>

        {/* Decision Tags from Notes */}
        {decisionTags.length > 0 && (
          <div className="mb-3 pb-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">Team Decision</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Map(decisionTags.map(t => [t.id, t])).values()).map((tag) => (
                <Badge
                  key={tag.id}
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color === "green" ? "#dcfce7" : 
                                   tag.color === "red" ? "#fee2e2" :
                                   tag.color === "yellow" ? "#fef3c7" :
                                   tag.color === "blue" ? "#dbeafe" : "#ede9fe",
                    color: tag.color === "green" ? "#166534" :
                         tag.color === "red" ? "#991b1b" :
                         tag.color === "yellow" ? "#92400e" :
                         tag.color === "blue" ? "#1e40af" : "#6d28d9",
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Tools */}
        <div className="mb-4 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Tools</p>
            <div className="flex flex-wrap gap-1">
              {candidate.tools.slice(0, 3).map((tool) => (
                <Badge key={tool} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {candidate.tools.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.tools.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Language & Attendance */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Language</p>
            <p className="font-medium">{candidate.language.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="font-medium">{candidate.attendance}%</p>
          </div>
        </div>

        {/* Mentor Notes */}
        {candidate.mentorNotes && (
          <div className="mb-4 p-2 bg-muted rounded text-sm">
            <p className="text-xs text-muted-foreground mb-1">Mentor Notes</p>
            <p className="text-foreground">{candidate.mentorNotes}</p>
          </div>
        )}

        {/* Evidence */}
        <div className="mb-4 flex gap-2">
          {(candidate.evidence.skillClips?.length ?? 0) > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted"
              data-testid="button-view-skill-clips"
            >
              <Film className="w-3 h-3" />
              Clips ({candidate.evidence.skillClips?.length})
            </button>
          )}
          {(candidate.evidence.voiceSamples?.length ?? 0) > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted"
              data-testid="button-view-voice-samples"
            >
              <Volume2 className="w-3 h-3" />
              Samples ({candidate.evidence.voiceSamples?.length})
            </button>
          )}
          {candidate.certificates.length > 0 && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted">
              <Award className="w-3 h-3" />
              Certs ({candidate.certificates.length})
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() =>
              setActionModal({ type: "shortlist", reason: "" })
            }
            disabled={isLoading}
            data-testid="button-shortlist-candidate"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Shortlist
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setActionModal({ type: "schedule", reason: "" })
            }
            disabled={isLoading}
            data-testid="button-schedule-candidate"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              setActionModal({ type: "reject", reason: "" })
            }
            disabled={isLoading}
            data-testid="button-reject-candidate"
          >
            <XCircle className="w-4 h-4" />
          </Button>
          <CandidateNotes 
            candidateId={candidate.id}
            candidateName={candidate.degree}
          />
        </div>
      </Card>

      {/* Save as Silver Medalist Dialog */}
      <Dialog open={showSavePrompt} onOpenChange={setShowSavePrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-secondary" />
              Save as Silver Medalist?
            </DialogTitle>
            <DialogDescription>
              This candidate has a strong fit score ({candidate.fitScore}%) and shows promise. Would you like to add them to your talent pool for future roles?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={handleSaveAsSilverMedalist}
              className="w-full bg-secondary hover:bg-secondary/90"
              data-testid="button-save-silver"
            >
              <Gem className="w-4 h-4 mr-2" />
              Save to Talent Pool
            </Button>
            <Button
              onClick={() => setShowSavePrompt(false)}
              variant="outline"
              className="w-full"
            >
              Skip
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={!!actionModal.type} onOpenChange={() => setActionModal({ type: null, reason: "" })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === "shortlist" && "Shortlist Candidate"}
              {actionModal.type === "schedule" && "Schedule Interview"}
              {actionModal.type === "reject" && "Reject Candidate"}
            </DialogTitle>
            <DialogDescription>
              {actionModal.type === "shortlist" &&
                "This candidate will be added to your shortlist. UdaYantu admin will notify the student."}
              {actionModal.type === "schedule" &&
                "UdaYantu admin will contact the student to schedule an interview."}
              {actionModal.type === "reject" &&
                "Please provide a reason for rejection (optional). UdaYantu admin will notify the student."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(actionModal.type === "reject" || actionModal.type === "schedule") && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  {actionModal.type === "reject" ? "Rejection Reason" : "Interview Notes"}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={
                    actionModal.type === "reject"
                      ? "Why are you rejecting this candidate?"
                      : "Any notes for the interview?"
                  }
                  value={actionModal.reason}
                  onChange={(e) =>
                    setActionModal({ ...actionModal, reason: e.target.value })
                  }
                  className="min-h-24"
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Note: Student contact details are not visible to you. UdaYantu
              admin will handle all direct communication.
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setActionModal({ type: null, reason: "" })
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={isLoading}
                data-testid="button-confirm-action"
              >
                {isLoading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
