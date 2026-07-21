import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Search, TrendingUp, Users, Calendar, Plus, 
  Briefcase, Trophy, UserPlus, Download, Upload, Eye, 
  Edit2, Trash2, MoreVertical, ShieldAlert, CheckCircle, 
  Mail, Phone, MapPin, Check, SlidersHorizontal, ChevronDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "./shared/PaginationControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Employer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  designation: string;
  roles_needed: string[];
  hiring_timeline: string;
  cohort_size_estimate: number;
  status?: "Active" | "Inactive" | "Pending";
  created_at: string;
}

interface AnalyticsStats {
  total: number;
  active: number;
  newThisWeek: number;
  openPositions: number;
  placementsThisMonth: number;
}

const ITEMS_PER_PAGE = 5;

const parseEmployer = (employer: any): Employer => ({
  id: employer.id,
  company_name: employer.company_name || "",
  contact_name: employer.contact_name || "",
  email: employer.email || "",
  phone: employer.phone || "",
  designation: employer.designation || "",
  roles_needed: employer.roles_needed || [],
  hiring_timeline: employer.hiring_timeline || "",
  cohort_size_estimate: employer.cohort_size_estimate || 0,
  status: employer.status || "Pending",
  created_at: employer.created_at || new Date().toISOString(),
});

