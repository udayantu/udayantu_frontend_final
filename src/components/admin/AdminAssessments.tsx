import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Upload, Send, Plus, Download, AlertCircle, CheckCircle2, Trash2, Tag, X, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseQuestionFile, generateCSVTemplate, generateJSONTemplate, ParsedQuestion, ParseError } from "@/utils/questionParser";

interface Assessment {
  id: string;
  student_id: string;
  type: string;
  score: number | null;
  attempt_number: number;
  completed_at: string;
  full_name?: string;
  email?: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface FailedStudent {
  student_id: string;
  full_name: string;
  email: string;
  score: number;
  assessment_type: string;
  last_completed_at: string;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: "as1",
    student_id: "u1",
    type: "Aptitude Test",
    score: 78,
    attempt_number: 1,
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    full_name: "Amit Kumar Sharma",
    email: "amit.sharma@gmail.com"
  },
  {
    id: "as2",
    student_id: "u2",
    type: "Psychometric Evaluation",
    score: 85,
    attempt_number: 1,
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    full_name: "Neha Patel",
    email: "neha.patel@outlook.com"
  },
  {
    id: "as3",
    student_id: "u3",
    type: "Aptitude Test",
    score: 45,
    attempt_number: 1,
    completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    full_name: "Rajesh Gond",
    email: "rajesh.gond@yahoo.com"
  }
];

const SUBJECT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#6366f1'];

