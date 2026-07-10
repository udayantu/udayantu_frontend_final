import { UserPlus, Target, BookOpen, Award, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { memo, useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    className="h-full"
  >
    <Card className="relative border border-border/40 hover:border-primary/30 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all duration-500 group h-full bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardContent className="pt-8 pb-6 px-5 text-center flex flex-col h-full items-center relative z-10">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-6 group-hover:bg-primary/10 transition-all duration-500 shadow-inner">
          <step.icon className="w-8 h-8 text-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500" />
          <div className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-black shadow-[0_4px_10px_rgba(255,90,31,0.3)] border-2 border-background">
            {step.number}
          </div>
        </div>
        <h3 className="font-heading text-base md:text-lg font-bold mb-2.5 text-foreground group-hover:text-primary transition-colors duration-300">{step.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-grow">
          {step.description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
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
          <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/45 to-primary/10 -z-10" />
          
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
