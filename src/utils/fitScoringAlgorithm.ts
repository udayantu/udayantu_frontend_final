// Fit Scoring Algorithm for Candidates
export interface FitScoringInput {
  candidateSkills: string[];
  candidateTools: string[];
  candidateLanguages: string[];
  candidateLocation: string;
  candidateAvailability: string;
  jobRequiredSkills: string[];
  jobRequiredTools: string[];
  jobPreferredLanguage: string;
  jobLocation: string;
  jobType: string;
}

export interface FitScoreBreakdown {
  skillsScore: number;
  toolsScore: number;
  languageScore: number;
  locationScore: number;
  availabilityScore: number;
  totalScore: number;
  scorePercentage: number;
}

/**
 * Calculate fit score for a candidate against job requirements
 * Returns score out of 100
 */
export function calculateFitScore(input: FitScoringInput): FitScoreBreakdown {
  const {
    candidateSkills,
    candidateTools,
    candidateLanguages,
    candidateLocation,
    candidateAvailability,
    jobRequiredSkills,
    jobRequiredTools,
    jobPreferredLanguage,
    jobLocation,
    jobType,
  } = input;

  // Skills matching (40% weight)
  const skillsScore = calculateSkillsMatch(candidateSkills, jobRequiredSkills);

  // Tools matching (25% weight)
  const toolsScore = calculateToolsMatch(candidateTools, jobRequiredTools);

  // Language matching (15% weight)
  const languageScore = calculateLanguageMatch(
    candidateLanguages,
    jobPreferredLanguage
  );

  // Location matching (10% weight)
  const locationScore = calculateLocationMatch(candidateLocation, jobLocation);

  // Availability matching (10% weight)
  const availabilityScore = calculateAvailabilityMatch(
    candidateAvailability,
    jobType
  );

  // Weighted total (normalized to 100)
  const totalScore =
    skillsScore * 0.4 +
    toolsScore * 0.25 +
    languageScore * 0.15 +
    locationScore * 0.1 +
    availabilityScore * 0.1;

  return {
    skillsScore,
    toolsScore,
    languageScore,
    locationScore,
    availabilityScore,
    totalScore: Math.round(totalScore),
    scorePercentage: Math.round(totalScore),
  };
}

/**
 * Calculate skills match score (0-100)
 */
function calculateSkillsMatch(
  candidateSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase());
  const matchedSkills = requiredSkills.filter((skill) =>
    normalizedCandidate.some((cs) =>
      cs.includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(cs)
    )
  );

  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

/**
 * Calculate tools match score (0-100)
 */
function calculateToolsMatch(
  candidateTools: string[],
  requiredTools: string[]
): number {
  if (requiredTools.length === 0) return 100;

  const normalizedCandidate = candidateTools.map((t) => t.toLowerCase());
  const matchedTools = requiredTools.filter((tool) =>
    normalizedCandidate.some((ct) =>
      ct.includes(tool.toLowerCase()) || tool.toLowerCase().includes(ct)
    )
  );

  return Math.round((matchedTools.length / requiredTools.length) * 100);
}

/**
 * Calculate language match score (0-100)
 */
function calculateLanguageMatch(
  candidateLanguages: string[],
  preferredLanguage: string
): number {
  const normalizedCandidate = candidateLanguages.map((l) => l.toLowerCase());

  // 100 if preferred language is present
  if (normalizedCandidate.includes(preferredLanguage.toLowerCase())) {
    return 100;
  }

  // 50 if candidate speaks some language (assumes bilingual helps)
  if (normalizedCandidate.length > 0) {
    return 50;
  }

  return 0;
}

/**
 * Calculate location match score (0-100)
 */
function calculateLocationMatch(
  candidateLocation: string,
  jobLocation: string
): number {
  const normCandidate = candidateLocation.toLowerCase();
  const normJob = jobLocation.toLowerCase();

  // 100 if same location
  if (normCandidate === normJob) return 100;

  // 75 if same state (last part after comma)
  const candidateState = normCandidate.split(",").pop()?.trim() || "";
  const jobState = normJob.split(",").pop()?.trim() || "";

  if (candidateState && jobState && candidateState === jobState) {
    return 75;
  }

  // 50 if different location but willing to relocate (assume "remote" is flexible)
  if (normCandidate.includes("remote") || normJob.includes("remote")) {
    return 50;
  }

  return 25;
}

/**
 * Calculate availability match score (0-100)
 */
function calculateAvailabilityMatch(
  candidateAvailability: string,
  jobType: string
): number {
  const normCandidate = candidateAvailability.toLowerCase();
  const normJob = jobType.toLowerCase();

  // 100 if perfect match
  if (normCandidate === normJob) return 100;

  // 75 if full-time available and job is flexible
  if (normCandidate.includes("full-time")) return 75;

  // 50 if part-time but can work full-time
  if (normCandidate.includes("part-time")) return 50;

  return 25;
}

/**
 * Get fit score label
 */
export function getFitScoreLabel(score: number): string {
  if (score >= 90) return "Excellent Fit";
  if (score >= 75) return "Good Fit";
  if (score >= 60) return "Moderate Fit";
  if (score >= 45) return "Fair Fit";
  return "Poor Fit";
}

/**
 * Get fit score color for UI
 */
export function getFitScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 45) return "bg-orange-500";
  return "bg-red-500";
}
