import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";
import { Link } from "react-router-dom";

interface EmployerWaitlistSuccessProps {
  email: string;
  companyName: string;
  onClose: () => void;
}

export function EmployerWaitlistSuccess({
  email,
  companyName,
  onClose,
}: EmployerWaitlistSuccessProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isClosing, setIsClosing] = useState(false);

  // Auto-close timer
  useEffect(() => {
    setMounted(true);
    
    if (timeLeft <= 0) {
      handleAutoClose();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleAutoClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleManualClose = () => {
    handleAutoClose();
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (timeLeft / 30) * circumference;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleManualClose}
      />

      {/* Modal card container */}
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Success Card */}
        <Card className="w-full max-w-2xl border border-primary/20 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header with close button */}
          <div className="relative p-8 pb-6 border-b border-primary/10">
            {/* Close button */}
            <button
              onClick={handleManualClose}
              className="absolute top-6 right-6 p-2 rounded-lg hover:bg-muted/60 transition-all duration-200 group"
              data-testid="button-close-success-modal"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            {/* Animated success icon */}
            <div className={`flex justify-center mb-6 transition-all duration-1000 ${mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1 className={`text-4xl md:text-5xl font-bold text-center text-foreground transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              You're In
            </h1>
            <p className={`text-center text-muted-foreground mt-2 transition-all duration-1000 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              {companyName} is now part of the network
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Confirmation box */}
            <div className={`space-y-4 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/0 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Company</p>
                <p className="text-lg font-bold text-foreground">{companyName}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/5 to-secondary/0 border border-secondary/20">
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Confirmation Email</p>
                <p className="text-lg font-bold text-primary break-all">{email}</p>
              </div>
            </div>

            {/* Status message */}
            <div className={`p-4 rounded-xl bg-gradient-to-r from-accent/5 to-accent/0 border border-accent/20 transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}>
              <p className="text-sm text-foreground">
                <span className="font-semibold">What's next:</span> Our team will verify your information within 24-48 hours and send portal access details to your email.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <Button
                size="lg"
                className="flex-1 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
                data-testid="button-explore-platform-modal"
              >
                <Link to="/">Explore Platform</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-11 border-primary/30 hover:border-primary/50 transition-all duration-300"
                onClick={handleManualClose}
                data-testid="button-close-modal"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Footer with timer */}
          <div className="px-8 py-6 bg-gradient-to-r from-muted/30 to-muted/10 border-t border-primary/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              This will auto-close in <span className="font-semibold text-foreground">{timeLeft}s</span>
            </p>

            {/* Circular countdown timer */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              {/* Timer text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{timeLeft}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
