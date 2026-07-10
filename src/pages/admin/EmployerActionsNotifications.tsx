import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmployerAction {
  id: string;
  employer_id: string;
  recruiter_name: string;
  recruiter_email: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_whatsapp?: string;
  action_type: "shortlist" | "schedule" | "reject";
  reason?: string;
  status: "pending" | "contacted" | "completed";
  created_at: string;
}

export const EmployerActionsNotifications = () => {
  const [actions, setActions] = useState<EmployerAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<EmployerAction | null>(
    null
  );
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">(
    "email"
  );
  const [contactMessage, setContactMessage] = useState("");
  const [isContacting, setIsContacting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setIsLoading(true);
    try {
      // Fetch recruiter actions (type-safe with any for unmapped tables)
      const { data: recruiterActions, error: actionsError } = await supabase
        .from("recruiter_actions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (actionsError) throw actionsError;

      // Fetch student details for each action
      const enrichedActions = await Promise.all(
        (recruiterActions || []).map(async (action: any) => {
          const { data: student } = await supabase
            .from("student_registrations")
            .select("full_name, email, phone, whatsapp")
            .eq("user_id", action.student_id)
            .single();

          return {
            ...action,
            student_name: student?.full_name,
            student_email: student?.email,
            student_phone: student?.phone,
            student_whatsapp: student?.whatsapp,
            status: "pending", // Default status
          } as EmployerAction;
        })
      );

      setActions(enrichedActions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load employer actions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async () => {
    if (!selectedAction) return;

    setIsContacting(true);
    try {
      // Simulate sending notification (in real app, this would trigger email/WhatsApp)
      console.log(
        `[NOTIFICATION] Contacting ${selectedAction.student_name} via ${contactMethod}`
      );
      console.log(`Message: ${contactMessage}`);

      // Update action status (type-safe with any for unmapped tables)
      const { error } = await supabase
        .from("recruiter_actions" as any)
        .update({ reason: contactMessage })
        .eq("id", selectedAction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student will be contacted via ${contactMethod}`,
      });

      setSelectedAction(null);
      setContactMessage("");
      loadActions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to contact student",
        variant: "destructive",
      });
    } finally {
      setIsContacting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "shortlist":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "schedule":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "reject":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "shortlist":
        return "Shortlisted";
      case "schedule":
        return "Interview Scheduled";
      case "reject":
        return "Rejected";
      default:
        return action;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-semibold mb-2">
          No employer actions yet
        </p>
        <p className="text-sm text-muted-foreground">
          Notifications will appear here when employers take actions on
          candidates
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Employer Actions & Notifications
      </h2>

      <div className="space-y-4">
        {actions.map((action) => (
          <Card key={action.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getActionIcon(action.action_type)}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {action.student_name || "Unknown Student"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.recruiter_name} from employer -{" "}
                      {action.recruiter_email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Student Email
                    </p>
                    <p className="text-sm font-medium">
                      {action.student_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Student Phone
                    </p>
                    <p className="text-sm font-medium">
                      {action.student_phone || "N/A"}
                    </p>
                  </div>
                </div>

                {action.reason && (
                  <div className="mb-3 p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground mb-1">
                      Recruiter Notes
                    </p>
                    <p className="text-sm text-foreground">{action.reason}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getActionLabel(action.action_type)}</Badge>
                  <Badge variant="outline">
                    {new Date(action.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => setSelectedAction(action)}
                size="sm"
                data-testid={`button-contact-${action.student_id}`}
              >
                Contact Student
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Contact Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Student</DialogTitle>
            <DialogDescription>
              Notify {selectedAction?.student_name} about the{" "}
              {selectedAction?.action_type} action
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Contact Method
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={contactMethod === "email" ? "default" : "outline"}
                  onClick={() => setContactMethod("email")}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  variant={
                    contactMethod === "whatsapp" ? "default" : "outline"
                  }
                  onClick={() => setContactMethod("whatsapp")}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message Template</Label>
              <Textarea
                id="message"
                placeholder={
                  contactMethod === "email"
                    ? "Dear Student, You have been shortlisted by our employer partner..."
                    : "Hi! You have been shortlisted by our employer partner..."
                }
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {contactMethod === "email"
                ? `Email will be sent to: ${selectedAction?.student_email}`
                : `WhatsApp will be sent to: ${selectedAction?.student_whatsapp || selectedAction?.student_phone}`}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContact}
                disabled={isContacting || !contactMessage.trim()}
                data-testid="button-send-notification"
              >
                {isContacting ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
