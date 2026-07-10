import { ContactUsForm } from "@/components/ContactUsForm";
import { Mail, MessageSquare, Clock } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20">
      {/* Background orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container px-4 mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">Contact Us</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Have a question or feedback? We'd love to hear from you. Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-card/60 to-card/40 hover:border-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Quick Response</h3>
            <p className="text-sm text-muted-foreground">We respond to all inquiries within 24 hours during business days.</p>
          </div>

          <div className="p-6 rounded-xl border border-secondary/20 bg-gradient-to-br from-card/60 to-card/40 hover:border-secondary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Always Available</h3>
            <p className="text-sm text-muted-foreground">Submit your inquiry anytime. We're available across all time zones.</p>
          </div>

          <div className="p-6 rounded-xl border border-accent/20 bg-gradient-to-br from-card/60 to-card/40 hover:border-accent/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">Your information is encrypted and only used to respond to your inquiry.</p>
          </div>
        </div>

        {/* Form */}
        <div className="mb-16">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
}
