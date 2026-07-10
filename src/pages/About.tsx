import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Rocket, Heart, CheckCircle2, Users, TrendingUp, Award, ArrowRight, GraduationCap, Building2, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import heroImage from "@/assets/hero-students.jpg";

const About = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <>
      <SEOHead 
        title="About Us - Bridging the Opportunity Gap | UdaYantu"
        description="UdaYantu bridges the opportunity gap for rural and Tier 4-5 graduates, transforming degrees into careers with job-ready skills and guaranteed placements. Empowering millions with world-class training and 100% job placement commitment."
        keywords="rural employability India, Tier 4-5 career training, job placement guarantee, rural graduate careers, affordable skill development, village graduates"
        canonicalUrl={`${window.location.origin}/about`}
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About UdaYantu",
          "description": "Bridging the opportunity gap for rural graduates",
          "url": `${window.location.origin}/about`,
          "publisher": {
            "@type": "Organization",
            "name": "UdaYantu",
            "url": window.location.origin
          }
        }}
      />
      
      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero Section with Image */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-24 md:py-32 lg:py-44 min-h-[calc(100vh-80px)]">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Rural graduates pursuing their dreams" 
              className="w-full h-full object-cover opacity-8 animate-in fade-in duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/87 to-primary/82" />
          </div>
          
          {/* Content */}
          <div className="container px-4 mx-auto relative z-10 h-full flex items-center">
            <div className="max-w-5xl mx-auto text-center space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-6 hover:bg-secondary/25 transition-colors duration-300">
                <Globe className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">Bridging the Opportunity Gap</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight">
                Talent is Universal,
                <span className="block text-secondary mt-3">Opportunity is Not</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed font-light">
                Empowering millions of rural graduates to unlock their potential and build dignified, sustainable careers in startup and enterprise environments
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center pt-8">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="gap-2 group text-base font-semibold px-8"
                  onClick={() => setIsRegistrationOpen(true)}
                  data-testid="button-start-journey-hero"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-base font-semibold px-8"
                  asChild
                >
                  <Link to="/#employers">Partner With Us</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background relative -mt-20">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-mono">1M+</div>
                <p className="text-muted-foreground font-medium text-sm">Rural Graduates Targeted</p>
              </Card>
              
              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-secondary/20 hover:border-secondary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-mono">70%</div>
                <p className="text-muted-foreground font-medium text-sm">Reduction in Onboarding Costs</p>
              </Card>
              
              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-accent/20 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors mb-4 mx-auto">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-mono">100%</div>
                <p className="text-muted-foreground font-medium text-sm">Job Placement Commitment</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                Our Story
              </h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent mx-auto rounded-full" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
              <div className="space-y-8">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  At <span className="font-bold text-foreground">UdaYantu</span>, we believe talent is universal, but opportunity is not.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  Every year, millions of graduates from villages and Tier 4–5 towns in India—holding degrees like <span className="font-semibold text-foreground">B.A, B.Sc, B.Com, M.A, M.Sc, M.Com, and other non‑technical fields</span>—step into the world with ambition but without access to the skills, networks, and confidence that employers demand.
                </p>
                <div className="p-8 bg-gradient-to-br from-primary/8 to-primary/3 border-l-4 border-primary rounded-r-2xl hover:shadow-md transition-shadow">
                  <p className="text-xl text-primary font-semibold italic">
                    "We exist to change that."
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  UdaYantu is the first platform built <span className="font-semibold text-foreground">for rural graduates, by people who understand their journey</span>. We combine <span className="font-semibold text-foreground">world‑class training, company‑specific onboarding simulations, and AI‑powered assessments</span> to transform overlooked degrees into career‑ready talent.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  For students, we are a bridge from <span className="font-semibold text-foreground">degree to career</span>—with zero upfront training fees, a job guarantee, and a promise: <span className="text-primary font-semibold italic">"If you don't get placed, your registration fee comes back."</span>
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  For employers, we are a pipeline of <span className="font-semibold text-foreground">pre‑trained, culturally aligned, and tool‑ready professionals</span> who reduce onboarding costs, improve productivity from day one, and lower churn.
                </p>
              </div>
            </div>
            
            <div className="mt-16 p-10 md:p-12 bg-gradient-to-br from-secondary/12 via-secondary/5 to-transparent rounded-3xl border border-secondary/25 hover:shadow-lg transition-shadow">
              <p className="text-2xl md:text-3xl text-foreground font-bold text-center leading-relaxed">
                We are not just building careers. We are building <span className="text-primary font-semibold">confidence, dignity, and futures</span> for millions of young people who deserve their chance to shine.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/8 via-background to-background">
          <div className="container px-4 mx-auto max-w-6xl">
            <Card className="relative overflow-hidden border-none shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/88" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/25 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl opacity-20" />
              
              <div className="relative z-10 p-10 md:p-16 lg:p-20">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 rounded-3xl bg-secondary/20 backdrop-blur-sm">
                    <Rocket className="w-10 h-10 text-secondary" />
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight">Vision</h2>
                </div>
                
                <p className="text-2xl md:text-3xl text-primary-foreground/95 leading-relaxed font-light">
                  To become the world's most trusted platform that transforms <span className="font-semibold text-secondary">rural and non‑technical graduates</span> into <span className="font-semibold text-secondary">global startup and enterprise professionals</span>, unlocking a billion‑dollar opportunity while uplifting millions of families and communities.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="text-center mb-16 md:mb-20">
              <div className="flex items-center justify-center gap-4 mb-8">
                <Target className="w-10 h-10 text-secondary" />
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">Mission</h2>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
                Empowering three key stakeholders in the employment ecosystem
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* For Students */}
              <Card className="p-10 bg-gradient-to-br from-primary/8 to-primary/12 border-primary/25 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mb-6 group-hover:bg-primary/25 group-hover:scale-110 transition-all">
                    <GraduationCap className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Students</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  To empower graduates from villages and Tier 4–5 cities with <span className="font-semibold text-foreground">job‑ready skills, confidence, and guaranteed career pathways</span> in Business Development, Customer Success, Project Management, Operations, and more.
                </p>
              </Card>
              
              {/* For Employers */}
              <Card className="p-10 bg-gradient-to-br from-secondary/8 to-secondary/12 border-secondary/25 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-secondary/15 flex items-center justify-center mb-6 group-hover:bg-secondary/25 group-hover:scale-110 transition-all">
                    <Building2 className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Employers</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  To solve the hiring and training bottleneck by delivering <span className="font-semibold text-foreground">pre‑vetted, role‑ready talent</span> that reduces onboarding costs by up to 70%, improves productivity, and lowers churn.
                </p>
              </Card>
              
              {/* For Society */}
              <Card className="p-10 bg-gradient-to-br from-accent/8 to-accent/12 border-accent/25 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-accent/15 flex items-center justify-center mb-6 group-hover:bg-accent/25 group-hover:scale-110 transition-all">
                    <Globe className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Society</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  To close the opportunity gap between rural and urban India, proving that <span className="font-semibold text-foreground">where you come from should never limit where you can go</span>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Promise Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="text-center mb-16 md:mb-20">
              <div className="flex items-center justify-center gap-4 mb-8">
                <Heart className="w-10 h-10 text-accent" />
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">Our Promise</h2>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
                A commitment to students and employers backed by guarantees
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 bg-card/60 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-primary/20 hover:border-primary/40">
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Zero Upfront Training Fees</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-light">Pay only after you get placed. No financial burden during training.</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 bg-card/60 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-secondary/20 hover:border-secondary/40">
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center group-hover:bg-secondary/25 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">100% Refund Guarantee</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-light">If you don't get placed, your registration fee is fully returned.</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 bg-card/60 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-accent/20 hover:border-accent/40">
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Company-Specific Onboarding</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-light">Graduates walk in ready to contribute from day one with role-specific training.</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 bg-card/60 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-primary/20 hover:border-primary/40">
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">AI-Powered Assessments</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-light">Aptitude, psychometric, and role-fit tests ensure perfect student-job matches.</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 bg-card/60 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-secondary/20 hover:border-secondary/40 md:col-span-2">
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center group-hover:bg-secondary/25 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">45-Day Post-Placement Support</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-light">Continuous coaching for 45 days after placement to ensure early success and career growth.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 mx-auto max-w-4xl">
            <Card className="relative overflow-hidden border-none shadow-3xl hover:shadow-4xl transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-accent" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/25 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />
              
              <div className="relative z-10 p-10 md:p-16 lg:p-20 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground tracking-tight">
                  Ready to Transform Lives?
                </h2>
                <p className="text-xl md:text-2xl text-secondary-foreground/90 max-w-2xl mx-auto font-light">
                  Join thousands of graduates and employers who are bridging the opportunity gap together.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-6">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-primary text-primary-foreground border-none hover:bg-primary/90 font-semibold text-base px-8 gap-2 group"
                    onClick={() => setIsRegistrationOpen(true)}
                    data-testid="button-register-student-cta"
                  >
                    Register as Student
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-secondary-foreground/15 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/25 font-semibold text-base px-8"
                    asChild
                  >
                    <Link to="/#employers" data-testid="link-partner-with-us">Partner with Us</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <Footer />
      </main>
      
      <AuthModal 
        open={isRegistrationOpen} 
        onOpenChange={setIsRegistrationOpen}
        defaultTab="register"
      />
    </>
  );
};

export default About;
