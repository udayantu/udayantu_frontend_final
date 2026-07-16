import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { indianStatesDistricts, qualifications, getBlocksForDistrict } from "@/data/indianStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, User } from "lucide-react";

// Profile schema without mobile (mobile can't be changed)
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  qualification: z.string().min(1, "Please select your qualification"),
  desiredRole: z.string().min(1, "Please select your desired role"),
  state: z.string().min(1, "Please select your state"),
  district: z.string().min(1, "Please select your district"),
  block: z.string().min(1, "Please select your block"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  userId: string;
}

export const ProfileEditor = ({ userId }: ProfileEditorProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [blocks, setBlocks] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('student_registrations')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data) {
          // Set form values
          setValue('fullName', data.full_name || '');
          setValue('email', data.email || '');
          setValue('qualification', data.qualification || '');
          setValue('desiredRole', data.desired_role || '');
          setValue('state', data.state || '');
          setValue('district', data.district || '');
          
          // Extract block from location string
          const locationParts = data.location?.split(', ') || [];
          setValue('block', locationParts[0] || '');

          // Set phone number (read-only)
          setPhoneNumber(data.phone || '');

          // Set state/district/blocks
          if (data.state) {
            setSelectedState(data.state);
            setDistricts(indianStatesDistricts[data.state] || []);
          }
          
          if (data.district) {
            setSelectedDistrict(data.district);
            setBlocks(getBlocksForDistrict(data.district));
          }
        }
      } catch (error: any) {
        toast({
          title: "Error Loading Profile",
          description: error.message || "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId, setValue, toast]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setDistricts(indianStatesDistricts[state] || []);
    setSelectedDistrict("");
    setBlocks([]);
    setValue('district', '');
    setValue('block', '');
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setBlocks(getBlocksForDistrict(district));
    setValue('block', '');
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Check for duplicate email
      const { data: existingEmailUser } = await supabase
        .from('student_registrations')
        .select('user_id')
        .eq('email', data.email)
        .neq('user_id', userId)
        .maybeSingle();

      if (existingEmailUser) {
        toast({
          title: "Email Already in Use",
          description: "This email address is already associated with another account.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('student_registrations')
        .update({
          full_name: data.fullName,
          email: data.email,
          qualification: data.qualification,
          desired_role: data.desiredRole,
          state: data.state,
          district: data.district,
          location: `${data.block}, ${data.district}, ${data.state}`,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const states = Object.keys(indianStatesDistricts).sort();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your profile information. Note: Mobile number cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mobile Number - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-2 border rounded-md bg-muted">
                <span className="text-sm font-medium">+91</span>
              </div>
              <Input
                id="mobile"
                value={phoneNumber}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mobile number cannot be changed for security reasons
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Enter your full name"
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email address"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Qualification */}
          <div className="space-y-2">
            <Label htmlFor="qualification">Your Qualification *</Label>
            <Controller
              name="qualification"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.qualification ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualifications.map((qual) => (
                      <SelectItem key={qual} value={qual}>
                        {qual}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.qualification && (
              <p className="text-sm text-destructive">{errors.qualification.message}</p>
            )}
          </div>

          {/* Desired Role */}
          <div className="space-y-2">
            <Label htmlFor="desiredRole">Select Desired Role *</Label>
            <Controller
              name="desiredRole"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.desiredRole ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business Development">Business Development</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                    <SelectItem value="Project Management">Project Management</SelectItem>
                    <SelectItem value="Operations Management">Operations Management</SelectItem>
                    <SelectItem value="Product Management">Product Management</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Marketing Management">Marketing Management</SelectItem>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.desiredRole && (
              <p className="text-sm text-destructive">{errors.desiredRole.message}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">Select State *</Label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleStateChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="district">Select District *</Label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleDistrictChange(value);
                  }}
                  value={field.value}
                  disabled={!selectedState}
                >
                  <SelectTrigger className={errors.district ? "border-destructive" : ""}>
                    <SelectValue
                      placeholder={
                        selectedState ? "Select your district" : "Please select state first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.district && (
              <p className="text-sm text-destructive">{errors.district.message}</p>
            )}
          </div>

          {/* Block */}
          <div className="space-y-2">
            <Label htmlFor="block">Select Block/Area *</Label>
            <Controller
              name="block"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger className={errors.block ? "border-destructive" : ""}>
                    <SelectValue
                      placeholder={
                        selectedDistrict ? "Select your block/area" : "Please select district first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {blocks.map((block) => (
                      <SelectItem key={block} value={block}>
                        {block}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.block && (
              <p className="text-sm text-destructive">{errors.block.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
