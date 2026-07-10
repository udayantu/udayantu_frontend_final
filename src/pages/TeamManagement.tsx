import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { getTeamMembers, createTeamInvite, removeTeamMember, getPendingInvites } from "@/lib/employerTeamStorage";
import { Users, Mail, Send, Trash2, Clock, CheckCircle2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeamManagement = () => {
  const navigate = useNavigate();
  const { session, logout, checkPermission } = useEmployerAuth();
  const { toast } = useToast();

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "recruiter" | "interviewer">("recruiter");
  const [inviteMethod, setInviteMethod] = useState<"email" | "whatsapp">("email");
  const [isInviting, setIsInviting] = useState(false);
  
  // Data
  const [teamMembers] = useState(getTeamMembers(session?.id || ""));
  const [pendingInvites] = useState(getPendingInvites(session?.id || ""));

  const t = {
    team: "Team Management",
    teamDesc: "Manage your team members and permissions",
    members: "Active Members",
    pendingTab: "Pending Invitations",
    invite: "Invite New Member",
    inviteEmail: "Email Address",
    invitePhone: "WhatsApp Phone Number",
    selectRole: "Select Role",
    admin: "Admin",
    recruiter: "Recruiter",
    interviewer: "Interviewer",
    sendInvite: "Send Invitation",
    email: "Email",
    phone: "Phone",
    role: "Role",
    status: "Status",
    actions: "Actions",
    active: "Active",
    pendingStatus: "Pending",
    remove: "Remove",
    noMembers: "No team members yet",
    noPending: "No pending invitations",
    inviteSent: "Invitation sent successfully",
    inviteFailed: "Failed to send invitation",
    memberRemoved: "Member removed successfully",
    logout: "Logout",
    roleInfo: "Admins manage team & access. Recruiters manage jobs and candidates. Interviewers provide feedback only.",
    viaEmail: "Via Email",
    viaWhatsApp: "Via WhatsApp",
  };

  // Redirect if not admin
  if (!session || !checkPermission("manage_team")) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
          <div className="max-w-md mx-auto text-center mt-20">
            <Card className="p-8 border">
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground mb-6">Only Admins can manage team members.</p>
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

  const handleInvite = async () => {
    const contactValue = inviteMethod === "email" ? inviteEmail : invitePhone;
    if (!contactValue.trim()) {
      toast({ 
        title: "Error", 
        description: `Please enter ${inviteMethod === "email" ? "an email address" : "a phone number"}`, 
        variant: "destructive" 
      });
      return;
    }

    setIsInviting(true);
    try {
      createTeamInvite(contactValue, session.id, inviteRole as any, session.email);
      
      // Simulate sending via WhatsApp or Email
      if (inviteMethod === "whatsapp") {
        const message = `Hi! You're invited to join ${session.companyName} as a ${inviteRole}. Accept your invitation here: ${window.location.origin}/team-invite/token`;
        const whatsappUrl = `https://wa.me/${contactValue.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(message)}`;
        console.log("WhatsApp invite URL:", whatsappUrl);
      }
      
      toast({ title: "Success", description: t.inviteSent });
      setInviteEmail("");
      setInvitePhone("");
      setInviteRole("recruiter");
      setInviteMethod("email");
    } catch (error) {
      toast({ title: "Error", description: t.inviteFailed, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure? This user will lose access immediately.")) {
      removeTeamMember(session.id, memberId);
      toast({ title: "Success", description: t.memberRemoved });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/employers");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{t.team}</h1>
              </div>
              <p className="text-muted-foreground">{t.teamDesc}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleLogout} variant="outline" className="gap-2" data-testid="button-logout">
                <LogOut className="w-4 h-4" />
                {t.logout}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="members">
                {t.members} ({teamMembers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t.pendingTab} ({pendingInvites.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <Card className="p-6 border">
                <h2 className="text-xl font-bold text-foreground mb-4">{t.members}</h2>
                {teamMembers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t.noMembers}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-semibold text-foreground">{t.email}</th>
                          <th className="text-left p-3 font-semibold text-foreground">{t.role}</th>
                          <th className="text-left p-3 font-semibold text-foreground">{t.status}</th>
                          <th className="text-right p-3 font-semibold text-foreground">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-3">{member.email}</td>
                            <td className="p-3">
                              <Badge variant="secondary" className="capitalize">
                                {member.role === "recruiter" ? t.recruiter : t.interviewer}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">
                                {member.status === "active" ? t.active : t.pendingStatus}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                data-testid={`button-remove-${member.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Pending Invites Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card className="p-6 border">
                <h2 className="text-xl font-bold text-foreground mb-4">{t.pendingTab}</h2>
                {pendingInvites.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t.noPending}</p>
                ) : (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{invite.email}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            Expires in{" "}
                            {Math.round((invite.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {invite.role === "recruiter" ? t.recruiter : t.interviewer}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Invite New Member */}
          <Card className="p-6 border mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-secondary" />
              {t.invite}
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t.roleInfo}</p>

              {/* Invite Method Toggle */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Invitation Method</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInviteMethod("email")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      inviteMethod === "email"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                    disabled={isInviting}
                  >
                    {t.viaEmail}
                  </button>
                  <button
                    onClick={() => setInviteMethod("whatsapp")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      inviteMethod === "whatsapp"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                    disabled={isInviting}
                  >
                    {t.viaWhatsApp}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    {inviteMethod === "email" ? t.inviteEmail : t.invitePhone}
                  </Label>
                  {inviteMethod === "email" ? (
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-background border-border"
                      data-testid="input-invite-email"
                      disabled={isInviting}
                    />
                  ) : (
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className="bg-background border-border"
                      data-testid="input-invite-phone"
                      disabled={isInviting}
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">{t.selectRole}</Label>
                  <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as "admin" | "recruiter" | "interviewer")}>
                    <SelectTrigger className="bg-background border-border" data-testid="select-invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t.admin}</SelectItem>
                      <SelectItem value="recruiter">{t.recruiter}</SelectItem>
                      <SelectItem value="interviewer">{t.interviewer}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting}
                    className="w-full bg-secondary hover:bg-secondary/90"
                    data-testid="button-send-invite"
                  >
                    {isInviting ? "Sending..." : t.sendInvite}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeamManagement;
