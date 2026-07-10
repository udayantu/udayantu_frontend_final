import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Gem, Globe, TrendingUp, Users } from "lucide-react";
import {
  getSilverMedalists,
  tagSilverMedalist,
  reactivateMedalist,
  markAsHired,
  removeFromTalentPool,
  exportTalentPoolToCSV,
  type SilverMedalist,
} from "@/lib/talentPoolApi";
import { requestCSAction, escalateToCS } from "@/lib/csMediationService";
import { AlertTriangle, Phone } from "lucide-react";

const TalentPool = () => {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  const [medalists, setMedalists] = useState<SilverMedalist[]>([]);
  const [filteredMedalists, setFilteredMedalists] = useState<SilverMedalist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedMedalist, setSelectedMedalist] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  useEffect(() => {
    if (!session) {
      navigate("/employer-login");
      return;
    }
    loadMedalists();
  }, [session, navigate]);

  useEffect(() => {
    const filtered = medalists.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMedalists(filtered);
  }, [searchTerm, medalists]);

  const loadMedalists = () => {
    if (session?.id) {
      const data = getSilverMedalists(session.id);
      setMedalists(data);
      setFilteredMedalists(data);
    }
  };

  const handleAddTag = (medalistId: string) => {
    if (!tagInput.trim()) {
      toast({ title: "Error", description: "Please enter a tag", variant: "destructive" });
      return;
    }

    tagSilverMedalist(medalistId, [tagInput]);
    toast({ title: "Success", description: "Tag added" });
    setTagInput("");
    loadMedalists();
  };

  const handleReactivate = (medalistId: string) => {
    if (!session) return;
    const result = requestCSAction(
      'reactivate_candidate',
      session.id,
      session.companyName,
      medalistId,
      { requestedBy: session.companyName },
      'medium'
    );
    if (result.success) {
      toast({ 
        title: "Request Sent", 
        description: "Customer Success will reactivate this candidate into your pipeline" 
      });
    }
  };

  const handleMarkHired = (medalistId: string) => {
    if (!session) return;
    const result = requestCSAction(
      'send_offer',
      session.id,
      session.companyName,
      medalistId,
      { action: 'mark_hired', requestedBy: session.companyName },
      'medium'
    );
    if (result.success) {
      toast({ 
        title: "Request Sent", 
        description: "Customer Success will process and confirm the hire" 
      });
    }
  };

  const handleRemove = (medalistId: string) => {
    if (confirm("Remove from talent pool?")) {
      removeFromTalentPool(medalistId);
      toast({ title: "Success", description: "Removed from talent pool" });
      loadMedalists();
    }
  };

  const handleExport = () => {
    try {
      const csv = exportTalentPoolToCSV(filteredMedalists);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `silver-medalists-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Talent pool exported" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Export failed", variant: "destructive" });
    }
  };

  const stats = {
    total: medalists.length,
    active: medalists.filter(m => m.status === "active").length,
    reactivated: medalists.filter(m => m.status === "reactivated").length,
    hired: medalists.filter(m => m.status === "hired").length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/employer-dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Gem className="w-6 h-6 text-secondary" />
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Talent Pool</h1>
              </div>
              <p className="text-muted-foreground">Manage Silver Medalists & promising candidates</p>
            </div>
            {filteredMedalists.length > 0 && (
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid="button-export-pool"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>

          {/* Language Toggle */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              <Globe className="w-4 h-4 mr-1" />
              EN
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('hi')}
            >
              हिंदी
            </Button>
          </div>

          {/* CS Mediation Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3 mb-8">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {language === 'hi'
                  ? 'स्टूडेंट से सीधा संपर्क अनुमति नहीं है'
                  : 'Direct student contact is not permitted'}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {language === 'hi'
                  ? 'सभी रीएक्टिवेशन और फॉलो-अप Customer Success (CS) के माध्यम से मैनेज किए जाते हैं।'
                  : 'All reactivations and follow-ups are managed through Customer Success (CS).'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 border">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </Card>
            <Card className="p-4 border">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </Card>
            <Card className="p-4 border">
              <div className="text-sm text-muted-foreground">Reactivated</div>
              <div className="text-3xl font-bold text-blue-600">{stats.reactivated}</div>
            </Card>
            <Card className="p-4 border">
              <div className="text-sm text-muted-foreground">Hired</div>
              <div className="text-3xl font-bold text-orange-600">{stats.hired}</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6 border">
            <Input
              placeholder="Search by name, degree, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              data-testid="input-search-pool"
            />
          </Card>

          {/* Medalists Grid */}
          {filteredMedalists.length === 0 ? (
            <Card className="p-12 text-center border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold">No Silver Medalists yet</p>
              <p className="text-sm text-muted-foreground">Reject promising candidates to add them to your talent pool</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedalists.map((medalist) => (
                <Card key={medalist.id} className="p-4 border hover:shadow-lg transition-shadow" data-testid={`card-medalist-${medalist.id}`}>
                  <div className="space-y-3">
                    {/* Header */}
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{medalist.name}</h3>
                      <p className="text-sm text-muted-foreground">{medalist.city}</p>
                      <Badge
                        variant="secondary"
                        className={`mt-2 ${
                          medalist.status === "hired"
                            ? "bg-green-100 text-green-800"
                            : medalist.status === "reactivated"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {medalist.status}
                      </Badge>
                    </div>

                    {/* Fit Score */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Fit Score: {medalist.fitScore}%</span>
                    </div>

                    {/* Skills */}
                    {medalist.skills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {medalist.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {medalist.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{medalist.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {medalist.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {medalist.tags.map((tag) => (
                            <Badge key={tag} className="bg-primary/10 text-primary text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    <div>
                      <p className="text-xs text-muted-foreground">Rejection Reason</p>
                      <p className="text-sm text-foreground">{medalist.rejectionReason || "Not specified"}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                      {selectedMedalist === medalist.id && (
                        <div className="flex gap-1">
                          <Input
                            placeholder="Add tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            size={10}
                            className="text-xs"
                            data-testid={`input-tag-${medalist.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddTag(medalist.id)}
                            className="text-xs"
                            data-testid={`button-tag-${medalist.id}`}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedMedalist === medalist.id ? "default" : "outline"}
                          className="flex-1 text-xs"
                          onClick={() => setSelectedMedalist(selectedMedalist === medalist.id ? null : medalist.id)}
                          data-testid={`button-edit-tags-${medalist.id}`}
                        >
                          Tags
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReactivate(medalist.id)}
                          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                          disabled={medalist.status === "hired"}
                          data-testid={`button-reactivate-${medalist.id}`}
                        >
                          Reactivate
                        </Button>
                        {medalist.status === "reactivated" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkHired(medalist.id)}
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                            data-testid={`button-hired-${medalist.id}`}
                          >
                            Hired
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemove(medalist.id)}
                          className="text-xs"
                          data-testid={`button-remove-${medalist.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TalentPool;
