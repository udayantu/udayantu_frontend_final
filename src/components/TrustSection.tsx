import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Building2, MapPin, Target, GitBranch, Award, Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useCounterAnimation, parseNumberString } from "@/hooks/useCounterAnimation";
import { motion } from "framer-motion";

const PlacementStatItem = ({ 
  icon: Icon, 
  value, 
  label 
}: { 
  icon: typeof TrendingUp; 
  value: string; 
  label: string;
}) => {
  const { number: targetNumber, prefix, suffix, decimals } = parseNumberString(value);
  const { ref, displayValue } = useCounterAnimation({
    end: targetNumber,
    duration: 2500,
    decimals,
    prefix,
    suffix,
  });

  return (
    <div ref={ref} className="text-center p-6 bg-primary/5 rounded-xl">
      <Icon className="w-10 h-10 text-secondary mx-auto mb-3" />
      <p className="text-3xl font-bold text-primary mb-2">{displayValue}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

interface TrustCardProps {
  icon: typeof Target;
  title: string;
  hindiText?: string;
  description: React.ReactNode;
  index: number;
}

const TrustCard = ({ icon: Icon, title, hindiText, description, index }: TrustCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
  >
    <Card className="group relative bg-card border border-border/40 rounded-2xl hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 h-full">
      <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full">
        {/* Icon with modern container */}
        <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        {/* Title */}
        <h4 className="font-bold text-lg mb-3 text-primary text-center leading-tight">
          {title}
        </h4>
        
        {/* Hindi text if present */}
        {hindiText && (
          <p className="font-semibold text-sm text-secondary mb-3 text-center">
            {hindiText}
          </p>
        )}
        
        {/* Description */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed flex-grow">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const trustCards = [
  {
    icon: Target,
    title: "Job or Your Fee Back",
    hindiText: "नॉकरी नहीं मिली, तो रजिस्ट्रेशन फीस भी वापस।",
    description: <>Finish the program, don't get placed? We refund your fees in full. <strong className="text-foreground">No hidden clauses. Period.</strong></>
  },
  {
    icon: GitBranch,
    title: "Placement Pathway for All",
    description: <>We partner with top national employers in Tier 1-3 cities who specifically want graduates from <em>every</em> city and village. <strong className="text-foreground">We focus on getting you a start.</strong></>
  },
  {
    icon: Award,
    title: "Certification Employers Trust",
    description: <>UdaYantu is officially recognized. Your certificate closes the gap between your degree and a good, respected job. <strong className="text-foreground">Built for high-demand, practical skills.</strong></>
  },
  {
    icon: Lock,
    title: "Secure & Built for You",
    description: <>Personalized coaching, flexible schedules, and 1:1 career guidance—<strong className="text-foreground">built specifically for students from small towns.</strong> Your data is safe and never sold.</>
  },
  {
    icon: Home,
    title: "Mentors Who Understand",
    description: <>Get guidance from mentors who know exactly where you've come from. <strong className="text-foreground">No need to relocate to start learning.</strong> Close the distance between your home and a great career.</>
  },
  {
    icon: Shield,
    title: "Transparent & Fair Process",
    description: <>No surprises, no hidden fees. Every step from enrollment to placement is clear, documented, and <strong className="text-foreground">designed to respect your time and trust.</strong></>
  }
];

export const TrustSection = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto max-w-6xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary"
        >
          Why UdaYantu
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-lg text-muted-foreground max-w-4xl mx-auto mb-14 leading-relaxed"
        >
          While others compete for talent from IITs and metro cities, <strong className="text-foreground">UdaYantu is the <em>only</em> company building career pathways</strong> for B.A., B.Sc., B.Com., M.A., and M.Com. graduates from our villages and Tier 4–5 towns. From your college to a career in a national company—we'll get you there, <strong className="text-foreground">together</strong>.
        </motion.p>

        {/* 3x2 Grid for balanced layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trustCards.map((card, index) => (
            <TrustCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              hindiText={card.hindiText}
              description={card.description}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold max-w-full shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300"
            onClick={() => setShowRegistration(true)}
          >
            ⚡ Start Your New Career. Get Job Ready Now.
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl p-8 md:p-12 border border-border/40 shadow-sm"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-primary">
            Placement Results
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlacementStatItem
              icon={TrendingUp}
              value="81%"
              label="Placement Rate within 120 days"
            />
            <PlacementStatItem
              icon={Building2}
              value="25+"
              label="Major Employer Partners (MSMEs, tech startups, NGOs)"
            />
            <PlacementStatItem
              icon={Shield}
              value="₹4.83 LPA"
              label="Average Salary Offered"
            />
            <PlacementStatItem
              icon={MapPin}
              value="50+"
              label="Cities/Towns Placed In across India"
            />
          </div>

          <div className="mt-8 text-center p-6 bg-secondary/5 rounded-xl border border-secondary/10">
            <Shield className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="text-lg font-semibold text-primary">
              100% of refunds honored on eligible, confirmed cases
            </p>
          </div>
        </motion.div>
      </div>

      <AuthModal 
        open={showRegistration}
        onOpenChange={setShowRegistration}
        defaultTab="register"
      />
    </section>
  );
};
