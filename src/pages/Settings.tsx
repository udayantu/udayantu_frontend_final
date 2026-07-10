import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Target,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { indianStatesData } from "@/data/indianStates";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const settingsSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  qualification: z.string().optional(),
  desired_role: z.string().min(1, "Please select a desired role"),
  state: z.string().optional(),
  district: z.string().optional(),
  location: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(true); // Simplified for now

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access settings",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('student_registrations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserData(data);
        setPhone(data.phone || "");
        setEmailVerified(true); // Simplified for now

        // Populate form
        setValue("full_name", data.full_name || "");
        setValue("email", data.email || "");
        setValue("qualification", data.qualification || "");
        setValue("desired_role", data.desired_role || "");
        setValue("state", data.state || "");
        setValue("district", data.district || "");
        setValue("location", data.location || "");

        // Set location dropdowns
        if (data.state) {
          setSelectedState(data.state);
          const stateData = indianStatesData.find(s => s.state === data.state);
          if (stateData) {
            setDistricts(stateData.districts.map(d => d.name));
            if (data.district) {
              setSelectedDistrict(data.district);
              const districtData = stateData.districts.find(d => d.name === data.district);
              if (districtData) {
                setBlocks(districtData.blocks);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast, setValue]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setValue("state", state);
    setValue("district", "");
    setValue("location", "");
    setSelectedDistrict("");
    setBlocks([]);

    const stateData = indianStatesData.find(s => s.state === state);
    if (stateData) {
      setDistricts(stateData.districts.map(d => d.name));
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setValue("district", district);
    setValue("location", "");

    const stateData = indianStatesData.find(s => s.state === selectedState);
    if (stateData) {
      const districtData = stateData.districts.find(d => d.name === district);
      if (districtData) {
        setBlocks(districtData.blocks);
      }
    }
  };

  // Email verification removed for simplicity - can be added back later

  const onSubmit = async (formData: SettingsFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('student_registrations')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          qualification: formData.qualification,
          desired_role: formData.desired_role,
          state: formData.state,
          district: formData.district,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-accent/20 rounded w-1/4"></div>
              <div className="h-96 bg-accent/20 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Email verification section removed for simplicity */}

          {/* Settings Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      {...register("full_name")}
                      placeholder="Enter your full name"
                      className="mt-1.5"
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                      {emailVerified && (
                        <Badge variant="default" className="text-xs">Verified</Badge>
                      )}
                    </Label>
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1.5"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone (Read-only)
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      disabled
                      className="mt-1.5 bg-accent/30"
                    />
                  </div>
                </div>

                <Separator />

                {/* Education */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Education
                  </h3>
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      {...register("qualification")}
                      placeholder="e.g., B.Tech, B.Com, 12th Pass"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="desired_role" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Desired Role
                    </Label>
                    <Controller
                      name="desired_role"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select desired role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                            <SelectItem value="Telecaller">Telecaller</SelectItem>
                            <SelectItem value="Customer Support">Customer Support</SelectItem>
                            <SelectItem value="Data Entry Operator">Data Entry Operator</SelectItem>
                            <SelectItem value="Office Assistant">Office Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.desired_role && (
                      <p className="text-sm text-destructive mt-1">{errors.desired_role.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </h3>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={handleStateChange} value={field.value}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStatesData.map((state) => (
                              <SelectItem key={state.state} value={state.state}>
                                {state.state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {districts.length > 0 && (
                    <div>
                      <Label htmlFor="district">District</Label>
                      <Controller
                        name="district"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={handleDistrictChange} value={field.value}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {districts.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}

                  {blocks.length > 0 && (
                    <div>
                      <Label htmlFor="location">Block</Label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select block" />
                            </SelectTrigger>
                            <SelectContent>
                              {blocks.map((block) => (
                                <SelectItem key={block} value={block}>
                                  {block}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}
