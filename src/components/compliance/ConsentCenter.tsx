import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  FileText,
  Bell,
} from "lucide-react";
import { complianceService } from "@/lib/complianceService";
import { ConsentPreference } from "@/types/compliance";
import { toast } from "sonner";

interface ConsentCenterProps {
  userId: string;
  userType: "student" | "employer" | "admin";
  language?: "en" | "hi";
  liteMode?: boolean;
}

const text = {
  en: {
    title: "Consent Center",
    description: "Manage your data preferences and privacy settings",
    dataProcessing: "Data Processing",
    dataProcessingDesc: "Allow us to process your data for services",
    communication: "Communication",
    communicationDesc: "Receive updates via email and WhatsApp",
    analytics: "Analytics",
    analyticsDesc: "Help us improve with usage analytics",
    marketing: "Marketing",
    marketingDesc: "Receive promotional content and offers",
    accepted: "Accepted",
    rejected: "Not Accepted",
    expired: "Expired",
    expiresIn: "Expires in",
    days: "days",
    renewNow: "Renew Now",
    exportRecords: "Export Records",
    expiringConsent: "Some consents are expiring soon",
    reconsentPrompt: "Please review and renew your consent preferences",
    lastUpdated: "Last updated",
    save: "Save Preferences",
    consentRequired: "Required for service",
    optional: "Optional",
  },
  hi: {
    title: "सहमति केंद्र",
    description: "अपनी डेटा और प्राइवेसी सेटिंग्स को मैनेज करें",
    dataProcessing: "डेटा प्रोसेसिंग",
    dataProcessingDesc: "हमें आपका डेटा सर्विस के लिए इस्तेमाल करने दें",
    communication: "कम्युनिकेशन",
    communicationDesc: "ईमेल और WhatsApp पर अपडेट पाएं",
    analytics: "एनालिटिक्स",
    analyticsDesc: "हमें बेहतर बनाने में मदद करें",
    marketing: "मार्केटिंग",
    marketingDesc: "प्रमोशनल ऑफर और कंटेंट पाएं",
    accepted: "स्वीकार",
    rejected: "स्वीकार नहीं",
    expired: "खत्म हो गया",
    expiresIn: "समाप्ति में",
    days: "दिन",
    renewNow: "अभी रिन्यू करें",
    exportRecords: "रिकॉर्ड डाउनलोड करें",
    expiringConsent: "कुछ सहमतियां जल्द खत्म होने वाली हैं",
    reconsentPrompt: "कृपया अपनी सहमति प्राथमिकताओं की समीक्षा करें",
    lastUpdated: "अंतिम अपडेट",
    save: "सेव करें",
    consentRequired: "सर्विस के लिए ज़रूरी",
    optional: "ऐच्छिक",
  },
};

type ConsentTypeKey = "data_processing" | "communication" | "analytics" | "marketing";

const consentTypes: { key: ConsentTypeKey; required: boolean }[] = [
  { key: "data_processing", required: true },
  { key: "communication", required: false },
  { key: "analytics", required: false },
  { key: "marketing", required: false },
];

