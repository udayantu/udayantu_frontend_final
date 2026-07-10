import { z } from "zod";

// Job Posting Schema
export const jobPostingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Job title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  tools: z.array(z.string()).min(1, "At least one tool is required"),
  languageLevel: z.enum(["beginner", "intermediate", "advanced"]),
  location: z.string().min(2, "Location is required"),
  salaryBandMin: z.number().min(0, "Minimum salary is required"),
  salaryBandMax: z.number().min(0, "Maximum salary is required"),
  workType: z.enum(["full-time", "part-time", "contract", "internship"]),
  description: z.string().optional(),
  companyId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type JobPosting = z.infer<typeof jobPostingSchema>;

// Pipeline Stage Schema
export const pipelineStageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Stage name is required"),
  jobId: z.string(),
  order: z.number().default(0),
  isDefault: z.boolean().default(false),
});

export type PipelineStage = z.infer<typeof pipelineStageSchema>;

// Candidate in Pipeline Schema
export const candidateInPipelineSchema = z.object({
  id: z.string().optional(),
  candidateId: z.string(),
  candidateName: z.string(),
  candidateEmail: z.string().email(),
  jobId: z.string(),
  stageId: z.string(),
  stageName: z.string(),
  movedAt: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  customFields: z.record(z.any()).optional(),
});

export type CandidateInPipeline = z.infer<typeof candidateInPipelineSchema>;

// Job Template Schema
export const jobTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Template name is required"),
  companyId: z.string(),
  jobData: jobPostingSchema,
  stages: z.array(pipelineStageSchema).optional(),
  createdAt: z.string().optional(),
});

export type JobTemplate = z.infer<typeof jobTemplateSchema>;

// Default Pipeline Stages
export const DEFAULT_PIPELINE_STAGES = [
  { name: "New", order: 0 },
  { name: "Shortlisted", order: 1 },
  { name: "Interview", order: 2 },
  { name: "Offered", order: 3 },
  { name: "Joined", order: 4 },
];
