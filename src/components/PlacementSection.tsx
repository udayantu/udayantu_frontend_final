import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Phone, Briefcase, MapPin, RefreshCw, Users } from "lucide-react";
import { memo } from "react";

const placementFeatures = [
  {
    icon: CheckCircle2,
    title: "1:1 Mentorship",
    description: "From mock interviews to resume building, get personalized guidance."
  },
  {
    icon: Briefcase,
    title: "Direct Referrals",
    description: "Access to leading employers in your chosen track."
  },
  {
    icon: MapPin,
    title: "Real-World Projects",
    description: "Hands-on experience in your home region and city."
  },
  {
    icon: Users,
    title: "Virtual & Hybrid Jobs",
    description: "Work from anywhere with remote-friendly opportunities."
  },
  {
    icon: Phone,
    title: "Job Search Coach",
    description: "Dedicated support via WhatsApp, SMS, or in-app messaging."
  },
  {
    icon: RefreshCw,
    title: "Full Fee Refund",
    description: "Not placed within 180 days? Get 100% money back."
  }
];

const FeatureCard = memo(({ feature }: { feature: typeof placementFeatures[0] }) => (
  <Card className="bg-white/10 border-white/15 backdrop-blur-sm h-full hover:bg-white/15 hover:border-white/25 transition-all duration-300 group">
    <CardContent className="pt-6 pb-5">
      <div className="flex items-start gap-4">
        <div className="bg-secondary/25 p-2.5 rounded-xl flex-shrink-0 group-hover:bg-secondary/35 transition-colors">
          <feature.icon className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1.5 text-white">{feature.title}</h3>
          <p className="text-sm text-primary-foreground/75 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

FeatureCard.displayName = "FeatureCard";

export const PlacementSection = memo(() => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--secondary)/0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--primary-hover)/0.3),transparent_50%)] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-5 md:mb-6 leading-tight">
            Job Placement Promise OR<br className="hidden sm:block" /> Get Your Registration Fee Back!
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed">
            At UdaYantu, we don't leave you behind. Every student who completes their curriculum gets comprehensive support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16">
          {placementFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {/* Stats Banner */}
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 md:p-8 lg:p-10 text-center shadow-xl shadow-secondary/30">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">
            81% Placement Rate within 120 days
          </p>
          <p className="text-base md:text-lg mt-3 opacity-90">
            UdaYantu graduates secured job offers at leading companies
          </p>
        </div>
      </div>
    </section>
  );
});

PlacementSection.displayName = "PlacementSection";
