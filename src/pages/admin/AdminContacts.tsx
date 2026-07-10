import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Mail, Phone, MapPin, MessageSquare, Users, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllContacts, type ContactSubmission as Contact } from "@/lib/contact-storage";

export default function AdminContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getAllContacts();
      setContacts(data || []);
    } catch (error: any) {
      console.error("Failed to load contacts:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVExport = () => {
    try {
      const headers = ["ID", "Name", "Mobile", "Email", "Role", "City", "Note", "Submitted Date"];
      const rows = filteredContacts.map((contact) => [
        contact.id,
        contact.full_name,
        contact.mobile_number,
        contact.email,
        contact.role,
        contact.city || "",
        contact.note || "",
        new Date(contact.created_at).toLocaleString(),
      ]);

      let csv = headers.join(",") + "\n";
      rows.forEach((row) => {
        csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contact-submissions-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${filteredContacts.length} contacts to CSV`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesEmail = contact.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesRole = filterRole === "all" || contact.role === filterRole;
    return matchesEmail && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Contact Submissions</h1>
        <p className="text-muted-foreground">Manage and view all contact form submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Total Submissions</div>
          <div className="text-3xl font-bold text-foreground">{contacts.length}</div>
        </Card>
        <Card className="p-4 border-secondary/20">
          <div className="text-sm text-muted-foreground mb-1">Students</div>
          <div className="text-3xl font-bold text-foreground">{contacts.filter((c) => c.role === "student").length}</div>
        </Card>
        <Card className="p-4 border-accent/20">
          <div className="text-sm text-muted-foreground mb-1">Employers</div>
          <div className="text-3xl font-bold text-foreground">{contacts.filter((c) => c.role === "employer").length}</div>
        </Card>
        <Card className="p-4 border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Others</div>
          <div className="text-3xl font-bold text-foreground">{contacts.filter((c) => c.role !== "student" && c.role !== "employer").length}</div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-foreground mb-2">Search by Email</label>
            <Input
              placeholder="Search email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="border-primary/20"
              data-testid="input-search-email"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-foreground mb-2">Filter by Role</label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="border-primary/20" data-testid="select-filter-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchContacts}
              variant="outline"
              size="icon"
              data-testid="button-refresh"
              title="Refresh submissions"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCSVExport}
              className="bg-primary hover:bg-primary/90 gap-2"
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {contacts.length === 0 ? "No contact submissions yet" : "No submissions match your filters"}
            </p>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="p-6 border-primary/20 hover:border-primary/40 transition-all duration-300"
              data-testid={`card-contact-${contact.id}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Name</p>
                    <p className="text-lg font-semibold text-foreground" data-testid={`text-name-${contact.id}`}>{contact.full_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline break-all"
                      data-testid={`link-email-${contact.id}`}
                    >
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-secondary" />
                    <a
                      href={`https://wa.me/91${contact.mobile_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                      data-testid={`link-whatsapp-${contact.id}`}
                    >
                      +91 {contact.mobile_number}
                    </a>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Role</p>
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20" data-testid={`badge-role-${contact.id}`}>
                        <span className="text-sm font-semibold text-primary capitalize">{contact.role}</span>
                      </div>
                    </div>
                    {contact.city && (
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">City</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20" data-testid={`badge-city-${contact.id}`}>
                          <MapPin className="w-3 h-3 text-secondary" />
                          <span className="text-sm font-semibold text-secondary">{contact.city}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Submitted</p>
                    <p className="text-sm text-foreground" data-testid={`text-date-${contact.id}`}>
                      {new Date(contact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              {contact.note && (
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex gap-2">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Message</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`text-message-${contact.id}`}>{contact.note}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Results summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredContacts.length} of {contacts.length} total submissions
      </div>
    </div>
  );
}
