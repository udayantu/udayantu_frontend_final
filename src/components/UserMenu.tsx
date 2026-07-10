import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  LayoutDashboard,
  ChevronDown,
  Mail,
  Phone
} from "lucide-react";

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "Come back soon!",
    });
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getPaymentBadge = () => {
    if (!userData) return null;
    
    const isPaid = userData.payment_status === 'paid';
    return (
      <Badge 
        variant={isPaid ? "default" : "secondary"} 
        className="text-xs font-normal"
      >
        {isPaid ? "Premium" : "Free"}
      </Badge>
    );
  };

  if (loading || !userData) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/10">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold text-sm">
              {getInitials(userData.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {userData.full_name?.split(" ")[0] || "User"}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {userData.email}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 z-[100]"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-3 bg-accent/30 rounded-lg mb-2">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-bold">
                {getInitials(userData.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm text-foreground truncate">
                  {userData.full_name}
                </p>
                {getPaymentBadge()}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{userData.email}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{userData.phone}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
        >
          <LayoutDashboard className="h-4 w-4 text-primary" />
          <span className="font-medium">Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
        >
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium">My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
        >
          <Settings className="h-4 w-4 text-primary" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => navigate("/support")}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="font-medium">Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
