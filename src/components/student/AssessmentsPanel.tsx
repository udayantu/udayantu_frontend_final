import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play,
  BookOpen,
  User,
  Globe,
  Target,
  Shield,
  Calendar
} from "lucide-react";
import { AssessmentStatus } from "@/lib/models/canonicalTypes";

interface AssessmentItem {
  id: string;
  type: "aptitude" | "psychometric" | "gk" | "final_role";
  status: AssessmentStatus;
  score?: number;
  scheduledAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  flagReason?: string;
  attemptNumber: number;
  maxAttempts: number;
}

interface AssessmentsPanelProps {
  assessments: AssessmentItem[];
  onStartAssessment: (type: AssessmentItem["type"]) => void;
  paymentCompleted: boolean;
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    assessments: "Assessments",
    assessmentsDesc: "Complete all assessments to get your role recommendation",
    aptitude: "Aptitude Test",
    aptitudeDesc: "Test your logical reasoning and problem-solving skills",
    psychometric: "Psychometric Test",
    psychometricDesc: "Understand your personality and work style",
    gk: "General Knowledge",
    gkDesc: "Test your awareness of current affairs and general topics",
    final_role: "Role Assessment",
    final_roleDesc: "Final assessment for your recommended role",
    start: "Start",
    resume: "Resume",
    retake: "Retake",
    completed: "Completed",
    verified: "Verified",
    flagged: "Review Needed",
    scheduled: "Scheduled",
    inProgress: "In Progress",
    score: "Score",
    attempt: "Attempt",
    of: "of",
    verifiedBy: "Verified by Content Expert",
    contentExpertApproved: "Content Expert Approved",
    scheduledFor: "Scheduled for",
    paymentRequired: "Complete payment to start",
    upcoming: "Upcoming",
    done: "Done",
  },
  hi: {
    assessments: "टेस्ट",
    assessmentsDesc: "सभी टेस्ट पूरे करो, फिर जॉब रोल मिलेगा",
    aptitude: "योग्यता टेस्ट",
    aptitudeDesc: "सोचने और समझने की क्षमता जांचें",
    psychometric: "व्यक्तित्व टेस्ट",
    psychometricDesc: "आप कैसे काम करते हो, यह समझें",
    gk: "सामान्य ज्ञान",
    gkDesc: "देश-दुनिया की जानकारी जांचें",
    final_role: "फाइनल टेस्ट",
    final_roleDesc: "आपके जॉब रोल का आखिरी टेस्ट",
    start: "शुरू करो",
    resume: "आगे चलो",
    retake: "दोबारा दो",
    completed: "हो गया",
    verified: "चेक हो गया",
    flagged: "देखना बाकी",
    scheduled: "टाइम सेट",
    inProgress: "चल रहा है",
    score: "नंबर",
    attempt: "बार",
    of: "में से",
    verifiedBy: "एक्सपर्ट ने चेक किया",
    contentExpertApproved: "एक्सपर्ट ने ओके किया",
    scheduledFor: "कब होगा",
    paymentRequired: "पहले पेमेंट करो",
    upcoming: "आने वाले",
    done: "पूरे हुए",
  },
};

const getAssessmentIcon = (type: AssessmentItem["type"]) => {
  switch (type) {
    case "aptitude": return BookOpen;
    case "psychometric": return User;
    case "gk": return Globe;
    case "final_role": return Target;
  }
};

const getAssessmentColor = (type: AssessmentItem["type"]) => {
  switch (type) {
    case "aptitude": return "text-blue-500";
    case "psychometric": return "text-purple-500";
    case "gk": return "text-green-500";
    case "final_role": return "text-amber-500";
  }
};

