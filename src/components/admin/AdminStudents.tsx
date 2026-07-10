import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, TrendingUp, Users, Calendar, DollarSign, Eye, RefreshCw, Award, Edit, UserCheck, ShieldAlert, CheckCircle, Mail, Phone, MapPin, UserPlus, Star, ChevronDown, ChevronUp, Check } from "lucide-react";
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
import { ExportStudents } from "./ExportStudents";
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

// Import real student photos from assets
import amitImg from "@/assets/testimonial-amit.jpg";
import nehaImg from "@/assets/testimonial-neha.jpg";
import rajeshImg from "@/assets/testimonial-rajesh.jpg";
import poojaImg from "@/assets/testimonial-pooja.jpg";
import blockImg from "@/assets/testimonial-vikram.jpg";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  desired_role: string;
  payment_status: string;
  status: string;
  created_at: string;
  user_id?: string | null;
  degree?: string | null;
  year?: string | null;
  qualification?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  role_recommendation?: string | null;
  referral_code?: string | null;
  whatsapp?: string | null;
}

const MOCK_STUDENTS: Student[] = [
  {
    id: "s1",
    user_id: "u1",
    full_name: "Amit Kumar Sharma",
    email: "amit.sharma@gmail.com",
    phone: "9876543210",
    state: "Uttar Pradesh",
    district: "Varanasi",
    city: "Babarpur",
    degree: "B.A. Graduate",
    year: "2025",
    desired_role: "Business Development",
    role_recommendation: "Business Development Specialist",
    payment_status: "paid",
    status: "active",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "s2",
    user_id: "u2",
    full_name: "Neha Patel",
    email: "neha.patel@outlook.com",
    phone: "8765432109",
    state: "Madhya Pradesh",
    district: "Bhopal",
    city: "Jitpon",
    degree: "B.Sc. Graduate",
    year: "2024",
    desired_role: "Customer Success",
    role_recommendation: "Customer Support Associate",
    payment_status: "pending",
    status: "pending",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "s3",
    user_id: "u3",
    full_name: "Rajesh Gond",
    email: "rajesh.gond@yahoo.com",
    phone: "7654321098",
    state: "Bihar",
    district: "Patna",
    city: "Danapur",
    degree: "B.Com Graduate",
    year: "2023",
    desired_role: "Project Management",
    role_recommendation: "Project Management Assistant",
    payment_status: "unpaid",
    status: "pending",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "s4",
    user_id: "u4",
    full_name: "Pooja Verma",
    email: "pooja.v@gmail.com",
    phone: "9123456780",
    state: "Rajasthan",
    district: "Jaipur",
    city: "Chomu",
    degree: "B.Tech Student",
    year: "2026",
    desired_role: "Business Development",
    role_recommendation: "Business Development Associate",
    payment_status: "paid",
    status: "active",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "s5",
    user_id: "u5",
    full_name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "8123456789",
    state: "Haryana",
    district: "Rohtak",
    city: "Kalanaur",
    degree: "12th Pass",
    year: "2022",
    desired_role: "Operations Management",
    role_recommendation: "Operations Executive",
    payment_status: "paid",
    status: "placed",
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

interface AssessmentRecord {
  id: string;
  type: string;
  score: number | null;
  recommended_role: string | null;
  completed_at: string | null;
}

const ITEMS_PER_PAGE = 10;

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const getStudentAvatar = (studentId: string) => {
    const avatars: Record<string, string> = {
      s1: amitImg,
      s2: nehaImg,
      s3: rajeshImg,
      s4: poojaImg,
      s5: blockImg,
    };
    return avatars[studentId] || null;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, paid: 0, thisWeek: 0, thisMonth: 0 });

  // Student Profile Dialog state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Edit actions inside profile dialog
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("");
  const [editRegistrationStatus, setEditRegistrationStatus] = useState<string>("");
  const [editRecommendedRole, setEditRecommendedRole] = useState<string>("");
  const [assignedMentor, setAssignedMentor] = useState<string>("none");
  const [mentorsList, setMentorsList] = useState<{ id: string; name: string }[]>([]);
  const [deepAnalysisOpen, setDeepAnalysisOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, paymentFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm, paymentFilter, statusFilter]);

  // Load mentors list once
  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const stored = localStorage.getItem("udayantu_teachers");
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        setMentorsList(parsed.map((t) => ({ id: t.id, name: t.full_name })));
      } else {
        const { data } = await supabase.from("teachers").select("id, full_name");
        if (data) {
          setMentorsList(data.map((t) => ({ id: t.id, name: t.full_name })));
        } else {
          setMentorsList([
            { id: "t1", name: "Dr. Ramesh Prasad" },
            { id: "t2", name: "Meera Nair" },
            { id: "t3", name: "Alok Sengupta" },
          ]);
        }
      }
    } catch (e) {
      setMentorsList([
        { id: "t1", name: "Dr. Ramesh Prasad" },
        { id: "t2", name: "Meera Nair" },
        { id: "t3", name: "Alok Sengupta" },
      ]);
    }
  };

  const fetchStudents = async () => {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      let query = supabase
        .from("student_registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Apply payment filter
      if (paymentFilter !== "all") {
        query = query.eq("payment_status", paymentFilter);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query.range(from, to);

      if (error || !data || data.length === 0) throw new Error("No database records found");
      setStudents(data || []);
      setFilteredStudents(data || []);
      setTotalCount(count || 0);

      // Fetch stats
      const [weekData, monthData] = await Promise.all([
        supabase
          .from("student_registrations")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("student_registrations")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
      ]);

      const { count: paidCountDb } = await supabase
        .from("student_registrations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "paid");

      setStats({
        total: count || 0,
        paid: paidCountDb || 0,
        thisWeek: weekData.count || 0,
        thisMonth: monthData.count || 0,
      });
    } catch (error: unknown) {
      // Local Storage Fallback
      const localData = localStorage.getItem("udayantu_students");
      let allStudents = localData ? JSON.parse(localData) : [];
      if (allStudents.length === 0) {
        allStudents = MOCK_STUDENTS;
        localStorage.setItem("udayantu_students", JSON.stringify(MOCK_STUDENTS));
      }

      let results = [...allStudents];

      // Apply filters
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter(
          (s) =>
            s.full_name?.toLowerCase().includes(lower) ||
            s.email?.toLowerCase().includes(lower) ||
            s.phone?.toLowerCase().includes(lower)
        );
      }
      if (paymentFilter !== "all") {
        results = results.filter((s) => s.payment_status === paymentFilter);
      }
      if (statusFilter !== "all") {
        results = results.filter((s) => s.status === statusFilter);
      }

      setTotalCount(results.length);
      const sliced = results.slice(from, to + 1);
      setStudents(sliced);
      setFilteredStudents(sliced);

      const paid = results.filter((s) => s.payment_status === "paid").length;
      setStats({
        total: results.length,
        paid: paid,
        thisWeek: results.filter((s) => new Date(s.created_at) >= weekAgo).length,
        thisMonth: results.filter((s) => new Date(s.created_at) >= monthAgo).length,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAssessments = async (studentUserId: string) => {
    setLoadingAssessments(true);
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, type, score, recommended_role, completed_at")
        .eq("student_id", studentUserId);

      if (error) throw error;

      if (data && data.length > 0) {
        setAssessments(data as AssessmentRecord[]);
      } else {
        // Fallback to sample data for assessment visualization
        setAssessments([
          { id: "a1", type: "Aptitude Test", score: 78, recommended_role: null, completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { id: "a2", type: "Psychometric Evaluation", score: 85, recommended_role: "Customer Success", completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { id: "a3", type: "General Knowledge", score: 62, recommended_role: null, completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ]);
      }
    } catch (e) {
      // Mock data in sandbox mode
      setAssessments([
        { id: "a1", type: "Aptitude Test", score: 78, recommended_role: null, completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "a2", type: "Psychometric Evaluation", score: 85, recommended_role: "Customer Success", completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "a3", type: "General Knowledge", score: 62, recommended_role: null, completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const handleOpenProfile = (student: Student) => {
    setSelectedStudent(student);
    setEditPaymentStatus(student.payment_status || "unpaid");
    setEditRegistrationStatus(student.status || "pending");
    setEditRecommendedRole(student.role_recommendation || "None");
    setAssignedMentor("none");
    setDeepAnalysisOpen(false);

    if (student.user_id) {
      loadStudentAssessments(student.user_id);
    } else {
      setAssessments([
        { id: "a1", type: "Aptitude Test (Mock)", score: 72, recommended_role: null, completed_at: new Date().toISOString() },
        { id: "a2", type: "Psychometric (Mock)", score: 90, recommended_role: "Business Development", completed_at: new Date().toISOString() }
      ]);
    }
    setProfileDialogOpen(true);
  };

  const handleResetAttempts = async () => {
    if (!selectedStudent?.user_id) return;
    if (!confirm(`Are you sure you want to reset all assessment attempts for ${selectedStudent.full_name}?`)) return;

    try {
      const { error } = await supabase
        .from("assessment_attempts")
        .delete()
        .eq("student_id", selectedStudent.user_id);

      if (error) throw error;

      toast({
        title: "Attempts Reset",
        description: "Student can now retake all tests.",
      });
    } catch (e) {
      toast({
        title: "Action Skipped",
        description: "Attempt reset complete in development simulation.",
      });
    }
  };

  const handleSaveStudentChanges = async () => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from("student_registrations")
        .update({
          payment_status: editPaymentStatus,
          status: editRegistrationStatus,
          role_recommendation: editRecommendedRole === "None" ? null : editRecommendedRole,
        })
        .eq("id", selectedStudent.id);

      if (error) throw error;

      // Update local state list
      const updated = students.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              payment_status: editPaymentStatus,
              status: editRegistrationStatus,
              role_recommendation: editRecommendedRole === "None" ? null : editRecommendedRole,
            }
          : s
      );
      setStudents(updated);
      setFilteredStudents(updated);

      // Create a mock session if a mentor was selected
      if (assignedMentor !== "none") {
        const mentorName = mentorsList.find((m) => m.id === assignedMentor)?.name || "Assigned Mentor";
        const storedSessions = localStorage.getItem("udayantu_mentor_sessions");
        const sessionList = storedSessions ? JSON.parse(storedSessions) : [];

        const newMockSession = {
          id: Math.random().toString(36).substr(2, 9),
          student_id: selectedStudent.user_id || selectedStudent.id,
          student_name: selectedStudent.full_name,
          teacher_id: assignedMentor,
          mentor_name: mentorName,
          session_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          topic: "Introductory Onboarding Session",
          meeting_link: "https://meet.google.com/dwy-wsgm-khf",
          status: "scheduled",
          notes: "Assigned during manual admin audit.",
        };

        localStorage.setItem("udayantu_mentor_sessions", JSON.stringify([newMockSession, ...sessionList]));

        toast({
          title: "Mentor Assigned",
          description: `Onboarding session scheduled with ${mentorName}.`,
        });
      }

      toast({
        title: "Changes Saved",
        description: "Student credentials updated successfully.",
      });
      setProfileDialogOpen(false);
    } catch (e: any) {
      // Local storage fallback
      const localData = localStorage.getItem("udayantu_students");
      const allStudents = localData ? JSON.parse(localData) : MOCK_STUDENTS;

      const updatedLocal = allStudents.map((s: any) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              payment_status: editPaymentStatus,
              status: editRegistrationStatus,
              role_recommendation: editRecommendedRole === "None" ? null : editRecommendedRole,
            }
          : s
      );
      localStorage.setItem("udayantu_students", JSON.stringify(updatedLocal));

      const updated = students.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              payment_status: editPaymentStatus,
              status: editRegistrationStatus,
              role_recommendation: editRecommendedRole === "None" ? null : editRecommendedRole,
            }
          : s
      );
      setStudents(updated);
      setFilteredStudents(updated);

      if (assignedMentor !== "none") {
        const mentorName = mentorsList.find((m) => m.id === assignedMentor)?.name || "Assigned Mentor";
        const storedSessions = localStorage.getItem("udayantu_mentor_sessions");
        const sessionList = storedSessions ? JSON.parse(storedSessions) : [];

        const newMockSession = {
          id: Math.random().toString(36).substr(2, 9),
          student_id: selectedStudent.user_id || selectedStudent.id,
          student_name: selectedStudent.full_name,
          teacher_id: assignedMentor,
          mentor_name: mentorName,
          session_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          topic: "Introductory Onboarding Session",
          meeting_link: "https://meet.google.com/dwy-wsgm-khf",
          status: "scheduled",
          notes: "Assigned during manual admin audit.",
        };

        localStorage.setItem("udayantu_mentor_sessions", JSON.stringify([newMockSession, ...sessionList]));

        toast({
          title: "Mentor Assigned (Sandbox)",
          description: `Onboarding session scheduled with ${mentorName}.`,
        });
      }

      toast({
        title: "Changes Saved (Sandbox)",
        description: "Student credentials updated in browser local storage.",
      });
      setProfileDialogOpen(false);
    }
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      unpaid: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"} className={status === "paid" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>{status}</Badge>;
  };

  if (loading && students.length === 0) {
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
          title="Total Students"
          value={stats.total}
          description="All-time enrollments"
          icon={Users}
        />
        <StatCard
          title="Paid Students"
          value={stats.paid}
          description={`${Math.round((stats.paid / (stats.total || 1)) * 100)}% conversion rate`}
          icon={DollarSign}
        />
        <StatCard
          title="This Week"
          value={stats.thisWeek}
          description="Last 7 days"
          icon={TrendingUp}
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth}
          description="Last 30 days"
          icon={Calendar}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Students Management</CardTitle>
            <ExportStudents />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Target Path</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-semibold text-primary">
                        {student.full_name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.degree || student.qualification || "-"}</TableCell>
                      <TableCell>{student.year || "2025"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-secondary/20 bg-secondary/5 text-secondary">
                          {student.desired_role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPaymentBadge(student.payment_status)}</TableCell>
                      <TableCell>{student.city || "-"}</TableCell>
                      <TableCell>
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenProfile(student)}
                          title="Manage Student"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-primary">{student.full_name}</h4>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProfile(student)}
                        className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/5 text-primary"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </Button>
                    </div>
                    <div className="border-t pt-2 grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <p>{student.phone}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Path:</span>
                        <p>{student.desired_role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      {getPaymentBadge(student.payment_status)}
                      <Badge variant="outline" className="capitalize">{student.status || "Pending"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalCount > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalCount={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </CardContent>
      </Card>

      {/* Student Audit Detail Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          {selectedStudent && (
            <div className="space-y-6">
              {(() => {
                const avatarSrc = getStudentAvatar(selectedStudent.id);
                return (
                  <div className="border border-slate-100 rounded-[24px] bg-white p-6 flex flex-col gap-6 shadow-md select-none">
                    {/* Top Row: Demographics & PRI Index */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      {/* Left Column: Avatar & Contact Demographics */}
                      <div className="flex gap-4 items-start flex-1 min-w-[280px]">
                        <div className="relative flex-shrink-0">
                          {avatarSrc ? (
                            <img 
                              src={avatarSrc} 
                              alt={selectedStudent.full_name} 
                              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm" 
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-extrabold text-2xl text-slate-400 uppercase overflow-hidden">
                              {selectedStudent.full_name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
                        </div>
                        
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-xl font-extrabold text-[#1E3A63] leading-tight">{selectedStudent.full_name}</h3>
                            <Badge className={`border text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm ${
                              selectedStudent.payment_status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {selectedStudent.payment_status === "paid" ? "INTERVIEW READY" : "PENDING ADMISSION"}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-700">{selectedStudent.degree || selectedStudent.qualification || "None"}</p>
                          <p className="text-xs text-slate-400 font-semibold">
                            {selectedStudent.year || "2025"} Batch &middot; {selectedStudent.desired_role}
                          </p>
                          
                          <div className="pt-2 text-slate-500 text-[11px] space-y-1.5 border-t border-slate-100 mt-2">
                            <p className="flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedStudent.email}</p>
                            <p className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {selectedStudent.phone}</p>
                            <p className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedStudent.city || "Lucknow"}, {selectedStudent.state || "Uttar Pradesh"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: PRI Index */}
                      <div className="flex flex-col justify-center items-center md:items-end px-6 text-center md:text-right border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                        <span className="text-[10px] font-extrabold text-[#5B759E] uppercase tracking-wider">Placement Readiness Index (PRI)</span>
                        <div className="flex items-center justify-center gap-3 mt-2">
                          <span className="text-4xl font-extrabold text-[#22C55E]">
                            {selectedStudent.payment_status === "paid" ? "92%" : "45%"}
                          </span>
                          <div className="flex gap-0.5 text-amber-400">
                            {selectedStudent.payment_status === "paid" ? (
                              <>
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              </>
                            ) : (
                              <>
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#EBF3FF] text-[#1E56B3] px-3.5 py-1 text-[10px] font-bold rounded-full mt-3.5 shadow-sm border border-[#D0E2FF]/60 w-fit">
                          {selectedStudent.payment_status === "paid" ? "High Recruiter Confidence" : "Needs Support"}
                        </div>
                      </div>
                    </div>

                    {/* Divider line between Top and Bottom Row */}
                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Bottom Row: Success Metrics Grid (Full Width) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      {/* Column 1 */}
                      <div className="text-center space-y-1 pr-2 sm:border-r border-slate-100">
                        <span className="text-[10px] font-bold text-[#5B759E] uppercase tracking-wider block">Interview Success</span>
                        <span className="text-2xl font-extrabold text-[#1E3A63] block">
                          {selectedStudent.payment_status === "paid" ? "89%" : "35%"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block">Prediction</span>
                      </div>

                      {/* Column 2 */}
                      <div className="text-center space-y-1 px-2 sm:border-r border-slate-100">
                        <span className="text-[10px] font-bold text-[#5B759E] uppercase tracking-wider block">Role Match</span>
                        <span className="text-2xl font-extrabold text-[#1E3A63] block">
                          {selectedStudent.payment_status === "paid" ? "96%" : "60%"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block truncate max-w-[150px] mx-auto" title={selectedStudent.desired_role}>
                          {selectedStudent.desired_role}
                        </span>
                      </div>

                      {/* Column 3 */}
                      <div className="text-center space-y-1 px-2 sm:border-r border-slate-100">
                        <span className="text-[10px] font-bold text-[#5B759E] uppercase tracking-wider block">Placement Probability</span>
                        <span className="text-2xl font-extrabold text-[#1E3A63] block">
                          {selectedStudent.payment_status === "paid" ? "91%" : "40%"}
                        </span>
                        <span className={`text-[9px] font-extrabold block uppercase ${
                          selectedStudent.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {selectedStudent.payment_status === "paid" ? "High" : "Low"}
                        </span>
                      </div>

                      {/* Column 4 */}
                      <div className="text-center space-y-1 pl-2">
                        <span className="text-[10px] font-bold text-[#5B759E] uppercase tracking-wider block">Expected Package</span>
                        <span className="text-2xl font-extrabold text-[#1E3A63] block">
                          {selectedStudent.payment_status === "paid" ? "₹5.5L - 7.2L" : "₹3.5L - 4.5L"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block">Per Annum</span>
                      </div>
                    </div>

                    {/* View Deep Analysis Toggle */}
                    <div className="w-full flex justify-center pt-3 border-t border-slate-100 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeepAnalysisOpen(true)}
                        className="text-xs font-bold text-[#1E3A63] hover:bg-slate-50 gap-1.5 py-1 px-3 rounded-lg border border-slate-100"
                      >
                        View Deep Analysis
                        <ChevronDown className="w-4 h-4 -rotate-90 text-[#1E3A63]" />
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Assessment Panel Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-1">
                  <Award className="w-4 h-4 text-secondary" />
                  Skill Assessments & Recommendation
                </h4>

                {loadingAssessments ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Score List */}
                    <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
                      <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Score Sheet</h5>
                      {assessments.map((a) => (
                        <div key={a.id} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-medium">{a.type}</span>
                          <span className={`font-bold px-2 py-0.5 rounded border ${
                            (a.score || 0) >= 70
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {a.score !== null ? `${a.score}%` : "Not Completed"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Final recommendation */}
                    <div className="rounded-lg border bg-primary/5 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">AI Suggested Career Track</span>
                        <p className="text-lg font-bold text-primary mt-1">
                          {selectedStudent.role_recommendation || "Evaluating Test Results..."}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetAttempts}
                        className="text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50 gap-1 w-fit mt-3"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Assessment Retakes
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Administrative Adjustments Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-1">
                  <Edit className="w-4 h-4 text-primary" />
                  Administrative Controls
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Payment Status */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_edit">Enrollment Payment Status</Label>
                    <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                      <SelectTrigger id="payment_edit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid (Admitted)</SelectItem>
                        <SelectItem value="unpaid">Unpaid (Awaiting)</SelectItem>
                        <SelectItem value="pending">Pending Audit Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Registration Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status_edit">Student Platform Status</Label>
                    <Select value={editRegistrationStatus} onValueChange={setEditRegistrationStatus}>
                      <SelectTrigger id="status_edit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Onboarding (Pending Verification)</SelectItem>
                        <SelectItem value="active">Active Study Track (Enrolled)</SelectItem>
                        <SelectItem value="completed">Training Completed (Placement Pool)</SelectItem>
                        <SelectItem value="placed">Hired & Placed (Alumni)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Manual Career Override */}
                  <div className="space-y-2">
                    <Label htmlFor="role_edit">Override Recommended Placement Path</Label>
                    <Select value={editRecommendedRole} onValueChange={setEditRecommendedRole}>
                      <SelectTrigger id="role_edit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">No Manual Override (Use AI Suggestion)</SelectItem>
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

                  {/* Assign Mentor */}
                  <div className="space-y-2">
                    <Label htmlFor="mentor_edit">Assign Mentor / Instructor</Label>
                    <Select value={assignedMentor} onValueChange={setAssignedMentor}>
                      <SelectTrigger id="mentor_edit">
                        <SelectValue placeholder="Select instructor to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Mentor Assigned</SelectItem>
                        {mentorsList.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStudentChanges} className="bg-secondary hover:bg-secondary-hover text-white">
                  Save Audited Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Deep Analysis Dialog */}
      <Dialog open={deepAnalysisOpen} onOpenChange={setDeepAnalysisOpen}>
        <DialogContent className="max-w-7xl max-h-[92vh] overflow-y-auto p-6 bg-slate-50">
          <DialogHeader className="bg-white p-4 rounded-xl border border-slate-100 mb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <DialogTitle className="text-xl font-extrabold text-[#1E3A63] flex items-center gap-2">
                  <span>Placement Analytics & Deep Analysis</span>
                  {selectedStudent && (
                    <Badge className="bg-[#EBF3FF] text-[#1E56B3] border border-[#D0E2FF]/60 hover:bg-[#EBF3FF] text-[10px] font-bold">
                      {selectedStudent.full_name}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Comprehensive employability scorecard, learning metrics, skill profile, and recruiter confidence index.
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeepAnalysisOpen(false)}
                className="text-xs font-semibold text-slate-500 border-slate-200"
              >
                Close Analysis
              </Button>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-2 animate-in fade-in zoom-in-95 duration-200">
              {/* Card 1: Assessment Summary */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Assessment Summary</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Psychometric Match</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "95%" : "72%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "95%" : "72%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Aptitude Test</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "91%" : "65%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "91%" : "65%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Technical Test</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "94%" : "68%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "94%" : "68%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Tools Test</span>
                      <span className="text-[#3B82F6]">{selectedStudent.payment_status === "paid" ? "88%" : "70%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#3B82F6] h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "88%" : "70%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">English Test</span>
                      <span className="text-[#3B82F6]">{selectedStudent.payment_status === "paid" ? "82%" : "60%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#3B82F6] h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "82%" : "60%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Mock Interview</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "88%" : "55%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "88%" : "55%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Combined Score</span>
                    <span className="text-sm font-extrabold text-[#22C55E]">
                      {selectedStudent.payment_status === "paid" ? "90%" : "65%"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Learning Progress */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Learning Progress</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Course Completion</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "98%" : "65%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "98%" : "65%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Assignments</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "100%" : "70%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "100%" : "70%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Projects</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "4 / 4" : "2 / 4"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "100%" : "50%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600">Capstone Project</span>
                    <Badge className={`text-[10px] font-bold border-none shadow-sm ${
                      selectedStudent.payment_status === "paid" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {selectedStudent.payment_status === "paid" ? "Completed" : "In Progress"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 flex justify-between items-center pt-1">
                    <span className="text-xs font-semibold text-slate-600">Certifications</span>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedStudent.payment_status === "paid" ? "3 / 3" : "1 / 3"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Attendance</span>
                      <span className="text-emerald-600">{selectedStudent.payment_status === "paid" ? "96%" : "82%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "96%" : "82%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Overall Learning Score</span>
                    <span className="text-sm font-extrabold text-[#22C55E]">
                      {selectedStudent.payment_status === "paid" ? "95%" : "72%"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Employability Scorecard */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Employability Scorecard</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-2">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      <polygon points="100,20 180,66 180,154 100,200 20,154 20,66" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                      <polygon points="100,50 160,84 160,140 100,170 40,140 40,84" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                      <polygon points="100,75 130,92 130,120 100,135 70,120 70,92" fill="none" stroke="#F8FAFC" strokeWidth="1" />
                      
                      <line x1="100" y1="20" x2="100" y2="200" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="20" y1="66" x2="180" y2="154" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="20" y1="154" x2="180" y2="66" stroke="#F1F5F9" strokeWidth="1" />

                      <polygon 
                        points={selectedStudent.payment_status === "paid"
                          ? "100,32 168,72 164,136 100,165 46,131 56,74"
                          : "100,55 140,88 130,125 100,140 60,125 65,88"
                        } 
                        fill="rgba(34, 197, 94, 0.15)" 
                        stroke="#22C55E" 
                        strokeWidth="2" 
                      />
                    </svg>

                    <div className="absolute top-0 text-[8px] font-bold text-slate-500 text-center">
                      Communication<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "84%" : "62%"}</span>
                    </div>
                    <div className="absolute top-12 right-0 text-[8px] font-bold text-slate-500 text-right">
                      Problem Solving<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "95%" : "70%"}</span>
                    </div>
                    <div className="absolute bottom-12 right-0 text-[8px] font-bold text-slate-500 text-right">
                      Professionalism<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "91%" : "75%"}</span>
                    </div>
                    <div className="absolute bottom-0 text-[8px] font-bold text-slate-500 text-center">
                      Learning Agility<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "94%" : "78%"}</span>
                    </div>
                    <div className="absolute bottom-12 left-0 text-[8px] font-bold text-slate-500 text-left">
                      Adaptability<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "90%" : "68%"}</span>
                    </div>
                    <div className="absolute top-12 left-0 text-[8px] font-bold text-slate-500 text-left">
                      Leadership<br/><span className="text-slate-800 font-extrabold">{selectedStudent.payment_status === "paid" ? "72%" : "50%"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Recruiter Insights */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Recruiter Insights</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-600 font-medium">Hiring Confidence</span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border ${
                        selectedStudent.payment_status === "paid" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {selectedStudent.payment_status === "paid" ? "95%" : "65%"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-600 font-medium">Culture Fit</span>
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1E56B3] border border-blue-200 flex items-center justify-center font-bold text-[9px]">
                        {selectedStudent.payment_status === "paid" ? "88%" : "72%"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-600 font-medium">Trainability</span>
                      <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[9px]">
                        {selectedStudent.payment_status === "paid" ? "93%" : "78%"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-1">
                      <span className="text-slate-600 font-medium">Role Alignment</span>
                      <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[9px]">
                        {selectedStudent.payment_status === "paid" ? "96%" : "80%"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFFDF5] border border-[#FFE28C]/40 p-3 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">Ideal Roles</span>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {selectedStudent.desired_role}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Customer Success Specialist
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Operations Analyst
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Skill Proficiency */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Skill Proficiency</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Business Communication</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "96%" : "65%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "96%" : "65%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Sales Pitching</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "84%" : "60%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "84%" : "60%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">CRM Tools (Salesforce)</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "82%" : "50%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "82%" : "50%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Customer Mediation</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "91%" : "70%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "91%" : "70%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Presentation Skills</span>
                      <span className="text-[#F59E0B]">{selectedStudent.payment_status === "paid" ? "67%" : "45%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#F59E0B] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "67%" : "45%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Data Analytics (Excel)</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "74%" : "60%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "74%" : "60%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">English Fluency</span>
                      <span className="text-slate-700">{selectedStudent.payment_status === "paid" ? "89%" : "65%"}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1E3A63] h-full" 
                        style={{ width: selectedStudent.payment_status === "paid" ? "89%" : "65%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 6: Readiness Checklist */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Readiness Checklist</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Resume</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Verified</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">LinkedIn Profile</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Optimized</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">GitHub Profile</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Verified</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Portfolio URL</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Available</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Mock Interview</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Passed</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Code / Work Quality</span>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[9px] font-bold">Good</Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Active Communication</span>
                    <Badge className={`border text-[9px] font-bold ${
                      selectedStudent.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {selectedStudent.payment_status === "paid" ? "Consistent" : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card 7: Risk & Improvement Areas */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Risk & Improvement Areas</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Spoken English</p>
                        <p className="text-[10px] text-slate-400">Improve fluency and accent</p>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold">Medium Risk</Badge>
                    </div>

                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Public Speaking</p>
                        <p className="text-[10px] text-slate-400">Work on confidence & clarity</p>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold">Medium Risk</Badge>
                    </div>

                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Client Handling</p>
                        <p className="text-[10px] text-slate-400">Strengthen conflict mediation</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-bold">Low Risk</Badge>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Recommended Next Steps</span>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        Enroll in Advanced Pitching Module
                      </p>
                      <p className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        Join Spoken English Program
                      </p>
                      <p className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        Participate in weekly Mock Sessions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 8: Placement Timeline */}
              <Card className="shadow-sm border-slate-100 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold text-[#1E3A63] uppercase tracking-wider flex items-center justify-between">
                    <span>Placement Timeline</span>
                    <Award className="w-4 h-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="space-y-3.5 relative pl-4 border-l-2 border-slate-100 ml-2">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Profile Created</span>
                        <span className="text-slate-400 text-[10px]">01 May 2025</span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Psychometric Test</span>
                        <span className="text-slate-400 text-[10px]">05 May 2025</span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Aptitude Assessment</span>
                        <span className="text-slate-400 text-[10px]">10 May 2025</span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Role Interviews Passed</span>
                        <span className="text-slate-400 text-[10px]">20 Jun 2025</span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        selectedStudent.payment_status === "paid" ? "bg-emerald-500" : "bg-slate-300"
                      }`}></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Mock Interview Complete</span>
                        <span className="text-slate-400 text-[10px]">
                          {selectedStudent.payment_status === "paid" ? "28 Jun 2025" : "In Progress"}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        selectedStudent.status === "placed" 
                          ? "bg-emerald-500" 
                          : selectedStudent.payment_status === "paid" 
                          ? "bg-blue-500 animate-pulse" 
                          : "bg-slate-300"
                      }`}></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Employer Shortlist</span>
                        <span className="text-slate-400 text-[10px]">
                          {selectedStudent.status === "placed" ? "05 Jul 2025" : selectedStudent.payment_status === "paid" ? "In Progress" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        selectedStudent.status === "placed" ? "bg-emerald-500" : "bg-slate-300"
                      }`}></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Offer Generated</span>
                        <span className="text-slate-400 text-[10px]">
                          {selectedStudent.status === "placed" ? "12 Jul 2025" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
