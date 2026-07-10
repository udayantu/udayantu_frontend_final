import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { AuthModal } from "./AuthModal";
import { MobileMenu } from "./MobileMenu";
import { UserMenu } from "./UserMenu";
import logoImage from "@/assets/udayantu-logo.svg";
import { LayoutDashboard, Building2, ChevronDown, Home, BookOpen, User } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isPaid, loading: paymentLoading } = usePaymentStatus();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["roles", "placements", "faq"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    // Set home as active when at top
    const handleTopScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleTopScroll);

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener("scroll", handleTopScroll);
    };
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      setAuthDefaultTab("login");
      setIsAuthOpen(true);
      return;
    }

    if (paymentLoading) {
      toast({
        title: "Loading",
        description: "Checking payment status...",
      });
      return;
    }

    if (!isPaid) {
      toast({
        title: "Payment Required",
        description: "Please complete your payment to access the dashboard",
        variant: "destructive",
      });
      navigate("/payment");
      return;
    }

    navigate("/dashboard");
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Programs", action: () => scrollToSection("roles"), sectionId: "roles" },
    { label: "Success Stories", action: () => scrollToSection("placements"), sectionId: "placements" },
    { label: "About", action: () => navigate("/about"), sectionId: "about" },
    { label: "Blog", action: () => navigate("/blog"), sectionId: "blog" },
  ];

  const isLinkActive = (sectionId: string) => {
    if (sectionId === "blog") {
      return location.pathname === "/blog";
    }
    if (sectionId === "about") {
      return location.pathname === "/about";
    }
    if (sectionId === "employers") {
      return location.pathname === "/employers";
    }
    return location.pathname === "/" && activeSection === sectionId;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl shadow-lg shadow-foreground/5 border-b border-border/60" 
          : "bg-background/80 backdrop-blur-md border-b border-border/20"
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo */}
            <button 
              onClick={() => navigate("/")}
              className="hover:opacity-90 transition-all duration-300 hover:scale-[1.02] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="UdaYantu Home"
              data-testid="button-navbar-logo"
            >
              <img 
                src={logoImage} 
                alt="UdaYantu - Professional Upskilling Programs" 
                width={140}
                height={56}
                className="h-10 sm:h-11 md:h-12 lg:h-14 w-auto object-contain"
                data-testid="img-navbar-logo"
              />
            </button>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`font-medium text-sm px-4 py-2.5 rounded-lg transition-all duration-200 relative group ${
                    isLinkActive(link.sectionId)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`button-navbar-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                  {/* Active indicator */}
                  {isLinkActive(link.sectionId) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* For Employers CTA - Only show when user is NOT authenticated */}
              {!user && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/employers")}
                  className="hidden md:inline-flex border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground font-medium text-sm px-4 gap-2 transition-all duration-200"
                  data-testid="button-navbar-for-employers"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden xl:inline">For Employers</span>
                  <span className="xl:hidden">Employers</span>
                </Button>
              )}

              {/* Auth Buttons & User Menu */}
              {user ? (
                <>
                  <div className="hidden lg:block">
                    <UserMenu />
                  </div>
                  <div className="lg:hidden">
                    <MobileMenu navLinks={navLinks} isLinkActive={isLinkActive} />
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthDefaultTab("login");
                      setIsAuthOpen(true);
                    }}
                    className="text-muted-foreground hover:text-foreground hidden md:inline-flex font-medium text-sm"
                    data-testid="button-navbar-sign-in"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAuthDefaultTab("register");
                      setIsAuthOpen(true);
                    }}
                    className="font-semibold hidden sm:inline-flex shadow-md hover:shadow-lg transition-all duration-200"
                    data-testid="button-navbar-get-started"
                  >
                    Get Started
                  </Button>
                  <div className="lg:hidden">
                    <MobileMenu navLinks={navLinks} isLinkActive={isLinkActive} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <AuthModal 
          open={isAuthOpen} 
          onOpenChange={setIsAuthOpen}
          defaultTab={authDefaultTab}
        />
      </nav>

      {/* Floating Bottom Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center">
          {/* Tab 1: Home */}
          <button 
            onClick={() => navigate("/")}
            className={`flex flex-col items-center justify-center gap-1.5 transition-colors focus:outline-none ${
              location.pathname === "/" && activeSection !== "roles" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* Tab 2: Programs */}
          <button 
            onClick={() => scrollToSection("roles")}
            className={`flex flex-col items-center justify-center gap-1.5 transition-colors focus:outline-none ${
              location.pathname === "/" && activeSection === "roles" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold tracking-tight">Programs</span>
          </button>

          {/* Tab 3: Employers */}
          <button 
            onClick={() => navigate("/employers")}
            className={`flex flex-col items-center justify-center gap-1.5 transition-colors focus:outline-none ${
              location.pathname === "/employers" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold tracking-tight">Employers</span>
          </button>

          {/* Tab 4: Dashboard/Auth */}
          <button 
            onClick={handleDashboardClick}
            className={`flex flex-col items-center justify-center gap-1.5 transition-colors focus:outline-none ${
              location.pathname === "/dashboard" || location.pathname === "/payment" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold tracking-tight">{user ? "Dashboard" : "Sign In"}</span>
          </button>
        </div>
      </div>
    </>
  );
};
