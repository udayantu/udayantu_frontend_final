import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Terms = () => {
  return (
    <>
      <SEOHead 
        title="Terms & Conditions - UdaYantu Enterprise"
        description="Official Terms and Conditions governing the use of UdaYantu TalenTech platform, services, program enrollment, payments, and placement facilitation."
        keywords="terms and conditions, enrollment policy, payment terms, placement guarantee, student code of conduct, UdaYantu legal"
        canonicalUrl={`${window.location.origin}/terms`}
        noIndex={false}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms & Conditions</h1>
            
            <div className="prose prose-lg max-w-none space-y-8 text-foreground/90 font-sans">
              <p className="text-xl text-muted-foreground">
                Effective Date: October 13, 2025
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-sm space-y-1.5">
                <p><strong>Company:</strong> UdaYantu TalenTech Pvt. Ltd ("UdaYantu", "we", "us" or "our")</p>
                <p><strong>Support Email:</strong> <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                <p>
                  These Terms and Conditions ("Terms") govern your use of the UdaYantu online platform, website, mobile applications and related services (collectively, the "Platform") provided by UdaYantu Enterprise, a company incorporated in India with its registered office in Lucknow, Uttar Pradesh ("UdaYantu"). These Terms constitute a legally binding agreement between you (an individual or entity using the Platform, "you" or "User") and UdaYantu. By accessing, registering, subscribing, enrolling or otherwise using the Platform or services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Account:</strong> Your registered account on the Platform.
                  </li>
                  <li>
                    <strong>Student:</strong> An individual who registers on the Platform to receive training services.
                  </li>
                  <li>
                    <strong>Employer:</strong> A startup, enterprise, corporate, bank, NGO or other organisation that engages with UdaYantu for hiring talent or other services.
                  </li>
                  <li>
                    <strong>Services:</strong> The training, placement, assessment, post-placement support and related services offered via the Platform.
                  </li>
                  <li>
                    <strong>Fees:</strong> Any payments payable by Students or Employers for Services, including registration fees, training, skills development & placement fees and other charges.
                  </li>
                  <li>
                    <strong>GST:</strong> Goods and Services Tax under Indian law.
                  </li>
                  <li>
                    <strong>Confidential Information:</strong> Non-public information disclosed by a party that is designated confidential or that reasonably should be understood to be confidential.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Eligibility</h2>
                <p>
                  You represent and warrant that: (a) you are at least 18 years old and have the legal capacity to enter into these Terms; (b) if you are under 18, you may use the Platform only with the involvement and consent of a parent or legal guardian; (c) you will provide true, accurate and complete information when registering; and (d) you will keep your account credentials secure. UdaYantu may require KYC verification for certain services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Account Registration and Access</h2>
                <p>
                  To access certain Services you must create an Account. You agree to: (a) provide current, complete and accurate information during registration; (b) maintain and promptly update your Account information; (c) keep your password and Account secure; and (d) accept responsibility for all activities that occur under your Account. UdaYantu reserves the right to suspend or terminate Accounts that violate these Terms or if fraudulent activity is suspected.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Services and Deliverables</h2>
                <p>
                  UdaYantu provides training programs, assessments, placement facilitation, company-specific onboarding, and post-placement mentoring (the "Services"). The scope, duration and deliverables for a particular program will be set out in the relevant program materials, enrollment pages, or a separate agreement. UdaYantu does not guarantee employment outcomes except where explicitly agreed in a separate written contract signed by authorized representatives.
                </p>
                <p>
                  Students will be provided access to course materials, live sessions (where applicable), assignments, assessment tools, and mentor support as described in program documentation. Employers may access candidate shortlists, hire candidates, and request placement-related services in accordance with their agreements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Fees, Payments and GST</h2>
                <p>
                  Fees for Services are set out on the Platform or in a separate written agreement. For the initial cohort, Students pay a registration fee of INR 5,321.00-11,999.00 plus applicable GST ("Registration Fee").
                </p>
                <p>
                  Payment of Fees shall be made through payment gateways supported on the Platform. You expressly authorize UdaYantu to charge applicable Fees using your provided payment method.
                </p>
                <p>
                  UdaYantu will issue GST-compliant invoices/receipts for payments. Fees may be subject to change but changes will not affect Fees for Services for which you have already paid.
                </p>
                <p>
                  <strong>Refunds:</strong> UdaYantu’s refund policy is published on the Platform and may vary by program. In general, if a Student is not placed within 180 Days of Cohort/Batch Completion the also time period specified in program materials, the Student may be eligible for a refund of the Registration Fee in accordance with the published refund policy.
                </p>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-sm text-orange-900 leading-relaxed font-semibold">
                  Training & Skills Development/Tuition Fees of 35% of total CTC of Students is Non-Refundable at all, which is payable by Students/Parents once students received Official Offer/Joining Letter from any company where he given interview post/during cohort/batch competition in his email.
                </div>
                <p>
                  Refunds will be processed through the original payment method subject to gateway policies and may take time to reflect. UdaYantu reserves the right to set additional conditions to avoid misuse of refund policies.
                </p>
                <p>
                  <strong>Chargebacks and disputes:</strong> In case of chargebacks or payment disputes, UdaYantu may suspend Services pending resolution. You agree to cooperate with investigations and provide information requested.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Placement Facilitation and Employer Engagement</h2>
                <p>
                  UdaYantu facilitates introductions between trained Students and Employers. Employers may opt to hire Students and where successful, placement fees may apply as agreed in the program terms (including commission of 8% of CTC to UdaYantu). Employers are independent hirers and are responsible for their own hiring decisions, offer letters, and employment terms.
                </p>
                <p>
                  UdaYantu will endeavor to prepare Students for Employer interviews with company-specific onboarding; however, Employers retain sole discretion to hire. UdaYantu is not and does not act as an employer of Students unless expressly set out in a separate employment agreement.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Student Obligations and Code of Conduct</h2>
                <p>
                  Students must: (a) attend scheduled sessions and complete assignments; (b) behave professionally with mentors, peers and Employer representatives; (c) not engage in plagiarism, cheating or other academic misconduct; (d) not upload or share content that infringes third-party rights; and (e) promptly disclose any conflicts or restrictions that may affect employment (e.g., non-compete clauses).
                </p>
                <p>
                  Failure to comply may result in warnings, suspension or expulsion from the program without refund (in cases of serious misconduct).
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Employer Obligations</h2>
                <p>
                  Employers must provide accurate job descriptions and evaluate candidates in good faith. Employers agree to comply with applicable labour laws and to provide fair treatment to candidates. Employers requesting candidate data must obtain candidate consent when required and use candidate data solely for recruitment purposes unless otherwise agreed.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">10. Intellectual Property Rights</h2>
                <p>
                  All content, materials, software and intellectual property provided through the Platform are the property of UdaYantu or its licensors. Students and Employers are granted a limited, non-exclusive, non-transferable license to use Platform content for personal/organizational use in connection with the Services.
                </p>
                <p>
                  Users must not copy, reproduce, distribute, modify, create derivative works from, or commercially exploit Platform content without express written permission. UdaYantu retains ownership of all course materials, trademarks and software.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">11. User Generated Content; License to Use</h2>
                <p>
                  Users may submit content such as assignments, project work, testimonials or forum posts ("User Content"). By submitting User Content, you grant UdaYantu a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, reproduce, modify, adapt, publish, translate, distribute and display such User Content for the purpose of operating and promoting the Platform and Services.
                </p>
                <p>
                  You represent and warrant that you own or have permission to submit User Content and that submission does not violate third-party rights or laws. UdaYantu may remove User Content that violates these Terms or is otherwise objectionable.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">12. Confidentiality</h2>
                <p>
                  Each party shall keep confidential and not disclose Confidential Information of the other party, except as required by law, court order, or with prior written consent. Confidential Information does not include information that is public knowledge, already known, or independently developed without the use of the other party's Confidential Information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">13. Data Protection and Privacy</h2>
                <p>
                  UdaYantu’s Privacy Policy governs collection, processing, transfer, retention and deletion of Personal Data. By using the Platform, you consent to the collection and use of your Personal Data as described in the Privacy Policy. Students consent to the sharing of relevant placement information with Employers for recruitment purposes as set out at the time of enrollment.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">14. Warranties and Disclaimers</h2>
                <p>
                  The Platform and Services are provided "as is" and "as available". UdaYantu disclaims all warranties to the fullest extent permitted by law, including implied warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. UdaYantu does not guarantee specific employment outcomes unless a separate agreement expressly provides such a guarantee.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">15. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable law, UdaYantu’s aggregate liability for any claim arising out of or in connection with these Terms shall not exceed the total Fees actually paid by you to UdaYantu during the twelve (12) months preceding the event giving rise to the claim. UdaYantu shall not be liable for indirect, incidental, special, consequential or punitive damages, loss of profits, loss of business, loss of data, or loss of goodwill.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">16. Indemnity</h2>
                <p>
                  You agree to indemnify, defend and hold harmless UdaYantu, its officers, directors, employees and agents from and against any and all claims, liabilities, damages, losses and expenses (including reasonable legal fees) arising out of or in connection with your breach of these Terms, your willful misconduct, or your violation of applicable laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">17. Termination and Suspension</h2>
                <p>
                  UdaYantu may suspend or terminate your access to the Platform or Services at any time for violations of these Terms, suspected fraud, non-payment, or for any reason where UdaYantu reasonably believes suspension is necessary to protect Users or the Platform. You may terminate your Account by contacting support. Termination does not relieve you of obligations incurred prior to termination (including payment obligations).
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">18. Refunds and Chargebacks (Detailed)</h2>
                <p>
                  Refund eligibility and procedures are described in the program-specific terms posted on the Platform. For the initial program cohort, the Registration Fee is refundable if the Student is not successfully placed within the time frame specified in program materials, subject to verification and the following conditions: (a) refund requests must be submitted in writing to support@udayantu.com within thirty (30) days of the end of the placement window; (b) refunds are subject to verification of candidate compliance with program requirements and cooperation with placement activities; (c) administrative charges and payment gateway fees, if any, may be deducted; and (d) refunds will be processed via the original payment method and may take 7–21 business days to reflect. In case of chargebacks, UdaYantu reserves the right to withhold further Services and to seek recovery of costs, including legal fees, if the chargeback is found to be unjustified.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">19. Force Majeure</h2>
                <p>
                  Neither party shall be liable for any failure or delay in performing obligations under these Terms resulting from causes beyond reasonable control, including natural disasters, pandemics, acts of government, strikes, civil unrest, internet outages, third-party service outages, or other force majeure events. The affected party shall notify the other party and use reasonable efforts to resume performance.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">20. Notices</h2>
                <p>
                  All notices under these Terms must be in writing and delivered to the contact details provided on the Platform or to support@udayantu.com. Notices to UdaYantu must be sent to the registered office and legal address as specified on the Platform. Notices are effective upon receipt.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">21. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Subject to mandatory pre-litigation requirements, the courts at Basti, Uttar Pradesh shall have exclusive jurisdiction to resolve any disputes arising out of or in connection with these Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">22. Amendments and Updates</h2>
                <p>
                  UdaYantu may amend these Terms from time to time to reflect changes in law, business practices, or platform functionality. Material changes will be communicated to registered Users via the Platform and/or email and will take effect as indicated. Continued use of the Platform after notice of changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">23. Severability</h2>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions will remain in full force and effect and the invalid or unenforceable provision shall be replaced with a valid, enforceable provision that comes closest to the intention of the original provision.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">24. Entire Agreement</h2>
                <p>
                  These Terms, together with any documents expressly incorporated by reference (including the Privacy Policy, program-specific terms, and any written agreements between the parties), constitute the entire agreement between you and UdaYantu with respect to the subject matter herein and supersede all prior agreements or understandings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">25. Contact Information</h2>
                <p>
                  For support, requests, disputes or other communications, please contact:
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm space-y-1.5">
                  <p><strong>Email:</strong> <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></p>
                  <p><strong>Registered Office:</strong> UdaYantu Enterprise, Lucknow, Uttar Pradesh, India</p>
                  <p><strong>Legal Notice Address:</strong> Basti, Uttar Pradesh, India (Courts at Basti have jurisdiction)</p>
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-150 pt-6">
                <h2 className="text-2xl font-bold text-foreground">Acknowledgement and Acceptance</h2>
                <p>
                  By clicking 'I Agree', registering for an Account, enrolling in a Program, or otherwise using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. You further confirm that you have the authority to accept these Terms on your own behalf (if an individual) or on behalf of the entity you represent (if acting for an organisation).
                </p>
                <div className="text-sm pt-4 text-slate-600 space-y-1">
                  <p><strong>Authorized Signatory for UdaYantu Enterprise:</strong> ______________________</p>
                  <p><strong>Date:</strong> October 13, 2025</p>
                </div>
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
