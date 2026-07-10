import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Calendar, Clock, Video, FileText, CheckCircle2, XCircle, AlertCircle, RefreshCw, UserCheck, Star, Edit } from "lucide-react";
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

export interface MentorSession {
  id: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  mentor_name: string;
  session_date: string;
  duration_minutes: number;
  topic: string;
  meeting_link: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes: string;
  feedback_rating?: number | null;
  student_attendance?: "present" | "absent" | "late" | "excused";
}

interface SelectorItem {
  id: string;
  full_name: string;
}

const ITEMS_PER_PAGE = 5;

const MOCK_SESSIONS: MentorSession[] = [
  {
    id: "s1",
    student_id: "st1",
    student_name: "Amit Kumar",
    teacher_id: "t1",
    mentor_name: "Dr. Ramesh Prasad",
    session_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    topic: "Linear Equations & Quantitative Practice",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    status: "scheduled",
    notes: "",
    feedback_rating: null,
    student_attendance: "present"
  },
  {
    id: "s2",
    student_id: "st2",
    student_name: "Priyanka Patel",
    teacher_id: "t2",
    mentor_name: "Meera Nair",
    session_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    topic: "Introduction and Ice Breaking Exercises",
    meeting_link: "https://meet.google.com/xyz-uvwx-yza",
    status: "completed",
    notes: "Priyanka spoke very confidently. Her introduction has improved, but she needs practice with active voice sentences.",
    feedback_rating: 4,
    student_attendance: "present"
  },
  {
    id: "s3",
    student_id: "st3",
    student_name: "Rahul Verma",
    teacher_id: "t3",
    mentor_name: "Alok Sengupta",
    session_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    topic: "Excel VLOOKUP & Pivot Tables Session",
    meeting_link: "https://meet.google.com/pqr-stuv-wxy",
    status: "no-show",
    notes: "Student did not join the meeting link. Attempted contact, phone was switched off.",
    feedback_rating: null,
    student_attendance: "absent"
  }
];

