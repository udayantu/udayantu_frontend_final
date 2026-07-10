import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, ClipboardList, Settings, Package, UserCheck, TrendingUp, Headphones, Clock, Target, IndianRupee, Award, Zap, CheckCircle2 } from "lucide-react";
import { memo, useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    id: "business",
    name: "Business Development",
    icon: Briefcase,
    tagline: "Launch Your Sales Career with Confidence",
    description: "Build a thriving career in Business Development at India's fastest-growing companies. Master consultative selling, lead generation, and relationship management through hands-on projects with real businesses. Join 500+ freshers who've already landed roles at top firms.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3.5-5L",
    outcomes: ["100% Job Assistance", "Real Client Projects", "Industry Mentorship"],
    modules: [
      "Solution Selling & Customer Psychology",
      "Lead Generation & Prospecting Mastery",
      "Advanced Negotiation Techniques",
      "Live Business Development Projects"
    ]
  },
  {
    id: "customer",
    name: "Customer Success",
    icon: Users,
    tagline: "Build Lasting Customer Relationships",
    description: "Step into the high-demand field of Customer Success where you'll learn to onboard, support, and delight customers at scale. Perfect for freshers who love problem-solving and building relationships. Our graduates work at India's leading SaaS companies.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3-4.5L",
    outcomes: ["Guaranteed Placement Support", "SaaS Tools Training", "Communication Workshops"],
    modules: [
      "Customer Onboarding Excellence",
      "Empathy-Driven Support Frameworks",
      "Data Analytics & KPI Tracking",
      "Conflict Resolution & Crisis Management"
    ]
  },
  {
    id: "project",
    name: "Project Management",
    icon: ClipboardList,
    tagline: "Lead Projects, Drive Business Success",
    description: "Become a certified Project Manager equipped with Agile, Scrum, and cutting-edge PM tools. No prior experience needed—our structured curriculum takes you from basics to managing real projects. 90% of our freshers secure PM roles within 3 months.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    outcomes: ["Agile Certification Path", "Live Project Experience", "PM Tools Mastery"],
    modules: [
      "Project Lifecycle & Planning Fundamentals",
      "Agile, Scrum & Kanban Methodologies",
      "Risk Management & Stakeholder Communication",
      "Industry Capstone Project Delivery"
    ]
  },
  {
    id: "operations",
    name: "Operations Management",
    icon: Settings,
    tagline: "Optimize Processes, Drive Efficiency",
    description: "Enter the backbone of every successful company—Operations Management. Learn to streamline workflows, manage supply chains, and drive operational excellence from day one. Our fresher-focused training includes on-site shadowing at partner companies.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    outcomes: ["Industry Shadowing", "Process Automation", "Analytics Training"],
    modules: [
      "Operations & Logistics Fundamentals",
      "Supply Chain Management Essentials",
      "Data-Driven Process Optimization",
      "Real-World Operations Shadowing"
    ]
  },
  {
    id: "product",
    name: "Product Management",
    icon: Package,
    tagline: "Shape Products Users Love",
    description: "Break into Product Management without a tech background. Learn user research, roadmapping, and MVP development through real product case studies. Our freshers-first approach makes PM accessible, with graduates now working at leading product companies.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹5-7L",
    outcomes: ["Build Your Portfolio", "User Research Projects", "Industry Mentors"],
    modules: [
      "Product Strategy & Roadmap Creation",
      "User Research & Bharat Market Insights",
      "MVP Development & A/B Testing",
      "Stakeholder Management & Presentations"
    ]
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: UserCheck,
    tagline: "Build Teams, Shape Company Culture",
    description: "Start your HR career with comprehensive training in recruitment, employee engagement, and compliance. Perfect for freshers passionate about people and culture. Our curriculum covers modern HR tech and prepares you for roles at India's top employers.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3.5-5L",
    outcomes: ["HR Tech Training", "Campus Recruitment", "Compliance Certification"],
    modules: [
      "Talent Acquisition & Campus Recruitment",
      "Diversity, Inclusion & Employee Engagement",
      "Payroll, Policies & Labour Compliance",
      "HR Analytics & Performance Management"
    ]
  },
  {
    id: "marketing",
    name: "Marketing Management",
    icon: TrendingUp,
    tagline: "Drive Growth Through Strategic Marketing",
    description: "Master digital marketing, brand strategy, and campaign analytics with zero prior experience required. Our hands-on curriculum includes live campaigns, SEO projects, and social media mastery. Join the next generation of marketing professionals.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    outcomes: ["Live Campaign Projects", "SEO Certification", "Analytics Mastery"],
    modules: [
      "Digital Marketing & SEO Fundamentals",
      "Brand Positioning & Content Strategy",
      "Social Media Marketing & Growth Hacking",
      "Campaign Analytics & ROI Optimization"
    ]
  },
  {
    id: "support",
    name: "Customer Support",
    icon: Headphones,
    tagline: "Solve Problems, Create Experiences",
    description: "Begin your career in Customer Support with training in leading CRM tools, communication frameworks, and problem-solving techniques. Perfect entry point for freshers—our graduates consistently achieve 95%+ customer satisfaction ratings.",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹2.5-4L",
    outcomes: ["CRM Tool Certification", "Communication Training", "Fast-Track Hiring"],
    modules: [
      "Support Platforms & Ticketing Systems",
      "Professional Communication & Active Listening",
      "Advanced Problem-Solving Frameworks",
      "Customer Satisfaction & Retention Metrics"
    ]
  }
];

