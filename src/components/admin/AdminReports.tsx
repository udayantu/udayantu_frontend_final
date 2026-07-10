import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign, 
  Sparkles, CheckCircle2, Loader2, RefreshCw, FileSpreadsheet
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompiledReport {
  id: string;
  name: string;
  category: "Placement" | "Academics" | "Finance" | "Systems";
  format: "PDF" | "CSV" | "XLSX";
  generated_by: string;
  status: "Ready" | "Generating";
  created_at: string;
  file_size: string;
}

const INITIAL_REPORTS: CompiledReport[] = [
  {
    id: "r1",
    name: "Q2 Placement Outcomes Summary",
    category: "Placement",
    format: "PDF",
    generated_by: "Pradeep K. C.",
    status: "Ready",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    file_size: "2.4 MB"
  },
  {
    id: "r2",
    name: "Student Assessment Readiness Index",
    category: "Academics",
    format: "CSV",
    generated_by: "Pradeep K. C.",
    status: "Ready",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    file_size: "480 KB"
  },
  {
    id: "r3",
    name: "Mentor Sessions Hour Logs & Invoices",
    category: "Finance",
    format: "XLSX",
    generated_by: "Ramesh Prasad",
    status: "Ready",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    file_size: "1.2 MB"
  },
  {
    id: "r4",
    name: "Waitlisted Employers Engagement Log",
    category: "Placement",
    format: "PDF",
    generated_by: "Neha Iyer",
    status: "Ready",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    file_size: "820 KB"
  }
];

