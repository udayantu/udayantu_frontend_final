import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Building2, Lock, TrendingUp, Users, DollarSign, Shield } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employerRegistrationSchema, type EmployerRegistrationFormData } from "@/lib/validationSchemas";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmployerWaitlistSuccess } from "./EmployerWaitlistSuccess";
import { trackEvent } from "@/lib/analytics";

const roleOptions = [
  "Business Development",
  "Customer Success",
  "Project Management",
  "Operations Management",
  "Product Management",
  "Human Resources",
  "Marketing Management",
  "Customer Support"
];

export const EmployerSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ email: string; companyName: string } | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    reset,
    watch,
    setValue,
    formState: { errors } 
  } = useForm<EmployerRegistrationFormData>({
    resolver: zodResolver(employerRegistrationSchema),
    defaultValues: {
      contactPerson: "",
      orgName: "",
      email: "",
      mobile: "",
      designation: [],
      hiringVolume: undefined as "1-5" | "5-10" | "10+" | undefined
    }
  });

  const selectedRoles = watch("designation") || [];

  const handleRoleToggle = (role: string) => {
    const currentRoles = selectedRoles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setValue("designation", newRoles);
  };

  const onSubmit = async (data: EmployerRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Save to database
      const { error: insertError } = await supabase
        .from("employers")
        .insert({
          contact_name: data.contactPerson,
          company_name: data.orgName,
          email: data.email,
          phone: data.mobile || "",
          designation: data.designation.join(", "),
          roles_needed: data.designation,
          cohort_size_estimate: parseInt(data.hiringVolume.split("-")[0])
        });

      if (insertError) throw insertError;

      // Track conversion event
      trackEvent({
        page: 'employers',
        eventType: 'form_submission',
        email: data.email,
        company: data.orgName,
        metadata: {
          roles: data.designation,
          hiringVolume: data.hiringVolume,
        },
      }).catch(() => {
        // Fail silently
      });

      // Trigger welcome email (non-blocking)
      supabase.functions.invoke("send-employer-welcome", {
        body: {
          name: data.contactPerson,
          email: data.email,
          company: data.orgName
        }
      }).catch((error) => {
        // Log silently - don't fail form submission
        console.log("Email notification pending domain verification");
      });

      // Store submitted data and show success screen
      setSubmittedData({
        email: data.email,
        companyName: data.orgName,
      });
      setShowSuccess(true);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success screen close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSubmittedData(null);
    reset();
  };

  // Show success modal (keep form in background)
  if (showSuccess && submittedData) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative">
        {/* Form shown in background */}
        <div className="container px-4 mx-auto max-w-6xl opacity-40 pointer-events-none">
          <div className="text-center mb-12 space-y-6">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Be the First to Access Pre-Trained Rural Talent
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join Our Employer Waitlist
            </p>
          </div>
        </div>

        {/* Modal overlay */}
        <EmployerWaitlistSuccess
          email={submittedData.email}
          companyName={submittedData.companyName}
          onClose={handleSuccessClose}
        />
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-3">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Join Our Employer Waitlist
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Be the first to access pre-trained, job-ready talent. Fill out the form below and secure your spot.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-primary/30 shadow-lg">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-xl md:text-2xl text-center text-primary">
              Register Your Company
            </CardTitle>
            <CardDescription className="text-center">
              Priority access to trained, job-ready rural talent
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {/* Trust Builders */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Your information is secure and never shared</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  <Shield className="w-3 h-3 mr-1" />
                  100+ students enrolled — first employer slots opening soon
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and Company - Two Column on Desktop */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    {...register("contactPerson")}
                    placeholder="Your full name"
                    className="h-11"
                    data-testid="input-contact-person"
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgName" className="font-semibold">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="orgName"
                    {...register("orgName")}
                    placeholder="Your company name"
                    className="h-11"
                    data-testid="input-org-name"
                  />
                  {errors.orgName && (
                    <p className="text-sm text-destructive">{errors.orgName.message}</p>
                  )}
                </div>
              </div>

              {/* Email and Phone - Two Column on Desktop */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Work Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="name@example.com"
                    className="h-11"
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="font-semibold">
                    Phone <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="mobile"
                    {...register("mobile")}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="h-11"
                    data-testid="input-mobile"
                  />
                  {errors.mobile && (
                    <p className="text-sm text-destructive">{errors.mobile.message}</p>
                  )}
                </div>
              </div>

              {/* Hiring Needs */}
              <div className="space-y-2">
                <Label htmlFor="hiringVolume" className="font-semibold">
                  Hiring Needs <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="hiringVolume"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11" data-testid="select-hiring-volume">
                        <SelectValue placeholder="Select hiring volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 candidates</SelectItem>
                        <SelectItem value="5-10">5-10 candidates</SelectItem>
                        <SelectItem value="10+">10+ candidates</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hiringVolume && (
                  <p className="text-sm text-destructive">{errors.hiringVolume.message}</p>
                )}
              </div>

              {/* Roles - Grid with better spacing */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Roles Needed <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/30">
                  {roleOptions.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                        data-testid={`checkbox-role-${role.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm font-medium leading-tight cursor-pointer"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.designation && (
                  <p className="text-sm text-destructive">{errors.designation.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 font-semibold"
                data-testid="button-submit-employer-waitlist"
              >
                {isSubmitting ? "Joining Waitlist..." : "Join Employer Waitlist"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Value Props Section - Below Form */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="border-primary/20 bg-card/60 hover:border-primary/40 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <TrendingUp className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-2">Job-Ready from Day One</h3>
                  <p className="text-sm text-muted-foreground">
                    Trained, certified graduates ready to contribute immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/60 hover:border-primary/40 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <DollarSign className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-2">70% Savings</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce training time and costs with pre-trained talent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/60 hover:border-primary/40 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Users className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-2">Higher Loyalty</h3>
                  <p className="text-sm text-muted-foreground">
                    Values-driven graduates who stay and grow with your team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
