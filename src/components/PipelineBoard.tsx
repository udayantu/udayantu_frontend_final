import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PipelineStage, CandidateInPipeline } from "@/lib/jobPostingSchema";
import { getAllPipelineStages, getCandidatesByStage, moveCandidateToStage, updateCandidateNotes, addPipelineStage } from "@/lib/jobStorage";
import { Plus, GripHorizontal, FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useEmployerAuth } from "@/hooks/useEmployerAuth";

interface PipelineBoardProps {
  jobId: string;
}

export const PipelineBoard = ({ jobId }: PipelineBoardProps) => {
  const { checkPermission } = useEmployerAuth();
  const canManageCandidates = checkPermission("manage_candidates");
  const isViewOnly = !canManageCandidates;
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [stageCandidates, setStageCandidates] = useState<Record<string, CandidateInPipeline[]>>({});
  const [draggedCandidate, setDraggedCandidate] = useState<CandidateInPipeline | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateInPipeline | null>(null);
  const [notes, setNotes] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);

  useEffect(() => {
    const pipelineStages = getAllPipelineStages(jobId);
    setStages(pipelineStages);

    const candidates: Record<string, CandidateInPipeline[]> = {};
    pipelineStages.forEach((stage) => {
      candidates[stage.id] = getCandidatesByStage(jobId, stage.id);
    });
    setStageCandidates(candidates);
  }, [jobId]);

  const handleDragStart = (candidate: CandidateInPipeline) => {
    if (isViewOnly) return; // Prevent drag if no permission
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isViewOnly) return; // Prevent drop if no permission
    e.preventDefault();
  };

  const handleDrop = (stageId: string, stageName: string) => {
    if (!draggedCandidate || isViewOnly) return; // Prevent drop if no permission

    moveCandidateToStage(draggedCandidate.candidateId, jobId, stageId, stageName);

    setStageCandidates((prev) => {
      const updated = { ...prev };
      // Remove from old stage
      updated[draggedCandidate.stageId] = updated[draggedCandidate.stageId]?.filter(
        (c) => c.candidateId !== draggedCandidate.candidateId
      );
      // Add to new stage
      if (!updated[stageId]) updated[stageId] = [];
      updated[stageId].push({ ...draggedCandidate, stageId, stageName, movedAt: new Date().toISOString() });

      return updated;
    });

    setDraggedCandidate(null);
  };

  const handleSelectCandidate = (candidate: CandidateInPipeline) => {
    setSelectedCandidate(candidate);
    setNotes(candidate.notes || "");
  };

  const handleSaveNotes = () => {
    if (selectedCandidate) {
      updateCandidateNotes(selectedCandidate.id!, notes);
      setSelectedCandidate({ ...selectedCandidate, notes });
    }
  };

  const handleAddStage = () => {
    if (newStageName.trim()) {
      addPipelineStage(jobId, newStageName);
      const newStage: PipelineStage = {
        id: `stage_${jobId}_${Date.now()}`,
        name: newStageName,
        jobId,
        order: stages.length,
        isDefault: false,
      };
      setStages([...stages, newStage]);
      setStageCandidates({ ...stageCandidates, [newStage.id]: [] });
      setNewStageName("");
      setIsAddingStage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 bg-muted/30 rounded-lg border border-border p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id, stage.name)}
              data-testid={`stage-${stage.name.toLowerCase().replace(" ", "-")}`}
            >
              {/* Stage Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">{stage.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stageCandidates[stage.id]?.length || 0}
                  </Badge>
                </div>
                <div className="h-1 bg-gradient-to-r from-secondary to-accent rounded-full" />
              </div>

              {/* Candidates */}
              <div className="space-y-3">
                {stageCandidates[stage.id]?.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable={!isViewOnly}
                    onDragStart={() => handleDragStart(candidate)}
                    onClick={() => handleSelectCandidate(candidate)}
                    className={`p-4 bg-card rounded-lg border border-border ${
                      isViewOnly ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                    } hover:shadow-md transition-shadow`}
                    data-testid={`candidate-${candidate.candidateId}`}
                  >
                    <div className="flex gap-3">
                      <GripHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{candidate.candidateName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{candidate.candidateEmail}</p>
                        {candidate.rating && (
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  i <= candidate.rating ? "bg-secondary" : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(candidate.movedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Stage Button - Admin/Recruiter Only */}
          {!isAddingStage && canManageCandidates ? (
            <button
              onClick={() => setIsAddingStage(true)}
              className="flex-shrink-0 w-80 h-20 flex items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-secondary transition-colors"
              data-testid="button-add-stage"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
          ) : isAddingStage ? (
            <div className="flex-shrink-0 w-80 bg-muted/30 rounded-lg border border-border p-4">
              <Input
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddStage()}
                placeholder="Stage name"
                className="mb-2"
                autoFocus
                data-testid="input-new-stage"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddStage} className="flex-1" data-testid="button-confirm-stage">
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingStage(false);
                    setNewStageName("");
                  }}
                  data-testid="button-cancel-stage"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Candidate Details Sidebar */}
      {selectedCandidate && (
        <Card className="p-6 border bg-muted/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedCandidate.candidateName}</h3>
              <p className="text-sm text-muted-foreground">{selectedCandidate.candidateEmail}</p>
              {isViewOnly && <p className="text-xs text-secondary mt-2">🔍 View-only (Interviewer)</p>}
            </div>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-close-details"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                {isViewOnly ? "Interview Feedback" : "Notes"}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isViewOnly ? "Add your interview feedback..." : "Add notes, feedback, etc."}
                className="min-h-[120px] border-border"
                data-testid="textarea-candidate-notes"
                disabled={isViewOnly}
              />
            </div>

            {!isViewOnly && (
              <Button
                onClick={handleSaveNotes}
                className="bg-secondary hover:bg-secondary/90 w-full"
                data-testid="button-save-notes"
              >
                Save Notes
              </Button>
            )}
            {isViewOnly && (
              <Button
                onClick={handleSaveNotes}
                variant="outline"
                className="w-full"
                data-testid="button-save-feedback"
              >
                Submit Feedback
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
