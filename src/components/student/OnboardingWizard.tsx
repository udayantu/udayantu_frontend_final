import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { indianStatesDistricts, qualifications, getBlocksForDistrict } from "@/data/indianStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingProgress } from "./OnboardingProgress";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const step1Schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z.object({
  state: z.string().min(1, "Please select your state"),
  district: z.string().min(1, "Please select your district"),
});

const step3Schema = z.object({
  qualification: z.string().min(1, "Please select your qualification"),
  desiredRole: z.string().min(1, "Please select your desired role"),
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to terms"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface OnboardingWizardProps {
  userId: string;
  phoneNumber: string;
  onComplete: () => void;
}

const STEPS = [
  { title: "Welcome! Let's Get Started", description: "Tell us about yourself" },
  { title: "Where Are You From?", description: "Help us personalize your experience" },
  { title: "Your Goals", description: "What do you want to achieve?" },
  { title: "All Set!", description: "Review and complete your profile" },
];

export const OnboardingWizard = ({ userId, phoneNumber, onComplete }: OnboardingWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    state: "",
    district: "",
    qualification: "",
    desiredRole: "",
    agreedToTerms: false,
  });

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { fullName: formData.fullName, email: formData.email },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { state: formData.state, district: formData.district },
  });

  const [selectedState, setSelectedState] = useState(formData.state);
  const [selectedDistrict, setSelectedDistrict] = useState(formData.district);
  const [districts, setDistricts] = useState<string[]>(formData.state ? indianStatesDistricts[formData.state] || [] : []);

  // Step 3 Form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { 
      qualification: formData.qualification, 
      desiredRole: formData.desiredRole,
      agreedToTerms: formData.agreedToTerms 
    },
  });

  const handleStep1Next = async (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleStep2Next = async (data: Step2Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleStep3Next = async (data: Step3Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Check for duplicate email
      const { data: existingEmailUser } = await supabase
        .from("student_registrations")
        .select("user_id")
        .eq("email", formData.email)
        .neq("user_id", userId)
        .maybeSingle();

      if (existingEmailUser) {
        toast({
          title: "Email Already in Use",
          description: "This email address is already associated with another account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("student_registrations")
        .update({
          full_name: formData.fullName,
          email: formData.email,
          qualification: formData.qualification,
          desired_role: formData.desiredRole,
          state: formData.state,
          district: formData.district,
          location: `${formData.district}, ${formData.state}`,
          status: "registered",
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Welcome Aboard! 🎉",
        description: "Your profile is complete. Let's start your journey!",
      });

      setTimeout(onComplete, 1500);
    } catch (error: any) {
      toast({
        title: "Oops! Something Went Wrong",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setDistricts(indianStatesDistricts[state] || []);
    setSelectedDistrict("");
    step2Form.setValue("district", "");
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={currentStep} totalSteps={4} steps={STEPS} />

        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1Next)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...step1Form.register("fullName")}
                    placeholder="Enter your full name"
                    className={step1Form.formState.errors.fullName ? "border-destructive" : ""}
                  />
                  {step1Form.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...step1Form.register("email")}
                    placeholder="your.email@example.com"
                    className={step1Form.formState.errors.email ? "border-destructive" : ""}
                  />
                  {step1Form.formState.errors.email && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-2 border rounded-md bg-muted">
                      <span className="text-sm font-medium">+91</span>
                    </div>
                    <Input value={phoneNumber} disabled className="bg-muted" />
                  </div>
                  <p className="text-xs text-muted-foreground">Verified during registration</p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleStep2Next)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Controller
                    name="state"
                    control={step2Form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleStateChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className={step2Form.formState.errors.state ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Object.keys(indianStatesDistricts).sort().map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {step2Form.formState.errors.state && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Controller
                    name="district"
                    control={step2Form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDistrictChange(value);
                        }}
                        value={field.value}
                        disabled={!selectedState}
                      >
                        <SelectTrigger className={step2Form.formState.errors.district ? "border-destructive" : ""}>
                          <SelectValue placeholder={selectedState ? "Select your district" : "Select state first"} />
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
                  {step2Form.formState.errors.district && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.district.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="w-full">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Education & Goals */}
            {currentStep === 3 && (
              <form onSubmit={step3Form.handleSubmit(handleStep3Next)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification *</Label>
                  <Controller
                    name="qualification"
                    control={step3Form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={step3Form.formState.errors.qualification ? "border-destructive" : ""}>
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
                  {step3Form.formState.errors.qualification && (
                    <p className="text-sm text-destructive">{step3Form.formState.errors.qualification.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredRole">Desired Career Role *</Label>
                  <Controller
                    name="desiredRole"
                    control={step3Form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={step3Form.formState.errors.desiredRole ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select your desired role" />
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
                  {step3Form.formState.errors.desiredRole && (
                    <p className="text-sm text-destructive">{step3Form.formState.errors.desiredRole.message}</p>
                  )}
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Controller
                    name="agreedToTerms"
                    control={step3Form.control}
                    render={({ field }) => (
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={step3Form.formState.errors.agreedToTerms ? "border-destructive" : ""}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the terms and conditions and privacy policy. I understand that my information will be used to provide career development services.
                        </Label>
                      </div>
                    )}
                  />
                  {step3Form.formState.errors.agreedToTerms && (
                    <p className="text-sm text-destructive">{step3Form.formState.errors.agreedToTerms.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="w-full">
                    Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Review & Complete */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle2 className="h-16 w-16 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">Almost There!</h3>
                  <p className="text-muted-foreground">Please review your information before completing</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-primary">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mobile</p>
                        <p className="font-medium">+91 {phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-primary">Location</h4>
                    <div className="text-sm">
                      <p className="font-medium">{formData.district}, {formData.state}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-primary">Career Goals</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Qualification</p>
                        <p className="font-medium">{formData.qualification}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Desired Role</p>
                        <p className="font-medium">{formData.desiredRole}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} className="w-full" disabled={isSubmitting}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleFinalSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