export function AdminEmployers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [stats, setStats] = useState<AnalyticsStats>({
    total: 0,
    active: 0,
    newThisWeek: 0,
    openPositions: 0,
    placementsThisMonth: 0
  });

  // Modal dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [hiringTimeline, setHiringTimeline] = useState("Immediate (Within 30 Days)");
  const [cohortSize, setCohortSize] = useState("10");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending">("Active");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchEmployers = async () => {
    setLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      let query = supabase
        .from("employers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const results = (data || []).map(parseEmployer);

      setTotalCount(count || 0);
      setEmployers(results.slice(from, to + 1));
      setFilteredEmployers(results.slice(from, to + 1));

      // Fetch stats separately
      const [allData, weekData] = await Promise.all([
        supabase.from("employers").select("cohort_size_estimate, status, created_at"),
        supabase.from("employers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      ]);

      const all = allData.data || [];
      const totalEmp = count || 0;
      const activeEmp = all.filter(e => e.status === "Active").length;
      const newThisWeekCount = weekData.count || 0;
      const totalOpenings = all.reduce((acc, e) => acc + (e.cohort_size_estimate || 0), 0);

      setStats({
        total: totalEmp,
        active: activeEmp,
        newThisWeek: newThisWeekCount,
        openPositions: totalOpenings,
        placementsThisMonth: Math.round(totalOpenings * 0.15)
      });

    } catch (e) {
      console.warn("Could not query employers from database.");
      setEmployers([]);
      setFilteredEmployers([]);
      setTotalCount(0);
      setStats({ total: 0, active: 0, newThisWeek: 0, openPositions: 0, placementsThisMonth: 0 });
    } finally {
      setLoading(false);
    }
  };

  const resetFormFields = () => {
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setDesignation("");
    setRolesNeeded("");
    setHiringTimeline("Immediate (Within 30 Days)");
    setCohortSize("10");
    setStatus("Active");
  };

  const handleOpenAddModal = () => {
    resetFormFields();
    setIsAddOpen(true);
  };

  const handleOpenEditModal = (employer: Employer) => {
    setSelectedEmployer(employer);
    setCompanyName(employer.company_name || "");
    setContactName(employer.contact_name || "");
    setEmail(employer.email || "");
    setPhone(employer.phone || "");
    setDesignation(employer.designation || "");
    setRolesNeeded((employer.roles_needed || []).join(", "));
    setHiringTimeline(employer.hiring_timeline || "Immediate (Within 30 Days)");
    setCohortSize(String(employer.cohort_size_estimate || "10"));
    setStatus(employer.status || "Active");
    setIsEditOpen(true);
  };

  const handleOpenViewModal = (employer: Employer) => {
    setSelectedEmployer(employer);
    setIsViewOpen(true);
  };

  const handleAddEmployer = async () => {
    if (!companyName || !contactName || !email || !phone) {
      toast({
        title: "Missing fields",
        description: "Please fill out company name, contact, email, and phone.",
        variant: "destructive"
      });
      return;
    }

    try {
      const rolesArray = rolesNeeded ? rolesNeeded.split(",").map(r => r.trim()).filter(Boolean) : [];
      const { error } = await supabase.from("employers").insert([{
        company_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        designation: designation,
        cohort_size_estimate: parseInt(cohortSize) || 10,
        hiring_timeline: hiringTimeline,
        roles_needed: rolesArray,
        status: status,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${companyName} added successfully.`,
      });

      setIsAddOpen(false);
      resetFormFields();
      fetchEmployers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not add employer record.",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployer = async () => {
    if (!selectedEmployer) return;
    if (!companyName || !contactName || !email || !phone) {
      toast({
        title: "Missing fields",
        description: "Please populate required company/contact parameters.",
        variant: "destructive"
      });
      return;
    }

    try {
      const rolesArray = rolesNeeded ? rolesNeeded.split(",").map(r => r.trim()).filter(Boolean) : [];
      const { error } = await supabase.from("employers").update({
        company_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        designation: designation,
        cohort_size_estimate: parseInt(cohortSize) || 10,
        hiring_timeline: hiringTimeline,
        roles_needed: rolesArray,
        status: status,
      }).eq("id", selectedEmployer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employer details updated successfully.",
      });

      setIsEditOpen(false);
      setSelectedEmployer(null);
      resetFormFields();
      fetchEmployers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not update employer record.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employer?")) return;

    try {
      const { error } = await supabase.from("employers").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Employer removed successfully.",
      });

      fetchEmployers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to remove employer.",
        variant: "destructive"
      });
    }
  };

  // Export filtered list to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "Company Name", "Contact Person", "Contact Email", "Contact Phone",
        "Designation", "Roles Needed", "Hiring Timeline", "Cohort Size", "Status", "Registered Date"
      ];

      const rows = filteredEmployers.map(e => [
        e.company_name, e.contact_name, e.email, e.phone,
        e.designation || "", (e.roles_needed || []).join(" | "),
        e.hiring_timeline || "", e.cohort_size_estimate || "",
        e.status || "", new Date(e.created_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `employer_directory_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Exported ${filteredEmployers.length} records.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Could not download CSV file.",
        variant: "destructive"
      });
    }
  };

  // CSV Import handler (format: Company Name, Contact, Email, Phone, Designation, Roles, Timeline, Cohort Size, Status)
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error("CSV has no data rows");

        const dbList: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          if (cells.length < 4) continue;

          const statusVal = cells[8] || "Active";
          dbList.push({
            company_name: cells[0],
            contact_name: cells[1],
            email: cells[2],
            phone: cells[3],
            designation: cells[4] || "",
            roles_needed: cells[5] ? cells[5].split("|").map(r => r.trim()) : [],
            hiring_timeline: cells[6] || "Immediate (Within 30 Days)",
            cohort_size_estimate: parseInt(cells[7]) || 10,
            status: ["Active", "Inactive", "Pending"].includes(statusVal) ? statusVal : "Active",
          });
        }

        if (dbList.length === 0) throw new Error("No valid rows could be imported.");

        const { error } = await supabase.from("employers").insert(dbList);
        if (error) throw error;

        toast({
          title: "Import Success",
          description: `Successfully imported ${dbList.length} employer records.`,
        });

        fetchEmployers();
      } catch (err: any) {
        toast({
          title: "Import Failed",
          description: err.message || "Invalid CSV layout structure.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerCSVSelect = () => {
    fileInputRef.current?.click();
  };

  const getCompanyColor = (companyName: string) => {
    const hash = companyName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ["bg-red-50 text-red-600 border-red-100", "bg-blue-50 text-blue-600 border-blue-100", "bg-emerald-50 text-emerald-600 border-emerald-100", "bg-purple-50 text-purple-600 border-purple-100", "bg-amber-50 text-amber-600 border-amber-100"];
    return colors[hash % colors.length];
  };

  const getIndustryBadgeColor = (industryName: string) => {
    switch (industryName) {
      case "IT Services":
        return "bg-[#EBF3FF] text-[#1E56B3] border-[#D0E2FF]/60";
      case "Banking":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Consulting":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Dynamic metrics calculation
  const topHirers = [...employers]
    .filter(e => (e.cohort_size_estimate || 0) > 0)
    .sort((a, b) => (b.cohort_size_estimate || 0) - (a.cohort_size_estimate || 0))
    .slice(0, 3);

  // Roles distribution calculations
  const totalWithRoles = employers.length || 1;
  const rolesStats = employers.reduce((acc, e) => {
    const roleList = e.roles_needed || [];
    const role = roleList.length > 0 ? roleList[0] : "Others";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedRoles = Object.entries(rolesStats)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalWithRoles) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const roleColorMap: Record<string, string> = {
    "Business Development": "#3B82F6",
    "Customer Success": "#10B981",
    "Project Management": "#F59E0B",
    "Operations Management": "#8B5CF6",
    "Others": "#64748B",
  };

  // Registration trends coordinates
  const nowTime = new Date().getTime();
  const intervals = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(nowTime - (4 - i) * 7 * 24 * 60 * 60 * 1000);
    return {
      label: d.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
      count: employers.filter(e => new Date(e.created_at) <= d).length
    };
  });

  const maxVal = Math.max(1, ...intervals.map(i => i.count));
  const points = intervals.map((interval, i) => {
    const x = 20 + i * 65;
    const y = 100 - (interval.count / maxVal) * 70;
    return `${x},${y}`;
  }).join(" ");

  const fillPoints = `20,100 ${points} 280,100`;

  let cumulativePercent = 0;
  const roleCircles = sortedRoles.slice(0, 4).map((role) => {
    const color = roleColorMap[role.name] || "#64748B";
    const dashArray = `${(role.percentage / 100) * 376.99} 376.99`;
    const dashOffset = `-${(cumulativePercent / 100) * 376.99}`;
    cumulativePercent += role.percentage;
    return {
      name: role.name,
      percentage: role.percentage,
      color,
      dashArray,
      dashOffset
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top row header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1E3A63] tracking-tight">Employers Management</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage and track employer relationships, job openings, and placement partnerships.
          </p>
        </div>
        
        <div className="flex items-center gap-3.5">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-bold px-3 py-1 flex items-center gap-1.5 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </Badge>
          <Button 
            onClick={handleOpenAddModal}
            className="bg-[#1E3A63] hover:bg-[#1E3A63]/90 text-white font-semibold text-xs gap-1.5 py-2 px-4 shadow-sm rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add Employer
          </Button>
        </div>
      </div>

      {/* 5 Stats Cards row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {/* Card 1 */}
        <Card className="shadow-sm border-slate-100 rounded-2xl relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-[#5B759E] uppercase tracking-wider">Total Employers</span>
            <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-[#1E56B3]" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4 pt-1">
            <div className="text-2xl font-extrabold text-[#1E3A63]">{stats.total}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">All-time registrations</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 12% vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-sm border-slate-100 rounded-2xl relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-[#5B759E] uppercase tracking-wider">Active Employers</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4 pt-1">
            <div className="text-2xl font-extrabold text-[#1E3A63]">{stats.active}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Currently hiring</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 8% vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="shadow-sm border-slate-100 rounded-2xl relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-[#5B759E] uppercase tracking-wider">New This Week</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <UserPlus className="h-4.5 w-4.5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4 pt-1">
            <div className="text-2xl font-extrabold text-[#1E3A63]">{stats.newThisWeek}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">New registrations</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 20% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="shadow-sm border-slate-100 rounded-2xl relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-[#5B759E] uppercase tracking-wider">Open Positions</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4 pt-1">
            <div className="text-2xl font-extrabold text-[#1E3A63]">{stats.openPositions}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Across all employers</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 18% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5 */}
        <Card className="shadow-sm border-slate-100 rounded-2xl relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-[#5B759E] uppercase tracking-wider">Placements This Month</span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4 pt-1">
            <div className="text-2xl font-extrabold text-[#1E3A63]">{stats.placementsThisMonth}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Through employer network</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 24% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory Table and Search controls Card */}
      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold text-[#1E3A63]">Employer Directory</CardTitle>
              <Badge className="bg-[#EBF3FF] text-[#1E56B3] hover:bg-[#EBF3FF] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#D0E2FF]/60 select-none">
                {totalCount} {statusFilter === "Pending" ? "Waitlisted" : "Total"}
              </Badge>
            </div>
            
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Partners
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter("Active"); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "Active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter("Pending"); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "Pending" ? "bg-white text-[#EA580C] shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Waitlist (Pending)
              </button>
            </div>
            
            {/* Export & Import actions */}
            <div className="flex items-center gap-2.5">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
                accept=".csv" 
                className="hidden" 
              />
              <Button 
                onClick={handleExportCSV}
                variant="outline" 
                size="sm" 
                className="text-xs font-bold text-slate-600 border-slate-200 gap-1.5 h-9 rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
              <Button 
                onClick={triggerCSVSelect}
                variant="outline" 
                size="sm" 
                className="text-xs font-bold text-slate-600 border-slate-200 gap-1.5 h-9 rounded-xl shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </Button>
            </div>
          </div>

          {/* Controls filtering row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4 pt-1">
            {/* Search field */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by company, contact, email, or keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs font-semibold text-slate-600 h-9 border-slate-200 rounded-xl"
              />
            </div>
               {/* Status Filter dropdown */}
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs font-bold text-slate-600 border-slate-200 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E56B3]" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 pl-6">Company</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Contact</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Designation</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Roles Needed</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 text-center">Cohort Size</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 text-center">Status</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Registered</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 text-center pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-slate-400 font-semibold py-12">
                          No employers found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployers.map((emp) => {
                        const avatarClass = getCompanyColor(emp.company_name);
                        return (
                          <TableRow key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                            {/* Company Logo + details */}
                            <TableCell className="py-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs uppercase select-none ${avatarClass}`}>
                                  {emp.company_name.substring(0, 2)}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-[#1E3A63] block leading-tight">{emp.company_name}</span>
                                  <span className="text-xs text-slate-500 font-medium block">{emp.hiring_timeline || "Immediate"}</span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Contact Demographics */}
                            <TableCell className="py-4">
                              <div className="space-y-0.5 text-xs font-semibold text-slate-600">
                                <p className="text-slate-800 font-bold leading-tight">{emp.contact_name}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{emp.email}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">+91 {emp.phone}</p>
                              </div>
                            </TableCell>

                            {/* Designation */}
                            <TableCell className="py-4">
                              <span className="text-sm font-semibold text-slate-700">{emp.designation || "-"}</span>
                            </TableCell>

                            {/* Roles Needed */}
                            <TableCell className="py-4">
                              <span className="text-xs font-semibold text-slate-700 line-clamp-1">{(emp.roles_needed || []).slice(0, 2).join(", ") || "-"}</span>
                            </TableCell>

                            {/* Cohort Size */}
                            <TableCell className="py-4 text-center">
                              <span className="text-sm font-black text-[#1E3A63]">{emp.cohort_size_estimate || "0"}</span>
                            </TableCell>

                            {/* Status Bullet */}
                            <TableCell className="py-4 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  emp.status === "Active" ? "bg-emerald-500" : emp.status === "Inactive" ? "bg-slate-300" : "bg-amber-400 animate-pulse"
                                }`}></span>
                                <span className={`text-sm font-bold ${
                                  emp.status === "Active" ? "text-emerald-600" : emp.status === "Inactive" ? "text-slate-400" : "text-amber-600"
                                }`}>{emp.status || "Active"}</span>
                              </div>
                            </TableCell>

                            {/* Registered Date */}
                            <TableCell className="py-4 text-sm font-medium text-slate-600">
                              {new Date(emp.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </TableCell>

                            {/* Actions buttons */}
                            <TableCell className="py-4 text-center pr-6">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenViewModal(emp)}
                                  className="h-7 w-7 rounded-lg text-[#1E3A63] hover:bg-slate-100"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenEditModal(emp)}
                                  className="h-7 w-7 rounded-lg text-[#1E3A63] hover:bg-slate-100"
                                  title="Edit Employer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteEmployer(emp.id)}
                                  className="h-7 w-7 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Delete Employer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredEmployers.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">No employers found</div>
                ) : (
                  filteredEmployers.map((emp) => {
                    const avatarClass = getCompanyColor(emp.company_name);
                    return (
                      <Card key={emp.id} className="border border-slate-100 rounded-xl p-4 shadow-sm relative space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5 items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${avatarClass}`}>
                              {emp.company_name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-[#1E3A63] leading-tight">{emp.company_name}</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">{emp.city}, {emp.state}</span>
                            </div>
                          </div>
                          <Badge className={`text-[9px] px-2 py-0.2 font-bold border rounded-full ${getIndustryBadgeColor(emp.industry || "IT Services")}`}>
                            {emp.industry}
                          </Badge>
                        </div>
                        
                        <div className="border-t border-slate-50 pt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Contact</span>
                            <span className="font-bold text-slate-700">{emp.contact_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Cohort Size</span>
                            <span className="font-extrabold text-[#1E3A63]">{emp.cohort_size_estimate || 0}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-50 pt-2 flex justify-between items-center text-xs">
                          <div className="inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                            <span className="font-bold text-slate-600">{emp.status}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenViewModal(emp)}>
                              <Eye className="w-3.5 h-3.5 text-[#1E3A63]" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEditModal(emp)}>
                              <Edit2 className="w-3.5 h-3.5 text-[#1E3A63]" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteEmployer(emp.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Pagination controls wrapper */}
              <div className="p-4 border-t border-slate-50">
                {totalCount > ITEMS_PER_PAGE && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                    totalCount={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row Grid containing top hirers & charts (SVG line and donut charts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Top Hiring Companies */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider">Top Hiring Companies</span>
            <Button variant="link" onClick={() => setCurrentPage(1)} className="text-[11px] font-bold text-[#1E56B3] p-0 h-auto">View all</Button>
          </div>
          
          <div className="space-y-4">
            {topHirers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                <Building2 className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No active hiring campaigns</p>
                <p className="text-[10px] text-slate-400">Add openings to start tracking</p>
              </div>
            ) : (
              topHirers.map((emp, index) => {
                const colors = [
                  { bg: "bg-red-50 text-red-600", fill: "#EF4444" },
                  { bg: "bg-blue-50 text-blue-600", fill: "#3B82F6" },
                  { bg: "bg-purple-50 text-purple-600", fill: "#8B5CF6" }
                ];
                const c = colors[index % colors.length];
                return (
                  <div key={emp.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-extrabold">{index + 1}</span>
                        <div className={`w-6 h-6 rounded-lg ${c.bg} flex items-center justify-center font-bold text-[10px]`}>
                          {emp.company_name.substring(0, 3).toUpperCase()}
                        </div>
                        <span className="text-slate-700 truncate max-w-[120px]">{emp.company_name}</span>
                      </div>
                      <span className="text-[#1E3A63] font-extrabold">{emp.cohort_size_estimate || 0} Openings</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1E56B3] h-full rounded-full" style={{ width: `${Math.min(100, (((emp.cohort_size_estimate || 0) || 1) / 50) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Column 2: Hiring Trends Line Chart (Vector SVG Representation) */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider">Hiring Trends</span>
            <Badge className="bg-slate-50 text-slate-500 font-bold border border-slate-100 text-[10px] rounded-lg">This Month</Badge>
          </div>
          
          <div className="relative h-[150px] w-full flex flex-col justify-between">
            {/* Vector SVG Line Chart */}
            <svg className="w-full h-[120px]" viewBox="0 0 300 120">
              <line x1="20" y1="20" x2="280" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="60" x2="280" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="#F1F5F9" strokeWidth="1" />

              <path d={`M 20,100 L ${points} L 280,100 Z`} fill="rgba(59, 130, 246, 0.05)" />
              <path d={`M 20,100 L ${points}`} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />

              {intervals.map((interval, i) => {
                const x = 20 + i * 65;
                const y = 100 - (interval.count / maxVal) * 70;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
                    <text x={x} y={y - 8} font-size="6" font-weight="bold" fill="#1E3A63" text-anchor="middle">{interval.count}</text>
                  </g>
                );
              })}
            </svg>
            
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-2">
              {intervals.map((interval, i) => (
                <span key={i}>{interval.label}</span>
              ))}
            </div>
            
            <div className="flex justify-center gap-4 text-[9px] font-bold text-slate-500 pt-1 border-t border-slate-50">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                Total Registered
              </span>
            </div>
          </div>
        </Card>

        {/* Column 3: Roles Distribution Donut Chart */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider">Roles Distribution</span>
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between gap-4 h-[150px]">
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="60" fill="none" stroke="#F8FAFC" strokeWidth="22" />
                {roleCircles.map((circle) => (
                  <circle
                    key={circle.name}
                    cx="100"
                    cy="100"
                    r="60"
                    fill="none"
                    stroke={circle.color}
                    strokeWidth="22"
                    strokeDasharray={circle.dashArray}
                    strokeDashoffset={circle.dashOffset}
                    transform="rotate(-90 100 100)"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#1E3A63] leading-none">{stats.total}</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Total</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-[10px] font-bold text-slate-500 overflow-y-auto max-h-[140px]">
              {sortedRoles.slice(0, 4).map((role) => {
                const color = roleColorMap[role.name] || "#64748B";
                return (
                  <div key={role.name} className="flex justify-between items-center gap-1.5">
                    <span className="flex items-center gap-1 truncate max-w-[80px]">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                      {role.name}
                    </span>
                    <span className="text-slate-800 font-extrabold">{role.percentage}%</span>
                  </div>
                );
              })}
              {sortedRoles.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-[#1E3A63]">Add New Employer Partnership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Register a new corporate recruiter or partner to track job openings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="add_comp_name">Company Name</Label>
              <Input id="add_comp_name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google India" className="h-9" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="add_contact">Contact Person</Label>
              <Input id="add_contact" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Sameer Shah" className="h-9" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add_email">Contact Email</Label>
                <Input id="add_email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sameer@google.com" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add_phone">Contact Phone</Label>
                <Input id="add_phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="add_desig">Designation</Label>
              <Input id="add_desig" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Lead Talent Scout" className="h-9" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="add_roles">Roles Needed (comma-separated)</Label>
              <Input id="add_roles" value={rolesNeeded} onChange={e => setRolesNeeded(e.target.value)} placeholder="e.g. Business Development, Customer Success" className="h-9" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add_timeline">Hiring Timeline</Label>
                <Select value={hiringTimeline} onValueChange={setHiringTimeline}>
                  <SelectTrigger id="add_timeline" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate (Within 30 Days)">Immediate (30 Days)</SelectItem>
                    <SelectItem value="Next 60 Days">Next 60 Days</SelectItem>
                    <SelectItem value="Next Quarter">Next Quarter</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add_cohort">Cohort Size</Label>
                <Input id="add_cohort" type="number" value={cohortSize} onChange={e => setCohortSize(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="add_status">Partnership Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="add_status" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active hiring</SelectItem>
                  <SelectItem value="Inactive">Inactive/Paused</SelectItem>
                  <SelectItem value="Pending">Pending Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployer} size="sm" className="bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90">Register Employer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employer Modal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-[#1E3A63]">Edit Employer Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Modify credentials or details for this partner record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="edit_comp_name">Company Name</Label>
              <Input id="edit_comp_name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_contact">Contact Person</Label>
              <Input id="edit_contact" value={contactName} onChange={e => setContactName(e.target.value)} className="h-9" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit_email">Contact Email</Label>
                <Input id="edit_email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_phone">Contact Phone</Label>
                <Input id="edit_phone" value={phone} onChange={e => setPhone(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_desig">Designation</Label>
              <Input id="edit_desig" value={designation} onChange={e => setDesignation(e.target.value)} className="h-9" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_roles">Roles Needed (comma-separated)</Label>
              <Input id="edit_roles" value={rolesNeeded} onChange={e => setRolesNeeded(e.target.value)} placeholder="e.g. Business Development" className="h-9" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit_timeline">Hiring Timeline</Label>
                <Select value={hiringTimeline} onValueChange={setHiringTimeline}>
                  <SelectTrigger id="edit_timeline" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate (Within 30 Days)">Immediate (30 Days)</SelectItem>
                    <SelectItem value="Next 60 Days">Next 60 Days</SelectItem>
                    <SelectItem value="Next Quarter">Next Quarter</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_cohort">Cohort Size</Label>
                <Input id="edit_cohort" type="number" value={cohortSize} onChange={e => setCohortSize(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_status">Partnership Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="edit_status" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active hiring</SelectItem>
                  <SelectItem value="Inactive">Inactive/Paused</SelectItem>
                  <SelectItem value="Pending">Pending Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEmployer} size="sm" className="bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employer Detail Modal Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md p-6 bg-slate-50">
          <DialogHeader className="bg-white p-4 rounded-xl border border-slate-100 mb-2">
            <DialogTitle className="text-lg font-extrabold text-[#1E3A63] flex items-center gap-2">
              <span>Employer Overview</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Detailed breakdown of active hiring partnerships.
            </DialogDescription>
          </DialogHeader>

          {selectedEmployer && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Summary */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm uppercase ${getCompanyColor(selectedEmployer.company_name)}`}>
                    {selectedEmployer.company_name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#1E3A63] text-sm leading-tight">{selectedEmployer.company_name}</h4>
                    <p className="text-[10px] text-slate-400">{selectedEmployer.hiring_timeline || "N/A"}</p>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Roles Needed</span>
                    <Badge className="bg-[#EBF3FF] text-[#1E56B3] border border-[#D0E2FF]/60 font-bold hover:bg-inherit shadow-none mt-0.5 text-[10px]">{(selectedEmployer.roles_needed || []).join(", ") || "N/A"}</Badge>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cohort Size</span>
                    <span className="text-sm font-black text-[#1E3A63] block mt-0.5">{selectedEmployer.cohort_size_estimate || 0} positions</span>
                  </div>
                </div>
              </div>

              {/* Point of Contact info */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Primary Point of Contact</span>
                <div className="space-y-1.5">
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-semibold">Contact Representative</span><span className="font-bold text-[#1E3A63]">{selectedEmployer.contact_name}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-semibold">Representative Designation</span><span className="font-bold text-slate-700">{selectedEmployer.designation || "-"}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-semibold">Corporate Email</span><span className="font-bold text-slate-700">{selectedEmployer.email}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-semibold">Representative Phone</span><span className="font-bold text-slate-700">+91 {selectedEmployer.phone}</span></p>
                </div>
              </div>

              {/* Timeline metrics */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Partnership Metadata</span>
                <div className="space-y-1.5 text-slate-600 font-semibold">
                  <p className="flex justify-between"><span className="text-slate-500">Recruiter Status</span><span className="text-emerald-600 font-bold">{selectedEmployer.status}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Last Dashboard Activity</span><span>{selectedEmployer.last_activity || "2 hours ago"}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Verification Date</span><span>{new Date(selectedEmployer.created_at).toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsViewOpen(false)} className="bg-[#1E3A63] text-white hover:bg-[#1E3A63]/90 size-sm">Close Overview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
