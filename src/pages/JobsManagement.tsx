import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobPostingForm } from "@/components/JobPostingForm";
import { PipelineBoard } from "@/components/PipelineBoard";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { getAllJobs, deleteJob, getAllJobTemplates, getTemplateById } from "@/lib/jobStorage";
import { useNavigate } from "react-router-dom";
import { Briefcase, Trash2, Copy, Plus } from "lucide-react";

const JobsManagement = () => {
  const navigate = useNavigate();
  const { session, checkPermission } = useEmployerAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState(getAllJobs(session?.id || ""));
  const [templates, setTemplates] = useState(getAllJobTemplates(session?.id || ""));
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!session) {
    navigate("/employer-login");
    return null;
  }

  // Role-based access check
  if (!checkPermission("view_jobs")) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
          <div className="max-w-md mx-auto text-center mt-20">
            <Card className="p-8 border">
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground mb-6">Your role (Interviewer) doesn't have access to job management.</p>
              <Button onClick={() => navigate("/employer-dashboard")} variant="outline">
                Back to Dashboard
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleJobCreated = () => {
    setShowForm(false);
    setSelectedTemplate(null);
    setJobs(getAllJobs(session.id));
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure? This will also delete all associated candidate records.")) {
      deleteJob(jobId);
      setJobs(getAllJobs(session.id));
      if (selectedJobId === jobId) setSelectedJobId(null);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowForm(true);
  };

  const currentJob = jobs.find(j => j.id === selectedJobId);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-2">Jobs & Pipeline</h1>
          <p className="text-muted-foreground mb-8">Manage job postings and candidate pipelines</p>

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className={`grid w-full ${checkPermission("manage_team") ? "grid-cols-3" : "grid-cols-2"} max-w-md`}>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              {checkPermission("manage_team") && <TabsTrigger value="templates">Templates</TabsTrigger>}
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Active Job Postings</h2>
                {checkPermission("manage_candidates") && (
                  <Button
                    onClick={() => {
                      setShowForm(true);
                      setSelectedTemplate(null);
                    }}
                    className="gap-2 bg-secondary hover:bg-secondary/90"
                    data-testid="button-new-job"
                  >
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </Button>
                )}
              </div>

              {showForm ? (
                <JobPostingForm
                  companyId={session.id}
                  onSuccess={handleJobCreated}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedTemplate(null);
                  }}
                  useTemplate={selectedTemplate}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.length === 0 ? (
                    <Card className="col-span-full p-8 text-center bg-muted/30">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                      <Button
                        onClick={() => setShowForm(true)}
                        variant="outline"
                        data-testid="button-start-posting"
                      >
                        Post Your First Job
                      </Button>
                    </Card>
                  ) : (
                    jobs.map((job) => (
                      <Card
                        key={job.id}
                        className="p-6 border hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedJobId(job.id)}
                        data-testid={`job-card-${job.id}`}
                      >
                        <h3 className="text-lg font-bold text-foreground mb-2">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{job.location}</p>

                        <div className="space-y-2 mb-4 text-xs">
                          <p>
                            <strong>Salary:</strong> ₹{(job.salaryBandMin / 100000).toFixed(1)}L - ₹
                            {(job.salaryBandMax / 100000).toFixed(1)}L
                          </p>
                          <p>
                            <strong>Type:</strong> {job.workType.replace("-", " ")}
                          </p>
                          <p>
                            <strong>Level:</strong> {job.languageLevel}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id!);
                            }}
                            data-testid={`button-delete-job-${job.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="space-y-6">
              {!selectedJobId ? (
                <Card className="p-8 text-center bg-muted/30">
                  <p className="text-muted-foreground mb-4">Select a job to view its candidate pipeline</p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {jobs.map((job) => (
                      <Button
                        key={job.id}
                        variant="outline"
                        onClick={() => setSelectedJobId(job.id)}
                        data-testid={`button-select-job-${job.id}`}
                      >
                        {job.title}
                      </Button>
                    ))}
                  </div>
                </Card>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">{currentJob?.title}</h2>
                    <Button variant="outline" onClick={() => setSelectedJobId(null)} data-testid="button-back-jobs">
                      ← Back to Jobs
                    </Button>
                  </div>
                  <PipelineBoard jobId={selectedJobId} />
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Job Templates</h2>

              {templates.length === 0 ? (
                <Card className="p-8 text-center bg-muted/30">
                  <p className="text-muted-foreground mb-4">No templates saved yet</p>
                  <p className="text-sm text-muted-foreground">Save a job posting as a template to reuse it quickly</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-6 border">
                      <h3 className="text-lg font-bold text-foreground mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.jobData.title}</p>

                      <Button
                        onClick={() => handleUseTemplate(template.id!)}
                        className="gap-2 bg-secondary hover:bg-secondary/90 w-full"
                        data-testid={`button-use-template-${template.id}`}
                      >
                        <Copy className="w-4 h-4" />
                        Use Template
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobsManagement;
