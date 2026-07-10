import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Terms = () => {
  return (
    <>
      <SEOHead 
        title="Terms of Service - UdaYantu Career Training"
        description="Terms of Service for UdaYantu Career Training & Job Placement. Read our program enrollment, payment terms, placement guarantee, and student responsibilities."
        keywords="terms of service, training program terms, placement guarantee terms, enrollment policy"
        canonicalUrl={`${window.location.origin}/terms`}
        noIndex={false}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
              <p className="text-xl text-muted-foreground">
                Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using UdaYantu's services, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Program Enrollment</h2>
                <p>
                  Enrollment in our training programs is subject to eligibility criteria and availability. We reserve the right to refuse admission to any applicant.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Payment Terms</h2>
                <p>
                  Payment terms vary by program. Some programs offer pay-after-placement options. All fees must be paid as per the agreed schedule.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Placement Guarantee</h2>
                <p>
                  Our 100% placement guarantee is subject to the student completing all required coursework, assessments, and maintaining minimum attendance requirements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Refund Policy</h2>
                <p>
                  Please refer to our separate <a href="/refund" className="text-primary hover:underline">Refund Policy</a> for detailed information about refunds and cancellations.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Student Responsibilities</h2>
                <p>
                  Students are expected to maintain professional conduct, complete assignments on time, and actively participate in all training activities.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Intellectual Property</h2>
                <p>
                  All course materials, including videos, documents, and assessments, are proprietary to UdaYantu and may not be shared or distributed without permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Contact Us</h2>
                <p>
                  For questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:support@udayantu.com" className="text-primary hover:underline">
                    support@udayantu.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </section>

        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default Terms;
