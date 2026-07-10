import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ExportEmployers() {
  const { toast } = useToast();

  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase
        .from("employers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No employer data available to export",
          variant: "destructive",
        });
        return;
      }

      // Create CSV headers
      const headers = [
        "Company Name",
        "Contact Name",
        "Email",
        "Phone",
        "Designation",
        "Roles Needed",
        "Cohort Size",
        "Hiring Timeline",
        "Tools Stack",
        "Notes",
        "Registered Date"
      ];

      // Create CSV rows
      const rows = data.map((employer) => [
        employer.company_name,
        employer.contact_name,
        employer.email,
        employer.phone,
        employer.designation || "",
        Array.isArray(employer.roles_needed) ? employer.roles_needed.join("; ") : "",
        employer.cohort_size_estimate || "",
        employer.hiring_timeline || "",
        employer.tools_stack || "",
        employer.notes || "",
        new Date(employer.created_at || "").toLocaleDateString(),
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `employers_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} employer records`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export employers";
      toast({
        title: "Export Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