export const RolesSection = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");

  return (
    <section id="roles" className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4 text-sm font-semibold px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            8 Career Paths • 15 Weeks Each • Fresher-Friendly
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground leading-tight">
            Choose Your Career Path,<br />
            <span className="text-primary">We'll Handle the Rest</span>
          </h2>
          <div className="bg-secondary/10 border-2 border-secondary/30 rounded-xl p-6 max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-primary font-bold text-center leading-relaxed">
              Every program is designed for freshers with zero experience — your degree is enough.
            </p>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-4">
            Get hands-on training, industry mentorship, and guaranteed placement support—all in just 15 weeks.
          </p>
        </div>

        <Tabs defaultValue="business" className="w-full">
          {/* Horizontal scrollable tabs with better mobile UX */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <TabsList className="inline-flex w-auto lg:grid lg:w-full lg:grid-cols-4 h-auto gap-2 md:gap-3 bg-transparent p-0 mb-8 md:mb-12">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <TabsTrigger 
                  key={role.id} 
                  value={role.id}
                  className="flex flex-col items-center justify-center gap-2 p-4 md:p-5 min-h-[90px] md:min-h-[110px] min-w-[120px] md:min-w-[160px] rounded-xl border-2 border-border bg-card/80 hover:bg-card hover:border-primary/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-lg transition-all duration-200 group"
                >
                  <Icon className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
                  <span className="text-xs md:text-sm font-semibold text-center leading-tight">{role.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          </div>

          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TabsContent key={role.id} value={role.id} className="mt-0 animate-in fade-in-50 duration-300">
                <Card className="border-2 border-border shadow-xl overflow-hidden bg-card">
                  <CardHeader className="bg-gradient-to-br from-muted/50 to-transparent space-y-5 pb-6">
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
                      <div className="bg-secondary text-secondary-foreground p-4 rounded-xl shadow-md">
                        <Icon className="w-7 h-7 md:w-8 md:h-8" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">{role.name}</CardTitle>
                        <CardDescription className="text-base md:text-lg font-medium text-primary flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {role.tagline}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Key info badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {role.duration}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5">
                        <Target className="w-3.5 h-3.5 mr-1.5" />
                        {role.difficulty}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5" />
                        {role.avgSalary}/year
                      </Badge>
                    </div>

                    {/* Outcome badges */}
                    <div className="flex flex-wrap gap-2">
                      {role.outcomes.map((outcome, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1.5 text-xs border-border bg-background">
                          <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary" />
                          {outcome}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6 space-y-6">
                    {/* Description */}
                    <div className="bg-muted/50 p-5 rounded-xl border border-border">
                      <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    
                    {/* Modules */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-base md:text-lg text-foreground flex items-center gap-2">
                        <div className="h-0.5 w-8 bg-primary rounded-full" />
                        What You'll Master
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {role.modules.map((module, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed pt-1">{module}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer with CTA */}
                    <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-primary" />
                          <span>Certification</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Placement Support</span>
                        </div>
                      </div>
                      <Button 
                        size="lg" 
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6 shadow-md"
                        onClick={() => {
                          if (user) {
                            navigate("/payment");
                          } else {
                            setAuthDefaultTab("register");
                            setIsAuthOpen(true);
                          }
                        }}
                      >
                        Apply for This Track
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        defaultTab={authDefaultTab}
      />
    </section>
  );
});

RolesSection.displayName = "RolesSection";
