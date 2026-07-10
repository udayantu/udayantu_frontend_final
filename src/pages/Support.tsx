import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  MapPin,
  Send,
  HelpCircle
} from "lucide-react";

export default function Support() {
  const whatsappNumber = "+919980814445";
  const supportEmail = "support@udayantu.com";
  const phoneNumber = "+91 9980814445";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">We're Here to Help</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? Our support team is ready to help you succeed.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle>WhatsApp Support</CardTitle>
                <CardDescription>Get instant help via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/\s+/g, '')}?text=Hi, I need help with my UdaYantu account`, '_blank')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat on WhatsApp
                </Button>
                <p className="text-sm text-muted-foreground mt-3">{whatsappNumber}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Call us for immediate assistance</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
                <p className="text-sm text-muted-foreground mt-3">{phoneNumber}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.location.href = `mailto:${supportEmail}?subject=Support Request from UdaYantu Portal`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <p className="text-sm text-muted-foreground mt-3">{supportEmail}</p>
              </CardContent>
            </Card>
          </div>

          {/* Support Hours & Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-accent/30">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-muted-foreground">9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent/30">
                  <span className="font-medium">Saturday</span>
                  <span className="text-muted-foreground">10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-accent/30">
                  * Response time: Within 24 hours on business days
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-2">UdaYantu Headquarters</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Bengaluru, Karnataka<br />
                  India
                </p>
                <div className="mt-6 pt-6 border-t border-accent/30">
                  <p className="text-sm text-muted-foreground mb-3">
                    We serve students across India, helping them build careers and achieve their professional goals.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="border-2 border-primary/10">
            <CardHeader className="text-center bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-semibold mb-2">How do I reset my password?</h4>
                <p className="text-sm text-muted-foreground">
                  Go to Settings and use the "Change Password" option. You'll receive an OTP via email to verify the change.
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-semibold mb-2">How can I verify my email?</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to Settings and click on "Verify Email". We'll send you a 6-digit OTP to complete the verification.
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major payment methods through Razorpay including UPI, Credit/Debit Cards, Net Banking, and Wallets.
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-semibold mb-2">Is there a refund policy?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer 100% refund if you're not selected for a job after completing your assessment. See our refund policy for details.
                </p>
              </div>
              <div className="text-center mt-6 pt-6 border-t border-accent/30">
                <p className="text-sm text-muted-foreground mb-4">Still have questions?</p>
                <Button 
                  onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/\s+/g, '')}?text=Hi, I have a question about UdaYantu`, '_blank')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
