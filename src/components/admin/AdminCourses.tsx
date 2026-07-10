import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CurriculumModule {
  week: number;
  title: string;
  topics: string[];
}

interface Course {
  id: string;
  title: string;
  title_hi?: string;
  description: string;
  description_hi?: string;
  role_type: string;
  duration_weeks: number;
  status: string;
  preview_video_url?: string;
  curriculum?: CurriculumModule[];
}

const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Executive Business Development Program",
    title_hi: "कार्यकारी व्यवसाय विकास कार्यक्रम",
    description: "Learn client relationship skills, dynamic lead generation, and B2B corporate communications.",
    description_hi: "ग्राहक संबंध कौशल, गतिशील लीड जनरेशन और बी2बी कॉर्पोरेट संचार सीखें।",
    role_type: "Sales Executive",
    duration_weeks: 12,
    status: "active",
    preview_video_url: "https://www.youtube.com/watch?v=mock1",
    curriculum: [
      { week: 1, title: "Foundations of Sales", topics: ["Cold calling", "Lead generation"] },
      { week: 2, title: "Negotiation and Closing", topics: ["Handling objections", "Contract signing"] }
    ]
  },
  {
    id: "c2",
    title: "Customer Support & Success Masterclass",
    title_hi: "ग्राहक सहायता और सफलता मास्टरक्लास",
    description: "Master ticketing workflows, escalation paths, client satisfaction metrics, and CRM software tools.",
    description_hi: "टिकटिंग वर्कफ़्लो, एस्केलेशन पथ, क्लाइंट संतुष्टि मेट्रिक्स और सीआरएम सॉफ़्टवेयर टूल में महारत हासिल करें।",
    role_type: "Customer Support",
    duration_weeks: 8,
    status: "active",
    preview_video_url: "https://www.youtube.com/watch?v=mock2",
    curriculum: [
      { week: 1, title: "Introduction to CRM", topics: ["Zendesk basics", "Email support etiquette"] }
    ]
  }
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

const ROLE_TYPES = [
  "BPO Voice Process",
  "BPO Non-Voice Process",
  "Sales Executive",
  "Digital Marketing Executive",
  "Tele-caller",
  "Customer Support",
  "Data Entry Operator",
  "Back Office Executive"
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" }
];

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    role_type: "",
    duration_weeks: 12,
    status: "active",
    preview_video_url: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) throw new Error("No database courses found");
      // Map the data to match our Course interface
      const mappedCourses: Course[] = (data || []).map((course) => ({
        id: course.id,
        title: course.title,
        title_hi: course.title_hi || undefined,
        description: course.description,
        description_hi: course.description_hi || undefined,
        role_type: course.role_type,
        duration_weeks: course.duration_weeks,
        status: course.status || 'active',
        preview_video_url: course.preview_video_url || undefined,
        curriculum: Array.isArray(course.curriculum) ? (course.curriculum as unknown as CurriculumModule[]) : undefined,
      }));
      setCourses(mappedCourses);
    } catch (error: unknown) {
      console.warn("Could not query courses from database. Initializing clean/empty state.");
      const stored = localStorage.getItem("udayantu_courses");
      if (stored) {
        setCourses(JSON.parse(stored));
      } else {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(formData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Course updated successfully" });
      } else {
        const { error } = await supabase.from("courses").insert([formData]);

        if (error) throw error;
        toast({ title: "Course created successfully" });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        title: "",
        title_hi: "",
        description: "",
        description_hi: "",
        role_type: "",
        duration_weeks: 12,
        status: "active",
        preview_video_url: "",
      });
      fetchCourses();
    } catch (error: unknown) {
      // Local Storage Fallback mutation
      const stored = localStorage.getItem("udayantu_courses");
      let allCourses = stored ? JSON.parse(stored) as Course[] : [];

      if (editingCourse) {
        allCourses = allCourses.map((c) =>
          c.id === editingCourse.id
            ? { ...c, ...formData }
            : c
        );
        toast({ title: "Course updated successfully (Sandbox)" });
      } else {
        const newCourse: Course = {
          id: "c-" + Math.random().toString(36).substr(2, 9),
          ...formData,
        };
        allCourses.unshift(newCourse);
        toast({ title: "Course created successfully (Sandbox)" });
      }

      localStorage.setItem("udayantu_courses", JSON.stringify(allCourses));
      setCourses(allCourses);

      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        title: "",
        title_hi: "",
        description: "",
        description_hi: "",
        role_type: "",
        duration_weeks: 12,
        status: "active",
        preview_video_url: "",
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      title_hi: course.title_hi || "",
      description: course.description,
      description_hi: course.description_hi || "",
      role_type: course.role_type,
      duration_weeks: course.duration_weeks,
      status: course.status,
      preview_video_url: course.preview_video_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Course deleted successfully" });
      fetchCourses();
    } catch (error: unknown) {
      // Local Storage Fallback
      const stored = localStorage.getItem("udayantu_courses");
      if (stored) {
        let allCourses = JSON.parse(stored) as Course[];
        allCourses = allCourses.filter((c) => c.id !== id);
        localStorage.setItem("udayantu_courses", JSON.stringify(allCourses));
        setCourses(allCourses);
        toast({ title: "Course deleted successfully (Sandbox)" });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Courses Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCourse(null);
              setFormData({
                title: "",
                title_hi: "",
                description: "",
                description_hi: "",
                role_type: "",
                duration_weeks: 12,
                status: "active",
                preview_video_url: "",
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
              <DialogDescription>
                Fill in the course details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title (English) *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., BPO Voice Process Course"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="title_hi">Title (Hindi)</Label>
                  <Input
                    id="title_hi"
                    value={formData.title_hi}
                    onChange={(e) =>
                      setFormData({ ...formData, title_hi: e.target.value })
                    }
                    placeholder="बीपीओ वॉइस प्रोसेस कोर्स"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed course description..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description_hi">Description (Hindi)</Label>
                <Textarea
                  id="description_hi"
                  value={formData.description_hi}
                  onChange={(e) =>
                    setFormData({ ...formData, description_hi: e.target.value })
                  }
                  placeholder="पाठ्यक्रम का विवरण..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role_type">Role Type *</Label>
                  <Select
                    value={formData.role_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role_type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_TYPES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.duration_weeks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_weeks: parseInt(e.target.value) || 12,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preview_video_url">Preview Video URL</Label>
                  <Input
                    id="preview_video_url"
                    type="url"
                    value={formData.preview_video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, preview_video_url: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingCourse ? "Update" : "Create"} Course
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No courses found. Create your first course to get started.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        {course.title_hi && (
                          <div className="text-sm text-muted-foreground">{course.title_hi}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.role_type}</Badge>
                    </TableCell>
                    <TableCell>{course.duration_weeks} weeks</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          course.status === "active"
                            ? "default"
                            : course.status === "draft"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
