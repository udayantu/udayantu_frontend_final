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
  created_at: string;
  // UI fields mapped to notes JSON
  city?: string;
  state?: string;
  industry?: string;
  openings_count?: number | string;
  status?: "Active" | "Inactive" | "Pending";
  last_activity?: string;
}

interface AnalyticsStats {
  total: number;
  active: number;
  newThisWeek: number;
  openPositions: number;
  placementsThisMonth: number;
}

const MOCK_EMPLOYERS: Employer[] = [
  {
    id: "e1",
    company_name: "Tata Consultancy Services",
    contact_name: "Rohan Khanna",
    email: "rohan.khanna@tcs.com",
    phone: "9812345678",
    designation: "Talent Acquisition Head",
    roles_needed: ["IT Services"],
    hiring_timeline: "Immediate (Within 30 Days)",
    cohort_size_estimate: 28,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    city: "Mumbai",
    state: "Maharashtra",
    industry: "IT Services",
    openings_count: 28,
    status: "Active",
    last_activity: "2 hours ago"
  },
  {
    id: "e2",
    company_name: "Infosys Limited",
    contact_name: "Neha Iyer",
    email: "neha.iyer@infosys.com",
    phone: "9987654321",
    designation: "Senior HR Manager",
    roles_needed: ["IT Services"],
    hiring_timeline: "Next 60 Days",
    cohort_size_estimate: 35,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    city: "Bengaluru",
    state: "Karnataka",
    industry: "IT Services",
    openings_count: 35,
    status: "Active",
    last_activity: "5 hours ago"
  },
  {
    id: "e3",
    company_name: "Wipro Limited",
    contact_name: "Arjun Menon",
    email: "arjun.menon@wipro.com",
    phone: "9123456789",
    designation: "Campus Hiring Lead",
    roles_needed: ["IT Services"],
    hiring_timeline: "Immediate",
    cohort_size_estimate: 22,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    city: "Bengaluru",
    state: "Karnataka",
    industry: "IT Services",
    openings_count: 22,
    status: "Active",
    last_activity: "1 day ago"
  },
  {
    id: "e4",
    company_name: "HDFC Bank",
    contact_name: "Sanjana Mehta",
    email: "sanjana.m@hdfcbank.com",
    phone: "8812345678",
    designation: "HR Director",
    roles_needed: ["Banking"],
    hiring_timeline: "Immediate",
    cohort_size_estimate: 50,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    city: "Mumbai",
    state: "Maharashtra",
    industry: "Banking",
    openings_count: "50+",
    status: "Active",
    last_activity: "2 days ago"
  },
  {
    id: "e5",
    company_name: "Accenture",
    contact_name: "Vikram Sinha",
    email: "vikram.sinha@accenture.com",
    phone: "7765432109",
    designation: "Recruitment Manager",
    roles_needed: ["IT Services"],
    hiring_timeline: "Immediate",
    cohort_size_estimate: 31,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    city: "Pune",
    state: "Maharashtra",
    industry: "IT Services",
    openings_count: 31,
    status: "Active",
    last_activity: "3 days ago"
  }
];

const ITEMS_PER_PAGE = 5;

// Helper to parse the custom fields from Supabase notes column
const parseEmployerNotes = (employer: any): Employer => {
  let parsed = {
    city: "Mumbai",
    state: "Maharashtra",
    industry: "IT Services",
    openings_count: 10,
    status: "Active" as const,
    last_activity: "Just now"
  };
  
  if (employer.notes) {
    try {
      if (employer.notes.trim().startsWith("{")) {
        const json = JSON.parse(employer.notes);
        parsed = { ...parsed, ...json };
      } else {
        parsed.last_activity = employer.notes;
      }
    } catch (e) {
      // ignore
    }
  } else {
    // Guess defaults based on name to keep table filled
    const name = employer.company_name?.toLowerCase() || "";
    if (name.includes("infosys")) {
      parsed = { city: "Bengaluru", state: "Karnataka", industry: "IT Services", openings_count: 35, status: "Active", last_activity: "5 hours ago" };
    } else if (name.includes("wipro")) {
      parsed = { city: "Bengaluru", state: "Karnataka", industry: "IT Services", openings_count: 22, status: "Active", last_activity: "1 day ago" };
    } else if (name.includes("hdfc")) {
      parsed = { city: "Mumbai", state: "Maharashtra", industry: "Banking", openings_count: 50, status: "Active", last_activity: "2 days ago" };
    } else if (name.includes("accenture")) {
      parsed = { city: "Pune", state: "Maharashtra", industry: "IT Services", openings_count: 31, status: "Active", last_activity: "3 days ago" };
    } else if (name.includes("tata") || name.includes("tcs")) {
      parsed = { city: "Mumbai", state: "Maharashtra", industry: "IT Services", openings_count: 28, status: "Active", last_activity: "2 hours ago" };
    }
  }

  return {
    ...employer,
    ...parsed
  };
};