export function AdminMentorSessions() {
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<MentorSession[]>([]);
  const [students, setStudents] = useState<SelectorItem[]>([]);
  const [teachers, setTeachers] = useState<SelectorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Scheduling Dialog states
  const [schedDialogOpen, setSchedDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState("");
  const [meetLink, setMeetLink] = useState("");

  // Complete/Feedback Dialog states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<MentorSession | null>(null);
  const [attendance, setAttendance] = useState<"present" | "absent" | "late" | "excused">("present");
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchSessionsData();
    fetchSelectors();
  }, []);

  useEffect(() => {
    let result = [...sessions];

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.student_name.toLowerCase().includes(lower) ||
          s.mentor_name.toLowerCase().includes(lower) ||
          s.topic.toLowerCase().includes(lower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    setFilteredSessions(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sessions]);

  const fetchSessionsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select("*")
        .order("session_date", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Resolve student names from database or mock them
        const mapped: MentorSession[] = data.map((s) => ({
          id: s.id,
          student_id: s.student_id,
          student_name: "Student " + s.student_id.slice(0, 4), // Placeholder if we don't join
          teacher_id: s.teacher_id || "",
          mentor_name: s.mentor_name,
          session_date: s.session_date,
          duration_minutes: s.duration_minutes || 60,
          topic: s.topic || "",
          meeting_link: s.meeting_link || "",
          status: (s.status as any) || "scheduled",
          notes: s.notes || "",
          feedback_rating: s.feedback_rating || null,
          student_attendance: s.student_attendance || "present",
        }));
        setSessions(mapped);
        setIsUsingMock(false);
      } else {
        loadMockSessions();
      }
    } catch (e) {
      console.warn("Could not query mentor_sessions from database. Falling back to sandbox.");
      loadMockSessions();
    } finally {
      setLoading(false);
    }
  };

  const loadMockSessions = () => {
    setIsUsingMock(true);
    const stored = localStorage.getItem("udayantu_mentor_sessions");
    if (stored) {
      setSessions(JSON.parse(stored));
    } else {
      localStorage.setItem("udayantu_mentor_sessions", JSON.stringify(MOCK_SESSIONS));
      setSessions(MOCK_SESSIONS);
    }
  };

  const fetchSelectors = async () => {
    // Load Students list for dropdown
    try {
      const { data: stdData, error: stdErr } = await supabase
        .from("student_registrations")
        .select("user_id, full_name");

      if (stdErr) throw stdErr;

      if (stdData && stdData.length > 0) {
        setStudents(
          stdData.map((s) => ({
            id: s.user_id || "",
            full_name: s.full_name || "Unknown Student",
          }))
        );
      } else {
        setStudents([
          { id: "st1", full_name: "Amit Kumar" },
          { id: "st2", full_name: "Priyanka Patel" },
          { id: "st3", full_name: "Rahul Verma" },
        ]);
      }
    } catch (e) {
      setStudents([
        { id: "st1", full_name: "Amit Kumar" },
        { id: "st2", full_name: "Priyanka Patel" },
        { id: "st3", full_name: "Rahul Verma" },
      ]);
    }

    // Load Teachers list for dropdown
    try {
      const { data: teachData, error: teachErr } = await supabase
        .from("teachers")
        .select("id, full_name");

      if (teachErr) throw teachErr;

      if (teachData && teachData.length > 0) {
        setTeachers(
          teachData.map((t) => ({
            id: t.id,
            full_name: t.full_name,
          }))
        );
      } else {
        const storedTeachers = localStorage.getItem("udayantu_teachers");
        if (storedTeachers) {
          const parseList = JSON.parse(storedTeachers) as SelectorItem[];
          setTeachers(parseList.map((t) => ({ id: t.id, full_name: t.full_name })));
        } else {
          setTeachers([
            { id: "t1", full_name: "Dr. Ramesh Prasad" },
            { id: "t2", full_name: "Meera Nair" },
            { id: "t3", full_name: "Alok Sengupta" },
          ]);
        }
      }
    } catch (e) {
      setTeachers([
        { id: "t1", full_name: "Dr. Ramesh Prasad" },
        { id: "t2", full_name: "Meera Nair" },
        { id: "t3", full_name: "Alok Sengupta" },
      ]);
    }
  };

  const saveSessionsList = (updatedList: MentorSession[]) => {
    setSessions(updatedList);
    if (isUsingMock) {
      localStorage.setItem("udayantu_mentor_sessions", JSON.stringify(updatedList));
    }
  };

  const handleOpenSchedDialog = () => {
    setSelectedStudent("");
    setSelectedTeacher("");
    setSessionDate("");
    setDuration(60);
    setTopic("");
    setMeetLink("https://meet.google.com/" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4) + "-" + Math.random().toString(36).substr(2, 3));
    setSchedDialogOpen(true);
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedTeacher || !sessionDate || !topic) {
      toast({
        title: "Validation Error",
        description: "Student, Teacher, Date, and Topic are required.",
        variant: "destructive",
      });
      return;
    }

    const studentName = students.find((s) => s.id === selectedStudent)?.full_name || "Selected Student";
    const teacherName = teachers.find((t) => t.id === selectedTeacher)?.full_name || "Selected Mentor";

    const newSession: MentorSession = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: selectedStudent,
      student_name: studentName,
      teacher_id: selectedTeacher,
      mentor_name: teacherName,
      session_date: new Date(sessionDate).toISOString(),
      duration_minutes: duration,
      topic,
      meeting_link: meetLink,
      status: "scheduled",
      notes: "",
    };

    try {
      if (!isUsingMock) {
        const { error } = await supabase.from("mentor_sessions").insert({
          id: newSession.id,
          student_id: newSession.student_id,
          mentor_name: newSession.mentor_name,
          teacher_id: newSession.teacher_id,
          session_date: newSession.session_date,
          duration_minutes: newSession.duration_minutes,
          topic: newSession.topic,
          meeting_link: newSession.meeting_link,
          status: newSession.status,
          notes: newSession.notes,
        });
        if (error) throw error;
      }

      saveSessionsList([newSession, ...sessions]);
      setSchedDialogOpen(false);

      toast({
        title: "Session Scheduled",
        description: `Mentor session successfully scheduled with ${teacherName}.`,
      });
    } catch (e: any) {
      toast({
        title: "Database Sync Error",
        description: e.message || "Failed to schedule session in database.",
        variant: "destructive",
      });
    }
  };

  const handleOpenCompleteDialog = (session: MentorSession) => {
    setActiveSession(session);
    setAttendance(session.student_attendance || "present");
    setRating(session.feedback_rating || 5);
    setNotes(session.notes || "");
    setFeedbackDialogOpen(true);
  };

  const handleCompleteSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSession) return;

    const updatedSession: MentorSession = {
      ...activeSession,
      status: "completed",
      student_attendance: attendance,
      feedback_rating: rating,
      notes,
    };

    try {
      if (!isUsingMock) {
        const { error } = await supabase
          .from("mentor_sessions")
          .update({
            status: "completed",
            student_attendance: attendance,
            feedback_rating: rating,
            notes,
          })
          .eq("id", activeSession.id);

        if (error) throw error;
      }

      const updated = sessions.map((s) => (s.id === activeSession.id ? updatedSession : s));
      saveSessionsList(updated);
      setFeedbackDialogOpen(false);

      // Increment teacher's total teaching hours in mock storage if applicable
      if (isUsingMock) {
        const storedT = localStorage.getItem("udayantu_teachers");
        if (storedT) {
          const parsedList = JSON.parse(storedT) as any[];
          const nextList = parsedList.map((t) => {
            if (t.id === activeSession.teacher_id) {
              const prev = Number(t.total_hours) || 0;
              const hrs = Math.ceil(activeSession.duration_minutes / 60);
              return { ...t, total_hours: prev + hrs };
            }
            return t;
          });
          localStorage.setItem("udayantu_teachers", JSON.stringify(nextList));
        }
      }

      toast({
        title: "Session Completed",
        description: `Attendance logged & rating saved for ${activeSession.student_name}.`,
      });
    } catch (e: any) {
      toast({
        title: "Update Failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelSession = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    try {
      if (!isUsingMock) {
        const { error } = await supabase
          .from("mentor_sessions")
          .update({ status: "cancelled" })
          .eq("id", id);
        if (error) throw error;
      }

      const updated = sessions.map((s) =>
        s.id === id ? { ...s, status: "cancelled" as const } : s
      );
      saveSessionsList(updated);

      toast({
        title: "Session Cancelled",
        description: "The scheduled class has been cancelled.",
      });
    } catch (e) {
      toast({
        title: "Database Sync Error",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; class: string; icon: any }> = {
      scheduled: { label: "Scheduled", class: "bg-blue-100 text-blue-700", icon: Calendar },
      completed: { label: "Completed", class: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
      cancelled: { label: "Cancelled", class: "bg-rose-100 text-rose-700", icon: XCircle },
      "no-show": { label: "No Show", class: "bg-amber-100 text-amber-700", icon: AlertCircle },
    };

    const conf = configs[status] || configs.scheduled;
    const Icon = conf.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1 w-fit border-none ${conf.class}`}>
        <Icon className="w-3 h-3" />
        {conf.label}
      </Badge>
    );
  };

  // Pagination Helper
  const totalCount = filteredSessions.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stat computations
  const scheduledCount = sessions.filter((s) => s.status === "scheduled").length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const cancellationRate = Math.round(
    (sessions.filter((s) => s.status === "cancelled").length / (sessions.length || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          description="Classes registered"
          icon={Calendar}
        />
        <StatCard
          title="Scheduled Classes"
          value={scheduledCount}
          description="Upcoming training"
          icon={Clock}
        />
        <StatCard
          title="Completed Classes"
          value={completedCount}
          description="Training sessions delivered"
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${cancellationRate}%`}
          description="Proportion of cancelled bookings"
          icon={XCircle}
        />
      </div>

      {isUsingMock && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-800 flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            <span><strong>Sandbox Mode:</strong> Session schedules are saved locally. Enable Supabase schemas to share session scheduling company-wide.</span>
          </span>
          <Button variant="outline" size="sm" className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-100/50 text-amber-800" onClick={fetchSessionsData}>
            Sync Database
          </Button>
        </div>
      )}

      {/* Main Sessions Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Mentor Session Scheduler</CardTitle>
            <CardDescription>Coordinate lessons, check virtual link availability, and track student attendance.</CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleOpenSchedDialog} className="flex-1 md:flex-initial bg-secondary hover:bg-secondary-hover text-white gap-1">
              <Plus className="w-4 h-4" />
              Schedule Class
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters Panel */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, teacher, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="scheduled">Scheduled Only</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="no-show">No Shows</SelectItem>
                <SelectItem value="cancelled">Cancelled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Class details</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-center">Link</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No mentor sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-semibold text-slate-800">
                        {session.student_name}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {session.mentor_name}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px]">
                          <p className="font-semibold text-xs line-clamp-1">{session.topic}</p>
                          {session.notes && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-slate-700">
                          {new Date(session.session_date).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes} mins)
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        {session.meeting_link ? (
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block p-1.5 rounded-full hover:bg-slate-100 text-blue-500 hover:text-blue-700"
                            title="Join Meeting"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(session.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {session.status === "scheduled" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCompleteDialog(session)}
                                className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Check-in
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancelSession(session.id)}
                                title="Cancel Class"
                              >
                                <XCircle className="w-4 h-4 text-rose-500" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center text-xs text-slate-400 gap-1 select-none">
                              {session.feedback_rating && (
                                <span className="flex items-center font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  {session.feedback_rating}
                                  <Star className="w-3 h-3 fill-amber-500 stroke-amber-500 ml-0.5" />
                                </span>
                              )}
                              <span>Attendance: {session.student_attendance}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Sessions View */}
          <div className="md:hidden space-y-4">
            {paginatedSessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No classes scheduled.
              </div>
            ) : (
              paginatedSessions.map((session) => (
                <Card key={session.id} className="shadow-sm">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">{session.student_name}</h4>
                        <p className="text-xs text-primary font-medium">Instructor: {session.mentor_name}</p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border text-xs space-y-1">
                      <p className="font-semibold text-slate-700">Topic: {session.topic}</p>
                      {session.notes && <p className="italic text-slate-500">"{session.notes}"</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t pt-2">
                      <div>
                        <span>Date:</span>
                        <p className="font-medium text-slate-700">
                          {new Date(session.session_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span>Time:</span>
                        <p className="font-medium text-slate-700">
                          {new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes}m)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t">
                      {session.meeting_link && (
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1 border-blue-200 text-blue-600">
                          <a href={session.meeting_link} target="_blank" rel="noreferrer">
                            <Video className="w-3 h-3" />
                            Join
                          </a>
                        </Button>
                      )}
                      {session.status === "scheduled" && (
                        <>
                          <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => handleCancelSession(session.id)}>
                            Cancel
                          </Button>
                          <Button variant="default" size="sm" className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleOpenCompleteDialog(session)}>
                            Complete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
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

      {/* Class Scheduler Dialog */}
      <Dialog open={schedDialogOpen} onOpenChange={setSchedDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleScheduleSession}>
            <DialogHeader>
              <DialogTitle>Schedule Mentor Session</DialogTitle>
              <DialogDescription>Create a meeting booking slot for student training instruction.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student_select">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student_select">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_select">Select Teacher/Mentor *</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger id="teacher_select">
                    <SelectValue placeholder="Choose an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class_date">Date & Start Time *</Label>
                  <Input
                    id="class_date"
                    type="datetime-local"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_duration">Duration (Minutes)</Label>
                  <Input
                    id="class_duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={15}
                    max={180}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_topic">Lesson Topic *</Label>
                <Input
                  id="class_topic"
                  placeholder="e.g. Resume building, Soft skills intro"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meet_link">Virtual Meeting URL</Label>
                <Input
                  id="meet_link"
                  placeholder="Google Meet, Zoom, or Skype Link"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSchedDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-secondary hover:bg-secondary-hover text-white">
                Book Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check-in / Complete Class Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCompleteSession}>
            <DialogHeader>
              <DialogTitle>Complete Lesson Check-in</DialogTitle>
              <DialogDescription>
                Mark student attendance and write feedback rating for {activeSession?.student_name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="attendance">Student Attendance Status</Label>
                <Select
                  value={attendance}
                  onValueChange={(val: any) => setAttendance(val)}
                >
                  <SelectTrigger id="attendance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present (On Time)</SelectItem>
                    <SelectItem value="late">Late Arrival</SelectItem>
                    <SelectItem value="absent">Unexcused No Show</SelectItem>
                    <SelectItem value="excused">Excused Absence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_rating">Student Performance/Readiness (1-5 Stars)</Label>
                <Select
                  value={rating.toString()}
                  onValueChange={(val) => setRating(Number(val))}
                >
                  <SelectTrigger id="student_rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (Fully Prepared)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Good (Ready, Minor practice needed)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Average (Needs focused work)</SelectItem>
                    <SelectItem value="2">⭐⭐ Fair (Unprepared, struggles)</SelectItem>
                    <SelectItem value="1">⭐ Poor (Severe difficulties)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_notes">Mentor Feedback & Lesson Notes</Label>
                <Textarea
                  id="class_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record summary of lessons taught, homework assignments, or developmental guidelines..."
                  className="h-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                Submit Class Logs
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
