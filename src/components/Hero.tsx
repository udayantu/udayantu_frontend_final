import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Shield, Award, Users } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-students.jpg";

// Memoized value prop card for performance
const ValuePropCard = memo(({ icon: Icon, title, description }: { 
  icon: typeof CheckCircle2; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-3 md:gap-4 text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
    <div className="bg-secondary/25 p-2 rounded-lg flex-shrink-0 group-hover:bg-secondary/35 transition-colors">
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
    </div>
    <div>
      <h3 className="font-semibold text-base md:text-lg mb-0.5">{title}</h3>
      <p className="text-sm text-white/75">{description}</p>
    </div>
  </div>
));

ValuePropCard.displayName = "ValuePropCard";

// Memoized trust badge for performance
const TrustBadge = memo(({ icon: Icon, title, subtitle }: { 
  icon: typeof Shield; 
  title: string; 
  subtitle: string;
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 text-center border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
    <div className="bg-secondary/25 w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-secondary/35 transition-colors">
      <Icon className="w-5 md:w-6 h-5 md:h-6 text-secondary" />
    </div>
    <p className="text-sm md:text-base font-semibold">{title}</p>
    <p className="text-xs text-white/65 mt-0.5">{subtitle}</p>
  </div>
));

TrustBadge.displayName = "TrustBadge";

const valueProps = [
  {
    icon: CheckCircle2,
    title: "Personal Mentorship",
    description: "One-on-one guidance throughout your journey"
  },
  {
    icon: CheckCircle2,
    title: "Industry-Ready Skills",
    description: "Practical training that companies value"
  },
  {
    icon: CheckCircle2,
    title: "Money-Back Guarantee",
    description: "100% refund if we don't place you"
  },
  {
    icon: CheckCircle2,
    title: "Pay After Placement",
    description: "Start learning now, pay when employed"
  }
];

const trustBadges = [
  { icon: Shield, title: "100% Refund", subtitle: "Money-back guarantee" },
  { icon: Award, title: "Govt. Certified", subtitle: "Official recognition" },
  { icon: Users, title: "100+ Placed", subtitle: "Students employed" },
  { icon: Shield, title: "Secure Platform", subtitle: "Data protected" }
];

export const Hero = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 lg:pt-44">
      {/* Background Image with fetchpriority for LCP optimization */}
      <img 
        src={heroImage}
        alt=""
        role="presentation"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/90 via-primary/85 to-primary/80" />
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--secondary)/0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--primary-hover)/0.3)_0%,_transparent_50%)]" />
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm md:text-base px-4 py-2 flex items-center gap-2 w-fit mx-auto shadow-lg shadow-secondary/30 border-0">
              <Shield className="w-4 h-4" />
              Job Placement Guarantee
            </Badge>
          </div>
          
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight leading-[1.1] animate-fade-in animation-delay-100">
            From Rural Degrees to 
            <span className="block mt-2 bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent">
              Global Careers
            </span>
          </h1>
          
          <p className="mb-4 text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in animation-delay-200">
            Guaranteed Pathways for B.A, B.Sc, B.Com, M.A, M.Sc, M.Com Graduates
          </p>
          
          <p className="mb-10 text-base sm:text-lg md:text-xl text-white/85 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-300">
            No costly coaching, no empty promises. Just mentorship, practical skills, and a job guarantee or get your admission fee back.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12 max-w-3xl mx-auto animate-fade-in animation-delay-400">
            {valueProps.map((prop) => (
              <ValuePropCard 
                key={prop.title}
                icon={prop.icon}
                title={prop.title}
                description={prop.description}
              />
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-16 animate-fade-in animation-delay-500">
            <Button 
              size="xl"
              variant="glow"
              className="text-lg md:text-xl px-8 md:px-12 py-6 md:py-7 h-auto"
              onClick={() => {
                if (user) {
                  navigate("/payment");
                } else {
                  setAuthDefaultTab("register");
                  setIsAuthOpen(true);
                }
              }}
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 md:w-6 h-5 md:h-6" />
            </Button>
            <Button 
              size="xl" 
              variant="ghost" 
              className="bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm text-base md:text-lg px-8 md:px-10 py-6 md:py-7 h-auto font-semibold"
              onClick={() => scrollToSection('roles')}
            >
              Explore Career Paths
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto animate-fade-in animation-delay-600">
            {trustBadges.map((badge) => (
              <TrustBadge
                key={badge.title}
                icon={badge.icon}
                title={badge.title}
                subtitle={badge.subtitle}
              />
            ))}
          </div>
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

Hero.displayName = "Hero";
