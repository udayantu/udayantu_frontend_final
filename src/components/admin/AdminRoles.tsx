import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmRoleDialog } from "./ConfirmRoleDialog";

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  desired_role: string;
  role_recommendation: string | null;
  final_role: string | null;
  payment_status: string;
}

const ROLE_OPTIONS = [
  { value: 'BD', label: 'Business Development' },
  { value: 'CS', label: 'Customer Success' },
  { value: 'PM', label: 'Product Management' },
  { value: 'Ops', label: 'Operations' },
  { value: 'Product', label: 'Product Development' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'MM', label: 'Marketing Management' },
  { value: 'CSP', label: 'Customer Support' },
];

export function AdminRoles() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from("student_registrations")
        .select("id, user_id, full_name, email, desired_role, role_recommendation, final_role, payment_status")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) throw new Error("No database records found");
      setStudents(data || []);
    } catch (error: unknown) {
      // Local Storage Fallback using the exact same udayantu_students dataset!
      const stored = localStorage.getItem("udayantu_students");
      const allStudents = stored ? JSON.parse(stored) : [];

      let results = [...allStudents];
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter((s: any) => 
          s.full_name?.toLowerCase().includes(lower) ||
          s.email?.toLowerCase().includes(lower)
        );
      }

      setStudents(results.map((s: any) => ({
        id: s.id,
        user_id: s.user_id || "",
        full_name: s.full_name,
        email: s.email,
        desired_role: s.desired_role,
        role_recommendation: s.role_recommendation || null,
        final_role: s.final_role || null,
        payment_status: s.payment_status,
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingStudent || !newRole) return;

    setSaving(true);
    setShowConfirm(false);
    try {
      const { error } = await supabase
        .from("student_registrations")
        .update({ 
          final_role: newRole,
        })
        .eq("id", editingStudent.id);

      if (error) throw error;

      toast({
        title: "Role Updated Successfully",
        description: `${editingStudent.full_name}'s role has been changed to ${newRole}`,
      });

      setEditingStudent(null);
      setNewRole("");
      fetchStudents();
    } catch (error: unknown) {
      // Local Storage Fallback mutation
      const stored = localStorage.getItem("udayantu_students");
      if (stored) {
        const allStudents = JSON.parse(stored);
        const updated = allStudents.map((s: any) => 
          s.id === editingStudent.id
            ? { ...s, final_role: newRole }
            : s
        );
        localStorage.setItem("udayantu_students", JSON.stringify(updated));
      }

      toast({
        title: "Role Updated Successfully (Sandbox)",
        description: `${editingStudent.full_name}'s role has been changed to ${newRole} in local storage.`,
      });

      setEditingStudent(null);
      setNewRole("");
      fetchStudents();
    } finally {
      setSaving(false);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Manually assign or update student roles</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Desired Role</TableHead>
                  <TableHead>Recommended</TableHead>
                  <TableHead>Final Role</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.desired_role}</Badge>
                      </TableCell>
                      <TableCell>
                        {student.role_recommendation ? (
                          <Badge variant="secondary">{student.role_recommendation}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.final_role ? (
                          <Badge>{student.final_role}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {student.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingStudent(student);
                            setNewRole(student.final_role || student.role_recommendation || '');
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Student Role</DialogTitle>
            <DialogDescription>
              Manually assign a role for {editingStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Desired Role</label>
              <p className="text-sm text-muted-foreground">{editingStudent?.desired_role}</p>
            </div>
            {editingStudent?.role_recommendation && (
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Recommendation</label>
                <p className="text-sm text-muted-foreground">{editingStudent.role_recommendation}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfirm(true)} disabled={saving || !newRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmRoleDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        studentName={editingStudent?.full_name || ""}
        newRole={newRole}
        onConfirm={handleUpdateRole}
        loading={saving}
      />
    </>
  );
}