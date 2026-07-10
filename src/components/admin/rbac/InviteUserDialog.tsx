import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { useAdminRBAC } from "@/hooks/useAdminRBAC";
import { ROLE_LABELS, AdminRole, ADMIN_ROLES } from "@/lib/rbac/types";
import { useToast } from "@/hooks/use-toast";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  role: z.enum(ADMIN_ROLES as unknown as [string, ...string[]]),
  expiryDays: z.number().min(1).max(365).optional(),
  sentVia: z.enum(["email", "whatsapp", "both"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { inviteUser, getRoleLabel } = useAdminRBAC();
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      role: "support_agent",
      expiryDays: 7,
      sentVia: "email",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    try {
      const result = await inviteUser(
        data.email,
        data.fullName,
        data.role as AdminRole,
        data.phone || undefined,
        data.expiryDays,
        data.sentVia
      );

      if (result.success) {
        toast({
          title: "Invite Sent",
          description: `Invitation sent to ${data.email}. Code: ${result.inviteCode}`,
        });
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: "Invite Failed",
          description: result.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { currentUser } = useAdminRBAC();
  
  const roleOptions = ADMIN_ROLES.filter((r) => {
    if (r === "main_admin") return false;
    
    if (!currentUser || currentUser.role !== "main_admin") {
      const roleHierarchy: Record<string, number> = {
        main_admin: 100,
        compliance_officer: 80,
        customer_success: 70,
        student_success: 70,
        data_analyst: 60,
        content_expert: 50,
        mentor_trainer: 50,
        support_agent: 30,
      };
      const currentLevel = roleHierarchy[currentUser?.role || ""] || 0;
      const targetLevel = roleHierarchy[r] || 0;
      return targetLevel < currentLevel;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Invite New Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a new admin user with specific role permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      data-testid="input-invite-fullname"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="user@company.com"
                      data-testid="input-invite-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+91 98765 43210"
                      data-testid="input-invite-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-invite-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role, "en")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Expiry (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={365}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 7)
                        }
                        data-testid="input-invite-expiry"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sentVia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Via</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-invite-via">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">
                          <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </span>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp
                          </span>
                        </SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-send-invite"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
