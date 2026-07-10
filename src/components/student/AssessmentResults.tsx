import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircle2, TrendingUp, Award } from "lucide-react";

interface SubjectScore {
  subject: string;
  score: number;
  correct: number;
  total: number;
}

interface AssessmentResultsProps {
  result: {
    score: number;
    analysis: {
      correctAnswers: number;
      incorrectAnswers: number;
      strengths?: string[];
      improvements?: string[];
      categoryScores?: SubjectScore[];
    };
  };
  assessmentType: string;
  onComplete: () => void;
}

export function AssessmentResults({ result, assessmentType, onComplete }: AssessmentResultsProps) {
  const categoryScores = result.analysis.categoryScores || [
    { subject: 'Quantitative', score: 75, correct: 15, total: 20 },
    { subject: 'Logical', score: 80, correct: 12, total: 15 },
    { subject: 'Verbal', score: 70, correct: 14, total: 20 },
    { subject: 'General', score: 65, correct: 13, total: 20 },
  ];

  // Performance gauge data
  const performanceData = [
    { name: 'Score', value: result.score, fill: result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444' },
    { name: 'Remaining', value: 100 - result.score, fill: '#e5e7eb' },
  ];

  // Prepare comparison data
  const comparisonData = categoryScores.map(cat => ({
    subject: cat.subject,
    score: cat.score,
    average: 70,
  }));

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Good', variant: 'default' as const };
    if (score >= 50) return { label: 'Average', variant: 'secondary' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  const totalCorrect = result.analysis.correctAnswers;
  const totalIncorrect = result.analysis.incorrectAnswers;
  const totalQuestions = totalCorrect + totalIncorrect;

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Assessment Complete!
              </CardTitle>
              <CardDescription>
                {assessmentType.replace('_', ' ')} Assessment Result
              </CardDescription>
            </div>
            <Badge className="text-lg px-4 py-2" variant={getPerformanceBadge(result.score).variant as any}>
              {getPerformanceBadge(result.score).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Circle and Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Score */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-8">
              <div className="relative w-32 h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getPerformanceColor(result.score)}`}>
                      {result.score}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center font-medium">Overall Score</p>
            </div>

            {/* Answer Stats */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Correct Answers */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Correct Answers</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {totalCorrect}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((totalCorrect / totalQuestions) * 100)}% accuracy
                  </p>
                </div>

                {/* Incorrect Answers */}
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Incorrect Answers</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {totalIncorrect}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    out of {totalQuestions} questions
                  </p>
                </div>

                {/* Accuracy */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((totalCorrect / totalQuestions) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalCorrect} out of {totalQuestions}
                  </p>
                </div>

                {/* Questions Attempted */}
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Questions Attempted</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {totalQuestions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    100% completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Subject-wise Performance
          </CardTitle>
          <CardDescription>Your score breakdown by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bar Chart */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" name="Your Score" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoryScores.map((cat) => (
              <div
                key={cat.subject}
                className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                data-testid={`card-subject-${cat.subject.toLowerCase()}`}
              >
                <p className="text-xs text-muted-foreground mb-2 font-medium">{cat.subject}</p>
                <p className={`text-2xl font-bold mb-1 ${getPerformanceColor(cat.score)}`}>
                  {cat.score}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {cat.correct}/{cat.total} correct
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Target</CardTitle>
          <CardDescription>Your performance compared to 70% benchmark</CardDescription>
        </CardHeader>
        <CardContent className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
                name="Your Score"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                dot={false}
                name="Target (70%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      {assessmentType !== 'psychometric' && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.analysis.strengths && result.analysis.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.strengths.map((strength: string) => (
                    <Badge
                      key={strength}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`badge-strength-${strength}`}
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.analysis.improvements && result.analysis.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.improvements.map((improvement: string) => (
                    <Badge
                      key={improvement}
                      variant="secondary"
                      data-testid={`badge-improvement-${improvement}`}
                    >
                      {improvement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onComplete}
        className="w-full py-6 text-base"
        data-testid="button-continue-dashboard"
      >
        Continue to Dashboard
      </Button>
    </div>
  );
}
