/**
 * RBAC API Layer
 * Permission checking, PII masking, device trust, and user provisioning
 * 
 * DEMO IMPLEMENTATION: Uses localStorage for prototype. For production:
 * - Store users/invites/audit in Supabase with RLS policies
 * - Never expose OTP codes to client (use server-side delivery)
 * - Implement cryptographic chaining for audit logs
 * - Add server-side session validation
 */

import {
  AdminRole,
  AdminUser,
  AdminInvite,
  DeviceTrust,
  RoleChangeAudit,
  Permission,
  ROLE_PERMISSIONS,
  ROLE_PII_ACCESS,
  TAB_PERMISSIONS,
  PIIMaskingConfig,
} from "./types";

const ADMIN_USERS_KEY = "udayantu_admin_users";
const ADMIN_INVITES_KEY = "udayantu_admin_invites";
const RBAC_AUDIT_KEY = "udayantu_rbac_audit";
const CURRENT_ADMIN_KEY = "udayantu_current_admin";
const OTP_EXPIRY_MINUTES = 10;

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function calculateHash(data: object): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function getDeviceFingerprint(): string {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const screen = typeof window !== "undefined" ? window.screen : null;
  
  const components = [
    nav?.userAgent || "unknown",
    nav?.language || "unknown",
    screen?.width || 0,
    screen?.height || 0,
    new Date().getTimezoneOffset(),
  ];
  
  return calculateHash({ components });
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function canAccessTab(role: AdminRole, tabId: string): boolean {
  const requiredPermissions = TAB_PERMISSIONS[tabId];
  if (!requiredPermissions) return false;
  return hasAnyPermission(role, requiredPermissions);
}

export function getAccessibleTabs(role: AdminRole): string[] {
  return Object.keys(TAB_PERMISSIONS).filter((tab) => canAccessTab(role, tab));
}

export function getPIIConfig(role: AdminRole): PIIMaskingConfig {
  return ROLE_PII_ACCESS[role];
}

export function maskPII(value: string, type: keyof PIIMaskingConfig, role: AdminRole): string {
  const config = getPIIConfig(role);
  
  if (config[type]) {
    return value;
  }
  
  switch (type) {
    case "email":
      if (!value.includes("@")) return "***@***.***";
      const [local, domain] = value.split("@");
      return `${local.slice(0, 2)}***@${domain.slice(0, 2)}***.***`;
    case "phone":
      if (value.length < 4) return "******";
      return `${value.slice(0, 2)}****${value.slice(-2)}`;
    case "fullName":
      const parts = value.split(" ");
      return parts.map((p) => `${p.charAt(0)}***`).join(" ");
    case "address":
      return "*** Address Hidden ***";
    case "aadhaar":
      if (value.length < 4) return "****-****-****";
      return `****-****-${value.slice(-4)}`;
    default:
      return "***";
  }
}

export function getAdminUsers(): AdminUser[] {
  try {
    const data = localStorage.getItem(ADMIN_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAdminUsers(users: AdminUser[]): void {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

export function getAdminUser(userId: string): AdminUser | null {
  const users = getAdminUsers();
  return users.find((u) => u.id === userId) || null;
}

export function getAdminUserByEmail(email: string): AdminUser | null {
  const users = getAdminUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const data = localStorage.getItem(CURRENT_ADMIN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentAdmin(admin: AdminUser | null): void {
  if (admin) {
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
  } else {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
  }
}

export function logoutAdmin(): void {
  setCurrentAdmin(null);
}

export function createAdminInvite(
  email: string,
  fullName: string,
  role: AdminRole,
  invitedBy: string,
  invitedByEmail: string,
  phone?: string,
  expiryDays: number = 7,
  sentVia: "email" | "whatsapp" | "both" = "email"
): AdminInvite {
  const invites = getAdminInvites();
  
  const existingPending = invites.find(
    (i) => i.email.toLowerCase() === email.toLowerCase() && i.status === "pending"
  );
  if (existingPending) {
    existingPending.status = "revoked";
    saveAdminInvites(invites);
  }
  
  const existingUser = getAdminUserByEmail(email);
  if (existingUser && existingUser.status === "active") {
    throw new Error("User with this email already exists and is active");
  }
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  const invite: AdminInvite = {
    id: generateId("inv"),
    email,
    phone,
    fullName,
    role,
    inviteCode: generateInviteCode(),
    invitedBy,
    invitedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
    sentVia,
  };
  
  invites.push(invite);
  saveAdminInvites(invites);
  
  logRoleChange(
    invite.id,
    email,
    null,
    role,
    invitedBy,
    invitedByEmail,
    `Invited new user as ${role}`
  );
  
  // Demo mode - invite created (code not logged for security)
  
  return invite;
}

export function getAdminInvites(): AdminInvite[] {
  try {
    const data = localStorage.getItem(ADMIN_INVITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAdminInvites(invites: AdminInvite[]): void {
  localStorage.setItem(ADMIN_INVITES_KEY, JSON.stringify(invites));
}

export function getInviteByCode(code: string): AdminInvite | null {
  const invites = getAdminInvites();
  return invites.find((i) => i.inviteCode === code && i.status === "pending") || null;
}

export function sendInviteOTP(inviteId: string): { success: boolean; otp?: string; error?: string } {
  const invites = getAdminInvites();
  const invite = invites.find((i) => i.id === inviteId);
  
  if (!invite) {
    return { success: false, error: "Invite not found" };
  }
  
  if (invite.status !== "pending") {
    return { success: false, error: "Invite is no longer valid" };
  }
  
  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = "expired";
    saveAdminInvites(invites);
    return { success: false, error: "Invite has expired" };
  }
  
  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP_EXPIRY_MINUTES);
  
  invite.otpCode = otp;
  invite.otpExpiresAt = otpExpiry.toISOString();
  saveAdminInvites(invites);
  
  // OTP generated for invite verification
  
  return { success: true, otp };
}

export function verifyInviteOTP(
  inviteCode: string,
  otp: string
): { success: boolean; user?: AdminUser; error?: string } {
  const invites = getAdminInvites();
  const invite = invites.find((i) => i.inviteCode === inviteCode);
  
  if (!invite) {
    return { success: false, error: "Invalid invite code" };
  }
  
  if (invite.status !== "pending") {
    return { success: false, error: "Invite is no longer valid" };
  }
  
  if (!invite.otpCode || !invite.otpExpiresAt) {
    return { success: false, error: "OTP not requested" };
  }
  
  if (new Date(invite.otpExpiresAt) < new Date()) {
    return { success: false, error: "OTP has expired" };
  }
  
  if (invite.otpCode !== otp) {
    return { success: false, error: "Invalid OTP" };
  }
  
  const deviceFingerprint = getDeviceFingerprint();
  const deviceTrust: DeviceTrust = {
    id: generateId("dev"),
    deviceFingerprint,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    ipAddress: "127.0.0.1",
    trustedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    isActive: true,
  };
  
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: generateId("usr"),
    email: invite.email,
    phone: invite.phone,
    fullName: invite.fullName,
    role: invite.role,
    status: "active",
    invitedBy: invite.invitedBy,
    invitedAt: invite.invitedAt,
    activatedAt: now,
    lastLoginAt: now,
    deviceTrust: [deviceTrust],
    createdAt: now,
    updatedAt: now,
  };
  
  const users = getAdminUsers();
  users.push(user);
  saveAdminUsers(users);
  
  invite.status = "accepted";
  invite.otpCode = undefined;
  invite.otpExpiresAt = undefined;
  saveAdminInvites(invites);
  
  setCurrentAdmin(user);
  
  return { success: true, user };
}

export function loginWithOTP(
  email: string
): { success: boolean; otp?: string; error?: string } {
  const user = getAdminUserByEmail(email);
  
  if (!user) {
    return { success: false, error: "User not found" };
  }
  
  if (user.status !== "active") {
    return { success: false, error: `Account is ${user.status}` };
  }
  
  if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
    const users = getAdminUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx].status = "expired";
      saveAdminUsers(users);
    }
    return { success: false, error: "Account has expired" };
  }
  
  const otp = generateOTP();
  const otpKey = `admin_login_otp_${email.toLowerCase()}`;
  const otpData = {
    code: otp,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  };
  localStorage.setItem(otpKey, JSON.stringify(otpData));
  
  // Login OTP generated for admin user
  
  return { success: true, otp };
}

export function verifyLoginOTP(
  email: string,
  otp: string
): { success: boolean; user?: AdminUser; error?: string } {
  const otpKey = `admin_login_otp_${email.toLowerCase()}`;
  const storedData = localStorage.getItem(otpKey);
  
  if (!storedData) {
    return { success: false, error: "OTP not found or expired" };
  }
  
  const otpData = JSON.parse(storedData);
  
  if (otpData.expiresAt < Date.now()) {
    localStorage.removeItem(otpKey);
    return { success: false, error: "OTP has expired" };
  }
  
  if (otpData.code !== otp) {
    return { success: false, error: "Invalid OTP" };
  }
  
  localStorage.removeItem(otpKey);
  
  const user = getAdminUserByEmail(email);
  if (!user) {
    return { success: false, error: "User not found" };
  }
  
  const deviceFingerprint = getDeviceFingerprint();
  const existingDevice = user.deviceTrust.find(
    (d) => d.deviceFingerprint === deviceFingerprint && d.isActive
  );
  
  if (existingDevice) {
    existingDevice.lastUsedAt = new Date().toISOString();
  } else {
    const newDevice: DeviceTrust = {
      id: generateId("dev"),
      deviceFingerprint,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      ipAddress: "127.0.0.1",
      trustedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      isActive: true,
    };
    user.deviceTrust.push(newDevice);
  }
  
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const users = getAdminUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    saveAdminUsers(users);
  }
  
  setCurrentAdmin(user);
  
  return { success: true, user };
}

export function updateUserRole(
  userId: string,
  newRole: AdminRole,
  changedBy: string,
  changedByEmail: string,
  reason: string
): { success: boolean; user?: AdminUser; error?: string } {
  const users = getAdminUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  
  if (userIdx === -1) {
    return { success: false, error: "User not found" };
  }
  
  const user = users[userIdx];
  const previousRole = user.role;
  
  user.role = newRole;
  user.updatedAt = new Date().toISOString();
  
  users[userIdx] = user;
  saveAdminUsers(users);
  
  logRoleChange(userId, user.email, previousRole, newRole, changedBy, changedByEmail, reason);
  
  return { success: true, user };
}

export function suspendUser(
  userId: string,
  changedBy: string,
  changedByEmail: string,
  reason: string
): { success: boolean; error?: string } {
  const users = getAdminUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  
  if (userIdx === -1) {
    return { success: false, error: "User not found" };
  }
  
  users[userIdx].status = "suspended";
  users[userIdx].updatedAt = new Date().toISOString();
  saveAdminUsers(users);
  
  logRoleChange(
    userId,
    users[userIdx].email,
    users[userIdx].role,
    users[userIdx].role,
    changedBy,
    changedByEmail,
    `User suspended: ${reason}`
  );
  
  return { success: true };
}

export function reactivateUser(
  userId: string,
  changedBy: string,
  changedByEmail: string
): { success: boolean; error?: string } {
  const users = getAdminUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  
  if (userIdx === -1) {
    return { success: false, error: "User not found" };
  }
  
  users[userIdx].status = "active";
  users[userIdx].updatedAt = new Date().toISOString();
  saveAdminUsers(users);
  
  logRoleChange(
    userId,
    users[userIdx].email,
    users[userIdx].role,
    users[userIdx].role,
    changedBy,
    changedByEmail,
    "User reactivated"
  );
  
  return { success: true };
}

export function setUserExpiry(
  userId: string,
  expiryDate: Date | null,
  changedBy: string,
  changedByEmail: string
): { success: boolean; error?: string } {
  const users = getAdminUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  
  if (userIdx === -1) {
    return { success: false, error: "User not found" };
  }
  
  users[userIdx].expiresAt = expiryDate?.toISOString();
  users[userIdx].updatedAt = new Date().toISOString();
  saveAdminUsers(users);
  
  logRoleChange(
    userId,
    users[userIdx].email,
    users[userIdx].role,
    users[userIdx].role,
    changedBy,
    changedByEmail,
    expiryDate ? `Access expiry set to ${expiryDate.toLocaleDateString()}` : "Access expiry removed"
  );
  
  return { success: true };
}

export function revokeDeviceTrust(
  userId: string,
  deviceId: string
): { success: boolean; error?: string } {
  const users = getAdminUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  
  if (userIdx === -1) {
    return { success: false, error: "User not found" };
  }
  
  const deviceIdx = users[userIdx].deviceTrust.findIndex((d) => d.id === deviceId);
  if (deviceIdx === -1) {
    return { success: false, error: "Device not found" };
  }
  
  users[userIdx].deviceTrust[deviceIdx].isActive = false;
  users[userIdx].updatedAt = new Date().toISOString();
  saveAdminUsers(users);
  
  return { success: true };
}

function logRoleChange(
  userId: string,
  userEmail: string,
  previousRole: AdminRole | null,
  newRole: AdminRole,
  changedBy: string,
  changedByEmail: string,
  reason: string
): RoleChangeAudit {
  const logs = getRoleChangeAuditLogs();
  
  const logEntry: Omit<RoleChangeAudit, "hash"> = {
    id: generateId("rca"),
    userId,
    userEmail,
    previousRole,
    newRole,
    changedBy,
    changedByEmail,
    reason,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };
  
  const hash = calculateHash(logEntry);
  const completeLog: RoleChangeAudit = { ...logEntry, hash };
  
  logs.push(completeLog);
  localStorage.setItem(RBAC_AUDIT_KEY, JSON.stringify(logs));
  
  return completeLog;
}

export function getRoleChangeAuditLogs(): RoleChangeAudit[] {
  try {
    const data = localStorage.getItem(RBAC_AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function verifyAuditLogIntegrity(log: RoleChangeAudit): boolean {
  const { hash, ...logWithoutHash } = log;
  const calculatedHash = calculateHash(logWithoutHash);
  return hash === calculatedHash;
}

export function exportAuditLogsCSV(logs: RoleChangeAudit[]): string {
  const headers = [
    "ID",
    "Timestamp",
    "User Email",
    "Previous Role",
    "New Role",
    "Changed By",
    "Reason",
    "Verified",
  ];
  
  const rows = logs.map((log) => [
    log.id,
    new Date(log.timestamp).toLocaleString(),
    log.userEmail,
    log.previousRole || "N/A",
    log.newRole,
    log.changedByEmail,
    log.reason,
    verifyAuditLogIntegrity(log) ? "Yes" : "TAMPERED",
  ]);
  
  return [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
}

export function initializeMainAdmin(
  email: string,
  fullName: string,
  phone?: string
): AdminUser {
  const users = getAdminUsers();
  
  const existingMainAdmin = users.find((u) => u.role === "main_admin" && u.status === "active");
  if (existingMainAdmin) {
    throw new Error("Main Admin already exists");
  }
  
  const now = new Date().toISOString();
  const deviceFingerprint = getDeviceFingerprint();
  
  const mainAdmin: AdminUser = {
    id: generateId("usr"),
    email,
    phone,
    fullName,
    role: "main_admin",
    status: "active",
    invitedBy: "system",
    invitedAt: now,
    activatedAt: now,
    lastLoginAt: now,
    deviceTrust: [
      {
        id: generateId("dev"),
        deviceFingerprint,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        ipAddress: "127.0.0.1",
        trustedAt: now,
        lastUsedAt: now,
        isActive: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(mainAdmin);
  saveAdminUsers(users);
  
  logRoleChange(
    mainAdmin.id,
    email,
    null,
    "main_admin",
    "system",
    "system@udayantu.com",
    "Initial Main Admin setup"
  );
  
  setCurrentAdmin(mainAdmin);
  
  return mainAdmin;
}

export function hasMainAdmin(): boolean {
  const users = getAdminUsers();
  return users.some((u) => u.role === "main_admin" && u.status === "active");
}
