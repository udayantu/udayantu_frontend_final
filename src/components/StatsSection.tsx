import { Users, TrendingUp, Building2, Award } from "lucide-react";
import { useCounterAnimation, parseNumberString } from "@/hooks/useCounterAnimation";
import { memo, useRef, useEffect, useState } from "react";

const StatItem = memo(({ icon: Icon, number, label }: { 
  icon: typeof Users; 
  number: string; 
  label: string; 
}) => {
  const { number: targetNumber, prefix, suffix, decimals } = parseNumberString(number);
  const { ref, displayValue } = useCounterAnimation({
    end: targetNumber,
    duration: 2000,
    decimals,
    prefix,
    suffix,
  });

  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-50px" }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={itemRef}
      className={`text-center text-white group transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div 
        ref={ref}
        className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/15 backdrop-blur-sm mb-3 md:mb-4 group-hover:bg-white/25 group-hover:scale-105 transition-all duration-300 border border-white/10"
      >
        <Icon className="w-7 h-7 md:w-8 md:h-8" />
      </div>
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-1 md:mb-2 tracking-tight">
        {displayValue}
      </div>
      <div className="text-sm md:text-base text-white/85 font-medium">
        {label}
      </div>
    </div>
  );
});

StatItem.displayName = "StatItem";

const stats = [
  {
    icon: Users,
    number: "500+",
    label: "Students Trained",
  },
  {
    icon: TrendingUp,
    number: "81%",
    label: "Placement Rate",
  },
  {
    icon: Award,
    number: "₹4.83L",
    label: "Average Package",
  },
  {
    icon: Building2,
    number: "25+",
    label: "Hiring Partners",
  },
];

export const StatsSection = memo(() => {
  return (
    <section className="py-14 md:py-16 lg:py-20 bg-gradient-to-r from-primary via-primary/95 to-secondary relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_hsl(var(--secondary)/0.15)_0%,_transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_hsl(var(--primary-hover)/0.2)_0%,_transparent_40%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = "StatsSection";
