import { Linkedin, Phone, Mail, Facebook, MapPin, Award, Shield, Users, TrendingUp, CheckCircle2, ArrowRight, ExternalLink, Heart, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate newsletter signup
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Thank you for subscribing!", {
      description: "You'll receive career insights and tips weekly."
    });
    setEmail("");
    setIsSubmitting(false);
  };

  const quickLinks = [
    { to: "/", label: "Home", isExternal: false },
    { to: "/about", label: "About Us", isExternal: false },
    { to: "/#roles", label: "Programs", isExternal: false, isAnchor: true },
    { to: "/#placements", label: "Success Stories", isExternal: false, isAnchor: true },
    { to: "/#register", label: "Register Now", isExternal: false, isAnchor: true },
  ];

  const resourceLinks = [
    { to: "/blog", label: "Blog & Insights", isExternal: false },
    { to: "/#testimonials", label: "Student Testimonials", isExternal: false, isAnchor: true },
    { to: "/#faq", label: "FAQs", isExternal: false, isAnchor: true },
    { to: "/employers", label: "For Employers", isExternal: false },
    { to: "/refund", label: "Refund Policy", isExternal: false },
  ];

  const legalLinks = [
    { to: "/terms", label: "Terms of Service" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/contact", label: "Contact Us" },
  ];

  const stats = [
    { icon: Users, value: "5000+", label: "Students Enrolled", color: "text-emerald-400" },
    { icon: TrendingUp, value: "81%", label: "Placement Rate", color: "text-sky-400" },
    { icon: Award, value: "25+", label: "Partner Companies", color: "text-amber-400" },
    { icon: Shield, value: "100%", label: "Money-back Guarantee", color: "text-violet-400" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-b from-background via-muted/50 to-[hsl(214,49%,22%)]">
        <div className="container px-4 mx-auto max-w-7xl py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-br from-[hsl(214,49%,26%)] to-[hsl(214,49%,18%)] rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden">
              {/* Subtle decorative glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="relative text-center mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium mb-3 border border-secondary/25">
                  <Mail className="w-3.5 h-3.5" />
                  Newsletter
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white">
                  Stay ahead with career insights
                </h3>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Join 10,000+ learners receiving tips, guides, and success stories
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="relative flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-secondary/40 focus-visible:border-secondary/40 h-11 rounded-lg flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 px-5 rounded-lg shadow-md transition-all duration-200 group"
                >
                  {isSubmitting ? "..." : "Subscribe"}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>
              <p className="relative text-xs text-white/40 text-center mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative bg-[hsl(214,49%,18%)]">
        <div className="relative container px-4 mx-auto max-w-7xl py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block mb-6 group">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-secondary transition-colors duration-300">
                    Uda<span className="text-secondary group-hover:text-white transition-colors duration-300">Yantu</span>
                  </span>
                  <span className="text-xs text-white/50 tracking-widest uppercase mt-0.5">Rise Up Together</span>
                </div>
              </Link>
              <p className="text-white/70 mb-6 text-sm leading-relaxed">
                Empowering rural and Tier 3-4 students with job-ready skills, 
                personalized mentorship, and guaranteed placement support. 
                Your dignity and success matter to us.
              </p>
              
              {/* Trust Indicators */}
              <div className="space-y-3 mb-8">
                {[
                  "100% Placement Guarantee",
                  "Fair-use Refund Policy",
                  "Human-first Support"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm group">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {[
                  { href: "https://www.linkedin.com/company/udayantu", icon: Linkedin, label: "LinkedIn", hoverBg: "hover:bg-[#0A66C2]" },
                  { href: "https://www.facebook.com/udayantu", icon: Facebook, label: "Facebook", hoverBg: "hover:bg-[#1877F2]" },
                  { href: "https://www.instagram.com/udayantu", icon: Instagram, label: "Instagram", hoverBg: "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]" },
                  { href: "https://www.youtube.com/@udayantu", icon: Youtube, label: "YouTube", hoverBg: "hover:bg-[#FF0000]" },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-white/10 ${social.hoverBg} rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/10 hover:border-transparent`}
                    aria-label={`Follow on ${social.label}`}
                  >
                    <social.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">Quick Links</h4>
              <nav className="space-y-3">
                {quickLinks.map((link) => (
                  link.isAnchor ? (
                    <a 
                      key={link.label}
                      href={link.to}
                      className="text-sm text-white/60 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </a>
                  ) : (
                    <Link 
                      key={link.label}
                      to={link.to} 
                      onClick={link.to === "/" ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
                      className="text-sm text-white/60 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </Link>
                  )
                ))}
              </nav>
            </div>

            {/* Resources */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">Resources</h4>
              <nav className="space-y-3">
                {resourceLinks.map((link) => (
                  link.isAnchor ? (
                    <a 
                      key={link.label}
                      href={link.to}
                      className="text-sm text-white/60 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </a>
                  ) : (
                    <Link 
                      key={link.label}
                      to={link.to}
                      className="text-sm text-white/60 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-secondary transition-colors" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </Link>
                  )
                ))}
              </nav>
            </div>

            {/* Support & Contact */}
            <div className="lg:col-span-4">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">Get in Touch</h4>
              
              <div className="space-y-4 mb-6">
                <a 
                  href="mailto:support@udayantu.com" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-secondary/40 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 border border-secondary/30">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Email us at</span>
                    <span className="text-sm text-white/90 group-hover:text-secondary transition-colors">support@udayantu.com</span>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Chat with us on</span>
                    <span className="text-sm text-white/90 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      WhatsApp Support
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0 border border-sky-500/30">
                    <MapPin className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block">Service Area</span>
                    <span className="text-sm text-white/90">Pan-India Coverage</span>
                  </div>
                </div>
              </div>

              {/* Legal Links */}
              <Separator className="bg-white/10 my-5" />
              <nav className="flex flex-wrap gap-x-4 gap-y-2">
                {legalLinks.map((link) => (
                  <Link 
                    key={link.label}
                    to={link.to} 
                    className="text-xs text-white/50 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t border-b border-white/10 py-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <p className="text-white/60 text-xs md:text-sm">
                © {currentYear} UdaYantu. All rights reserved.
              </p>
              <span className="hidden sm:inline text-white/30">•</span>
              <p className="text-white/60 text-xs md:text-sm flex items-center gap-1">
                Built with <Heart className="w-3 h-3 text-red-500 inline animate-pulse" /> for rural India
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>GST Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>ISO Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";