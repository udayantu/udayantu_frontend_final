import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AssessmentResults } from "./AssessmentResults";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface AssessmentTakerProps {
  assessmentType: 'aptitude' | 'psychometric' | 'gk' | 'final_role';
  roleType?: string;
  onComplete: () => void;
}

export function AssessmentTaker({ assessmentType, roleType, onComplete }: AssessmentTakerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const { toast } = useToast();

  useEffect(() => {
    generateAssessment();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const generateAssessment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-assessment', {
        body: { assessmentType, roleType },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setQuestions(data.questions);
    } catch (error: any) {
      console.error('Error generating assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Evaluate assessment
      const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-assessment', {
        body: {
          questions,
          answers,
          assessmentType,
        },
      });

      if (evalError) throw evalError;

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: saveError } = await supabase.from('assessments').insert([{
        student_id: user.id,
        type: assessmentType,
        questions: questions as any,
        answers: answers as any,
        score: evalData.score,
        analysis: evalData.analysis as any,
        completed_at: new Date().toISOString(),
      }]);

      if (saveError) throw saveError;

      // Update attempt tracking
      const { data: attemptData } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('student_id', user.id)
        .eq('assessment_type', assessmentType)
        .single();

      if (attemptData) {
        await supabase
          .from('assessment_attempts')
          .update({
            attempt_number: attemptData.attempt_number + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', attemptData.id);
      } else {
        await supabase.from('assessment_attempts').insert({
          student_id: user.id,
          assessment_type: assessmentType,
          attempt_number: 1,
          last_attempt_at: new Date().toISOString(),
        });
      }

      setResult(evalData);
      
      toast({
        title: "Assessment Complete!",
        description: `Your score: ${evalData.score}%`,
      });
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Generating your assessment...</p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return <AssessmentResults result={result} assessmentType={assessmentType} onComplete={onComplete} />;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle className="capitalize">{assessmentType.replace('_', ' ')} Assessment</CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {questions.length}
            </CardDescription>
          </div>
          <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-lg px-4 py-2">
            {formatTime(timeLeft)}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => setAnswers({ ...answers, [currentQuestion]: parseInt(value) })}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Answered: {Object.keys(answers).length} / {questions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}