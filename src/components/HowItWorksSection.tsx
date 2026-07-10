import { UserPlus, Target, BookOpen, Award, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { memo, useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Secure Your Spot",
    description: "Complete your registration to secure your spot in the upcoming batch.",
  },
  {
    icon: Target,
    number: "02",
    title: "Find Your Fit",
    description: "Take our aptitude & psychometric tests to get matched with your perfect role.",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Learn & Practice",
    description: "Get hands-on training with real projects and personal mentorship",
  },
  {
    icon: Award,
    number: "04",
    title: "Get Certified",
    description: "Earn government-recognized certification proving your expertise",
  },
  {
    icon: Briefcase,
    number: "05",
    title: "Land Your Job",
    description: "We guarantee placement with our hiring partners or full refund",
  },
];

const StepCard = memo(({ step, index }: { step: typeof steps[0]; index: number }) => (
  <Card className="relative border border-border hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 group h-full bg-card">
    <CardContent className="pt-8 pb-6 px-5 text-center">
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/8 mb-4 group-hover:bg-primary/15 transition-all duration-300">
        <step.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shadow-md">
          {step.number}
        </div>
      </div>
      <h3 className="font-heading text-lg md:text-xl font-bold mb-2 text-foreground">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </CardContent>
  </Card>
));

StepCard.displayName = "StepCard";

export const HowItWorksSection = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background via-primary/[0.03] to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your journey from student to employed professional in 5 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-20 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10" />
          
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 md:mt-16">
          <Button 
            size="xl" 
            variant="glow"
            onClick={() => {
              if (user) {
                navigate("/payment");
              } else {
                setAuthDefaultTab("register");
                setIsAuthOpen(true);
              }
            }}
          >
            Register Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        defaultTab={authDefaultTab}
      />
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
