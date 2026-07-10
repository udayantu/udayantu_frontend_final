import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CandidateCard } from "@/components/CandidateCard";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Filter, Download, FileJson } from "lucide-react";
import {
  getCandidates,
  submitCandidateAction,
} from "@/lib/candidatesApi";
import {
  getCandidateNotes,
  exportCandidatesToCSV,
  exportCandidatesToATS,
} from "@/lib/candidateNotesApi";

interface Candidate {
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
  certificates: any[];
  evidence: {
    skillClips?: string[];
    voiceSamples?: string[];
  };
}

export default function CandidatesPage() {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fitScoreFilter, setFitScoreFilter] = useState(0);

  useEffect(() => {
    if (!session) {
      navigate("/employer-login");
    } else {
      loadCandidates();
    }
  }, [session, navigate]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateAction = async (
    studentId: string,
    action: "shortlist" | "schedule" | "reject",
    reason?: string
  ) => {
    try {
      await submitCandidateAction({
        studentId,
        action,
        reason,
        employerId: session?.id || "",
        recruiterEmail: session?.email || "",
        recruiterName: session?.companyName || "",
      });

      await loadCandidates();
    } catch (error: any) {
      throw new Error(error.message || "Failed to perform action");
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFitScore = candidate.fitScore >= fitScoreFilter;

    return matchesSearch && matchesFitScore;
  });

  const handleExportCSV = () => {
    try {
      const notesMap: Record<string, any> = {};
      candidates.forEach(candidate => {
        notesMap[candidate.id] = getCandidateNotes(candidate.id);
      });

      const csv = exportCandidatesToCSV(filteredCandidates, notesMap);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `candidates-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Candidates exported to CSV",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportATS = () => {
    try {
      const notesMap: Record<string, any> = {};
      candidates.forEach(candidate => {
        notesMap[candidate.id] = getCandidateNotes(candidate.id);
      });

      const atsJson = exportCandidatesToATS(filteredCandidates, notesMap);
      const blob = new Blob([atsJson], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `candidates-ats-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Candidates exported to ATS format",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export ATS",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Candidates
              </h1>
              <p className="text-lg text-muted-foreground">
                Review qualified candidates with fit scores
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isLoading || filteredCandidates.length === 0}
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportATS}
                disabled={isLoading || filteredCandidates.length === 0}
                data-testid="button-export-ats"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Export ATS
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Search by degree, city, or skill
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="B.A, Mumbai, Python..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Minimum Fit Score
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={fitScoreFilter}
                    onChange={(e) => setFitScoreFilter(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold w-12 text-right">
                    {fitScoreFilter}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Candidates Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <Card className="p-12 text-center">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">
                No candidates found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or fit score filter
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onAction={handleCandidateAction}
                />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {candidates.length}{" "}
              candidates
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
