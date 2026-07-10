// Silver Medalists & Talent Pool Management

export interface SilverMedalist {
  id: string;
  candidateId: string;
  studentId: string;
  employerId: string;
  name: string;
  degree: string;
  city: string;
  skills: string[];
  fitScore: number;
  rejectionReason: string;
  tags: string[];
  savingDate: string;
  lastAlerted: string;
  status: "active" | "reactivated" | "hired";
}

export interface JobAlert {
  id: string;
  silverMedalistId: string;
  jobId: string;
  matchScore: number;
  alertedAt: string;
  dismissed: boolean;
}

const TALENT_POOL_KEY = "udayantu_talent_pool";
const JOB_ALERTS_KEY = "udayantu_job_alerts";

// Save Silver Medalist
export function saveSilverMedalist(candidate: any, rejectionReason: string, employerId: string): SilverMedalist {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    
    const silverMedalist: SilverMedalist = {
      id: `sm_${Math.random().toString(36).substr(2, 9)}`,
      candidateId: candidate.id,
      studentId: candidate.studentId,
      employerId,
      name: candidate.degree || "Unknown",
      degree: candidate.degree,
      city: candidate.city,
      skills: candidate.skills || [],
      fitScore: candidate.fitScore,
      rejectionReason,
      tags: [],
      savingDate: new Date().toISOString(),
      lastAlerted: new Date().toISOString(),
      status: "active",
    };

    pool.push(silverMedalist);
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(pool));
    return silverMedalist;
  } catch (error) {
    console.error("Failed to save silver medalist:", error);
    throw error;
  }
}

// Get Silver Medalists for employer
export function getSilverMedalists(employerId: string, status?: "active" | "reactivated" | "hired"): SilverMedalist[] {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    let filtered = pool.filter(m => m.employerId === employerId);
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    return filtered.sort((a, b) => new Date(b.savingDate).getTime() - new Date(a.savingDate).getTime());
  } catch (error) {
    return [];
  }
}

// Add tags to Silver Medalist
export function tagSilverMedalist(medalistId: string, newTags: string[]): SilverMedalist | null {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    const index = pool.findIndex(m => m.id === medalistId);
    
    if (index === -1) return null;

    pool[index].tags = [...new Set([...pool[index].tags, ...newTags])];
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(pool));
    return pool[index];
  } catch (error) {
    return null;
  }
}

// Remove tag from Silver Medalist
export function removeTag(medalistId: string, tag: string): SilverMedalist | null {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    const index = pool.findIndex(m => m.id === medalistId);
    
    if (index === -1) return null;

    pool[index].tags = pool[index].tags.filter(t => t !== tag);
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(pool));
    return pool[index];
  } catch (error) {
    return null;
  }
}

// Reactivate into pipeline
export function reactivateMedalist(medalistId: string, jobId: string): SilverMedalist | null {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    const index = pool.findIndex(m => m.id === medalistId);
    
    if (index === -1) return null;

    pool[index].status = "reactivated";
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(pool));
    return pool[index];
  } catch (error) {
    return null;
  }
}

// Mark as hired
export function markAsHired(medalistId: string): SilverMedalist | null {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    const index = pool.findIndex(m => m.id === medalistId);
    
    if (index === -1) return null;

    pool[index].status = "hired";
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(pool));
    return pool[index];
  } catch (error) {
    return null;
  }
}

// Match jobs with silver medalists (skill-based matching)
export function matchJobsWithMedalists(job: any, medalists: SilverMedalist[]): { medalist: SilverMedalist; matchScore: number }[] {
  const jobSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
  
  return medalists
    .map(medalist => {
      const medalistSkills = (medalist.skills || []).map(s => s.toLowerCase());
      const matchedSkills = medalistSkills.filter(s => jobSkills.includes(s));
      const matchScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;
      
      return { medalist, matchScore };
    })
    .filter(m => m.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore);
}

// Create job alerts
export function createJobAlert(medalistId: string, jobId: string, matchScore: number): JobAlert {
  try {
    const alerts = JSON.parse(localStorage.getItem(JOB_ALERTS_KEY) || "[]") as JobAlert[];
    
    const alert: JobAlert = {
      id: `alert_${Math.random().toString(36).substr(2, 9)}`,
      silverMedalistId: medalistId,
      jobId,
      matchScore,
      alertedAt: new Date().toISOString(),
      dismissed: false,
    };

    alerts.push(alert);
    localStorage.setItem(JOB_ALERTS_KEY, JSON.stringify(alerts));
    return alert;
  } catch (error) {
    throw error;
  }
}

// Get pending alerts for medalist
export function getPendingAlerts(medalistId: string): JobAlert[] {
  try {
    const alerts = JSON.parse(localStorage.getItem(JOB_ALERTS_KEY) || "[]") as JobAlert[];
    return alerts.filter(a => a.silverMedalistId === medalistId && !a.dismissed);
  } catch (error) {
    return [];
  }
}

// Dismiss alert
export function dismissAlert(alertId: string): void {
  try {
    const alerts = JSON.parse(localStorage.getItem(JOB_ALERTS_KEY) || "[]") as JobAlert[];
    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alerts[index].dismissed = true;
      localStorage.setItem(JOB_ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error("Failed to dismiss alert:", error);
  }
}

// Delete from talent pool
export function removeFromTalentPool(medalistId: string): boolean {
  try {
    const pool = JSON.parse(localStorage.getItem(TALENT_POOL_KEY) || "[]") as SilverMedalist[];
    const filtered = pool.filter(m => m.id !== medalistId);
    localStorage.setItem(TALENT_POOL_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    return false;
  }
}

// Export talent pool to CSV
export function exportTalentPoolToCSV(medalists: SilverMedalist[]): string {
  const headers = ["Name", "Degree", "City", "Skills", "Fit Score", "Tags", "Status", "Rejection Reason", "Saved Date"];
  
  const rows = medalists.map(m => [
    m.name,
    m.degree,
    m.city,
    (m.skills || []).join("; "),
    m.fitScore,
    m.tags.join(", "),
    m.status,
    m.rejectionReason,
    new Date(m.savingDate).toLocaleDateString(),
  ]);

  const csv = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csv;
}
