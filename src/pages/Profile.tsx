import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  CreditCard,
  Target,
  Award,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentData {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  state?: string;
  district?: string;
  location?: string;
  qualification?: string;
  desired_role?: string;
  role_recommendation?: string;
  final_role?: string;
  payment_status?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('student_registrations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load profile";
        console.error(message);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-accent/20 rounded w-1/4"></div>
              <div className="h-64 bg-accent/20 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!userData) {
    return null;
  }

  const isPaid = userData.payment_status === 'paid';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header with Back Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">View your complete account details</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Premium Profile Card */}
          <Card className="mb-8 border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent">
              <div className="flex items-start gap-8">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-4xl">
                    {getInitials(userData.full_name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-3xl">{userData.full_name}</CardTitle>
                    <Badge variant={isPaid ? "default" : "secondary"} className="text-sm px-3 py-1">
                      {isPaid ? "✓ Premium Member" : "Free Member"}
                    </Badge>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">
                    Member since {formatDate(userData.created_at || '')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  Contact Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <p className="text-xs text-muted-foreground font-semibold">Email</p>
                    <p className="font-semibold text-foreground mt-1">{userData.email}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                    <p className="text-xs text-muted-foreground font-semibold">Phone</p>
                    <p className="font-semibold text-foreground mt-1">{userData.phone}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-purple-500" />
                  </div>
                  Location
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {userData.state && (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <p className="text-xs text-muted-foreground font-semibold">State</p>
                      <p className="font-semibold text-foreground mt-1">{userData.state}</p>
                    </div>
                  )}
                  {userData.district && (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <p className="text-xs text-muted-foreground font-semibold">District</p>
                      <p className="font-semibold text-foreground mt-1">{userData.district}</p>
                    </div>
                  )}
                  {userData.location && (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <p className="text-xs text-muted-foreground font-semibold">Location</p>
                      <p className="font-semibold text-foreground mt-1">{userData.location}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Education & Career */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-amber-500" />
                  </div>
                  Education & Career Goals
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {userData.qualification && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <p className="text-xs text-muted-foreground font-semibold">Qualification</p>
                      <p className="font-semibold text-foreground mt-1">{userData.qualification}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs text-muted-foreground font-semibold">Desired Role</p>
                    <p className="font-semibold text-foreground mt-1">{userData.desired_role}</p>
                  </div>
                  {userData.role_recommendation && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 col-span-full sm:col-span-1">
                      <p className="text-xs text-muted-foreground font-semibold">Recommended Role</p>
                      <p className="font-semibold text-primary mt-1">{userData.role_recommendation}</p>
                    </div>
                  )}
                  {userData.final_role && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <p className="text-xs text-muted-foreground font-semibold">Assigned Role</p>
                      <p className="font-semibold text-green-600 dark:text-green-400 mt-1">{userData.final_role}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                  </div>
                  Account Status
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs text-muted-foreground font-semibold">Payment Status</p>
                    <Badge variant={isPaid ? "default" : "secondary"} className="mt-2">
                      {isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs text-muted-foreground font-semibold">Account Status</p>
                    <Badge variant="outline" className="mt-2">
                      {userData.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
