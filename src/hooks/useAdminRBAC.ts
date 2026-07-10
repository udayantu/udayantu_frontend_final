/**
 * Admin RBAC Hook
 * Provides role-based access control for admin users
 * Syncs with Supabase auth and user_roles table
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminUser,
  AdminRole,
  Permission,
  ROLE_LABELS,
  ADMIN_ROLES,
  PIIMaskingConfig,
} from "@/lib/rbac/types";
import {
  getCurrentAdmin,
  setCurrentAdmin,
  logoutAdmin,
  hasPermission,
  hasAnyPermission,
  canAccessTab,
  getAccessibleTabs,
  maskPII,
  loginWithOTP,
  verifyLoginOTP,
  getAdminUsers,
  getAdminInvites,
  createAdminInvite,
  updateUserRole,
  suspendUser,
  reactivateUser,
  setUserExpiry,
  getRoleChangeAuditLogs,
  initializeMainAdmin,
  hasMainAdmin,
  getAdminUserByEmail,
} from "@/lib/rbac/rbacApi";

export interface UseAdminRBACResult {
  currentUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: AdminRole | null;
  
  checkPermission: (permission: Permission) => boolean;
  checkAnyPermission: (permissions: Permission[]) => boolean;
  canAccessTab: (tabId: string) => boolean;
  getAccessibleTabs: () => string[];
  maskPII: (value: string, type: keyof PIIMaskingConfig) => string;
  getRoleLabel: (role: AdminRole, lang?: "en" | "hi") => string;
  
  requestLoginOTP: (email: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  inviteUser: (
    email: string,
    fullName: string,
    role: AdminRole,
    phone?: string,
    expiryDays?: number,
    sentVia?: "email" | "whatsapp" | "both"
  ) => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
  
  changeUserRole: (
    userId: string,
    newRole: AdminRole,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  suspendUserAccess: (
    userId: string,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  reactivateUserAccess: (
    userId: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  setAccessExpiry: (
    userId: string,
    expiryDate: Date | null
  ) => Promise<{ success: boolean; error?: string }>;
  
  getAllUsers: () => AdminUser[];
  getAllInvites: () => ReturnType<typeof getAdminInvites>;
  getAuditLogs: () => ReturnType<typeof getRoleChangeAuditLogs>;
  
  setupMainAdmin: (
    email: string,
    fullName: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  isMainAdminSetup: () => boolean;
  availableRoles: typeof ADMIN_ROLES;
}

export function useAdminRBAC(): UseAdminRBACResult {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: supabaseUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const syncAdminWithSupabase = async () => {
      if (authLoading) return;
      
      if (supabaseUser) {
        // Check if user has admin role in Supabase user_roles table
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", supabaseUser.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (!error && roleData) {
          // User has admin role in Supabase - sync to local RBAC using user_id as primary key
          const email = supabaseUser.email || supabaseUser.user_metadata?.email || "";
          const fullName = supabaseUser.user_metadata?.full_name || 
                          supabaseUser.user_metadata?.fullName || 
                          (email ? email.split("@")[0] : "Admin");
          
          // Check if local admin with same user_id already exists
          const localAdmin = getCurrentAdmin();
          
          if (localAdmin && localAdmin.id === supabaseUser.id) {
            // Already synced with correct user_id - just update last login
            localAdmin.lastLoginAt = new Date().toISOString();
            setCurrentAdmin(localAdmin);
            setCurrentUser(localAdmin);
          } else {
            // Create/update local admin user synced from Supabase using user_id
            const now = new Date().toISOString();
            const newAdmin: AdminUser = {
              id: supabaseUser.id, // Use Supabase user_id as primary key
              email: email,
              phone: supabaseUser.phone || supabaseUser.user_metadata?.phone,
              fullName: fullName,
              role: "main_admin" as AdminRole,
              status: "active",
              invitedBy: "supabase_sync",
              invitedAt: now,
              activatedAt: now,
              lastLoginAt: now,
              deviceTrust: [],
              createdAt: now,
              updatedAt: now,
            };
            setCurrentAdmin(newAdmin);
            setCurrentUser(newAdmin);
          }
        } else {
          // User doesn't have admin role OR query failed - CLEAR local admin state
          // This prevents stale localStorage from granting unauthorized access
          setCurrentAdmin(null);
          setCurrentUser(null);
        }
      } else {
        // No Supabase user - CLEAR local admin state for security
        // Don't allow localStorage-only admin access
        setCurrentAdmin(null);
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    };
    
    syncAdminWithSupabase();
  }, [supabaseUser, authLoading]);

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      if (!currentUser) return false;
      return hasPermission(currentUser.role, permission);
    },
    [currentUser]
  );

  const checkAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!currentUser) return false;
      return hasAnyPermission(currentUser.role, permissions);
    },
    [currentUser]
  );

  const canAccessTabFn = useCallback(
    (tabId: string): boolean => {
      if (!currentUser) return false;
      return canAccessTab(currentUser.role, tabId);
    },
    [currentUser]
  );

  const getAccessibleTabsFn = useCallback((): string[] => {
    if (!currentUser) return [];
    return getAccessibleTabs(currentUser.role);
  }, [currentUser]);

  const maskPIIFn = useCallback(
    (value: string, type: keyof PIIMaskingConfig): string => {
      if (!currentUser) return "***";
      return maskPII(value, type, currentUser.role);
    },
    [currentUser]
  );

  const getRoleLabel = useCallback(
    (role: AdminRole, lang: "en" | "hi" = "en"): string => {
      return ROLE_LABELS[role]?.[lang] || role;
    },
    []
  );

  const requestLoginOTP = useCallback(
    async (email: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
      return loginWithOTP(email);
    },
    []
  );

  const verifyOTP = useCallback(
    async (
      email: string,
      otp: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = verifyLoginOTP(email, otp);
      if (result.success && result.user) {
        setCurrentUser(result.user);
      }
      return { success: result.success, error: result.error };
    },
    []
  );

  const logout = useCallback(() => {
    logoutAdmin();
    setCurrentUser(null);
  }, []);

  const inviteUser = useCallback(
    async (
      email: string,
      fullName: string,
      role: AdminRole,
      phone?: string,
      expiryDays?: number,
      sentVia?: "email" | "whatsapp" | "both"
    ): Promise<{ success: boolean; inviteCode?: string; error?: string }> => {
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }
      
      if (!hasPermission(currentUser.role, "manage_users")) {
        return { success: false, error: "Permission denied" };
      }
      
      try {
        const invite = createAdminInvite(
          email,
          fullName,
          role,
          currentUser.id,
          currentUser.email,
          phone,
          expiryDays,
          sentVia
        );
        return { success: true, inviteCode: invite.inviteCode };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create invite",
        };
      }
    },
    [currentUser]
  );

  const changeUserRole = useCallback(
    async (
      userId: string,
      newRole: AdminRole,
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }
      
      if (!hasPermission(currentUser.role, "assign_roles")) {
        return { success: false, error: "Permission denied" };
      }
      
      const result = updateUserRole(
        userId,
        newRole,
        currentUser.id,
        currentUser.email,
        reason
      );
      
      return { success: result.success, error: result.error };
    },
    [currentUser]
  );

  const suspendUserAccess = useCallback(
    async (
      userId: string,
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }
      
      if (!hasPermission(currentUser.role, "manage_users")) {
        return { success: false, error: "Permission denied" };
      }
      
      return suspendUser(userId, currentUser.id, currentUser.email, reason);
    },
    [currentUser]
  );

  const reactivateUserAccess = useCallback(
    async (userId: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }
      
      if (!hasPermission(currentUser.role, "manage_users")) {
        return { success: false, error: "Permission denied" };
      }
      
      return reactivateUser(userId, currentUser.id, currentUser.email);
    },
    [currentUser]
  );

  const setAccessExpiry = useCallback(
    async (
      userId: string,
      expiryDate: Date | null
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }
      
      if (!hasPermission(currentUser.role, "manage_users")) {
        return { success: false, error: "Permission denied" };
      }
      
      return setUserExpiry(userId, expiryDate, currentUser.id, currentUser.email);
    },
    [currentUser]
  );

  const getAllUsers = useCallback((): AdminUser[] => {
    if (!currentUser || !hasPermission(currentUser.role, "manage_users")) {
      return [];
    }
    return getAdminUsers();
  }, [currentUser]);

  const getAllInvites = useCallback(() => {
    if (!currentUser || !hasPermission(currentUser.role, "manage_users")) {
      return [];
    }
    return getAdminInvites();
  }, [currentUser]);

  const getAuditLogs = useCallback(() => {
    if (!currentUser || !hasPermission(currentUser.role, "view_audit_logs")) {
      return [];
    }
    return getRoleChangeAuditLogs();
  }, [currentUser]);

  const setupMainAdmin = useCallback(
    async (
      email: string,
      fullName: string,
      phone?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const admin = initializeMainAdmin(email, fullName, phone);
        setCurrentUser(admin);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to setup Main Admin",
        };
      }
    },
    []
  );

  const isMainAdminSetup = useCallback((): boolean => {
    return hasMainAdmin();
  }, []);

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser && currentUser.status === "active",
    role: currentUser?.role || null,
    
    checkPermission,
    checkAnyPermission,
    canAccessTab: canAccessTabFn,
    getAccessibleTabs: getAccessibleTabsFn,
    maskPII: maskPIIFn,
    getRoleLabel,
    
    requestLoginOTP,
    verifyOTP,
    logout,
    
    inviteUser,
    changeUserRole,
    suspendUserAccess,
    reactivateUserAccess,
    setAccessExpiry,
    
    getAllUsers,
    getAllInvites,
    getAuditLogs,
    
    setupMainAdmin,
    isMainAdminSetup,
    availableRoles: ADMIN_ROLES,
  };
}
