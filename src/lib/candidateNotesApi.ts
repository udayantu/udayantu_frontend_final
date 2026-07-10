import { supabase } from "@/integrations/supabase/client";

export interface CandidateNote {
  id: string;
  candidateId: string;
  employerId: string;
  addedBy: string;
  addedByName: string;
  content: string;
  tags: DecisionTag[];
  createdAt: string;
  updatedAt: string;
}

export interface DecisionTag {
  id: string;
  name: string;
  color: "red" | "green" | "yellow" | "blue" | "purple";
  label: string;
}

const CANDIDATE_NOTES_KEY = "udayantu_candidate_notes";
const DECISION_TAGS_KEY = "udayantu_decision_tags";

export const PREDEFINED_TAGS: DecisionTag[] = [
  { id: "strong-match", name: "Strong Match", color: "green", label: "Strong fit for role" },
  { id: "needs-interview", name: "Needs Interview", color: "blue", label: "Schedule interview" },
  { id: "on-hold", name: "On Hold", color: "yellow", label: "Review later" },
  { id: "not-fit", name: "Not Fit", color: "red", label: "Not suitable" },
  { id: "follow-up", name: "Follow Up", color: "purple", label: "Requires follow-up" },
];

// Save candidate notes
export function saveCandidateNotes(notes: CandidateNote[]): void {
  localStorage.setItem(CANDIDATE_NOTES_KEY, JSON.stringify(notes));
}

// Get notes for candidate
export function getCandidateNotes(candidateId: string): CandidateNote[] {
  try {
    const stored = localStorage.getItem(CANDIDATE_NOTES_KEY);
    if (!stored) return [];
    const notes = JSON.parse(stored) as CandidateNote[];
    return notes.filter(n => n.candidateId === candidateId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to get candidate notes:", error);
    return [];
  }
}

// Add note
export function addCandidateNote(
  candidateId: string,
  employerId: string,
  addedBy: string,
  addedByName: string,
  content: string,
  tags: DecisionTag[] = []
): CandidateNote {
  try {
    const notes = JSON.parse(localStorage.getItem(CANDIDATE_NOTES_KEY) || "[]") as CandidateNote[];
    
    const newNote: CandidateNote = {
      id: `note_${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      employerId,
      addedBy,
      addedByName,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    saveCandidateNotes(notes);
    return newNote;
  } catch (error) {
    console.error("Failed to add candidate note:", error);
    throw error;
  }
}

// Update note
export function updateCandidateNote(
  noteId: string,
  content: string,
  tags: DecisionTag[]
): CandidateNote | null {
  try {
    const notes = JSON.parse(localStorage.getItem(CANDIDATE_NOTES_KEY) || "[]") as CandidateNote[];
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) return null;

    notes[noteIndex] = {
      ...notes[noteIndex],
      content,
      tags,
      updatedAt: new Date().toISOString(),
    };

    saveCandidateNotes(notes);
    return notes[noteIndex];
  } catch (error) {
    console.error("Failed to update candidate note:", error);
    return null;
  }
}

// Delete note
export function deleteCandidateNote(noteId: string): boolean {
  try {
    const notes = JSON.parse(localStorage.getItem(CANDIDATE_NOTES_KEY) || "[]") as CandidateNote[];
    const filtered = notes.filter(n => n.id !== noteId);
    saveCandidateNotes(filtered);
    return true;
  } catch (error) {
    console.error("Failed to delete candidate note:", error);
    return false;
  }
}

// Export candidates to CSV
export function exportCandidatesToCSV(
  candidates: any[],
  notes: Record<string, CandidateNote[]>
): string {
  const headers = [
    "Student ID",
    "Degree",
    "City",
    "Skills",
    "Tools",
    "Languages",
    "Fit Score",
    "Interview Attendance",
    "Team Notes",
    "Decision Tags",
    "Last Updated",
  ];

  const rows = candidates.map(candidate => {
    const candidateNotes = notes[candidate.id] || [];
    const allTags = candidateNotes.flatMap(n => n.tags.map(t => t.name));
    const combinedNotes = candidateNotes.map(n => `[${n.addedByName}] ${n.content}`).join(" | ");

    return [
      candidate.studentId,
      candidate.degree,
      candidate.city,
      (candidate.skills || []).join("; "),
      (candidate.tools || []).join("; "),
      (candidate.language || []).join("; "),
      candidate.fitScore,
      `${candidate.attendance}%`,
      combinedNotes || "-",
      allTags.join(", ") || "-",
      new Date().toLocaleDateString(),
    ];
  });

  const csv = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csv;
}

// Export to ATS format
export function exportCandidatesToATS(
  candidates: any[],
  notes: Record<string, CandidateNote[]>
): string {
  const atsData = candidates.map(candidate => {
    const candidateNotes = notes[candidate.id] || [];
    
    return {
      candidate_id: candidate.studentId,
      first_name: candidate.studentId.split("_")[0] || "Student",
      email: "contact@udayantu.com",
      phone: "Not Available",
      source: "UdaYantu Platform",
      current_position: candidate.degree,
      education: candidate.degree,
      location: candidate.city,
      skills: (candidate.skills || []).join(", "),
      tools: (candidate.tools || []).join(", "),
      languages: (candidate.language || []).join(", "),
      fit_score: candidate.fitScore,
      interview_attendance: `${candidate.attendance}%`,
      notes: candidateNotes.map(n => `${n.addedByName}: ${n.content}`).join("\n"),
      tags: candidateNotes.flatMap(n => n.tags.map(t => t.name)).join(","),
      export_date: new Date().toISOString(),
    };
  });

  return JSON.stringify(atsData, null, 2);
}