export function AdminReports() {
  const [reports, setReports] = useState<CompiledReport[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [compilingId, setCompilingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("udayantu_compiled_reports");
    if (stored) {
      setReports(JSON.parse(stored));
    } else {
      setReports(INITIAL_REPORTS);
      localStorage.setItem("udayantu_compiled_reports", JSON.stringify(INITIAL_REPORTS));
    }
  }, []);

  const handleGenerateReport = (reportName: string, category: CompiledReport["category"], format: CompiledReport["format"]) => {
    const mockId = "r_" + Date.now();
    setCompilingId(reportName);
    
    toast({
      title: "Compiling Report",
      description: `Gathering database logs for ${reportName}...`
    });

    setTimeout(() => {
      const newReport: CompiledReport = {
        id: mockId,
        name: reportName,
        category,
        format,
        generated_by: "Pradeep K. C.",
        status: "Ready",
        created_at: new Date().toISOString(),
        file_size: Math.floor(Math.random() * 3 + 1) + "." + Math.floor(Math.random() * 9) + " MB"
      };

      const updated = [newReport, ...reports];
      setReports(updated);
      localStorage.setItem("udayantu_compiled_reports", JSON.stringify(updated));
      setCompilingId(null);

      toast({
        title: "Report Compiled",
        description: `Your compiled ${format} report is ready for download.`
      });
    }, 1500);
  };

  const getFilteredReports = () => {
    if (activeCategory === "all") return reports;
    return reports.filter(r => r.category === activeCategory);
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "PDF": return "bg-red-50 text-red-700 border-red-200";
      case "CSV": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1E3A63] tracking-tight">Reports & Audit Center</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Compile operational statistics, student outcomes, placement logs, and financial records.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Total Reports Compiled</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">{reports.length + 12}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Active caching enabled</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Average Compile Speed</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">840ms</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">99.8% database queries optimal</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Scheduled Pipelines</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">3 Active</span>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">Weekly email dispatches</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Billed Hours This Month</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">162 hrs</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Mentoring billing verified</span>
        </Card>
      </div>

      {/* Grid containing action card and table log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Quick Actions to trigger reports compilation */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 md:col-span-1 space-y-4">
          <CardTitle className="text-base font-extrabold text-[#1E3A63] flex items-center gap-2 pb-3 border-b border-slate-50">
            <Sparkles className="w-4.5 h-4.5 text-[#FF5A1F]" />
            Generate New Report
          </CardTitle>

          <div className="space-y-3.5 text-xs font-semibold text-slate-600">
            {/* Action Card 1: Student Placement Outcomes */}
            <Card className="border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#1E3A63] block">Placement & Hiring Outcomes</span>
                <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Active job openings, conversion logs, and employer counts.</span>
              </div>
              <Button 
                onClick={() => handleGenerateReport("Hiring & Placements Summary", "Placement", "PDF")}
                disabled={compilingId === "Hiring & Placements Summary"}
                className="mt-3 bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90 text-[10px] font-bold h-8 rounded-xl w-full"
              >
                {compilingId === "Hiring & Placements Summary" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : "Compile PDF Report"}
              </Button>
            </Card>

            {/* Action Card 2: Student Academics / Ranks */}
            <Card className="border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#1E3A63] block">Academics & Readiness Index</span>
                <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Assessment scores, retake attempts, and recommend roles.</span>
              </div>
              <Button 
                onClick={() => handleGenerateReport("Student Assessment Scoresheet", "Academics", "CSV")}
                disabled={compilingId === "Student Assessment Scoresheet"}
                className="mt-3 bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90 text-[10px] font-bold h-8 rounded-xl w-full"
              >
                {compilingId === "Student Assessment Scoresheet" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : "Compile CSV Table"}
              </Button>
            </Card>

            {/* Action Card 3: Session Invoicing / Finance */}
            <Card className="border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#1E3A63] block">Billing & Mentor Session Hours</span>
                <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Sessions completed, total pay rate summaries, and invoices.</span>
              </div>
              <Button 
                onClick={() => handleGenerateReport("Mentor Billing Logs", "Finance", "XLSX")}
                disabled={compilingId === "Mentor Billing Logs"}
                className="mt-3 bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90 text-[10px] font-bold h-8 rounded-xl w-full"
              >
                {compilingId === "Mentor Billing Logs" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : "Compile Excel sheet"}
              </Button>
            </Card>
          </div>
        </Card>

        {/* Right column: Recent compiled list table log */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-base font-extrabold text-[#1E3A63]">Report Compilation History</span>
            
            {/* Category tabs filters */}
            <div className="flex gap-1">
              <Button 
                onClick={() => setActiveCategory("all")}
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                className="text-[10px] font-bold h-7 px-2 rounded-lg"
              >
                All
              </Button>
              <Button 
                onClick={() => setActiveCategory("Placement")}
                variant={activeCategory === "Placement" ? "default" : "outline"}
                size="sm"
                className="text-[10px] font-bold h-7 px-2 rounded-lg"
              >
                Placements
              </Button>
              <Button 
                onClick={() => setActiveCategory("Academics")}
                variant={activeCategory === "Academics" ? "default" : "outline"}
                size="sm"
                className="text-[10px] font-bold h-7 px-2 rounded-lg"
              >
                Academics
              </Button>
              <Button 
                onClick={() => setActiveCategory("Finance")}
                variant={activeCategory === "Finance" ? "default" : "outline"}
                size="sm"
                className="text-[10px] font-bold h-7 px-2 rounded-lg"
              >
                Finance
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Report Name</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Category</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3 text-center">Format</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Size</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Compiled On</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredReports().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8 font-semibold">
                      No compiled reports found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredReports().map(rep => (
                    <TableRow key={rep.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1E3A63]" />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{rep.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block">Requested by: {rep.generated_by}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200/50 hover:bg-inherit shadow-none font-bold text-[9px] px-1.5 py-0.2 rounded-md">
                          {rep.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge className={`text-[9px] font-bold rounded border ${getFormatBadgeColor(rep.format)}`}>
                          {rep.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-semibold text-slate-500">
                        {rep.file_size}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-400 font-semibold">
                        {new Date(rep.created_at).toLocaleString("en-IN", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            toast({
                              title: "Downloading report",
                              description: `Retrieving file payload: ${rep.name}.${rep.format.toLowerCase()}`
                            });
                          }}
                          className="h-7 w-7 text-[#1E3A63] hover:bg-slate-100 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
