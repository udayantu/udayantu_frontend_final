import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGA4 } from "@/hooks/useGA4";

const benefits = [
  {
    title: "100% Placement Guarantee",
    description: "Get placed or get your money back"
  },
  {
    title: "Pay After Placement",
    description: "Start learning now, pay your training fee only when you get a job"
  },
  {
    title: "Personal Mentorship",
    description: "One-on-one guidance throughout your journey"
  },
  {
    title: "Industry-Ready Skills",
    description: "Learn what companies are actually looking for"
  }
];

const BenefitItem = memo(({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/10">
    <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
));

BenefitItem.displayName = "BenefitItem";

export const RegistrationSection = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useGA4();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
              <CardHeader className="text-center space-y-4 pb-8 pt-8">
                <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Ready to Transform Your Career and Support Your Family
                </CardTitle>
                <CardDescription className="text-lg md:text-xl text-muted-foreground">
                  Join thousands of students who have already started their journey to success with UdaYantu
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8 pt-0">
                {/* Benefits */}
                <div className="grid md:grid-cols-2 gap-4">
                  {benefits.map((benefit) => (
                    <BenefitItem key={benefit.title} title={benefit.title} description={benefit.description} />
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center pt-6">
                  <Button 
                    size="lg"
                    onClick={() => {
                      trackEvent('registration_cta_clicked', {
                        location: 'registration_section',
                        user_status: user ? 'logged_in' : 'not_logged_in'
                      });
                      
                      if (user) {
                        navigate("/payment");
                      } else {
                        setAuthDefaultTab("register");
                        setIsAuthOpen(true);
                      }
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base sm:text-lg px-6 sm:px-12 py-5 sm:py-6 h-auto shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                    data-testid="button-registration-cta"
                  >
                    <span className="inline sm:hidden">Get Started Now</span>
                    <span className="hidden sm:inline">Register Now - Start Your Journey</span>
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 inline" />
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                    Join our next cohort starting soon. Limited seats available!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        defaultTab={authDefaultTab}
      />
    </>
  );
});

RegistrationSection.displayName = "RegistrationSection";
