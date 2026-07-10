import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, CheckCircle, Lock } from "lucide-react";
import { useAdminRBAC } from "@/hooks/useAdminRBAC";
import { useToast } from "@/hooks/use-toast";

const setupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
});

type SetupFormData = z.infer<typeof setupSchema>;

interface MainAdminSetupProps {
  onComplete?: () => void;
}

export function MainAdminSetup({ onComplete }: MainAdminSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setupMainAdmin, isMainAdminSetup } = useAdminRBAC();
  const { toast } = useToast();

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
    },
  });

  if (isMainAdminSetup()) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2">Main Admin Configured</h3>
          <p className="text-muted-foreground">
            The Main Admin account has already been set up. Please log in to
            continue.
          </p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true);
    try {
      const result = await setupMainAdmin(
        data.email,
        data.fullName,
        data.phone || undefined
      );

      if (result.success) {
        toast({
          title: "Main Admin Created",
          description: "You are now the Main Admin. Welcome to UdaYantu!",
        });
        onComplete?.();
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || "Failed to create Main Admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Initialize Main Admin</CardTitle>
          <p className="text-muted-foreground mt-2">
            Set up the first administrator account for UdaYantu
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        data-testid="input-setup-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@udayantu.com"
                        data-testid="input-setup-email"
                      />
                    </FormControl>
                    <FormDescription>
                      This will be your primary login credential
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+91 98765 43210"
                        data-testid="input-setup-phone"
                      />
                    </FormControl>
                    <FormDescription>
                      For WhatsApp OTP fallback
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-setup-admin"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Initialize Main Admin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                As Main Admin, you'll have full access to all features including
                user provisioning, role management, and audit logs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