export function AssessmentsPanel({
  assessments,
  onStartAssessment,
  paymentCompleted,
  language = "hi",
  liteMode = false,
}: AssessmentsPanelProps) {
  const t = text[language];

  const getStatusBadge = (assessment: AssessmentItem) => {
    switch (assessment.status) {
      case "verified":
        return (
          <Badge variant="default" className="gap-1 bg-green-600 animate-pulse">
            <Shield className="h-3 w-3" />
            {t.verified}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t.completed}
          </Badge>
        );
      case "flagged":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t.flagged}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <Clock className="h-3 w-3" />
            {t.inProgress}
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {t.scheduled}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionButton = (assessment: AssessmentItem) => {
    if (!paymentCompleted) {
      return (
        <Button disabled size="sm" variant="outline">
          {t.paymentRequired}
        </Button>
      );
    }

    switch (assessment.status) {
      case "scheduled":
        return (
          <Button 
            size="sm" 
            onClick={() => onStartAssessment(assessment.type)}
            data-testid={`button-start-${assessment.type}`}
          >
            <Play className="mr-1 h-3 w-3" />
            {t.start}
          </Button>
        );
      case "in_progress":
        return (
          <Button 
            size="sm"
            onClick={() => onStartAssessment(assessment.type)}
            data-testid={`button-resume-${assessment.type}`}
          >
            <Play className="mr-1 h-3 w-3" />
            {t.resume}
          </Button>
        );
      case "completed":
      case "flagged":
        if (assessment.attemptNumber < assessment.maxAttempts) {
          return (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStartAssessment(assessment.type)}
              data-testid={`button-retake-${assessment.type}`}
            >
              {t.retake}
            </Button>
          );
        }
        return null;
      case "verified":
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            {t.verifiedBy}
          </div>
        );
      default:
        return (
          <Button 
            size="sm"
            onClick={() => onStartAssessment(assessment.type)}
            data-testid={`button-start-${assessment.type}`}
          >
            <Play className="mr-1 h-3 w-3" />
            {t.start}
          </Button>
        );
    }
  };

  const upcomingAssessments = assessments.filter(a => 
    ["scheduled", "in_progress"].includes(a.status) || !a.completedAt
  );
  const completedAssessments = assessments.filter(a => 
    ["completed", "verified", "flagged"].includes(a.status)
  );

  const completedCount = completedAssessments.length;
  const totalCount = assessments.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span>{t.assessments}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {completedCount}/{totalCount} {t.done}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {assessments.map((assessment) => {
            const Icon = getAssessmentIcon(assessment.type);
            return (
              <div 
                key={assessment.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${getAssessmentColor(assessment.type)}`} />
                  <span className="text-sm">{t[assessment.type]}</span>
                </div>
                <div className="flex items-center gap-2">
                  {assessment.score !== undefined && (
                    <span className="text-sm font-medium">{assessment.score}%</span>
                  )}
                  {getStatusBadge(assessment)}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>{t.assessments}</CardTitle>
            <CardDescription>{t.assessmentsDesc}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
            <Progress value={progressPercent} className="w-24 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessments.map((assessment) => {
          const Icon = getAssessmentIcon(assessment.type);
          const iconColor = getAssessmentColor(assessment.type);
          
          return (
            <div 
              key={assessment.id}
              className="group flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 hover:bg-primary/5 transition-all duration-300"
              data-testid={`assessment-item-${assessment.type}`}
            >
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  {t[assessment.type]}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t[`${assessment.type}Desc`]}
                </p>
                
                {assessment.score !== undefined && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">
                      {t.score}: <strong>{assessment.score}%</strong>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.attempt} {assessment.attemptNumber} {t.of} {assessment.maxAttempts}
                    </span>
                  </div>
                )}
                
                {assessment.verifiedAt && assessment.verifiedBy && (
                  <div className="flex items-center gap-2 mt-2 px-2 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {t.contentExpertApproved}
                    </span>
                  </div>
                )}
                
                {assessment.flagReason && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {assessment.flagReason}
                  </div>
                )}
                
                {assessment.scheduledAt && assessment.status === "scheduled" && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {t.scheduledFor}: {new Date(assessment.scheduledAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                {getStatusBadge(assessment)}
                {getActionButton(assessment)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export type { AssessmentItem };
