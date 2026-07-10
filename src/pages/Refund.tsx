import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Refund = () => {
  return (
    <>
      <SEOHead 
        title="Refund Policy - 100% Money-Back Guarantee | UdaYantu"
        description="UdaYantu's 100% placement guarantee refund policy. Get placed or get your admission fee back. Learn about our fair, transparent refund process and eligibility criteria."
        keywords="refund policy, money-back guarantee, placement guarantee, admission fee refund, fair refund terms"
        canonicalUrl={`${window.location.origin}/refund`}
        noIndex={false}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Refund Policy</h1>
            
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
              <p className="text-xl text-muted-foreground">
                Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="bg-secondary/10 border-l-4 border-secondary p-6 rounded-r-lg">
                <p className="font-semibold text-lg">
                  100% Placement Guarantee: Get placed or get your admission fee back!
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Placement Guarantee Refund</h2>
                <p>
                  If you complete all program requirements and we are unable to place you within 90 days of program completion, you are eligible for a full refund of your admission fee.
                </p>
                <p className="font-semibold">
                  Eligibility criteria:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Completion of all coursework and assessments with passing grades</li>
                  <li>Minimum 90% attendance in all training sessions</li>
                  <li>Active participation in placement activities</li>
                  <li>Professional conduct throughout the program</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Early Withdrawal Refund</h2>
                <p>
                  If you withdraw from the program before completion:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Within 7 days of enrollment:</strong> 100% refund (minus processing fees)</li>
                  <li><strong>Within 14 days of enrollment:</strong> 75% refund</li>
                  <li><strong>Within 30 days of enrollment:</strong> 50% refund</li>
                  <li><strong>After 30 days:</strong> No refund available</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Pay-After-Placement Programs</h2>
                <p>
                  For programs with deferred payment options, no upfront fees are required. Payment terms are triggered only upon successful placement.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Non-Refundable Items</h2>
                <p>
                  The following are non-refundable:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Registration/Application fees</li>
                  <li>Assessment fees</li>
                  <li>Certificate issuance fees</li>
                  <li>Payment processing fees</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Refund Process</h2>
                <p>
                  To request a refund:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Submit a refund request via email to <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></li>
                  <li>Provide your enrollment details and reason for refund</li>
                  <li>Allow 7-14 business days for processing</li>
                  <li>Refunds will be processed to the original payment method</li>
                </ol>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Program Cancellation by UdaYantu</h2>
                <p>
                  If we cancel a program for any reason, you will receive a full refund of all fees paid, including registration fees.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
                <p>
                  For questions about our refund policy or to request a refund, please contact us at{" "}
                  <a href="mailto:support@udayantu.com" className="text-primary hover:underline">
                    support@udayantu.com
                  </a>{" "}
                  or call our support line.
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

export default Refund;
