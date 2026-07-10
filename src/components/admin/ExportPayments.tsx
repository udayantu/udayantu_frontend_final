import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ExportPayments() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Order ID",
        "Payment ID",
        "Amount (INR)",
        "Currency",
        "Status",
        "Method",
        "Base Amount",
        "GST %",
        "GST Amount",
        "Final Amount",
        "Created At"
      ];

      const csvContent = [
        headers.join(","),
        ...data.map(payment => [
          `"${payment.razorpay_order_id || ''}"`,
          `"${payment.razorpay_payment_id || ''}"`,
          payment.amount / 100,
          `"${payment.currency || ''}"`,
          `"${payment.status || ''}"`,
          `"${payment.method || ''}"`,
          payment.amount_base_inr || 0,
          payment.gst_percent || 0,
          payment.gst_amount_inr || 0,
          payment.amount_final_inr || 0,
          `"${new Date(payment.created_at).toLocaleString()}"`
        ].join(","))
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} payment records to CSV`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export payments";
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
