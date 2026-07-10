import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, GitBranch, Award, Lock, Home, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { LazyImage } from "./LazyImage";
import testimonialAnjali from "@/assets/testimonial-anjali.jpg";

export const WhySection = memo(() => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <section className="py-20 bg-muted">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Component 1: The Hook & Core Narrative */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary">
          Why UdaYantu Now
        </h2>
        
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg mb-12">
          {/* Introductory Text */}
          <p className="text-lg md:text-xl leading-relaxed text-foreground mb-6">
            For millions of dreamers in rural and Tier-4 and Tier-5 communities, the biggest barrier isn't talent, it's <em>opportunity</em>. 
            UdaYantu was built for you self-starters, family breadwinners, and first-generation graduates. 
            We bridge the gap between your ambition and real jobs, no costly travel, no empty promises. 
            You get hands-on learning, tools training, mentorship from people who understand you, and programs proven to deliver interviews, 
            offers, and careers. <em>Rise-up-together</em>
          </p>

          {/* Differentiator Text */}
          <p className="text-lg md:text-xl leading-relaxed text-foreground mb-8">
            While others compete for talent from IITs and metro cities, <strong>UdaYantu is the <em>only</em> company building career pathways</strong> for B.A., B.Sc., B.Com., M.A., M.Sc, M.Com, and others non tech graduates from our villages and Tier 4–5 towns and colleges. From your college to a career in a national company we'll get you there, <strong>together</strong>!
          </p>

          {/* Component 2: Social Proof - Testimonial */}
          <div className="bg-primary/5 rounded-xl p-6 md:p-8 border-l-4 border-secondary mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <LazyImage 
                src={testimonialAnjali} 
                alt="Anjali Singh, UdaYantu Graduate" 
                className="w-24 h-24 rounded-full object-cover border-4 border-secondary"
                placeholderClassName="w-24 h-24 rounded-full"
              />
              <div className="text-center md:text-left">
                <p className="text-lg md:text-xl italic text-foreground mb-3">
                  "UdaYantu gave me my chance. From my village, I joined a top company, debt-free no one believed it, but my mentors did."
                </p>
                <p className="font-semibold text-primary">Anjali Singh</p>
                <p className="text-sm text-muted-foreground">Operation Executive: 4.3 LPA</p>
                <p className="text-sm text-muted-foreground">Gopalganj, Bihar. Working in Lucknow</p>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="p-6 bg-secondary/10 rounded-xl">
            <p className="text-lg font-semibold text-center text-primary">
              Our Mission:<br />
              Every motivated student regardless of background gets a real chance at a professional, 
              future-proofed career. No dead ends, no empty guarantees. Just support, tools training, mentorship, and a clear job path. 
              That's the UdaYantu Promise
            </p>
          </div>
        </div>

        {/* Phase 2: The 5-Pillar Trust Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="pt-6">
              <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">🎯 Job or Your Fee Back.</h4>
              <p className="font-bold text-base mb-3 text-lg">
                नॉकरी नहीं मिली, तो रजिस्ट्रेशन फीस भी वापस।
              </p>
              <p className="text-sm text-muted-foreground">
                Finish the program, don't get placed? We refund your registration fees in full.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="pt-6">
              <GitBranch className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">🤝 Placement Pathway for All.</h4>
              <p className="text-sm text-muted-foreground">
                We partner with top national employers in Tier 1-3 cities who specifically want graduates from <em>every</em> city and village. <strong>We focus on getting you a start.</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="pt-6">
              <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">🌟 Certification Employers Trust.</h4>
              <p className="text-sm text-muted-foreground">
                UdaYantu is officially recognized. Your certificate closes the gap between your degree and a good, respected job. <strong>Built for high-demand, practical skills.</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="pt-6">
              <Lock className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">🔒 Secure & Built for You.</h4>
              <p className="text-sm text-muted-foreground">
                Personalized coaching, flexible schedules, and 1:1 career guidance—<strong>built specifically for students from small towns.</strong> Your data is safe and never sold.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative inline-block mb-4">
                <Home className="w-12 h-12 text-secondary mx-auto" />
                <ArrowUp className="w-6 h-6 text-secondary absolute -top-1 -right-1" />
              </div>
              <h4 className="font-bold text-lg mb-2">🏘️ Mentors Who Understand.</h4>
              <p className="text-sm text-muted-foreground">
                Get guidance from mentors who know exactly where you've come from. <strong>No need to relocate to start learning.</strong> Close the distance between your home and a great career.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Phase 3: Final Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold max-w-full"
            onClick={() => setShowRegistration(true)}
          >
            Secure Your Guaranteed Path
          </Button>
        </div>
      </div>

      <AuthModal 
        open={showRegistration}
        onOpenChange={setShowRegistration}
        defaultTab="register"
      />
    </section>
  );
});

WhySection.displayName = "WhySection";
