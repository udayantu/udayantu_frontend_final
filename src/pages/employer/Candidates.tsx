import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useEmployerAuth } from '@/hooks/useEmployerAuth';
import { ArrowLeft, Globe, AlertTriangle } from 'lucide-react';
import { CandidatePipeline } from '@/components/employer/CandidatePipeline';

export default function Candidates() {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const [liteMode, setLiteMode] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/employer-login');
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/employer-dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {language === 'hi' ? 'कैंडिडेट' : 'Candidates'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                <Globe className="w-4 h-4 mr-1" />
                EN
              </Button>
              <Button
                variant={language === 'hi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('hi')}
              >
                हिंदी
              </Button>
              <Button
                variant={liteMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLiteMode(!liteMode)}
              >
                {language === 'hi' ? 'लाइट मोड' : 'Lite Mode'}
              </Button>
            </div>
          </div>

          {/* CS Mediation Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {language === 'hi' 
                  ? 'सभी कैंडिडेट एक्शन Customer Success के माध्यम से प्रोसेस होते हैं'
                  : 'All candidate actions are processed through Customer Success'}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {language === 'hi'
                  ? 'इंटरव्यू शेड्यूलिंग, ऑफर भेजना और जॉइनिंग कन्फर्मेशन - सभी CS टीम द्वारा मैनेज किए जाते हैं। स्टूडेंट से सीधा संपर्क अनुमति नहीं है।'
                  : 'Interview scheduling, offer sending, and joining confirmation are all managed by the CS team. Direct student contact is not permitted.'}
              </p>
            </div>
          </div>

          <CandidatePipeline
            employerId={session.id}
            employerName={session.companyName}
            language={language}
            liteMode={liteMode}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
