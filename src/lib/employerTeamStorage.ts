import { EmployerRole } from "./employerAuth";

export interface TeamMember {
  id: string;
  companyId: string;
  email: string;
  name: string;
  role: EmployerRole;
  status: "pending" | "active";
  inviteToken?: string;
  invitedAt: string;
  joinedAt?: string;
  invitedBy: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  companyId: string;
  role: EmployerRole;
  token: string;
  otp: string;
  expiresAt: number;
  invitedBy: string;
}

const TEAM_MEMBERS_KEY = "udayantu_team_members";
const TEAM_INVITES_KEY = "udayantu_team_invites";

/**
 * Save team members to storage
 */
export function saveTeamMembers(members: TeamMember[]): void {
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
}

/**
 * Get all team members for company
 */
export function getTeamMembers(companyId: string): TeamMember[] {
  try {
    const stored = localStorage.getItem(TEAM_MEMBERS_KEY);
    if (!stored) return [];
    const members = JSON.parse(stored) as TeamMember[];
    return members.filter(m => m.companyId === companyId);
  } catch (error) {
    console.error("Failed to get team members:", error);
    return [];
  }
}

/**
 * Add team member
 */
export function addTeamMember(member: TeamMember): boolean {
  try {
    const members = JSON.parse(localStorage.getItem(TEAM_MEMBERS_KEY) || "[]") as TeamMember[];
    
    // Check if email already exists for this company
    if (members.some(m => m.companyId === member.companyId && m.email === member.email)) {
      return false;
    }
    
    members.push(member);
    saveTeamMembers(members);
    return true;
  } catch (error) {
    console.error("Failed to add team member:", error);
    return false;
  }
}

/**
 * Update team member
 */
export function updateTeamMember(memberId: string, updates: Partial<TeamMember>): boolean {
  try {
    const members = JSON.parse(localStorage.getItem(TEAM_MEMBERS_KEY) || "[]") as TeamMember[];
    const index = members.findIndex(m => m.id === memberId);
    
    if (index === -1) return false;
    
    members[index] = { ...members[index], ...updates };
    saveTeamMembers(members);
    return true;
  } catch (error) {
    console.error("Failed to update team member:", error);
    return false;
  }
}

/**
 * Remove team member
 */
export function removeTeamMember(companyId: string, memberId: string): boolean {
  try {
    const members = JSON.parse(localStorage.getItem(TEAM_MEMBERS_KEY) || "[]") as TeamMember[];
    const filtered = members.filter(m => !(m.companyId === companyId && m.id === memberId));
    saveTeamMembers(filtered);
    return true;
  } catch (error) {
    console.error("Failed to remove team member:", error);
    return false;
  }
}

/**
 * Get team member by email
 */
export function getTeamMemberByEmail(companyId: string, email: string): TeamMember | null {
  try {
    const members = getTeamMembers(companyId);
    return members.find(m => m.email === email) || null;
  } catch (error) {
    return null;
  }
}

/**
 * Save pending invites
 */
export function savePendingInvites(invites: TeamInvite[]): void {
  localStorage.setItem(TEAM_INVITES_KEY, JSON.stringify(invites));
}

/**
 * Get pending invites
 */
export function getPendingInvites(companyId: string): TeamInvite[] {
  try {
    const stored = localStorage.getItem(TEAM_INVITES_KEY);
    if (!stored) return [];
    const invites = JSON.parse(stored) as TeamInvite[];
    return invites.filter(i => i.companyId === companyId && i.expiresAt > Date.now());
  } catch (error) {
    return [];
  }
}

/**
 * Create team invite
 */
export function createTeamInvite(email: string, companyId: string, role: EmployerRole, invitedBy: string): TeamInvite {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `invite_${Math.random().toString(36).substr(2, 9)}`;
  
  const invite: TeamInvite = {
    id: `inv_${Date.now()}`,
    email,
    companyId,
    role,
    token,
    otp,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    invitedBy,
  };
  
  const invites = JSON.parse(localStorage.getItem(TEAM_INVITES_KEY) || "[]") as TeamInvite[];
  invites.push(invite);
  savePendingInvites(invites);
  
  // OTP intentionally not logged - check sessionStorage for demo testing
  
  return invite;
}

/**
 * Verify team invite
 */
export function verifyTeamInvite(token: string, otp: string): TeamInvite | null {
  try {
    const invites = JSON.parse(localStorage.getItem(TEAM_INVITES_KEY) || "[]") as TeamInvite[];
    const invite = invites.find(i => i.token === token && i.otp === otp && i.expiresAt > Date.now());
    
    if (!invite) return null;
    
    // Remove used invite
    const updated = invites.filter(i => i.token !== token);
    savePendingInvites(updated);
    
    return invite;
  } catch (error) {
    return null;
  }
}

/**
 * Get invite by token
 */
export function getInviteByToken(token: string): TeamInvite | null {
  try {
    const invites = JSON.parse(localStorage.getItem(TEAM_INVITES_KEY) || "[]") as TeamInvite[];
    return invites.find(i => i.token === token && i.expiresAt > Date.now()) || null;
  } catch (error) {
    return null;
  }
}

/**
 * Clear expired invites
 */
export function clearExpiredInvites(): void {
  try {
    const invites = JSON.parse(localStorage.getItem(TEAM_INVITES_KEY) || "[]") as TeamInvite[];
    const valid = invites.filter(i => i.expiresAt > Date.now());
    savePendingInvites(valid);
  } catch (error) {
    console.error("Failed to clear expired invites:", error);
  }
}
