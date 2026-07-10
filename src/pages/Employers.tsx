import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmployerSection } from "@/components/EmployerSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, DollarSign, Zap, BarChart3, CheckCircle2, Lock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trackPageVisit } from "@/lib/analytics";
import { EmployerStatStrip, StatSubheadLine, WhyPartnerIntroLine } from "@/components/employer/EmployerStatStrip";

const Employers = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track page visit
    trackPageVisit('employers');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SEOHead
        title="Hire Pre-Trained Rural Talent | UdaYantu Employer Platform | Enterprise Recruitment"
        description="Access pre-trained, job-ready graduates from rural India. Reduce onboarding costs by 70%, build culturally aligned teams, and tap into India's largest untapped talent pool. Enterprise-grade hiring solution with AI-vetted candidates."
        keywords="employer hiring platform, rural talent recruitment, job-ready graduates, hiring partners, enterprise recruitment, cost-effective hiring, India recruitment, talent acquisition"
        canonicalUrl={`${window.location.origin}/employers`}
        ogType="website"
        ogImage={`${window.location.origin}/opengraph-image.png`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": ["WebPage", "Service"],
          "name": "UdaYantu Employer Platform - Hire Pre-Trained Rural Talent",
          "description": "Enterprise recruitment platform connecting employers with pre-trained, job-ready graduates from rural India",
          "url": `${window.location.origin}/employers`,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "For Employers",
                "item": `${window.location.origin}/employers`
              }
            ]
          },
          "publisher": {
            "@type": "Organization",
            "name": "UdaYantu",
            "url": window.location.origin,
            "logo": `${window.location.origin}/opengraph-image.png`,
            "description": "Career development platform empowering rural Indian graduates with mentorship, skill training, and 100% job placement guarantee",
            "areaServed": "IN",
            "serviceType": "Recruitment Services"
          },
          "serviceType": "Recruitment Services",
          "areaServed": "IN",
          "offers": {
            "@type": "Offer",
            "description": "Pre-trained graduates ready for enterprise hiring",
            "priceCurrency": "INR",
            "price": "Variable based on role and batch size",
            "availability": "InStock"
          },
          "potentialAction": {
            "@type": "ReserveAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${window.location.origin}/employers#waitlist-form`,
              "actionPlatform": ["DesktopWebPlatform", "MobileWebPlatform"]
            },
            "name": "Join Employer Waitlist"
          },
          "mainEntity": {
            "@type": "Service",
            "name": "Enterprise Talent Recruitment",
            "provider": {
              "@type": "Organization",
              "name": "UdaYantu"
            },
            "description": "Access to pre-trained, job-ready graduates from B.A, B.Sc, B.Com, M.A, M.Sc, M.Com programs",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Available Roles",
              "itemListElement": [
                {
                  "@type": "Service",
                  "name": "Business Development",
                  "description": "Business Development role with pre-trained graduates"
                },
                {
                  "@type": "Service",
                  "name": "Customer Success",
                  "description": "Customer Success professionals ready for deployment"
                },
                {
                  "@type": "Service",
                  "name": "Project Management",
                  "description": "Skilled project managers for enterprise teams"
                },
                {
                  "@type": "Service",
                  "name": "Operations Management",
                  "description": "Operations professionals with industry readiness"
                },
                {
                  "@type": "Service",
                  "name": "Product Management",
                  "description": "Product management talent pipeline"
                },
                {
                  "@type": "Service",
                  "name": "Human Resources",
                  "description": "HR professionals trained in modern practices"
                },
                {
                  "@type": "Service",
                  "name": "Marketing Management",
                  "description": "Marketing managers with practical expertise"
                },
                {
                  "@type": "Service",
                  "name": "Customer Support",
                  "description": "Customer support specialists with training"
                }
              ]
            }
          }
        }}
      />

      <main className="min-h-screen">
        <Navbar />

        {/* Enterprise Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-24 md:py-32 lg:py-44 min-h-[calc(100vh-80px)]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/87 to-primary/82" />
          </div>

          <div className="container px-4 mx-auto relative z-10 h-full flex items-center">
            <div className="max-w-5xl mx-auto text-center space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-6 hover:bg-secondary/25 transition-colors duration-300" data-testid="badge-enterprise-hiring" aria-label="Enterprise Hiring Platform badge">
                <Zap className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-sm font-semibold text-secondary">Enterprise Hiring Platform</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight" data-testid="heading-hero-title">
                Access Pre-Trained
                <span className="block text-secondary mt-3">Rural Talent at Scale</span>
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed font-light" data-testid="text-hero-description">
                Reduce onboarding costs by 70%, build culturally aligned teams, and tap into the largest untapped talent pool in India. Job-ready graduates, not fresh hires.
              </p>

              {/* Stat Subhead Line */}
              <StatSubheadLine />

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  size="lg"
                  className="gap-2 group text-base font-semibold px-8 bg-secondary hover:bg-secondary/90"
                  onClick={() => navigate('/employer-login')}
                  data-testid="button-employer-login-hero"
                >
                  Employer Portal Login
                  <Lock className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 group text-base font-semibold px-8"
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-join-waitlist-hero"
                >
                  Join Employer Waitlist
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-base font-semibold px-8"
                  asChild
                  data-testid="button-back-to-home-hero"
                >
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </section>

        {/* Branded 3-Stat Strip */}
        <section className="bg-gradient-to-b from-muted/30 to-muted/10 relative -mt-8">
          <EmployerStatStrip />
        </section>

        {/* Quick Stats Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background relative">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-testid="card-stat-students">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono">5000+</div>
                <p className="text-muted-foreground font-medium text-sm">Students Ready</p>
              </Card>

              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-secondary/20 hover:border-secondary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-testid="card-stat-savings">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono">70%</div>
                <p className="text-muted-foreground font-medium text-sm">Cost Savings</p>
              </Card>

              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-accent/20 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-testid="card-stat-salaries">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors mb-4 mx-auto">
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono">₹3L-8L</div>
                <p className="text-muted-foreground font-medium text-sm">Entry-Level Salaries</p>
              </Card>

              <Card className="p-8 text-center bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-testid="card-stat-roles">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 mx-auto">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono">8 Roles</div>
                <p className="text-muted-foreground font-medium text-sm">Available Positions</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Enterprise Value Proposition */}
        <section className="py-20 md:py-32">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight" data-testid="heading-why-partner">
                Why Partner with UdaYantu?
              </h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent mx-auto rounded-full mb-6" />
              {/* Why Partner Intro Line */}
              <WhyPartnerIntroLine />
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10" aria-label="Cost savings benefit">
                      <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Reduce Onboarding by 70%</h3>
                    <p className="text-muted-foreground font-light">Pre-trained graduates understand workplace basics, tools, and processes. Day one productivity is real.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-secondary/10" aria-label="Team alignment benefit">
                      <Users className="h-6 w-6 text-secondary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Culturally Aligned Teams</h3>
                    <p className="text-muted-foreground font-light">Graduates with values-based motivation, lower churn, and higher retention compared to fresh hires.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-accent/10" aria-label="Fast hiring at scale benefit">
                      <Zap className="h-6 w-6 text-accent" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Fast Hiring at Scale</h3>
                    <p className="text-muted-foreground font-light">Access talent batches designed for your hiring timeline. Scale from 1-5 to 100+ candidates effortlessly.</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10" aria-label="Competitive pricing benefit">
                      <DollarSign className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Competitive Pricing</h3>
                    <p className="text-muted-foreground font-light">Fresh talent at fresher budgets. Hire multiple skilled professionals instead of one expensive senior.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-secondary/10" aria-label="AI vetted talent benefit">
                      <BarChart3 className="h-6 w-6 text-secondary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">AI-Vetted Talent</h3>
                    <p className="text-muted-foreground font-light">Psychometric assessments, role-fit analysis, and aptitude tests ensure perfect team matches.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-accent/10" aria-label="Early partner benefits">
                      <Lock className="h-6 w-6 text-accent" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Early Partner Benefits</h3>
                    <p className="text-muted-foreground font-light">Be part of building our employer network. Shape training modules and influence program design.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Roles */}
            <div className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl border border-primary/20 p-10 md:p-14" data-testid="section-available-roles">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center" data-testid="heading-available-roles">Available Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Business Development",
                  "Customer Success",
                  "Project Management",
                  "Operations Management",
                  "Product Management",
                  "Human Resources",
                  "Marketing Management",
                  "Customer Support"
                ].map((role) => (
                  <div key={role} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-base md:text-lg text-foreground font-medium">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="text-center mb-14 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight" data-testid="heading-security-trust">Enterprise-Grade Security & Trust</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto font-light">Your data and candidate information are protected with enterprise-grade security standards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-card/60 backdrop-blur border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300" data-testid="card-data-privacy">
                <div className="flex gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Data Privacy</h3>
                    <p className="text-muted-foreground font-light text-sm">ISO-compliant security, encrypted data handling, and GDPR compliance for all employer information.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-card/60 backdrop-blur border border-secondary/20 hover:border-secondary/40 hover:shadow-lg transition-all duration-300" data-testid="card-verified-candidates">
                <div className="flex gap-4">
                  <Lock className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Verified Candidates</h3>
                    <p className="text-muted-foreground font-light text-sm">Background verified, skill-tested, and personality assessed graduates ready for your team.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Employer Form Section */}
        <section id="waitlist-form" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/10" data-testid="section-waitlist-form">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight" data-testid="heading-form-section">Join Our Employer Waitlist</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto font-light">Fill out the form below and secure your spot. Our team will contact you with exclusive early-access benefits.</p>
            </div>
            <EmployerSection />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 mx-auto max-w-4xl">
            <Card className="relative overflow-hidden border-none shadow-3xl hover:shadow-4xl transition-shadow duration-500" data-testid="card-final-cta">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-accent" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/25 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />

              <div className="relative z-10 p-10 md:p-16 lg:p-20 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground tracking-tight" data-testid="heading-final-cta">
                  Ready to Scale Your Team?
                </h2>
                <p className="text-lg md:text-2xl text-secondary-foreground/90 max-w-2xl mx-auto font-light">
                  Join our early employer network and get priority access to batches of pre-trained, job-ready talent.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary text-primary-foreground border-none hover:bg-primary/90 font-semibold text-base px-8 gap-2 group"
                    onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="button-join-waitlist-final-cta"
                  >
                    Join Waitlist
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-secondary-foreground/15 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/25 font-semibold text-base px-8"
                    asChild
                    data-testid="button-back-to-home-final"
                  >
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Employers;
