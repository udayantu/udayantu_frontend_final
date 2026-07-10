import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  ShieldOff,
  RefreshCw,
  Calendar,
  Laptop,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
import { useAdminRBAC } from "@/hooks/useAdminRBAC";
import { AdminUser, AdminRole, ADMIN_ROLES, ROLE_LABELS } from "@/lib/rbac/types";
import { InviteUserDialog } from "./InviteUserDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  suspended: {
    label: "Suspended",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showExpiryDialog, setShowExpiryDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<AdminRole | "">("");
  const [roleReason, setRoleReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentUser,
    getAllUsers,
    changeUserRole,
    suspendUserAccess,
    reactivateUserAccess,
    setAccessExpiry,
    getRoleLabel,
    checkPermission,
  } = useAdminRBAC();
  const { toast } = useToast();

  const canManageUsers = checkPermission("manage_users");
  const canAssignRoles = checkPermission("assign_roles");

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole || !roleReason.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await changeUserRole(selectedUser.id, newRole as AdminRole, roleReason);
      if (result.success) {
        toast({
          title: "Role Updated",
          description: `${selectedUser.fullName}'s role changed to ${getRoleLabel(newRole as AdminRole)}`,
        });
        loadUsers();
        setShowRoleDialog(false);
        setSelectedUser(null);
        setNewRole("");
        setRoleReason("");
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await suspendUserAccess(selectedUser.id, suspendReason);
      if (result.success) {
        toast({
          title: "User Suspended",
          description: `${selectedUser.fullName}'s access has been suspended`,
        });
        loadUsers();
        setShowSuspendDialog(false);
        setSelectedUser(null);
        setSuspendReason("");
      } else {
        toast({
          title: "Suspension Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async (user: AdminUser) => {
    const result = await reactivateUserAccess(user.id);
    if (result.success) {
      toast({
        title: "User Reactivated",
        description: `${user.fullName}'s access has been restored`,
      });
      loadUsers();
    } else {
      toast({
        title: "Reactivation Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleSetExpiry = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const date = expiryDate ? new Date(expiryDate) : null;
      const result = await setAccessExpiry(selectedUser.id, date);
      if (result.success) {
        toast({
          title: "Expiry Updated",
          description: date
            ? `Access expires on ${format(date, "PPP")}`
            : "Access expiry removed",
        });
        loadUsers();
        setShowExpiryDialog(false);
        setSelectedUser(null);
        setExpiryDate("");
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = ADMIN_ROLES.filter((r) => r !== "main_admin");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage admin users and their roles
            </p>
          </div>
          {canManageUsers && (
            <Button
              onClick={() => setShowInviteDialog(true)}
              data-testid="button-invite-user"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              {canManageUsers && (
                <Button
                  variant="link"
                  onClick={() => setShowInviteDialog(true)}
                  className="mt-2"
                >
                  Invite your first team member
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const statusConfig = STATUS_CONFIG[user.status];
                    const StatusIcon = statusConfig.icon;
                    const isCurrentUser = currentUser?.id === user.id;

                    return (
                      <TableRow
                        key={user.id}
                        data-testid={`row-user-${user.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {user.fullName}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Shield className="w-3 h-3 mr-1" />
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <span className="text-sm">
                              {format(new Date(user.lastLoginAt), "PP")}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Never
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Laptop className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {user.deviceTrust.filter((d) => d.isActive).length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {canManageUsers && !isCurrentUser && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-testid={`button-user-actions-${user.id}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {canAssignRoles && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setNewRole(user.role);
                                      setShowRoleDialog(true);
                                    }}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setExpiryDate(user.expiresAt?.split("T")[0] || "");
                                    setShowExpiryDialog(true);
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Set Access Expiry
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowSuspendDialog(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Suspend Access
                                  </DropdownMenuItem>
                                ) : user.status === "suspended" ? (
                                  <DropdownMenuItem
                                    onClick={() => handleReactivate(user)}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reactivate
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={loadUsers}
      />

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.fullName}. This action will be
              logged in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as AdminRole)}
              >
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason for Change *</Label>
              <Textarea
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                placeholder="Provide a reason for this role change..."
                data-testid="textarea-role-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={!newRole || !roleReason.trim() || isSubmitting}
              data-testid="button-confirm-role-change"
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User Access</DialogTitle>
            <DialogDescription>
              Suspend {selectedUser?.fullName}'s access to the admin panel. They
              will not be able to log in until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Suspension *</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Provide a reason for suspending this user..."
                data-testid="textarea-suspend-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim() || isSubmitting}
              data-testid="button-confirm-suspend"
            >
              Suspend Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Access Expiry</DialogTitle>
            <DialogDescription>
              Set an expiration date for {selectedUser?.fullName}'s access.
              Leave empty to remove expiry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                data-testid="input-expiry-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExpiryDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetExpiry}
              disabled={isSubmitting}
              data-testid="button-confirm-expiry"
            >
              {expiryDate ? "Set Expiry" : "Remove Expiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
