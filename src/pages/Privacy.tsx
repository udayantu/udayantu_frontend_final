import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Privacy = () => {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - UdaYantu Career Training"
        description="Privacy Policy for UdaYantu Career Training & Job Placement. Learn how we collect, use, and protect your personal information and data."
        keywords="privacy policy, data protection, information security, GDPR compliance"
        canonicalUrl={`${window.location.origin}/privacy`}
        noIndex={false}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
              <p className="text-xl text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
                <p>
                  We collect personal information that you provide to us such as name, email address, phone number, educational background, and payment information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain our training services</li>
                  <li>Process payments and send transactional communications</li>
                  <li>Personalize your learning experience</li>
                  <li>Communicate with you about courses, placements, and updates</li>
                  <li>Improve our services and develop new features</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
                <p>
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Potential employers for placement purposes (with your consent)</li>
                  <li>Service providers who assist in our operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve user experience.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
                <p>
                  For questions about this Privacy Policy or to exercise your rights, please contact us at{" "}
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

export default Privacy;
