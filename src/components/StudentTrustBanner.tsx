import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, ArrowRight } from "lucide-react";
import { memo } from "react";

interface StudentTrustBannerProps {
  onScrollToTestimonials: () => void;
}

export const StudentTrustBanner = memo(({ onScrollToTestimonials }: StudentTrustBannerProps) => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/8 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--secondary)/0.1),transparent_50%)] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <Card className="border-2 border-secondary/25 bg-gradient-to-br from-card via-card to-secondary/5 shadow-lg hover:shadow-xl hover:border-secondary/35 transition-all duration-300">
          <CardContent className="py-8 md:py-10 px-6 md:px-10">
            <div className="text-center space-y-6">
              {/* Main Banner */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                <div className="bg-secondary/15 p-3 rounded-xl">
                  <Users className="w-7 h-7 md:w-8 md:h-8 text-secondary" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-primary leading-tight">
                  Built for students from villages and Tier‑4/5 towns
                </h2>
              </div>
              
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                Your degree matters here.
              </p>

              {/* Family Impact */}
              <div className="bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 rounded-2xl p-6 md:p-8 border-l-4 border-secondary max-w-3xl mx-auto shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                  <div className="flex-shrink-0 bg-secondary/20 rounded-xl p-3 border border-secondary/20">
                    <Heart className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-base md:text-lg lg:text-xl font-bold text-primary leading-relaxed">
                      Support your family, build dignity, and start earning in{" "}
                      <span className="bg-gradient-to-r from-secondary to-orange-400 bg-clip-text text-transparent font-extrabold">
                        just 120 days
                      </span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base md:text-lg px-8 py-6 h-auto font-semibold group"
                  onClick={onScrollToTestimonials}
                >
                  See How Others Succeeded
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
});

StudentTrustBanner.displayName = "StudentTrustBanner";
