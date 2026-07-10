import { Menu, LogOut, LayoutDashboard, User, Settings, HelpCircle, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  navLinks: Array<{ label: string; action: () => void; sectionId: string }>;
  isLinkActive: (sectionId: string) => boolean;
}

export const MobileMenu = ({ navLinks, isLinkActive }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isPaid, loading: paymentLoading } = usePaymentStatus();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('student_registrations')
          .select('full_name, email, phone, payment_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    setOpen(false);
    navigate("/");
  };

  const handleDashboardClick = () => {
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
      setOpen(false);
      navigate("/payment");
      return;
    }

    setOpen(false);
    navigate("/dashboard");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[380px] bg-background p-0 overflow-y-auto">
        <nav className="flex flex-col gap-3 p-6">
          {/* User Profile Section - Only shown when logged in */}
          {user && userData && (
            <>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border-2 border-primary/20 mb-2">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-bold text-lg">
                      {getInitials(userData.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-base text-foreground truncate">
                        {userData.full_name}
                      </p>
                      {userData.payment_status === 'paid' && (
                        <Badge className="text-xs px-2 py-0.5">Premium</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{userData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-1" />
            </>
          )}

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                link.action();
                setOpen(false);
              }}
              className={`text-left text-base font-medium transition-all py-3 px-4 rounded-xl ${
                isLinkActive(link.sectionId)
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-foreground hover:text-primary hover:bg-accent/50"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <Separator className="my-2" />
          
          {user ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard");
                }}
                disabled={paymentLoading}
                className="justify-start text-base font-medium py-6 px-4 h-auto w-full rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <LayoutDashboard className="h-5 w-5 mr-3 text-primary" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="justify-start text-base font-medium py-6 px-4 h-auto w-full rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <User className="h-5 w-5 mr-3 text-primary" />
                My Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/settings");
                }}
                className="justify-start text-base font-medium py-6 px-4 h-auto w-full rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <Settings className="h-5 w-5 mr-3 text-primary" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/support");
                }}
                className="justify-start text-base font-medium py-6 px-4 h-auto w-full rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <HelpCircle className="h-5 w-5 mr-3 text-primary" />
                Support
              </Button>
              <Separator className="my-3" />
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="justify-start text-base font-medium py-6 px-4 h-auto hover:bg-destructive/10 text-destructive hover:text-destructive w-full rounded-xl"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/auth");
                  setOpen(false);
                }}
                className="justify-center text-base font-semibold py-6 px-4 h-auto w-full rounded-xl border-2 hover:border-primary/50"
              >
                Sign In
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  navigate("/auth");
                  setOpen(false);
                }}
                className="justify-center text-base font-bold py-6 px-4 h-auto w-full rounded-xl shadow-lg"
              >
                Get Started
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
