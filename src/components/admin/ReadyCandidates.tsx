import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  Eye,
  UserCheck,
  Wrench,
  Languages,
  Flame,
  Award,
  Calendar,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { 
  getReadyPacketsForRole, 
  markReadyPacketViewed, 
  markReadyPacketActioned,
  StoredReadyPacket 
} from "@/lib/models/eventHandlers";

interface ReadyCandidatesProps {
  userRole: string;
  userId: string;
  onScheduleInterview?: (studentId: string, studentName: string) => void;
}

const text = {
  en: {
    title: "Ready Candidates",
    description: "Students ready for placement (via SS/CS pipeline only)",
    noPackets: "No ready candidates in pipeline",
    noPacketsDesc: "Ready packets will appear here when students complete their readiness requirements",
    readinessScore: "Readiness Score",
    tools: "Tools",
    language: "Language",
    attendance: "Attendance",
    assessments: "Assessments",
    days: "days streak",
    completed: "completed",
    new: "New",
    viewed: "Viewed",
    actioned: "Scheduled",
    markViewed: "Mark as Viewed",
    scheduleInterview: "Schedule Interview",
    refresh: "Refresh",
    beginner: "Basic",
    intermediate: "Conversational",
    advanced: "Fluent",
    emittedAt: "Ready since",
    ssOnly: "SS-Managed Only",
    noDirectContact: "No direct student contact with employers",
  },
  hi: {
    title: "तैयार उम्मीदवार",
    description: "प्लेसमेंट के लिए तैयार छात्र (केवल SS/CS पाइपलाइन के माध्यम से)",
    noPackets: "पाइपलाइन में कोई तैयार उम्मीदवार नहीं",
    noPacketsDesc: "जब छात्र अपनी तैयारी की आवश्यकताएं पूरी करेंगे तब यहां रेडी पैकेट दिखाई देंगे",
    readinessScore: "तैयारी स्कोर",
    tools: "टूल्स",
    language: "भाषा",
    attendance: "उपस्थिति",
    assessments: "मूल्यांकन",
    days: "दिन स्ट्रीक",
    completed: "पूर्ण",
    new: "नया",
    viewed: "देखा गया",
    actioned: "निर्धारित",
    markViewed: "देखा हुआ चिह्नित करें",
    scheduleInterview: "साक्षात्कार निर्धारित करें",
    refresh: "रिफ्रेश",
    beginner: "बुनियादी",
    intermediate: "बातचीत",
    advanced: "धाराप्रवाह",
    emittedAt: "से तैयार",
    ssOnly: "केवल SS-प्रबंधित",
    noDirectContact: "छात्रों का नियोक्ताओं से सीधा संपर्क नहीं",
  },
};

export function ReadyCandidates({ 
  userRole, 
  userId, 
  onScheduleInterview 
}: ReadyCandidatesProps) {
  const [packets, setPackets] = useState<StoredReadyPacket[]>([]);
  const [language] = useState<"en" | "hi">("en");
  const t = text[language];

  const loadPackets = () => {
    const loaded = getReadyPacketsForRole(userRole);
    setPackets(loaded.sort((a, b) => 
      new Date(b.emittedAt).getTime() - new Date(a.emittedAt).getTime()
    ));
  };

  useEffect(() => {
    loadPackets();
  }, [userRole]);

  const handleMarkViewed = (packetId: string) => {
    markReadyPacketViewed(packetId, userRole, userId);
    loadPackets();
  };

  const handleScheduleInterview = (packet: StoredReadyPacket) => {
    markReadyPacketActioned(packet.id);
    loadPackets();
    onScheduleInterview?.(packet.studentId, packet.studentName);
  };

  const getStatusBadge = (status: StoredReadyPacket["status"]) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="default" className="gap-1 bg-blue-600">
            <Clock className="h-3 w-3" />
            {t.new}
          </Badge>
        );
      case "viewed":
        return (
          <Badge variant="secondary" className="gap-1">
            <Eye className="h-3 w-3" />
            {t.viewed}
          </Badge>
        );
      case "actioned":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {t.actioned}
          </Badge>
        );
    }
  };

  const getLanguageBadge = (level: string) => {
    const levelText = level === "advanced" ? t.advanced : 
                      level === "intermediate" ? t.intermediate : t.beginner;
    const variant = level === "advanced" ? "default" : 
                    level === "intermediate" ? "secondary" : "outline";
    return <Badge variant={variant}>{levelText}</Badge>;
  };

  const avgToolsProficiency = (tools: StoredReadyPacket["toolsProficiency"]) => {
    return Math.round((tools.crm + tools.jira + tools.spreadsheets + tools.communication) / 4);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (packets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                {t.title}
              </CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadPackets}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t.refresh}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.noPackets}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t.noPacketsDesc}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              {t.title}
              <Badge variant="outline" className="ml-2">{packets.length}</Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {t.description}
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {t.ssOnly}
              </Badge>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadPackets}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.refresh}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          {t.noDirectContact}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {packets.map((packet) => (
          <div 
            key={packet.id}
            className={`p-4 rounded-xl border transition-all ${
              packet.status === "new" 
                ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20" 
                : "border-muted bg-muted/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-lg">{packet.studentName}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t.emittedAt}: {formatDate(packet.emittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(packet.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  {t.readinessScore}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{packet.readinessScore}%</span>
                  <Progress value={packet.readinessScore} className="h-2 flex-1" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wrench className="h-3 w-3" />
                  {t.tools}
                </div>
                <span className="text-lg font-semibold">
                  {avgToolsProficiency(packet.toolsProficiency)}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Languages className="h-3 w-3" />
                  {t.language}
                </div>
                {getLanguageBadge(packet.languageLevel)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  {t.attendance}
                </div>
                <span className="text-lg font-semibold">
                  {packet.attendanceStreak} {t.days}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                {t.assessments}: <strong>{packet.assessmentCount}/4</strong> {t.completed}
              </div>
              <div className="flex gap-2">
                {packet.status === "new" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkViewed(packet.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t.markViewed}
                  </Button>
                )}
                {packet.status !== "actioned" && (
                  <Button 
                    size="sm"
                    onClick={() => handleScheduleInterview(packet)}
                  >
                    {t.scheduleInterview}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