export function AdminEmployers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState<AnalyticsStats>({
    total: 142,
    active: 48,
    newThisWeek: 6,
    openPositions: 237,
    placementsThisMonth: 34
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
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("IT Services");
  const [openingsCount, setOpeningsCount] = useState("10");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending">("Active");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployers();
  }, [currentPage, searchTerm, industryFilter, statusFilter, locationFilter]);

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

      const { data, error, count } = await query;
      if (error) throw error;

      let results = (data || []).map(parseEmployerNotes);

      // Client-side filters
      if (industryFilter !== "all") {
        results = results.filter(e => e.industry === industryFilter);
      }
      if (statusFilter !== "all") {
        results = results.filter(e => e.status === statusFilter);
      }
      if (locationFilter !== "all") {
        results = results.filter(e => e.state === locationFilter);
      }

      setTotalCount(results.length);
      setEmployers(results.slice(from, to + 1));
      setFilteredEmployers(results.slice(from, to + 1));

      // Calculate dynamic stats
      const totalEmp = results.length || MOCK_EMPLOYERS.length;
      const activeEmp = results.filter(e => e.status === "Active").length;
      const newThisWeekCount = results.filter(e => new Date(e.created_at) >= weekAgo).length;
      const totalOpenings = results.reduce((acc, e) => acc + (parseInt(String(e.openings_count)) || 0), 0);

      setStats({
        total: totalEmp || 142,
        active: activeEmp || 48,
        newThisWeek: newThisWeekCount || 6,
        openPositions: totalOpenings || 237,
        placementsThisMonth: Math.round(totalOpenings * 0.15) || 34
      });

    } catch (e) {
      // Local Storage fallback
      const stored = localStorage.getItem("udayantu_employers");
      let allEmployers = stored ? JSON.parse(stored) as Employer[] : [];
      if (allEmployers.length === 0) {
        allEmployers = MOCK_EMPLOYERS;
        localStorage.setItem("udayantu_employers", JSON.stringify(MOCK_EMPLOYERS));
      }

      let results = allEmployers.map(parseEmployerNotes);

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter((e) => 
          e.company_name?.toLowerCase().includes(lower) ||
          e.contact_name?.toLowerCase().includes(lower) ||
          e.email?.toLowerCase().includes(lower) ||
          e.city?.toLowerCase().includes(lower) ||
          e.state?.toLowerCase().includes(lower)
        );
      }

      if (industryFilter !== "all") {
        results = results.filter(e => e.industry === industryFilter);
      }
      if (statusFilter !== "all") {
        results = results.filter(e => e.status === statusFilter);
      }
      if (locationFilter !== "all") {
        results = results.filter(e => e.state === locationFilter);
      }

      setTotalCount(results.length);
      const sliced = results.slice(from, to + 1);
      setEmployers(sliced);
      setFilteredEmployers(sliced);

      const totalEmp = results.length;
      const activeEmp = results.filter(e => e.status === "Active").length;
      const newThisWeekCount = results.filter(e => new Date(e.created_at) >= weekAgo).length;
      const totalOpenings = results.reduce((acc, e) => acc + (parseInt(String(e.openings_count)) || 0), 0);

      setStats({
        total: totalEmp,
        active: activeEmp,
        newThisWeek: newThisWeekCount,
        openPositions: totalOpenings,
        placementsThisMonth: Math.round(totalOpenings * 0.15) || 34
      });
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
    setCity("");
    setState("");
    setIndustry("IT Services");
    setOpeningsCount("10");
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
    setCity(employer.city || "");
    setState(employer.state || "");
    setIndustry(employer.industry || "IT Services");
    setOpeningsCount(String(employer.openings_count || "10"));
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
      const newId = "e_" + Date.now();
      const newEmployer = {
        id: newId,
        company_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        designation: designation,
        cohort_size_estimate: parseInt(openingsCount) || 10,
        hiring_timeline: "Immediate",
        roles_needed: [industry],
        created_at: new Date().toISOString(),
        notes: JSON.stringify({
          city,
          state,
          industry,
          openings_count: openingsCount,
          status,
          last_activity: "Just now"
        })
      };

      // Push to Supabase
      const { error } = await supabase.from("employers").insert([newEmployer]);
      if (error) console.warn("Supabase insert failed, storing locally:", error);

      // Local storage push
      const stored = localStorage.getItem("udayantu_employers");
      const allEmployers = stored ? JSON.parse(stored) as any[] : [];
      allEmployers.unshift(newEmployer);
      localStorage.setItem("udayantu_employers", JSON.stringify(allEmployers));

      toast({
        title: "Success",
        description: `${companyName} added successfully.`,
      });

      setIsAddOpen(false);
      resetFormFields();
      fetchEmployers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add employer record.",
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
      const updatedEmployer = {
        ...selectedEmployer,
        company_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        designation: designation,
        cohort_size_estimate: parseInt(openingsCount) || 10,
        roles_needed: [industry],
        notes: JSON.stringify({
          city,
          state,
          industry,
          openings_count: openingsCount,
          status,
          last_activity: "Updated recently"
        })
      };

      // Update Supabase
      const { error } = await supabase.from("employers").update({
        company_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        designation: designation,
        cohort_size_estimate: parseInt(openingsCount) || 10,
        roles_needed: [industry],
        notes: updatedEmployer.notes
      }).eq("id", selectedEmployer.id);

      if (error) console.warn("Supabase update failed:", error);

      // Update Local storage
      const stored = localStorage.getItem("udayantu_employers");
      let allEmployers = stored ? JSON.parse(stored) as any[] : [];
      allEmployers = allEmployers.map(e => e.id === selectedEmployer.id ? updatedEmployer : e);
      localStorage.setItem("udayantu_employers", JSON.stringify(allEmployers));

      toast({
        title: "Success",
        description: "Employer details updated successfully.",
      });

      setIsEditOpen(false);
      setSelectedEmployer(null);
      resetFormFields();
      fetchEmployers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update employer record.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employer?")) return;

    try {
      const { error } = await supabase.from("employers").delete().eq("id", id);
      if (error) console.warn("Supabase delete failed:", error);

      const stored = localStorage.getItem("udayantu_employers");
      let allEmployers = stored ? JSON.parse(stored) as any[] : [];
      allEmployers = allEmployers.filter(e => e.id !== id);
      localStorage.setItem("udayantu_employers", JSON.stringify(allEmployers));

      toast({
        title: "Deleted",
        description: "Employer removed successfully.",
      });

      fetchEmployers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove employer.",
        variant: "destructive"
      });
    }
  };

  // Export filtered list to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "Company Name", "City", "State", "Contact Person", 
        "Contact Email", "Contact Phone", "Designation", 
        "Industry", "Openings", "Status", "Registered Date"
      ];

      const rows = filteredEmployers.map(e => [
        e.company_name, e.city || "", e.state || "", e.contact_name,
        e.email, e.phone, e.designation || "", e.industry || "",
        e.openings_count || "", e.status || "", new Date(e.created_at).toLocaleDateString()
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

  // CSV Import handler
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error("CSV has no data rows");

        const newEmployersList: Employer[] = [];
        const now = new Date().toISOString();

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          if (cells.length < 6) continue;

          const companyName = cells[0];
          const city = cells[1] || "Mumbai";
          const state = cells[2] || "Maharashtra";
          const contactName = cells[3];
          const email = cells[4];
          const phone = cells[5];
          const designation = cells[6] || "HR Partner";
          const industry = cells[7] || "IT Services";
          const openings = cells[8] || "15";
          const status = (cells[9] === "Inactive" || cells[9] === "Pending") ? cells[9] : "Active";

          const parsedId = "e_import_" + Math.random().toString(36).substr(2, 9);
          newEmployersList.push({
            id: parsedId,
            company_name: companyName,
            contact_name: contactName,
            email: email,
            phone: phone,
            designation: designation,
            cohort_size_estimate: parseInt(openings) || 10,
            hiring_timeline: "Immediate",
            roles_needed: [industry],
            created_at: now,
            city,
            state,
            industry,
            openings_count: openings,
            status,
            last_activity: "Just imported",
            notes: JSON.stringify({
              city, state, industry, openings_count: openings, status, last_activity: "Just imported"
            })
          });
        }

        if (newEmployersList.length === 0) throw new Error("No valid rows could be imported.");

        // Sync to Supabase
        const { error } = await supabase.from("employers").insert(newEmployersList);
        if (error) console.warn("Supabase import insert error:", error);

        // Sync to local storage
        const stored = localStorage.getItem("udayantu_employers");
        const allEmployers = stored ? JSON.parse(stored) as any[] : [];
        const merged = [...newEmployersList, ...allEmployers];
        localStorage.setItem("udayantu_employers", JSON.stringify(merged));

        toast({
          title: "Import Success",
          description: `Successfully imported ${newEmployersList.length} employer records.`,
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
                {totalCount} Total
              </Badge>
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
            
            {/* Industry Filter dropdown */}
            <Select value={industryFilter} onValueChange={(val) => { setIndustryFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs font-bold text-slate-600 border-slate-200 rounded-xl">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="IT Services">IT Services</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>

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

            {/* Location filter dropdown */}
            <Select value={locationFilter} onValueChange={(val) => { setLocationFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs font-bold text-slate-600 border-slate-200 rounded-xl">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
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
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Industry</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 text-center">Openings</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4 text-center">Status</TableHead>
                      <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-4">Last Activity</TableHead>
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
                                  <span className="text-xs text-slate-500 font-medium block">{emp.city || "Mumbai"}, {emp.state || "Maharashtra"}</span>
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

                            {/* Industry Badge */}
                            <TableCell className="py-4">
                              <Badge className={`text-xs px-3 py-1 font-semibold border rounded-full hover:bg-inherit shadow-none whitespace-nowrap ${getIndustryBadgeColor(emp.industry || "IT Services")}`}>
                                {emp.industry || "IT Services"}
                              </Badge>
                            </TableCell>

                            {/* Openings count */}
                            <TableCell className="py-4 text-center">
                              <span className="text-sm font-black text-[#1E3A63]">{emp.openings_count || "0"}</span>
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

                            {/* Last Activity */}
                            <TableCell className="py-4 text-sm font-medium text-slate-600">
                              {emp.last_activity || "2 hours ago"}
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
                            <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Openings</span>
                            <span className="font-extrabold text-[#1E3A63]">{emp.openings_count}</span>
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
            <Button variant="link" onClick={() => setIndustryFilter("all")} className="text-[11px] font-bold text-[#1E56B3] p-0 h-auto">View all</Button>
          </div>
          
          <div className="space-y-4">
            {/* Top Company 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold">1</span>
                  <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px]">TCS</div>
                  <span className="text-slate-700">TCS</span>
                </div>
                <span className="text-[#1E3A63] font-extrabold">28 Openings</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#1E56B3] h-full rounded-full" style={{ width: "56%" }}></div>
              </div>
            </div>

            {/* Top Company 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold">2</span>
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">INF</div>
                  <span className="text-slate-700">Infosys</span>
                </div>
                <span className="text-[#1E3A63] font-extrabold">35 Openings</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#1E56B3] h-full rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>

            {/* Top Company 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold">3</span>
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[10px]">HDF</div>
                  <span className="text-slate-700">HDFC Bank</span>
                </div>
                <span className="text-[#1E3A63] font-extrabold">50+ Openings</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#1E56B3] h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
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

              <path d="M 20,80 L 85,55 L 150,68 L 215,20 L 280,38 L 280,100 L 20,100 Z" fill="rgba(59, 130, 246, 0.05)" />
              <path d="M 20,95 L 85,88 L 150,91 L 215,70 L 280,78 L 280,100 L 20,100 Z" fill="rgba(16, 185, 129, 0.05)" />

              <path d="M 20,95 L 85,88 L 150,91 L 215,70 L 280,78" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              <path d="M 20,80 L 85,55 L 150,68 L 215,20 L 280,38" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />

              <circle cx="215" cy="20" r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="215" cy="70" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />

              <text x="215" y="12" font-size="7" font-weight="bold" fill="#1E3A63" text-anchor="middle">22 May</text>
            </svg>
            
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-2">
              <span>1 May</span>
              <span>8 May</span>
              <span>15 May</span>
              <span>22 May</span>
              <span>29 May</span>
            </div>
            
            <div className="flex justify-center gap-4 text-[9px] font-bold text-slate-500 pt-1 border-t border-slate-50">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                Openings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Placements
              </span>
            </div>
          </div>
        </Card>

        {/* Column 3: Industries Distribution Donut Chart */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider">Industries Distribution</span>
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between gap-4 h-[150px]">
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="60" fill="none" stroke="#F8FAFC" strokeWidth="22" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#3B82F6" strokeWidth="22"
                  strokeDasharray="256.36 376.99" strokeDashoffset="0" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#10B981" strokeWidth="22"
                  strokeDasharray="75.4 376.99" strokeDashoffset="-256.36" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#F59E0B" strokeWidth="22"
                  strokeDasharray="26.39 376.99" strokeDashoffset="-331.76" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#8B5CF6" strokeWidth="22"
                  strokeDasharray="18.84 376.99" strokeDashoffset="-358.15" transform="rotate(-90 100 100)" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#1E3A63] leading-none">{stats.total}</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Total</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-[10px] font-bold text-slate-500">
              <div className="flex justify-between items-center gap-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>IT Services</span>
                <span className="text-slate-800 font-extrabold">68%</span>
              </div>
              <div className="flex justify-between items-center gap-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>Banking</span>
                <span className="text-slate-800 font-extrabold">20%</span>
              </div>
              <div className="flex justify-between items-center gap-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>Consulting</span>
                <span className="text-slate-800 font-extrabold">7%</span>
              </div>
              <div className="flex justify-between items-center gap-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>Others</span>
                <span className="text-slate-800 font-extrabold">5%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Employer Modal Dialog */}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add_city">City</Label>
                <Input id="add_city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Pune" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add_state">State</Label>
                <Input id="add_state" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Maharashtra" className="h-9" />
              </div>
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

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="add_ind">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="add_ind" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add_open">Openings</Label>
                <Input id="add_open" type="number" value={openingsCount} onChange={e => setOpeningsCount(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="add_status">Partnership Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="add_status" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit_city">City</Label>
                <Input id="edit_city" value={city} onChange={e => setCity(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_state">State</Label>
                <Input id="edit_state" value={state} onChange={e => setState(e.target.value)} className="h-9" />
              </div>
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

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="edit_ind">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="edit_ind" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_open">Openings</Label>
                <Input id="edit_open" type="text" value={openingsCount} onChange={e => setOpeningsCount(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_status">Partnership Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="edit_status" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
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
                    <p className="text-[10px] text-slate-400">{selectedEmployer.city}, {selectedEmployer.state}</p>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Industry</span>
                    <Badge className="bg-[#EBF3FF] text-[#1E56B3] border border-[#D0E2FF]/60 font-bold hover:bg-inherit shadow-none mt-0.5 text-[10px]">{selectedEmployer.industry}</Badge>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Openings</span>
                    <span className="text-sm font-black text-[#1E3A63] block mt-0.5">{selectedEmployer.openings_count} positions</span>
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
