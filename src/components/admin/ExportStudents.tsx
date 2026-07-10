import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ExportStudents() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("student_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Full Name",
        "Email",
        "Phone",
        "WhatsApp",
        "Desired Role",
        "Recommended Role",
        "Final Role",
        "Payment Status",
        "Status",
        "State",
        "District",
        "Created At"
      ];

      const csvContent = [
        headers.join(","),
        ...data.map(student => [
          `"${student.full_name || ''}"`,
          `"${student.email || ''}"`,
          `"${student.phone || ''}"`,
          `"${student.whatsapp || ''}"`,
          `"${student.desired_role || ''}"`,
          `"${student.role_recommendation || ''}"`,
          `"${student.final_role || ''}"`,
          `"${student.payment_status || ''}"`,
          `"${student.status || ''}"`,
          `"${student.state || ''}"`,
          `"${student.district || ''}"`,
          `"${new Date(student.created_at).toLocaleString()}"`
        ].join(","))
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} students to CSV`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export students";
      toast({
        title: "Export Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={exportToCSV} disabled={exporting} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : "Export to CSV"}
    </Button>
  );
}
