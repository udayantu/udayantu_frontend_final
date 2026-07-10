import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Building2,
  MapPin,
  Video,
  Phone,
  HelpCircle,
  Bell
} from "lucide-react";

type InterviewStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
type InterviewMode = "video" | "phone" | "in-person";

interface Interview {
  id: string;
  companyName: string;
  role: string;
  scheduledAt: string;
  duration: number;
  mode: InterviewMode;
  location?: string;
  status: InterviewStatus;
  ssManagerName: string;
  whatsappReminder: boolean;
  notes?: string;
}

interface InterviewTimelineProps {
  interviews: Interview[];
  onRequestReschedule: (interviewId: string) => void;
  onContactSupport: () => void;
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    interviews: "Interview Schedule",
    interviewsDesc: "Your upcoming and past interviews managed by Student Success team",
    noInterviews: "No interviews scheduled yet",
    noInterviewsDesc: "Your Student Success manager will schedule interviews when you're ready",
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
    video: "Video Call",
    phone: "Phone Call",
    "in-person": "In-Person",
    duration: "Duration",
    minutes: "min",
    managedBy: "Managed by",
    whatsappReminder: "WhatsApp reminder ON",
    whatsappWillNotify: "You'll get a WhatsApp message before the interview",
    requestReschedule: "Request Reschedule",
    contactSupport: "Contact Support",
    upcoming: "Upcoming",
    past: "Past",
    today: "Today",
    tomorrow: "Tomorrow",
    note: "Note from SS team",
    ssOnly: "All interviews are scheduled by your SS team only",
    noDirectContact: "You don't need to contact companies directly",
  },
  hi: {
    interviews: "इंटरव्यू टाइम",
    interviewsDesc: "SS टीम ने आपके इंटरव्यू सेट किए हैं",
    noInterviews: "अभी कोई इंटरव्यू नहीं",
    noInterviewsDesc: "जब आप तैयार होगे, SS टीम इंटरव्यू लगाएगी",
    scheduled: "सेट है",
    confirmed: "पक्का",
    completed: "हो गया",
    cancelled: "रद्द",
    rescheduled: "बदला गया",
    video: "वीडियो कॉल",
    phone: "फोन कॉल",
    "in-person": "ऑफिस में",
    duration: "समय",
    minutes: "मिनट",
    managedBy: "सेट किया",
    whatsappReminder: "WhatsApp याद ON",
    whatsappWillNotify: "इंटरव्यू से पहले WhatsApp मेसेज आएगा",
    requestReschedule: "टाइम बदलो",
    contactSupport: "मदद चाहिए",
    upcoming: "आने वाले",
    past: "बीते हुए",
    today: "आज",
    tomorrow: "कल",
    note: "SS टीम ने लिखा",
    ssOnly: "सभी इंटरव्यू SS टीम सेट करती है",
    noDirectContact: "कंपनी को खुद कॉल नहीं करना है",
  },
};

const getModeIcon = (mode: InterviewMode) => {
  switch (mode) {
    case "video": return Video;
    case "phone": return Phone;
    case "in-person": return MapPin;
  }
};

export function InterviewTimeline({
  interviews,
  onRequestReschedule,
  onContactSupport,
  language = "hi",
  liteMode = false,
}: InterviewTimelineProps) {
  const t = text[language];

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {t.confirmed}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t.completed}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t.cancelled}
          </Badge>
        );
      case "rescheduled":
        return (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <Clock className="h-3 w-3" />
            {t.rescheduled}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {t.scheduled}
          </Badge>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return t.today;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return t.tomorrow;
    }
    return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();
  const upcomingInterviews = interviews.filter(i => 
    new Date(i.scheduledAt) >= now && !["completed", "cancelled"].includes(i.status)
  );
  const pastInterviews = interviews.filter(i => 
    new Date(i.scheduledAt) < now || ["completed", "cancelled"].includes(i.status)
  );

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.interviews}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noInterviews}</p>
          ) : (
            interviews.map((interview) => (
              <div 
                key={interview.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <span className="text-sm font-medium">{interview.companyName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDate(interview.scheduledAt)} {formatTime(interview.scheduledAt)}
                  </span>
                </div>
                {getStatusBadge(interview.status)}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.noInterviews}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t.noInterviewsDesc}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onContactSupport}
            data-testid="button-contact-support"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            {t.contactSupport}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {t.interviews}
        </CardTitle>
        <CardDescription>{t.interviewsDesc}</CardDescription>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span>{t.ssOnly} — {t.noDirectContact}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {upcomingInterviews.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.upcoming}
            </h4>
            {upcomingInterviews.map((interview) => {
              const ModeIcon = getModeIcon(interview.mode);
              return (
                <div 
                  key={interview.id}
                  className="p-4 rounded-xl border border-primary/10 bg-background/50 space-y-3"
                  data-testid={`interview-card-${interview.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{interview.companyName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{interview.role}</p>
                    </div>
                    {getStatusBadge(interview.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(interview.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTime(interview.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ModeIcon className="h-4 w-4" />
                      {t[interview.mode]}
                    </div>
                    <span className="text-muted-foreground">
                      {interview.duration} {t.minutes}
                    </span>
                  </div>

                  {interview.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {interview.location}
                    </div>
                  )}

                  {interview.notes && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        {t.note}:
                      </span>
                      {interview.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t.managedBy}: {interview.ssManagerName}</span>
                      {interview.whatsappReminder && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium">
                          <Bell className="h-3 w-3 animate-pulse" />
                          {t.whatsappReminder}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRequestReschedule(interview.id)}
                      data-testid={`button-reschedule-${interview.id}`}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      {t.requestReschedule}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pastInterviews.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t.past}
            </h4>
            {pastInterviews.slice(0, 3).map((interview) => {
              const ModeIcon = getModeIcon(interview.mode);
              return (
                <div 
                  key={interview.id}
                  className="p-3 rounded-lg border border-muted bg-muted/20 opacity-75"
                  data-testid={`interview-past-${interview.id}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-sm">{interview.companyName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(interview.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(interview.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { Interview };
