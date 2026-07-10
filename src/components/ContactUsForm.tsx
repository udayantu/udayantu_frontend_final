import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ContactSuccessModal } from "./ContactSuccessModal";
import { Mail, Phone, User, MapPin, MessageSquare, Users } from "lucide-react";
import { submitContact } from "@/lib/contact-storage";

interface ContactFormData {
  fullName: string;
  mobileNumber: string;
  email: string;
  role: "student" | "employer" | "instructor" | "others";
  city: string;
  note: string;
}

export function ContactUsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    role: "student",
    city: "",
    note: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as ContactFormData["role"],
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return false;
    }
    if (!formData.mobileNumber.trim() || !/^[0-9]{10}$/.test(formData.mobileNumber)) {
      toast({ title: "Error", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return false;
    }
    if (formData.note && formData.note.length > 500) {
      toast({ title: "Error", description: "Note must be 500 characters or less", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await submitContact({
        full_name: formData.fullName,
        mobile_number: formData.mobileNumber,
        email: formData.email,
        role: formData.role,
        city: formData.city || null,
        note: formData.note || null,
      });

      if (!result) {
        throw new Error("Failed to submit form. Please try again.");
      }

      setShowSuccess(true);
      setFormData({
        fullName: "",
        mobileNumber: "",
        email: "",
        role: "student",
        city: "",
        note: "",
      });

      toast({
        title: "Success",
        description: "Thank you! Your message has been received. We'll get back to you soon!",
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <ContactSuccessModal
        fullName={formData.fullName}
        email={formData.email}
        role={formData.role}
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border border-primary/20 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl shadow-xl">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-muted-foreground">We'd love to hear from you. Send us your inquiry and we'll respond within 24 hours.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact-us">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="border-primary/20 focus-visible:ring-primary"
                data-testid="input-full-name"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Mobile Number
              </label>
              <Input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="border-primary/20 focus-visible:ring-primary"
                data-testid="input-mobile-number"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="border-primary/20 focus-visible:ring-primary"
                data-testid="input-email"
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                I am
              </label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-primary/20 focus-visible:ring-primary" data-testid="select-role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                City <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className="border-primary/20 focus-visible:ring-primary"
                data-testid="input-city"
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Message <span className="text-xs text-muted-foreground font-normal">({formData.note.length}/500 characters)</span>
              </label>
              <Textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Tell us more about your inquiry..."
                maxLength={500}
                className="border-primary/20 focus-visible:ring-primary min-h-32 resize-none"
                data-testid="textarea-note"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-submit-contact"
            >
              {loading ? "Submitting..." : "Send Message"}
            </Button>
          </form>

          {/* Info message */}
          <div className="p-4 rounded-lg bg-muted/20 border border-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. Your information will only be used to respond to your inquiry.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
