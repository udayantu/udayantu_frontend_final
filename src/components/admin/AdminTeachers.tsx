import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Edit, Trash2, UserCheck, UserX, BookOpen, Clock, DollarSign, Download, Phone, Mail, Award } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "./shared/PaginationControls";
import { StatCard } from "./shared/StatCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  status: "active" | "inactive";
  total_hours: number;
  pay_rate: number;
  bio: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

const MOCK_TEACHERS: Teacher[] = [
  {
    id: "t1",
    full_name: "Dr. Ramesh Prasad",
    email: "ramesh.prasad@udayantu.org",
    phone: "9876543210",
    specialization: "Project Management",
    status: "active",
    total_hours: 120,
    pay_rate: 800,
    bio: "Experienced Project Management instructor teaching Agile, Scrum, and professional planning frameworks.",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "t2",
    full_name: "Meera Nair",
    email: "meera.nair@udayantu.org",
    phone: "9812345678",
    specialization: "Customer Success",
    status: "active",
    total_hours: 85,
    pay_rate: 650,
    bio: "Passionate Customer Success expert coaching student cohorts on onboarding workflows, escalations, and CRM software tools.",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "t3",
    full_name: "Alok Sengupta",
    email: "alok.sengupta@udayantu.org",
    phone: "9123456789",
    specialization: "Operations Management",
    status: "active",
    total_hours: 42,
    pay_rate: 500,
    bio: "Operations leader teaching process mapping, supply chain metrics, and Excel analytics to fresh graduates.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "t4",
    full_name: "Sunita Deshmukh",
    email: "sunita.d@udayantu.org",
    phone: "9988776655",
    specialization: "Business Development",
    status: "inactive",
    total_hours: 60,
    pay_rate: 750,
    bio: "Former corporate sales manager teaching lead generation, client presentations, and negotiation techniques.",
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    status: "active",
    total_hours: 0,
    pay_rate: 500,
    bio: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let result = [...teachers];

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name.toLowerCase().includes(lower) ||
          t.email.toLowerCase().includes(lower) ||
          t.phone.includes(lower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Specialization filter
    if (specFilter !== "all") {
      result = result.filter((t) => t.specialization === specFilter);
    }

    setFilteredTeachers(result);
    setCurrentPage(1); // Reset to page 1 on filter
  }, [searchTerm, statusFilter, specFilter, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTeachers((data as Teacher[]) || []);
      setIsUsingMock(false);
    } catch (error) {
      console.warn("Could not load teachers from live database. Loading from local storage fallback.");
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setIsUsingMock(true);
    const stored = localStorage.getItem("udayantu_teachers");
    if (stored) {
      setTeachers(JSON.parse(stored));
    } else {
      localStorage.setItem("udayantu_teachers", JSON.stringify(MOCK_TEACHERS));
      setTeachers(MOCK_TEACHERS);
    }
  };

  const saveTeachersList = async (updatedList: Teacher[]) => {
    setTeachers(updatedList);
    if (isUsingMock) {
      localStorage.setItem("udayantu_teachers", JSON.stringify(updatedList));
    } else {
      // Direct supabase sync is automatically handled on next refresh,
      // but in mock-mode we write directly to localStorage.
    }
  };

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setCurrentTeacher({
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      status: "active",
      total_hours: 0,
      pay_rate: 500,
      bio: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (teacher: Teacher) => {
    setDialogMode("edit");
    setCurrentTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to remove this instructor?")) return;

    try {
      if (!isUsingMock) {
        const { error } = await supabase.from("teachers").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = teachers.filter((t) => t.id !== id);
      saveTeachersList(updated);

      toast({
        title: "Instructor Removed",
        description: "Instructor record has been deleted successfully.",
      });
    } catch (error) {
      console.warn("Database delete failed, removing locally:", error);
      const updated = teachers.filter((t) => t.id !== id);
      saveTeachersList(updated);
      setIsUsingMock(true);
      toast({
        title: "Instructor Removed (Local)",
        description: "Instructor record has been deleted locally.",
      });
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    const nextStatus = teacher.status === "active" ? "inactive" : "active";
    try {
      if (!isUsingMock) {
        const { error } = await supabase
          .from("teachers")
          .update({ status: nextStatus })
          .eq("id", teacher.id);
        if (error) throw error;
      }

      const updated = teachers.map((t) =>
        t.id === teacher.id ? { ...t, status: nextStatus } : t
      );
      saveTeachersList(updated);

      toast({
        title: "Status Updated",
        description: `${teacher.full_name} is now ${nextStatus}.`,
      });
    } catch (error) {
      console.warn("Database status toggle failed, updating locally:", error);
      const updated = teachers.map((t) =>
        t.id === teacher.id ? { ...t, status: nextStatus } : t
      );
      saveTeachersList(updated);
      setIsUsingMock(true);
      toast({
        title: "Status Updated (Local)",
        description: `${teacher.full_name} is now ${nextStatus} locally.`,
      });
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTeacher.full_name || !currentTeacher.email || !currentTeacher.specialization) {
      toast({
        title: "Validation Error",
        description: "Name, email, and specialization are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (dialogMode === "add") {
        const newRecord: Teacher = {
          id: currentTeacher.id || Math.random().toString(36).substr(2, 9),
          full_name: currentTeacher.full_name,
          email: currentTeacher.email,
          phone: currentTeacher.phone || "",
          specialization: currentTeacher.specialization,
          status: (currentTeacher.status as "active" | "inactive") || "active",
          total_hours: Number(currentTeacher.total_hours) || 0,
          pay_rate: Number(currentTeacher.pay_rate) || 500,
          bio: currentTeacher.bio || "",
          created_at: new Date().toISOString(),
        };

        if (!isUsingMock) {
          try {
            const { error } = await supabase.from("teachers").insert(newRecord);
            if (error) throw error;
          } catch (dbError) {
            console.warn("Supabase insert failed, falling back to local storage:", dbError);
            setIsUsingMock(true);
            const stored = localStorage.getItem("udayantu_teachers");
            const list = stored ? JSON.parse(stored) : [];
            list.unshift(newRecord);
            localStorage.setItem("udayantu_teachers", JSON.stringify(list));
          }
        }

        saveTeachersList([newRecord, ...teachers]);
        toast({
          title: "Instructor Added",
          description: `${newRecord.full_name} has been added successfully.`,
        });
      } else {
        const updatedRecord = {
          ...currentTeacher,
          total_hours: Number(currentTeacher.total_hours) || 0,
          pay_rate: Number(currentTeacher.pay_rate) || 500,
        } as Teacher;

        if (!isUsingMock) {
          try {
            const { error } = await supabase
              .from("teachers")
              .update(updatedRecord)
              .eq("id", updatedRecord.id);
            if (error) throw error;
          } catch (dbError) {
            console.warn("Supabase update failed, falling back to local storage:", dbError);
            setIsUsingMock(true);
            const stored = localStorage.getItem("udayantu_teachers");
            const list = stored ? JSON.parse(stored) : [];
            const updatedList = list.map((t: Teacher) => (t.id === updatedRecord.id ? updatedRecord : t));
            localStorage.setItem("udayantu_teachers", JSON.stringify(updatedList));
          }
        }

        saveTeachersList(
          teachers.map((t) => (t.id === updatedRecord.id ? updatedRecord : t))
        );
        toast({
          title: "Profile Updated",
          description: "Instructor details have been saved.",
        });
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save details to Supabase.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Specialization", "Status", "Hours Taught", "Pay Rate (INR/hr)", "Bio", "Joined Date"];
    const rows = filteredTeachers.map((t) => [
      t.id,
      t.full_name,
      t.email,
      t.phone,
      t.specialization,
      t.status,
      t.total_hours,
      t.pay_rate,
      `"${t.bio.replace(/"/g, '""')}"`,
      new Date(t.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `udayantu_instructors_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination helper
  const totalCount = filteredTeachers.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Compute stat card counters
  const totalHours = teachers.reduce((acc, curr) => acc + (curr.total_hours || 0), 0);
  const activeCount = teachers.filter((t) => t.status === "active").length;
  const specializations = Array.from(new Set(teachers.map((t) => t.specialization)));

  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Instructors"
          value={teachers.length}
          description="Registered mentors"
          icon={Award}
        />
        <StatCard
          title="Active Instructors"
          value={activeCount}
          description={`${Math.round((activeCount / (teachers.length || 1)) * 100)}% utilization`}
          icon={UserCheck}
        />
        <StatCard
          title="Total Teaching Hours"
          value={`${totalHours} hrs`}
          description="Delivered to rural youth"
          icon={Clock}
        />
        <StatCard
          title="Specializations"
          value={specializations.length}
          description="Core training categories"
          icon={BookOpen}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Teachers & Instructors</CardTitle>
            <CardDescription>Manage teacher accounts, billing rates, specializations, and bios.</CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleExportCSV} className="flex-1 md:flex-initial gap-1">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={handleOpenAddDialog} className="flex-1 md:flex-initial bg-secondary hover:bg-secondary-hover text-white gap-1">
              <Plus className="w-4 h-4" />
              Add Instructor
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters Panel */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={specFilter} onValueChange={setSpecFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead className="text-right">Pay Rate</TableHead>
                  <TableHead className="text-right">Hours Taught</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No instructors match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-primary">{teacher.full_name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={teacher.bio}>
                            {teacher.bio || "No bio registered"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                          {teacher.specialization}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-y-1">
                        <p className="text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {teacher.email}
                        </p>
                        <p className="text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {teacher.phone || "No phone record"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700">
                        ₹{teacher.pay_rate}/hr
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-600">
                        {teacher.total_hours || 0} hrs
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={teacher.status === "active" ? "default" : "secondary"}
                          className={
                            teacher.status === "active"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                          }
                        >
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(teacher)}
                            title={teacher.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {teacher.status === "active" ? (
                              <UserX className="w-4 h-4 text-amber-500" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(teacher)}
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            title="Remove Instructor"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedTeachers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No instructors found.
              </div>
            ) : (
              paginatedTeachers.map((teacher) => (
                <Card key={teacher.id} className="shadow-sm">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-primary">{teacher.full_name}</h4>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {teacher.specialization}
                        </span>
                      </div>
                      <Badge
                        variant={teacher.status === "active" ? "default" : "secondary"}
                        className={
                          teacher.status === "active" ? "bg-emerald-500 text-white" : ""
                        }
                      >
                        {teacher.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{teacher.bio}</p>

                    <div className="border-t pt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <p className="font-medium truncate">{teacher.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <p className="font-medium">{teacher.phone || "-"}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Pay Rate:</span>
                        <p className="font-medium text-emerald-600">₹{teacher.pay_rate}/hr</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Hours:</span>
                        <p className="font-semibold text-slate-700">{teacher.total_hours} hrs</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleToggleStatus(teacher)}
                      >
                        {teacher.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-primary border-primary/20 hover:bg-primary/5"
                        onClick={() => handleOpenEditDialog(teacher)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalCount={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit / Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveTeacher}>
            <DialogHeader>
              <DialogTitle>{dialogMode === "add" ? "Add Instructor" : "Edit Instructor Profile"}</DialogTitle>
              <DialogDescription>
                Register or update instructor bio, billing rate, and specialization.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={currentTeacher.full_name || ""}
                  onChange={(e) => setCurrentTeacher({ ...currentTeacher, full_name: e.target.value })}
                  placeholder="Enter instructor's full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentTeacher.email || ""}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
                    placeholder="name@udayantu.org"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={currentTeacher.phone || ""}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, phone: e.target.value })}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select
                  value={currentTeacher.specialization || ""}
                  onValueChange={(val) => setCurrentTeacher({ ...currentTeacher, specialization: val })}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business Development">Business Development</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                    <SelectItem value="Project Management">Project Management</SelectItem>
                    <SelectItem value="Operations Management">Operations Management</SelectItem>
                    <SelectItem value="Product Management">Product Management</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Marketing Management">Marketing Management</SelectItem>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_rate">Pay Rate (INR/hour)</Label>
                  <Input
                    id="pay_rate"
                    type="number"
                    value={currentTeacher.pay_rate || 500}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, pay_rate: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_hours">Total Hours Taught</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    value={currentTeacher.total_hours || 0}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, total_hours: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio & Background Details</Label>
                <Textarea
                  id="bio"
                  value={currentTeacher.bio || ""}
                  onChange={(e) => setCurrentTeacher({ ...currentTeacher, bio: e.target.value })}
                  placeholder="Summarize teaching credentials, background, and availability details..."
                  className="h-20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-secondary hover:bg-secondary-hover text-white">
                {dialogMode === "add" ? "Register" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
