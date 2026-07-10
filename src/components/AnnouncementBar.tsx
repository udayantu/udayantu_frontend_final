import { useState, useEffect } from "react";
import { X, Trophy, Clock, Sparkles, Users, Award, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

type UserBehavior = "first-visit" | "returning" | "enrolled";

interface AnnouncementContent {
  icon: any;
  messages: Array<{
    text: string;
    highlight?: string;
  }>;
  badge?: string;
  ctaText: string;
  ctaAction: () => void;
}

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>("first-visit");
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const dismissedUntil = localStorage.getItem("announcement-dismissed-until");
    const visitCount = parseInt(localStorage.getItem("visit-count") || "0");
    const lastVisit = localStorage.getItem("last-visit");
    
    // Check if announcement was dismissed and still within dismissal period
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setIsVisible(false);
        return;
      }
    }

    // Track visits
    const newVisitCount = visitCount + 1;
    localStorage.setItem("visit-count", newVisitCount.toString());
    localStorage.setItem("last-visit", new Date().toISOString());

    // Determine user behavior
    if (user) {
      setUserBehavior("enrolled");
    } else if (visitCount === 0) {
      setUserBehavior("first-visit");
    } else {
      setUserBehavior("returning");
    }

    setIsVisible(true);
  }, [user, loading]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 7 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem("announcement-dismissed-until", dismissUntil.toISOString());
  };

  // Define content based on user behavior
  const getAnnouncementContent = (): AnnouncementContent => {
    switch (userBehavior) {
      case "first-visit":
        return {
          icon: Sparkles,
          messages: [
            { text: "Welcome! ", highlight: "98% Placement Success Rate" },
            { text: "Join ", highlight: "5,000+ Students" },
            { text: "Transform Your Career in ", highlight: "6-12 Months" },
          ],
          badge: "₹5,321 Special Offer",
          ctaText: "Explore Programs",
          ctaAction: () => {
            const element = document.getElementById("roles");
            element?.scrollIntoView({ behavior: "smooth" });
          },
        };

      case "returning":
        return {
          icon: TrendingUp,
          messages: [
            { text: "Welcome Back! ", highlight: "Limited Seats Available" },
            { text: "Deadline: ", highlight: "Dec 31, 2025" },
            { text: "Don't Miss ", highlight: "₹5,321 Offer" },
          ],
          badge: "Still Deciding?",
          ctaText: "See Success Stories",
          ctaAction: () => {
            const element = document.getElementById("placements");
            element?.scrollIntoView({ behavior: "smooth" });
          },
        };

      case "enrolled":
        return {
          icon: Award,
          messages: [
            { text: "Welcome to ", highlight: "Udayantu Community" },
            { text: "Your Learning Journey ", highlight: "Starts Here" },
            { text: "Access Your ", highlight: "Dashboard Now" },
          ],
          ctaText: "Go to Dashboard",
          ctaAction: () => {
            window.location.href = "/student-dashboard";
          },
        };

      default:
        return {
          icon: Sparkles,
          messages: [
            { text: "98% Placement Rate" },
            { text: "Limited Seats: Enroll by ", highlight: "Dec 31, 2025" },
          ],
          badge: "₹5,321 Special Offer",
          ctaText: "View Programs",
          ctaAction: () => {
            const element = document.getElementById("roles");
            element?.scrollIntoView({ behavior: "smooth" });
          },
        };
    }
  };

  if (!isVisible || loading) return null;

  const content = getAnnouncementContent();
  const IconComponent = content.icon;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground shadow-lg animate-in slide-in-from-top duration-500">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-2.5 md:py-3 gap-3">
          {/* Content */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 flex-shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            
            {/* Personalized Messages */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs md:text-sm overflow-hidden">
              {content.messages.map((message, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="hidden sm:inline text-primary-foreground/60">•</span>
                  )}
                  <span className="font-medium">
                    {message.text}
                    {message.highlight && (
                      <span className="font-bold">{message.highlight}</span>
                    )}
                  </span>
                </div>
              ))}
              {content.badge && (
                <>
                  <span className="hidden md:inline text-primary-foreground/60">•</span>
                  <span className="hidden md:inline font-semibold bg-primary-foreground/20 px-3 py-1 rounded-full">
                    {content.badge}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA Button - Hidden on smallest screens */}
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-md flex-shrink-0"
            onClick={content.ctaAction}
          >
            {content.ctaText}
          </Button>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
