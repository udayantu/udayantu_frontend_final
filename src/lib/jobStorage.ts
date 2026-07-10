/**
 * Job Posting & Pipeline Storage (localStorage)
 * Production: integrate with Supabase
 */

import { JobPosting, PipelineStage, CandidateInPipeline, JobTemplate, DEFAULT_PIPELINE_STAGES } from "@/lib/jobPostingSchema";

const JOBS_KEY = "udayantu_jobs";
const PIPELINE_STAGES_KEY = "udayantu_pipeline_stages";
const CANDIDATES_PIPELINE_KEY = "udayantu_candidates_pipeline";
const JOB_TEMPLATES_KEY = "udayantu_job_templates";

// Jobs Management
export function saveJob(job: JobPosting): JobPosting {
  const jobs = getAllJobs();
  const newJob = {
    ...job,
    id: job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: job.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  
  // Create default pipeline stages
  createDefaultPipelineStages(newJob.id, newJob.companyId);
  
  return newJob;
}

export function getAllJobs(companyId?: string): JobPosting[] {
  try {
    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    if (companyId) {
      return jobs.filter((j: JobPosting) => j.companyId === companyId);
    }
    return jobs;
  } catch {
    return [];
  }
}

export function getJobById(id: string): JobPosting | null {
  const jobs = getAllJobs();
  return jobs.find(j => j.id === id) || null;
}

export function updateJob(id: string, updates: Partial<JobPosting>): JobPosting | null {
  const jobs = getAllJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) return null;
  
  const updated = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  jobs[index] = updated;
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return updated;
}

export function deleteJob(id: string): boolean {
  const jobs = getAllJobs();
  const filtered = jobs.filter(j => j.id !== id);
  localStorage.setItem(JOBS_KEY, JSON.stringify(filtered));
  
  // Clean up related data
  deletePipelineStagesByJobId(id);
  deleteCandidatesByJobId(id);
  
  return jobs.length !== filtered.length;
}

// Pipeline Stages Management
export function createDefaultPipelineStages(jobId: string, companyId: string): void {
  const stages = DEFAULT_PIPELINE_STAGES.map((s, idx) => ({
    id: `stage_${jobId}_${idx}`,
    name: s.name,
    jobId,
    order: s.order,
    isDefault: true,
  }));
  
  const existing = getAllPipelineStages();
  existing.push(...stages);
  localStorage.setItem(PIPELINE_STAGES_KEY, JSON.stringify(existing));
}

export function getAllPipelineStages(jobId?: string): PipelineStage[] {
  try {
    const stages = JSON.parse(localStorage.getItem(PIPELINE_STAGES_KEY) || "[]");
    if (jobId) {
      return stages.filter((s: PipelineStage) => s.jobId === jobId).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order);
    }
    return stages;
  } catch {
    return [];
  }
}

export function addPipelineStage(jobId: string, name: string): PipelineStage {
  const stages = getAllPipelineStages(jobId);
  const newStage: PipelineStage = {
    id: `stage_${jobId}_${Date.now()}`,
    name,
    jobId,
    order: stages.length,
    isDefault: false,
  };
  
  const allStages = getAllPipelineStages();
  allStages.push(newStage);
  localStorage.setItem(PIPELINE_STAGES_KEY, JSON.stringify(allStages));
  
  return newStage;
}

export function deletePipelineStagesByJobId(jobId: string): void {
  const stages = getAllPipelineStages();
  const filtered = stages.filter(s => s.jobId !== jobId);
  localStorage.setItem(PIPELINE_STAGES_KEY, JSON.stringify(filtered));
}

// Candidates in Pipeline Management
export function moveCandidateToStage(candidateId: string, jobId: string, stageId: string, stageName: string): CandidateInPipeline | null {
  const candidates = getAllCandidatesInPipeline(jobId);
  const candidate = candidates.find(c => c.candidateId === candidateId);
  
  if (candidate) {
    candidate.stageId = stageId;
    candidate.stageName = stageName;
    candidate.movedAt = new Date().toISOString();
  } else {
    // This shouldn't happen in normal flow, but handle it
    console.warn("Candidate not found in pipeline");
    return null;
  }
  
  const allCandidates = getAllCandidatesInPipeline();
  const index = allCandidates.findIndex(c => c.id === candidate.id);
  if (index !== -1) {
    allCandidates[index] = candidate;
  }
  
  localStorage.setItem(CANDIDATES_PIPELINE_KEY, JSON.stringify(allCandidates));
  return candidate;
}

export function addCandidateToPipeline(jobId: string, candidate: Omit<CandidateInPipeline, "id" | "movedAt">): CandidateInPipeline {
  const stages = getAllPipelineStages(jobId);
  const firstStage = stages[0];
  
  const newCandidate: CandidateInPipeline = {
    ...candidate,
    id: `candidate_${jobId}_${Date.now()}`,
    stageId: firstStage?.id || "",
    stageName: firstStage?.name || "New",
    movedAt: new Date().toISOString(),
  };
  
  const candidates = getAllCandidatesInPipeline();
  candidates.push(newCandidate);
  localStorage.setItem(CANDIDATES_PIPELINE_KEY, JSON.stringify(candidates));
  
  return newCandidate;
}

export function getAllCandidatesInPipeline(jobId?: string): CandidateInPipeline[] {
  try {
    const candidates = JSON.parse(localStorage.getItem(CANDIDATES_PIPELINE_KEY) || "[]");
    if (jobId) {
      return candidates.filter((c: CandidateInPipeline) => c.jobId === jobId);
    }
    return candidates;
  } catch {
    return [];
  }
}

export function getCandidatesByStage(jobId: string, stageId: string): CandidateInPipeline[] {
  return getAllCandidatesInPipeline(jobId).filter(c => c.stageId === stageId);
}

export function updateCandidateNotes(candidateId: string, notes: string): CandidateInPipeline | null {
  const candidates = getAllCandidatesInPipeline();
  const candidate = candidates.find(c => c.id === candidateId);
  
  if (candidate) {
    candidate.notes = notes;
    const index = candidates.findIndex(c => c.id === candidateId);
    if (index !== -1) {
      candidates[index] = candidate;
    }
    localStorage.setItem(CANDIDATES_PIPELINE_KEY, JSON.stringify(candidates));
  }
  
  return candidate || null;
}

export function deleteCandidatesByJobId(jobId: string): void {
  const candidates = getAllCandidatesInPipeline();
  const filtered = candidates.filter(c => c.jobId !== jobId);
  localStorage.setItem(CANDIDATES_PIPELINE_KEY, JSON.stringify(filtered));
}

// Job Templates Management
export function saveJobTemplate(template: JobTemplate): JobTemplate {
  const templates = getAllJobTemplates();
  const newTemplate = {
    ...template,
    id: template.id || `template_${Date.now()}`,
    createdAt: template.createdAt || new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(JOB_TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function getAllJobTemplates(companyId?: string): JobTemplate[] {
  try {
    const templates = JSON.parse(localStorage.getItem(JOB_TEMPLATES_KEY) || "[]");
    if (companyId) {
      return templates.filter((t: JobTemplate) => t.companyId === companyId);
    }
    return templates;
  } catch {
    return [];
  }
}

export function getTemplateById(id: string): JobTemplate | null {
  const templates = getAllJobTemplates();
  return templates.find(t => t.id === id) || null;
}

export function deleteTemplate(id: string): boolean {
  const templates = getAllJobTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(JOB_TEMPLATES_KEY, JSON.stringify(filtered));
  return templates.length !== filtered.length;
}