export function ConsentCenter({ userId, userType, language = "hi", liteMode = false }: ConsentCenterProps) {
  const t = text[language];
  const [preferences, setPreferences] = useState<ConsentPreference[]>([]);
  const [expiringConsents, setExpiringConsents] = useState<ConsentPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Record<ConsentTypeKey, boolean>>({
    data_processing: true,
    communication: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  async function loadPreferences() {
    setLoading(true);
    try {
      const prefs = await complianceService.getConsentPreferences(userId);
      setPreferences(prefs);

      const prefMap: Record<ConsentTypeKey, boolean> = {
        data_processing: true,
        communication: false,
        analytics: false,
        marketing: false,
      };

      for (const pref of prefs) {
        if (pref.consentType in prefMap) {
          prefMap[pref.consentType as ConsentTypeKey] = pref.status === "accepted";
        }
      }
      setLocalPrefs(prefMap);

      const expiring = await complianceService.checkConsentExpiry(userId);
      setExpiringConsents(expiring);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(type: ConsentTypeKey, checked: boolean) {
    setLocalPrefs((prev) => ({ ...prev, [type]: checked }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const { key, required } of consentTypes) {
        if (localPrefs[key]) {
          await complianceService.grantConsent(userId, userType, key, language);
        } else if (!required) {
          const existing = preferences.find((p) => p.consentType === key);
          if (existing) {
            await complianceService.revokeConsent(existing.id, userId);
          }
        }
      }
      toast.success(language === "hi" ? "सेटिंग्स सेव हो गईं" : "Preferences saved");
      await loadPreferences();
    } catch (error) {
      toast.error(language === "hi" ? "सेव करने में समस्या" : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  async function handleRenew(consentId: string) {
    try {
      await complianceService.renewConsent(consentId, userId);
      toast.success(language === "hi" ? "सहमति रिन्यू हो गई" : "Consent renewed");
      await loadPreferences();
    } catch {
      toast.error(language === "hi" ? "रिन्यू करने में समस्या" : "Failed to renew consent");
    }
  }

  async function handleExport() {
    try {
      const data = await complianceService.exportConsentRecords(userId);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `consent_records_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(language === "hi" ? "रिकॉर्ड डाउनलोड हो गए" : "Records exported");
    } catch {
      toast.error(language === "hi" ? "एक्सपोर्ट में समस्या" : "Export failed");
    }
  }

  function getExpiryDays(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getConsentPref(type: ConsentTypeKey): ConsentPreference | undefined {
    return preferences.find((p) => p.consentType === type);
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (liteMode) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {consentTypes.map(({ key, required }) => (
            <div key={key} className="flex items-center justify-between">
              <span>{t[key as keyof typeof t]}</span>
              <Badge variant={localPrefs[key] ? "default" : "secondary"}>
                {localPrefs[key] ? t.accepted : t.rejected}
              </Badge>
            </div>
          ))}
          <Button onClick={handleSave} size="sm" className="w-full mt-2" disabled={saving}>
            {t.save}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t.exportRecords}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {expiringConsents.length > 0 && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <Bell className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <strong>{t.expiringConsent}</strong>
              <p className="text-sm mt-1">{t.reconsentPrompt}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {consentTypes.map(({ key, required }) => {
            const pref = getConsentPref(key);
            const daysLeft = pref ? getExpiryDays(pref.expiresAt) : 365;
            const isExpiring = daysLeft > 0 && daysLeft <= 30;
            const isExpired = daysLeft <= 0;

            return (
              <div
                key={key}
                className={`p-4 rounded-lg border ${
                  isExpiring ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : ""
                } ${isExpired ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {key === "data_processing" && t.dataProcessing}
                        {key === "communication" && t.communication}
                        {key === "analytics" && t.analytics}
                        {key === "marketing" && t.marketing}
                      </span>
                      <Badge variant={required ? "default" : "secondary"} className="text-xs">
                        {required ? t.consentRequired : t.optional}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {key === "data_processing" && t.dataProcessingDesc}
                      {key === "communication" && t.communicationDesc}
                      {key === "analytics" && t.analyticsDesc}
                      {key === "marketing" && t.marketingDesc}
                    </p>

                    {pref && localPrefs[key] && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {isExpired ? (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          ) : isExpiring ? (
                            <Clock className="h-3 w-3 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                          <span className={isExpired ? "text-red-600" : isExpiring ? "text-amber-600" : "text-muted-foreground"}>
                            {isExpired
                              ? t.expired
                              : `${t.expiresIn} ${daysLeft} ${t.days}`}
                          </span>
                        </div>
                        {!isExpired && (
                          <Progress
                            value={Math.min(100, (daysLeft / 365) * 100)}
                            className="h-1"
                          />
                        )}
                        {(isExpiring || isExpired) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(pref.id)}
                            className="mt-2"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {t.renewNow}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <Switch
                    checked={localPrefs[key]}
                    onCheckedChange={(checked) => handleToggle(key, checked)}
                    disabled={required}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          {preferences.length > 0 && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {t.lastUpdated}: {new Date(preferences[0]?.grantedAt || new Date()).toLocaleDateString()}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {t.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
