import { lazy, Suspense, memo } from "react";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AnnouncementBar } from "@/components/AnnouncementBar";

// Lazy load below-the-fold sections for faster initial render
const StatsSection = lazy(() => import("@/components/StatsSection").then(m => ({ default: m.StatsSection })));
const StudentTrustBanner = lazy(() => import("@/components/StudentTrustBanner").then(m => ({ default: m.StudentTrustBanner })));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const WhySection = lazy(() => import("@/components/WhySection").then(m => ({ default: m.WhySection })));
const RolesSection = lazy(() => import("@/components/RolesSection").then(m => ({ default: m.RolesSection })));
const PlacementSection = lazy(() => import("@/components/PlacementSection").then(m => ({ default: m.PlacementSection })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const RegistrationSection = lazy(() => import("@/components/RegistrationSection").then(m => ({ default: m.RegistrationSection })));
const FAQSection = lazy(() => import("@/components/FAQSection").then(m => ({ default: m.FAQSection })));
const BlogPreviewSection = lazy(() => import("@/components/blog/BlogPreviewSection").then(m => ({ default: m.BlogPreviewSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

// Lightweight section placeholder for smooth loading
const SectionLoader = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionLoader.displayName = "SectionLoader";

const Index = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen">
      {/* Critical above-the-fold content - loaded immediately */}
      <AnnouncementBar />
      <Navbar />
      <Hero />
      
      {/* Below-the-fold content - lazy loaded for faster initial render */}
      <Suspense fallback={<SectionLoader />}>
        <StudentTrustBanner onScrollToTestimonials={() => scrollToSection('testimonials')} />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <StatsSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <HowItWorksSection />
      </Suspense>
      
      <div id="why">
        <Suspense fallback={<SectionLoader />}>
          <WhySection />
        </Suspense>
      </div>
      
      <div id="roles">
        <Suspense fallback={<SectionLoader />}>
          <RolesSection />
        </Suspense>
      </div>
      
      <div id="placements">
        <Suspense fallback={<SectionLoader />}>
          <PlacementSection />
        </Suspense>
      </div>
      
      <div id="testimonials">
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
      </div>
      
      <div id="register">
        <Suspense fallback={<SectionLoader />}>
          <RegistrationSection />
        </Suspense>
      </div>
      
      <Suspense fallback={<SectionLoader />}>
        <BlogPreviewSection />
      </Suspense>
      
      <div id="faq">
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
      </div>
      
      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
      
      <WhatsAppButton />
    </main>
  );
};

export default Index;
