import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { LogOut, Users, Briefcase, Calendar, BarChart3, Settings, FileCheck, Gem, TrendingUp } from "lucide-react";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { session, logout, features, checkPermission } = useEmployerAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate("/employer-login");
    }
  }, [session, navigate]);

  if (!session) return null;

  const t = {
    dashboard: "Dashboard",
    welcome: `Welcome, ${session.companyName}`,
    role: `Role: ${session.role.charAt(0).toUpperCase() + session.role.slice(1)}`,
    logout: "Logout",
    jobs: "Jobs",
    jobsDesc: "Manage job postings and requirements",
    candidates: "Candidates",
    candidatesDesc: "Review and manage candidates",
    interviews: "Interviews",
    interviewsDesc: "Schedule and track interviews",
    offers: "Offers",
    offersDesc: "Create and manage job offers",
    analytics: "Analytics",
    analyticsDesc: "View hiring metrics and insights",
    outcomes: "Outcomes",
    outcomesDesc: "Track hiring funnel and results",
    talentPool: "Talent Pool",
    talentPoolDesc: "Manage Silver Medalists & promising candidates",
    team: "Team",
    teamDesc: "Manage team members and permissions",
    settings: "Settings",
    settingsDesc: "Configure account settings",
    feedback: "Feedback",
    feedbackDesc: "Provide interview feedback",
    noAccess: "You don't have access to this feature",
  };

  const moduleCards = [
    {
      icon: Briefcase,
      title: t.jobs,
      desc: t.jobsDesc,
      permission: "view_jobs",
      show: checkPermission("view_jobs"),
      route: "/jobs",
    },
    {
      icon: Users,
      title: t.candidates,
      desc: t.candidatesDesc,
      permission: "manage_candidates",
      show: checkPermission("manage_candidates"),
      route: "/employer/candidates",
    },
    {
      icon: Calendar,
      title: t.interviews,
      desc: t.interviewsDesc,
      permission: "manage_interviews",
      show: checkPermission("manage_interviews"),
      route: "/interviews",
    },
    {
      icon: FileCheck,
      title: t.offers,
      desc: t.offersDesc,
      permission: "manage_offers",
      show: checkPermission("manage_offers"),
      route: "/employer/offers",
    },
    {
      icon: BarChart3,
      title: t.analytics,
      desc: t.analyticsDesc,
      permission: "view_analytics",
      show: checkPermission("view_analytics"),
      route: "/employer/analytics",
    },
    {
      icon: TrendingUp,
      title: t.outcomes,
      desc: t.outcomesDesc,
      permission: "view_analytics",
      show: checkPermission("view_analytics"),
      route: "/employer/outcomes",
    },
    {
      icon: Gem,
      title: t.talentPool,
      desc: t.talentPoolDesc,
      permission: "manage_candidates",
      show: checkPermission("manage_candidates"),
      route: "/employer/talent-pool",
    },
    {
      icon: Users,
      title: t.team,
      desc: t.teamDesc,
      permission: "manage_team",
      show: checkPermission("manage_team"),
      route: "/team",
    },
    {
      icon: Settings,
      title: t.settings,
      desc: t.settingsDesc,
      permission: "view_all",
      show: true,
      route: "/settings",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/employers");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{t.dashboard}</h1>
              <p className="text-lg text-foreground font-semibold">{t.welcome}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </Button>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map(
              (card) =>
                card.show && (
                  <Card
                    key={card.title}
                    onClick={() => {
                      navigate(card.route || "/employer-dashboard");
                    }}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer border"
                    data-testid={`card-${card.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-secondary/10">
                        <card.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.desc}</p>
                      </div>
                    </div>
                  </Card>
                )
            )}
          </div>

          {/* Coming Soon Message */}
          <div className="mt-12 p-8 bg-accent-bg/30 rounded-lg border border-border text-center">
            <p className="text-foreground font-semibold mb-2">Full Dashboard Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              We're building powerful tools to help you manage hiring efficiently. Stay tuned!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmployerDashboard;
