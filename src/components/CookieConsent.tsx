import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import {
  ConsentPreferences,
  getDefaultPreferences,
  saveConsentPreferences,
  acceptAllPreferences,
  rejectAllPreferences,
} from '@/lib/cookieConsent';

interface CookieConsentProps {
  onConsent?: () => void;
}

const CookieConsent = ({ onConsent }: CookieConsentProps) => {
  const { hasConsent, preferences, withdrawConsent } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [tempPreferences, setTempPreferences] = useState<ConsentPreferences>(
    getDefaultPreferences()
  );

  // Show banner if no consent given
  useEffect(() => {
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, [hasConsent]);

  const handleAcceptAll = () => {
    acceptAllPreferences(language);
    setShowBanner(false);
    onConsent?.();
  };

  const handleRejectAll = () => {
    rejectAllPreferences(language);
    setShowBanner(false);
    onConsent?.();
  };

  const handleManagePreferences = () => {
    setTempPreferences(preferences || getDefaultPreferences());
    setShowModal(true);
  };

  const handleSavePreferences = () => {
    saveConsentPreferences(tempPreferences, language);
    setShowModal(false);
    setShowBanner(false);
    onConsent?.();
  };

  const handleWithdrawConsent = () => {
    withdrawConsent();
    setShowBanner(true);
    setShowModal(false);
  };

  const text = {
    en: {
      banner:
        'We use cookies to improve your experience, analyze usage, and deliver personalized content. You can manage preferences anytime.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      managePreferences: 'Manage Preferences',
      essentialTitle: 'Essential',
      essentialDesc: 'Required for basic site functionality and security.',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'Help us understand how you use our platform.',
      marketingTitle: 'Marketing',
      marketingDesc: 'Personalized content and product recommendations.',
      functionalTitle: 'Functional',
      functionalDesc: 'Enhanced features and user experience.',
      save: 'Save Preferences',
      language: 'Language',
      cookieSettings: 'Cookie Settings',
      savedConfirmation: 'Your preferences have been saved!',
    },
    hi: {
      banner:
        'हम आपके अनुभव को बेहतर बनाने, उपयोग का विश्लेषण करने और व्यक्तिगत सामग्री प्रदान करने के लिए कुकीज़ का उपयोग करते हैं। आप कभी भी प्राथमिकताओं को प्रबंधित कर सकते हैं।',
      acceptAll: 'सभी स्वीकार करें',
      rejectAll: 'सभी अस्वीकार करें',
      managePreferences: 'प्राथमिकताएं प्रबंधित करें',
      essentialTitle: 'आवश्यक',
      essentialDesc: 'मूल साइट कार्यक्षमता और सुरक्षा के लिए आवश्यक।',
      analyticsTitle: 'विश्लेषण',
      analyticsDesc: 'हमें समझने में मदद करें कि आप हमारे मंच का कैसे उपयोग करते हैं।',
      marketingTitle: 'मार्केटिंग',
      marketingDesc: 'व्यक्तिगत सामग्री और उत्पाद सिफारिशें।',
      functionalTitle: 'कार्यात्मक',
      functionalDesc: 'बेहतर सुविधाएं और उपयोगकर्ता अनुभव।',
      save: 'प्राथमिकताएं सहेजें',
      language: 'भाषा',
      cookieSettings: 'कुकी सेटिंग्स',
      savedConfirmation: 'आपकी प्राथमिकताएं सहेज दी गई हैं!',
    },
  };

  const t = text[language];

  // Prevent banner from showing if consent already given and not forced to renew
  if (!showBanner && !showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-60 hover:opacity-100"
        data-testid="button-cookie-settings"
        title={t.cookieSettings}
      >
        {t.cookieSettings}
      </button>
    );
  }

  return (
    <>
      {/* Reserve space for cookie banner to prevent CLS */}
      {showBanner && <div className="h-0 md:h-0" style={{ marginBottom: '120px' }} aria-hidden="true" />}
      
      {/* Banner - uses transform for GPU-accelerated animation without CLS */}
      {showBanner && (
        <div
          className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-fade-in"
          data-testid="cookie-banner"
          style={{ contain: 'layout' }}
        >
          <div className="container mx-auto px-4 py-4 md:py-5 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{t.banner}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2 md:gap-3 md:flex-nowrap md:justify-end">
                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="px-3 py-2 text-xs md:text-sm rounded-md border border-border hover:bg-muted transition-colors"
                  data-testid="button-toggle-language"
                >
                  {language === 'en' ? 'हिंदी' : 'English'}
                </button>

                {/* Reject All */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="text-xs md:text-sm"
                  data-testid="button-reject-all"
                >
                  {t.rejectAll}
                </Button>

                {/* Manage Preferences */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManagePreferences}
                  className="text-xs md:text-sm"
                  data-testid="button-manage-preferences"
                >
                  {t.managePreferences}
                </Button>

                {/* Accept All */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs md:text-sm bg-secondary hover:bg-secondary/90"
                  data-testid="button-accept-all"
                >
                  {t.acceptAll}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="cookie-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          data-testid="cookie-modal"
        >
          <div className="bg-card rounded-lg border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{t.managePreferences}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                data-testid="button-close-modal"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Language Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{t.language}:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                    data-testid="button-lang-en"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      language === 'hi'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                    data-testid="button-lang-hi"
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Category: Essential */}
              <div className="cookie-category border border-border rounded-lg p-4 bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t.essentialTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.essentialDesc}</p>
                  </div>
                  <Switch checked={true} disabled className="flex-shrink-0" data-testid="switch-essential" />
                </div>
              </div>

              {/* Category: Analytics */}
              <div className="cookie-category border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t.analyticsTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.analyticsDesc}</p>
                  </div>
                  <Switch
                    checked={tempPreferences.analytics}
                    onCheckedChange={(checked) =>
                      setTempPreferences({ ...tempPreferences, analytics: checked })
                    }
                    className="flex-shrink-0"
                    data-testid="switch-analytics"
                  />
                </div>
              </div>

              {/* Category: Marketing */}
              <div className="cookie-category border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t.marketingTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.marketingDesc}</p>
                  </div>
                  <Switch
                    checked={tempPreferences.marketing}
                    onCheckedChange={(checked) =>
                      setTempPreferences({ ...tempPreferences, marketing: checked })
                    }
                    className="flex-shrink-0"
                    data-testid="switch-marketing"
                  />
                </div>
              </div>

              {/* Category: Functional */}
              <div className="cookie-category border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t.functionalTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.functionalDesc}</p>
                  </div>
                  <Switch
                    checked={tempPreferences.functional}
                    onCheckedChange={(checked) =>
                      setTempPreferences({ ...tempPreferences, functional: checked })
                    }
                    className="flex-shrink-0"
                    data-testid="switch-functional"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row gap-3 p-6 border-t border-border bg-muted/30">
              <button
                onClick={handleWithdrawConsent}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                data-testid="button-withdraw-consent"
              >
                {t.cookieSettings}
              </button>
              <div className="flex gap-3 md:ml-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="text-sm"
                  data-testid="button-modal-cancel"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSavePreferences}
                  className="text-sm bg-secondary hover:bg-secondary/90"
                  data-testid="button-save-preferences"
                >
                  {t.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
