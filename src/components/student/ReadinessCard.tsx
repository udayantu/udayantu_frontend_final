import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Wrench,
  Languages,
  Flame,
  MessageSquare,
  Star,
  Award
} from "lucide-react";

interface ToolsProficiency {
  crm: number;
  jira: number;
  spreadsheets: number;
  communication: number;
}

interface MentorNote {
  id: string;
  content: string;
  createdAt: string;
  mentorName: string;
  type: "feedback" | "guidance" | "milestone";
}

interface ReadinessCardProps {
  toolsProficiency: ToolsProficiency;
  languageLevel: "beginner" | "intermediate" | "advanced";
  attendanceStreak: number;
  totalSessions: number;
  mentorNotes: MentorNote[];
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    readiness: "Job Readiness",
    readinessDesc: "Track your skills and placement readiness",
    toolsSkills: "Tools & Skills",
    crm: "CRM Tools",
    jira: "Jira / Project Tools",
    spreadsheets: "Spreadsheets",
    communication: "Communication",
    languageLevel: "English Proficiency",
    beginner: "Basic",
    intermediate: "Conversational",
    advanced: "Fluent",
    attendance: "Attendance Streak",
    days: "days",
    sessions: "sessions attended",
    mentorFeedback: "Mentor Feedback",
    noFeedback: "No feedback yet",
    readyStatus: "Ready for Placement",
    almostReady: "Almost Ready",
    needsWork: "Keep Learning",
    ssManaged: "Your SS team is tracking your progress",
  },
  hi: {
    readiness: "नौकरी तैयारी",
    readinessDesc: "आपकी स्किल और जॉब तैयारी यहाँ देखें",
    toolsSkills: "टूल्स सीखे",
    crm: "CRM (ग्राहक सॉफ्टवेयर)",
    jira: "Jira (प्रोजेक्ट टूल)",
    spreadsheets: "एक्सेल/शीट",
    communication: "बातचीत",
    languageLevel: "इंग्लिश लेवल",
    beginner: "शुरुआती",
    intermediate: "ठीक-ठाक",
    advanced: "अच्छी",
    attendance: "हाज़िरी",
    days: "दिन",
    sessions: "क्लास आए",
    mentorFeedback: "मेंटर की राय",
    noFeedback: "अभी मेंटर ने कुछ नहीं लिखा",
    readyStatus: "जॉब के लिए तैयार!",
    almostReady: "थोड़ा और सीखो",
    needsWork: "सीखते रहो",
    ssManaged: "आपकी SS टीम आपकी प्रगति देख रही है",
  },
};

export function ReadinessCard({
  toolsProficiency,
  languageLevel,
  attendanceStreak,
  totalSessions,
  mentorNotes,
  language = "hi",
  liteMode = false,
}: ReadinessCardProps) {
  const t = text[language];

  const avgToolsProficiency = Math.round(
    (toolsProficiency.crm + 
     toolsProficiency.jira + 
     toolsProficiency.spreadsheets + 
     toolsProficiency.communication) / 4
  );

  const languageLevelScore = languageLevel === "advanced" ? 100 : 
                              languageLevel === "intermediate" ? 70 : 40;

  const attendanceScore = Math.min(100, (attendanceStreak / 30) * 100);

  const overallReadiness = Math.round(
    (avgToolsProficiency * 0.4) + 
    (languageLevelScore * 0.3) + 
    (attendanceScore * 0.3)
  );

  const getReadinessStatus = () => {
    if (overallReadiness >= 80) return { label: t.readyStatus, variant: "default" as const, icon: CheckCircle2 };
    if (overallReadiness >= 60) return { label: t.almostReady, variant: "secondary" as const, icon: Clock };
    return { label: t.needsWork, variant: "outline" as const, icon: AlertCircle };
  };

  const readinessStatus = getReadinessStatus();
  const StatusIcon = readinessStatus.icon;

  const getNoteTypeIcon = (type: MentorNote["type"]) => {
    switch (type) {
      case "milestone": return <Award className="h-3 w-3 text-amber-500" />;
      case "guidance": return <MessageSquare className="h-3 w-3 text-blue-500" />;
      default: return <Star className="h-3 w-3 text-green-500" />;
    }
  };

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span>{t.readiness}</span>
            <Badge variant={readinessStatus.variant} className="text-xs">
              <StatusIcon className="mr-1 h-3 w-3" />
              {readinessStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.toolsSkills}:</span>
            <span className="font-semibold">{avgToolsProficiency}%</span>
          </div>
          <div className="flex justify-between">
            <span>{t.languageLevel}:</span>
            <span className="font-semibold">{t[languageLevel]}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.attendance}:</span>
            <span className="font-semibold">{attendanceStreak} {t.days}</span>
          </div>
          {mentorNotes.length > 0 && (
            <div className="pt-2 border-t">
              <span className="text-muted-foreground">{t.mentorFeedback}:</span>
              <p className="mt-1 text-foreground">{mentorNotes[0]?.content}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {t.readiness}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t.readinessDesc}</p>
          </div>
          <Badge variant={readinessStatus.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {readinessStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            {t.toolsSkills}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.crm}</span>
                <span className="font-medium">{toolsProficiency.crm}%</span>
              </div>
              <Progress value={toolsProficiency.crm} className="h-2" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.jira}</span>
                <span className="font-medium">{toolsProficiency.jira}%</span>
              </div>
              <Progress value={toolsProficiency.jira} className="h-2" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.spreadsheets}</span>
                <span className="font-medium">{toolsProficiency.spreadsheets}%</span>
              </div>
              <Progress value={toolsProficiency.spreadsheets} className="h-2" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.communication}</span>
                <span className="font-medium">{toolsProficiency.communication}%</span>
              </div>
              <Progress value={toolsProficiency.communication} className="h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{t.languageLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge 
                variant={languageLevel === "advanced" ? "default" : 
                        languageLevel === "intermediate" ? "secondary" : "outline"}
              >
                {t[languageLevel]}
              </Badge>
              <span className="text-2xl font-bold">{languageLevelScore}%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{t.attendance}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{attendanceStreak}</span>
                <span className="text-sm text-muted-foreground ml-1">{t.days}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {totalSessions} {t.sessions}
              </span>
            </div>
          </div>
        </div>

        {mentorNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              {t.mentorFeedback}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mentorNotes.slice(0, 3).map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 rounded-lg bg-background/50 border border-primary/10"
                >
                  <div className="flex items-start gap-2">
                    {getNoteTypeIcon(note.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{note.content}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{note.mentorName}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mentorNotes.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {t.noFeedback}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { ToolsProficiency, MentorNote };