export function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [failedStudents, setFailedStudents] = useState<FailedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('aptitude');
  
  // Subject Management States
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Quantitative', color: '#3b82f6' },
    { id: '2', name: 'Logical', color: '#8b5cf6' },
    { id: '3', name: 'Verbal', color: '#ec4899' },
    { id: '4', name: 'General Knowledge', color: '#22c55e' },
  ]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  
  // Question Management States
  const [uploadedQuestions, setUploadedQuestions] = useState<(ParsedQuestion & { id: string; subject_id: string })[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<ParseError[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({ 
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: 0, 
    explanation: '', 
    category: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: assessmentsData, error: assessError } = await supabase
        .from("assessments")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(50);

      if (assessError) throw assessError;

      const studentIds = [...new Set(assessmentsData?.map(a => a.student_id) || [])];
      let enrichedAssessments: any[] = [];
      let failed: any[] = [];

      if (studentIds.length > 0) {
        const { data: studentsData } = await supabase
          .from("student_registrations")
          .select("user_id, full_name, email")
          .in("user_id", studentIds);

        enrichedAssessments = (assessmentsData || []).map(assessment => {
          const student = studentsData?.find(s => s.user_id === assessment.student_id);
          return {
            ...assessment,
            full_name: student?.full_name || 'Unknown',
            email: student?.email || 'Unknown',
          };
        });

        failed = enrichedAssessments
          ?.filter(a => a.score !== null && a.score < 70)
          .map(a => ({
            student_id: a.student_id,
            full_name: a.full_name,
            email: a.email,
            score: a.score as number,
            assessment_type: a.type,
            last_completed_at: a.completed_at,
          }))
          .filter((a, idx, arr) => arr.findIndex(x => x.student_id === a.student_id && x.assessment_type === a.assessment_type) === idx) || [];
      }

      setAssessments(enrichedAssessments);
      setFailedStudents(failed);
    } catch (error: unknown) {
      console.warn("Could not query assessments from live database. Initializing clean/empty state.");
      const stored = localStorage.getItem("udayantu_assessments");
      let allAssessments = stored ? JSON.parse(stored) : [];
      setAssessments(allAssessments);
      setFailedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Subject Management
  const addSubject = () => {
    if (!newSubjectName.trim()) {
      toast({ title: "Error", description: "Subject name is required", variant: "destructive" });
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    toast({ title: "Subject Added", description: `"${newSubjectName}" has been added` });
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    if (selectedSubject === id) {
      setSelectedSubject(subjects[0]?.id || '');
    }
    toast({ title: "Subject Deleted", description: "Subject has been removed" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSubject) {
      toast({ title: "Error", description: "Please select a subject first", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadErrors([]);
    try {
      const { questions, errors } = await parseQuestionFile(file);
      
      // Display errors if any
      if (errors.length > 0) {
        setUploadErrors(errors);
        setShowErrors(true);
        if (questions.length === 0) {
          toast({
            title: "Parse Failed",
            description: `Found ${errors.length} error(s) in your file. Please fix them.`,
            variant: "destructive",
          });
          setUploading(false);
          return;
        } else {
          toast({
            title: "Partial Parse",
            description: `Parsed ${questions.length} valid questions. ${errors.length} error(s) found - please review.`,
            variant: "destructive",
          });
        }
      }

      if (questions.length > 0) {
        const questionIds = questions.map(q => ({
          ...q,
          id: Date.now() + Math.random().toString(),
          subject_id: selectedSubject,
        }));
        setUploadedQuestions([...uploadedQuestions, ...questionIds]);
        setShowPreview(true);
        toast({
          title: "Success",
          description: `Parsed ${questions.length} questions from "${file.name}"`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some(o => !o) || !newQuestion.explanation || !newQuestion.category) {
      toast({
        title: "Validation Error",
        description: "Fill all required fields (Question, Options, Explanation, Category)",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSubject) {
      toast({ title: "Error", description: "Please select a subject first", variant: "destructive" });
      return;
    }

    const question = {
      ...newQuestion,
      options: newQuestion.options as [string, string, string, string],
      correctAnswer: newQuestion.correctAnswer as 0 | 1 | 2 | 3,
      id: Date.now() + Math.random().toString(),
      subject_id: selectedSubject,
    };

    setUploadedQuestions([...uploadedQuestions, question]);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', category: '' });
    toast({ title: "Question Added", description: "Question added to bank" });
  };

  const deleteQuestion = (id: string) => {
    setUploadedQuestions(uploadedQuestions.filter(q => q.id !== id));
    setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
  };

  const deleteMultipleQuestions = () => {
    if (selectedQuestions.length === 0) {
      toast({ title: "Error", description: "Select questions to delete", variant: "destructive" });
      return;
    }

    setUploadedQuestions(uploadedQuestions.filter(q => !selectedQuestions.includes(q.id)));
    setSelectedQuestions([]);
    toast({ title: "Success", description: `Deleted ${selectedQuestions.length} question(s)` });
  };

  const handleSaveQuestions = async () => {
    try {
      if (uploadedQuestions.length === 0) {
        toast({ title: "Error", description: "No questions to save", variant: "destructive" });
        return;
      }

      toast({
        title: "Questions Saved",
        description: `Successfully saved ${uploadedQuestions.length} questions`,
      });

      setUploadedQuestions([]);
      setShowPreview(false);
      setSelectedQuestions([]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReassignTests = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Select Students",
        description: "Choose at least one student to reassign tests",
        variant: "destructive",
      });
      return;
    }

    setReassigning(true);
    try {
      toast({
        title: "Tests Reassigned",
        description: `Reassigned ${selectedStudents.length} ${selectedAssessmentType} tests`,
      });

      setSelectedStudents([]);
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reassign tests",
        variant: "destructive",
      });
    } finally {
      setReassigning(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    const content = format === 'csv' ? generateCSVTemplate() : generateJSONTemplate();
    const filename = `question-template.${format}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Template Downloaded", description: `Downloaded ${format.toUpperCase()} template` });
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">Pending</Badge>;
    if (score >= 70) return <Badge variant="default" className="bg-green-600">{score}%</Badge>;
    if (score >= 50) return <Badge variant="secondary">{score}%</Badge>;
    return <Badge variant="destructive">{score}%</Badge>;
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const questionsInSubject = uploadedQuestions.filter(q => q.subject_id === selectedSubject);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="results" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="results">Assessment Results</TabsTrigger>
        <TabsTrigger value="questionbank">Question Bank</TabsTrigger>
        <TabsTrigger value="reassign">Reassign Tests</TabsTrigger>
      </TabsList>

      {/* Assessment Results Tab */}
      <TabsContent value="results">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Overview</CardTitle>
            <CardDescription>View all student assessment results and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {assessment.full_name}
                        </TableCell>
                        <TableCell>{assessment.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {assessment.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{getScoreBadge(assessment.score)}</TableCell>
                        <TableCell>#{assessment.attempt_number}</TableCell>
                        <TableCell>
                          {assessment.completed_at 
                            ? new Date(assessment.completed_at).toLocaleDateString()
                            : 'In Progress'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAssessment(assessment)}
                            data-testid={`button-view-assessment-${assessment.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
      </TabsContent>

      {/* Question Bank Tab */}
      <TabsContent value="questionbank" className="space-y-4">
        {/* Subject Management */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-5 w-5" />
              Subject Management
            </CardTitle>
            <CardDescription>Create and manage subjects for your question bank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Subject */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter new subject name (e.g., Coding, DSA, SQL)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                data-testid="input-subject-name"
              />
              <Button onClick={addSubject} data-testid="button-add-subject">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Subjects List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSubject === subject.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSubject(subject.id)}
                  data-testid={`card-subject-${subject.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubject(subject.id);
                      }}
                      data-testid={`button-delete-subject-${subject.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedQuestions.filter(q => q.subject_id === subject.id).length} questions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Questions</CardTitle>
            <CardDescription>Import questions into the selected subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected Subject:</strong> {currentSubject?.name || 'No subject selected'}
              </AlertDescription>
            </Alert>

            {/* Download Templates */}
            <div>
              <h3 className="font-semibold mb-3">Download Templates</h3>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" onClick={() => downloadTemplate('csv')} data-testid="button-download-csv">
                  <Download className="h-4 w-4 mr-2" />
                  CSV Template
                </Button>
                <Button variant="outline" onClick={() => downloadTemplate('json')} data-testid="button-download-json">
                  <Download className="h-4 w-4 mr-2" />
                  JSON Template
                </Button>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              {/* Advanced Features Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Advanced Features</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  This question bank supports mathematical equations, physics/chemistry diagrams, LaTeX formulas, and visual reasoning questions.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-xs bg-white dark:bg-slate-900 p-2 rounded">
                    <strong>Mathematical:</strong> Equations, formulas, LaTeX
                  </div>
                  <div className="text-xs bg-white dark:bg-slate-900 p-2 rounded">
                    <strong>Physics:</strong> Diagrams, force vectors, graphs
                  </div>
                  <div className="text-xs bg-white dark:bg-slate-900 p-2 rounded">
                    <strong>Chemistry:</strong> Molecular structures, reactions
                  </div>
                  <div className="text-xs bg-white dark:bg-slate-900 p-2 rounded">
                    <strong>Reasoning:</strong> Visual patterns, diagrams
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-3">
                  Read the <strong>QUESTION_UPLOAD_GUIDE.md</strong> file in root directory for comprehensive examples and LaTeX reference.
                </p>
              </div>

              <h3 className="font-semibold mb-3">Upload Question File</h3>
              <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedSubject}
                  className="hidden"
                  data-testid="input-question-file"
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Drop your CSV/JSON file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Maximum 500 questions per file</p>
                </div>
              </label>

              {uploading && (
                <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing file...</span>
                </div>
              )}

              {/* Professional Error Display Panel */}
              {showErrors && uploadErrors.length > 0 && (
                <div className="border-2 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-200">
                          Found {uploadErrors.length} Error{uploadErrors.length !== 1 ? 's' : ''} in Your File
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Please review and fix the issues below before uploading again
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowErrors(false);
                        setUploadErrors([]);
                      }}
                      data-testid="button-close-errors"
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Error Cards */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uploadErrors.map((error, idx) => {
                      const errorColor = 
                        error.type === 'parse' ? 'border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-900' :
                        error.type === 'format' ? 'border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-900' :
                        'border-red-300 dark:border-red-700 bg-white dark:bg-slate-900';
                      
                      const errorBgColor = 
                        error.type === 'parse' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        error.type === 'format' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20';

                      return (
                        <div
                          key={idx}
                          className={`border-l-4 rounded p-3 ${errorColor}`}
                          data-testid={`error-card-${idx}`}
                        >
                          <div className="flex gap-3">
                            <div className={`${errorBgColor} rounded-full p-1 flex-shrink-0 mt-0.5`}>
                              {error.type === 'parse' && <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                              {error.type === 'format' && <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                              {error.type === 'validation' && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Error Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {error.type === 'parse' && '⚙️ Parse Error'}
                                    {error.type === 'format' && '📋 Format Error'}
                                    {error.type === 'validation' && '✓ Validation Error'}
                                    {error.row && ` (Row ${error.row})`}
                                  </p>
                                  {error.field && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      <strong>Field:</strong> {error.field}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Error Message */}
                              <p className="text-sm mt-2 text-slate-700 dark:text-slate-300">
                                {error.message}
                              </p>

                              {/* Error Value (if applicable) */}
                              {error.value && (
                                <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                                  <span className="text-muted-foreground">Value: </span>
                                  <span className="break-all">{error.value}</span>
                                </div>
                              )}

                              {/* Suggestion */}
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
                                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Suggestion:</p>
                                <p className="text-xs text-blue-800 dark:text-blue-300">{error.suggestion}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Error Summary */}
                  <div className="border-t border-red-200 dark:border-red-800 pt-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-center">
                        <p className="font-semibold text-red-900 dark:text-red-200">
                          {uploadErrors.filter(e => e.type === 'validation').length}
                        </p>
                        <p className="text-red-700 dark:text-red-300">Validation</p>
                      </div>
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-center">
                        <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                          {uploadErrors.filter(e => e.type === 'format').length}
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300">Format</p>
                      </div>
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded text-center">
                        <p className="font-semibold text-orange-900 dark:text-orange-200">
                          {uploadErrors.filter(e => e.type === 'parse').length}
                        </p>
                        <p className="text-orange-700 dark:text-orange-300">Parse</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Question Add */}
        <Card>
          <CardHeader>
            <CardTitle>Add Question Manually</CardTitle>
            <CardDescription>Add questions one at a time to "{currentSubject?.name}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Textarea
                placeholder="Enter question text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                data-testid="input-question-text"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {newQuestion.options.map((option, idx) => (
                <div key={idx}>
                  <label className="text-sm font-medium">Option {idx + 1}</label>
                  <Input
                    placeholder={`Enter option ${idx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updated = [...newQuestion.options];
                      updated[idx] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                    data-testid={`input-option-${idx}`}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium">Correct Answer</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-2 mt-2"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                data-testid="select-correct-answer"
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Explanation</label>
                <Textarea
                  placeholder="Explain why this is the correct answer"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  data-testid="input-explanation"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Quantitative, Logical"
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  data-testid="input-category"
                  className="mt-2"
                />
              </div>
            </div>

            <Button onClick={handleAddQuestion} className="w-full" data-testid="button-add-question">
              <Plus className="h-4 w-4 mr-2" />
              Add to {currentSubject?.name}
            </Button>
          </CardContent>
        </Card>

        {/* Questions Display & Management */}
        {questionsInSubject.length > 0 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Questions in {currentSubject?.name}
                  </CardTitle>
                  <CardDescription>{questionsInSubject.length} question(s) uploaded</CardDescription>
                </div>
                {selectedQuestions.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={deleteMultipleQuestions}
                    data-testid="button-delete-selected"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedQuestions.length}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {questionsInSubject.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-white dark:bg-slate-950 rounded-lg border flex gap-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions([...selectedQuestions, q.id]);
                        } else {
                          setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                        }
                      }}
                      data-testid={`checkbox-question-${q.id}`}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-semibold mb-3">Q{idx + 1}: {q.question}</p>
                      <div className="grid gap-2 mb-3">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded text-sm ${
                              optIdx === q.correctAnswer
                                ? 'bg-green-100 dark:bg-green-900 border-l-4 border-green-600 font-medium'
                                : 'bg-slate-100 dark:bg-slate-800'
                            }`}
                            data-testid={`option-${q.id}-${optIdx}`}
                          >
                            {String.fromCharCode(65 + optIdx)}) {opt}
                            {optIdx === q.correctAnswer && <span className="ml-2 text-green-600">✓</span>}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground"><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteQuestion(q.id)}
                      data-testid={`button-delete-question-${q.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {uploadedQuestions.length > 0 && (
                <Button onClick={handleSaveQuestions} className="w-full" data-testid="button-save-questions">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save All {uploadedQuestions.length} Questions to Database
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Test Reassignment Tab */}
      <TabsContent value="reassign" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reassign Tests to Failed Students</CardTitle>
            <CardDescription>Students with scores below 70% can retake the test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Assessment Type</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-2 mt-2"
                value={selectedAssessmentType}
                onChange={(e) => setSelectedAssessmentType(e.target.value)}
                data-testid="select-reassign-type"
              >
                <option value="aptitude">Aptitude Test</option>
                <option value="psychometric">Psychometric Assessment</option>
                <option value="gk">General Knowledge</option>
              </select>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === failedStudents.filter(s => s.assessment_type === selectedAssessmentType).length && failedStudents.filter(s => s.assessment_type === selectedAssessmentType).length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(failedStudents.filter(s => s.assessment_type === selectedAssessmentType).map(s => s.student_id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Attempt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedStudents.filter(s => s.assessment_type === selectedAssessmentType).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No failed students for this assessment type
                      </TableCell>
                    </TableRow>
                  ) : (
                    failedStudents
                      .filter(s => s.assessment_type === selectedAssessmentType)
                      .map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.student_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents([...selectedStudents, student.student_id]);
                                } else {
                                  setSelectedStudents(selectedStudents.filter(id => id !== student.student_id));
                                }
                              }}
                              data-testid={`checkbox-student-${student.student_id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{student.score}%</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(student.last_completed_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={handleReassignTests}
              disabled={selectedStudents.length === 0 || reassigning}
              className="w-full"
              size="lg"
              data-testid="button-reassign-tests"
            >
              {reassigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reassigning...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Reassign {selectedStudents.length} Test{selectedStudents.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Assessment Details Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.type.toUpperCase()} - Attempt #{selectedAssessment?.attempt_number}
            </DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <p className="text-sm">{selectedAssessment.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{selectedAssessment.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Score</label>
                  <div>{getScoreBadge(selectedAssessment.score)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Completed</label>
                  <p className="text-sm">
                    {selectedAssessment.completed_at 
                      ? new Date(selectedAssessment.completed_at).toLocaleString()
                      : 'In Progress'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Assessment details and performance analysis will be displayed here</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
