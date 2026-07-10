import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Privacy = () => {
  return (
    <>
      <SEOHead 
        title="Privacy Policy & Terms of Use - UdaYantu Enterprise"
        description="Official Privacy Policy and data usage terms for UdaYantu Enterprise. Learn about how we secure, process, and respect user privacy and sensitive data."
        keywords="privacy policy, data protection, SPDI, India data rules, GDPR compliance, UdaYantu legal"
        canonicalUrl={`${window.location.origin}/privacy`}
        noIndex={false}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy & Terms of Use</h1>
            
            <div className="prose prose-lg max-w-none space-y-8 text-foreground/90 font-sans">
              <p className="text-xl text-muted-foreground">
                Effective Date: October 13, 2025
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-sm space-y-1.5">
                <p><strong>Domain:</strong> Skill Development and Talent-as-a-Service (TaaS) Company</p>
                <p><strong>Head Office:</strong> Lucknow, Uttar Pradesh, India</p>
                <p><strong>Support:</strong> <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                <p>
                  Welcome to UdaYantu Enterprise ("UdaYantu", "we", "us", or "our"). Our mission is to empower rural and Tier-3/4 graduates by providing high-quality, industry-aligned skill development and placement services through our online platform (the "Platform"). This Privacy Policy & Terms of Use (the "Policy" or "Agreement") explains how we collect, use, disclose, store and protect information about users ("you", "user", "students", "parents", "employers" or "clients") who access our Platform and services.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">1.1 Scope and Applicability</h3>
                <p>
                  This Policy applies to all users of the Platform, including but not limited to: (a) students and parents or guardians; (b) startups, enterprises, corporates, banks, NGOs and recruitment partners (collectively "Employers"); and (c) visitors to our landing pages, marketing materials, and social media. By registering, accessing, or using the Platform in any manner, you acknowledge that you have read, understood and agree to be bound by this Policy. If you do not agree to this Policy, you must immediately stop using the Platform.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">1.2 Legal Notice and Disclaimer</h3>
                <p>
                  This Policy is drafted to comply with applicable Indian laws, rules and regulations governing information technology, electronic commerce, taxation, consumer protection, and data privacy to the extent they exist at the date of this Policy. It is intended to be a comprehensive statement of our practices; however, it does not constitute legal advice. UdaYantu strongly recommends that you consult legal counsel if you require legal advice specific to your circumstances.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Personal Data:</strong> Any information that identifies or can be used to identify an individual, directly or indirectly, including but not limited to name, email, phone number, date of birth, address, bank account details, PAN, photographs and other identifiers.
                  </li>
                  <li>
                    <strong>Sensitive Personal Data or Information (SPDI):</strong> Sensitive categories of personal data such as financial information (bank account, payment details), Aadhaar (if provided), biometric data, health or medical information, and other categories as defined under applicable laws.
                  </li>
                  <li>
                    <strong>Processing:</strong> Any operation or set of operations performed on Personal Data, whether or not by automated means, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, erasure or destruction.
                  </li>
                  <li>
                    <strong>Controller:</strong> UdaYantu Enterprise, which determines the purpose and means of Processing Personal Data collected through the Platform.
                  </li>
                  <li>
                    <strong>Processor:</strong> A natural or legal person, public authority, agency or other body which processes Personal Data on behalf of UdaYantu.
                  </li>
                  <li>
                    <strong>Platform:</strong> All digital properties owned, controlled or operated by UdaYantu including the website, landing pages, web applications, mobile applications, APIs, and subdomains.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Information We Collect</h2>
                <p>
                  We collect information which is necessary to provide our services, improve user experience, ensure compliance, and protect the safety of our community. The information collected falls into the following categories:
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">3.1 Personal Data Collected</h3>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Identity and contact information:</strong> Full name, date of birth, gender (optional), postal address, email address, mobile number (including country code), parent/guardian contact (for minors).
                  </li>
                  <li>
                    <strong>Academic and background information:</strong> Educational qualifications, college/university name, year of graduation, course and stream, marks/grades (if submitted), certifications, and transcripts (if provided).
                  </li>
                  <li>
                    <strong>Professional information:</strong> Work experience, CV/resume data, employer name (if applicable), designation, salary details (current/expected), job history.
                  </li>
                  <li>
                    <strong>Payment and financial information:</strong> Payment instrument metadata (transaction IDs), billing address, payment receipts, GSTIN (if any), and refund records. <em>Note:</em> Full card details are NOT stored by UdaYantu; payment processing is handled through PCI-compliant third-party payment gateways.
                  </li>
                  <li>
                    <strong>Account information:</strong> Platform username, encrypted password (where applicable), device identifiers, login timestamps, and session tokens.
                  </li>
                  <li>
                    <strong>Communications:</strong> Records of your communications with us, including email, chat logs, recorded support calls (if applicable) and correspondence.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">3.2 Sensitive Personal Data</h3>
                <p>
                  We do not normally collect Sensitive Personal Data. Where such data is provided voluntarily (for example, medical or disability information to enable reasonable accommodations), we will process it only with explicit consent, for limited purposes and with appropriate safeguards. Aadhaar numbers or biometric data must NOT be submitted through the Platform unless explicitly requested under a lawful process and with express consent.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">3.3 Non-Personal and Aggregated Data</h3>
                <p>
                  We may collect non-identifying information such as device and browser details, IP addresses, geolocation (coarse precision), anonymized usage metrics, course engagement, time spent on pages, quiz performance (as aggregated metrics) and other analytics data. Such aggregated data is used to improve our services and product analytics.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">3.4 Cookies and Tracking Technologies</h3>
                <p>
                  The Platform uses cookies and similar technologies (web beacons, pixel tags, local storage) to facilitate functionality, personalize user experience, and support analytics and marketing. Cookies may be classified as: essential (required for platform functionality), performance (analytics), functional (preferences), and marketing (ad targeting). You can manage cookie preferences via browser settings and our cookie banner. However, disabling essential cookies may impair core Platform functionality.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Purpose of Processing and Legal Basis</h2>
                <p>
                  UdaYantu processes Personal Data for the following primary purposes. Where required under applicable law, we will rely on a lawful basis for processing, such as consent, contract performance, legal obligation, legitimate interests, or vital interests as applicable:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Service delivery and account management:</strong> To register users, manage accounts, authenticate access, deliver courses, administer batches, assessments, certificates, and placement services.
                  </li>
                  <li>
                    <strong>Payment processing and refunds:</strong> To facilitate registration payments, issue invoices (GST compliant), process refunds, manage billing disputes, reconcile payments and meet taxation obligations.
                  </li>
                  <li>
                    <strong>Student assessment and placement:</strong> To conduct assessments, evaluate performance, generate placement shortlists, and share required information with hiring partners upon obtaining user consent or as per contractual agreements.
                  </li>
                  <li>
                    <strong>Compliance and safety:</strong> To comply with law enforcement requests, taxation requirements (GST), audit, anti-fraud measures, dispute resolution and to protect rights, property or safety of users and the public.
                  </li>
                  <li>
                    <strong>Product improvement and research:</strong> To analyze platform usage, improve learning content, personalize learning paths, and perform research and development activities (using anonymized data wherever possible).
                  </li>
                  <li>
                    <strong>Communications and marketing:</strong> To provide transactional communications (registration receipts, invoices, notifications) and promotional communications (where consented) about relevant programs, events, or partner offerings. Users may opt-out of marketing communications at any time.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">4.1 Consent and Opt-out</h3>
                <p>
                  Where processing is based on consent, we will obtain explicit consent from you before collecting or processing data for that purpose. You have the right to withdraw consent at any time, subject to legal or contractual restrictions. Withdrawals will not affect the lawfulness of processing carried out prior to withdrawal. You can opt-out of marketing communications by clicking the unsubscribe link in emails or by contacting <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Sharing Personal Data and Third Parties</h2>
                <p>
                  UdaYantu may share Personal Data with third parties in the following circumstances. We require all third-party processors to implement appropriate technical and organizational measures to protect Personal Data:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Service Providers and Processors:</strong> Payment gateways (e.g., Razorpay/PayU), email and SMS providers, cloud hosting providers, CDNs, analytics providers, and video-hosting services.
                  </li>
                  <li>
                    <strong>Employers and Hiring Partners:</strong> Candidate profiles and selected data necessary for recruitment (resume, contact details, skill assessments) may be shared with employer partners for evaluation, only with your consent or as provided under a contractual arrangement.
                  </li>
                  <li>
                    <strong>Legal, regulatory or safety obligations:</strong> When required by law, court order, government request, or to respond to lawful requests by public authorities.
                  </li>
                  <li>
                    <strong>Business transfers:</strong> As part of a merger, acquisition, or sale of assets; we will notify affected users and require that successor entities adhere to this Policy.
                  </li>
                  <li>
                    <strong>Aggregated or anonymized disclosures:</strong> Aggregate or de-identified information may be shared with partners for research and product improvement.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">5.1 International Data Transfers</h3>
                <p>
                  To provide global services, UdaYantu may transfer Personal Data to third-party service providers located in other jurisdictions, including outside India. We will ensure such transfers are subject to appropriate safeguards, such as standard contractual clauses, data processing agreements, or other mechanisms required by applicable law. By using the Platform, you consent to such transfers where necessary for service delivery.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Data Retention</h2>
                <p>
                  UdaYantu retains Personal Data only for as long as necessary to fulfill the purposes outlined in this Policy, and to comply with legal and accounting obligations. Typical retention periods include:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Transactional & Billing Records:</strong> 6 years (or longer) for tax and audit purposes in accordance with Indian tax laws such as GST regulations.
                  </li>
                  <li>
                    <strong>Student Records & Certifications:</strong> Retained for the lifetime of the user account unless deletion is requested; certificates and related records retained permanently for verification purposes.
                  </li>
                  <li>
                    <strong>Applications & Assessments:</strong> Retained for up to 3–7 years depending on consent, contractual requirements, and dispute resolution needs.
                  </li>
                  <li>
                    <strong>Marketing Preferences:</strong> Retained until you unsubscribe or withdraw consent.
                  </li>
                  <li>
                    <strong>Support & Complaint Records:</strong> Retained for statutory or operational reasons as required by law or internal policy.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">6.1 Account Deletion and Data Erasure</h3>
                <p>
                  You may request deletion of your account and Personal Data (subject to applicable law and legitimate retention obligations). Certain data may be retained for legal compliance, fraud prevention, enforcement of our Terms, and archival purposes. To request deletion, contact <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a>. We will verify identity and respond to requests within a reasonable timeframe.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Your Rights and How to Exercise Them</h2>
                <p>You have the following rights under applicable data protection laws:</p>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Right to Access:</strong> You may request access to the personal data we hold about you and obtain a copy in a portable format.</li>
                  <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete personal data.</li>
                  <li><strong>Right to Deletion/Erasure:</strong> Where permitted by law, you may request deletion of your personal data.</li>
                  <li><strong>Right to Restrict Processing:</strong> You may ask us to restrict processing in certain circumstances.</li>
                  <li><strong>Right to Object:</strong> You may object to processing based on legitimate interests or for direct marketing.</li>
                  <li><strong>Right to Data Portability:</strong> Where technically feasible, you may request transfer of your data to another provider in a structured, commonly used format.</li>
                  <li><strong>Right to Withdraw Consent:</strong> If processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">7.1 Data Protection Officer / Grievance Officer</h3>
                <p>
                  In accordance with applicable Indian rules and the spirit of best practices, UdaYantu appoints a Grievance & Data Protection Officer to address privacy concerns, complaints and data rights requests.
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm space-y-1.5">
                  <p><strong>Grievance & Data Protection Officer (GDPO):</strong></p>
                  <p><strong>Email:</strong> <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></p>
                  <p><strong>Postal Address:</strong> UdaYantu Enterprise, Gomti Nagar, Lucknow, Uttar Pradesh, India</p>
                  <p className="mt-3">If you are not satisfied with our resolution, you may escalate the matter by serving a legal notice to:</p>
                  <p><strong>Legal Notice Address:</strong> Basti, Uttar Pradesh, India (Jurisdiction: Courts at Basti)</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Security Measures and Data Protection</h2>
                <p>
                  UdaYantu is committed to safeguarding your Personal Data and has implemented appropriate technical and organizational measures to protect against unauthorized access, loss, misuse, alteration or disclosure:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit (TLS) and at rest where feasible.</li>
                  <li>Role-based access controls and least-privilege principles for internal systems.</li>
                  <li>Periodic security assessments, vulnerability scanning and penetration testing.</li>
                  <li>Secure development lifecycle practices and code reviews for Platform updates.</li>
                  <li>Regular backups and disaster recovery plans, with encrypted backups stored regionally.</li>
                  <li>Incident response plan including timely user notifications and regulatory reporting as required.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">8.1 Data Breach Notification</h3>
                <p>
                  In the event of a verified data breach affecting Personal Data, UdaYantu will act promptly to contain and remediate the breach. We will notify affected users and relevant authorities as required by applicable law, and provide reasonable information about steps taken to mitigate the impact. We maintain an incident response plan and forensic procedures to investigate breaches.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Children and Minors</h2>
                <p>
                  UdaYantu does not target users below the age of 18. If you are under 18, you may use the Platform only with the involvement and consent of a parent or legal guardian. Where we collect information about minors (for example, students aged 16–18 within certain programs), parental consent is required and will be obtained prior to collection. Parents or guardians may contact <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a> to review, correct or delete their child's information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">10. Payments, Fees, Refunds and GST Compliance</h2>
                <p>
                  All monetary transactions on the Platform are subject to the payment terms, fees and refunds as offered on the landing/web page or individual program terms. UdaYantu collects registration fees and placement-related fees as described in program materials. The following principles apply:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>Payment Gateway & PCI:</strong> Payments are processed by PCI-compliant third-party gateways (e.g., Razorpay). UdaYantu does not store full card data; tokens or masked card references may be retained only for reconciliation.
                  </li>
                  <li>
                    <strong>GST & Invoicing:</strong> UdaYantu will issue GST-compliant invoices/receipts for paid fees. Users may be required to provide GSTIN if invoicing requires it. Financial records are maintained per Indian tax laws.
                  </li>
                  <li>
                    <strong>Refund Policy:</strong> The refund policy (including registration fee refund conditions, timelines and processes) is posted clearly on program pages. Refunds, when applicable, are processed through the payment gateway with supporting reconciliation.
                  </li>
                  <li>
                    <strong>Chargebacks & Disputes:</strong> In case of payment disputes or chargebacks, UdaYantu will investigate and reserve the right to withhold placement services pending resolution.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">11. Intellectual Property Rights</h2>
                <p>
                  All content on the Platform, including course materials, videos, documents, software, designs, logos and trademarks, is the intellectual property of UdaYantu or its licensors, and is protected under applicable intellectual property laws. You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit Platform content without prior written consent from UdaYantu.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">11.1 User Generated Content</h3>
                <p>
                  Users may post or submit content in designated areas (e.g., discussion forums, assignment submissions). By posting content, you grant UdaYantu a non-exclusive, worldwide, royalty-free license to use, host, store, reproduce, modify, publish, translate, distribute and display such content for the purpose of operating and promoting the Platform. Users must not upload content that infringes third-party rights, is unlawful, defamatory, obscene or offensive.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">12. Disclaimers, Limitation of Liability and Indemnity</h2>
                <p className="font-bold text-slate-800 uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, UDAYANTU PROVIDES THE PLATFORM AND SERVICES ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. UDAYANTU DOES NOT GUARANTEE SPECIFIC OUTCOMES, EMPLOYMENT, OR SALARY LEVELS UNLESS SPECIFICALLY STATED IN A WRITTEN AGREEMENT.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> UdaYantu’s total aggregate liability arising out of or relating to this Policy or the Platform shall not exceed the total fees paid by you to UdaYantu in the 12-month period preceding the claim, except where prohibited by law.
                </p>
                <p>
                  <strong>Indemnity:</strong> You agree to indemnify and hold harmless UdaYantu and its officers, directors, employees, agents and affiliates from any claim, loss, liability, damages, costs or expenses arising from your breach of this Policy or misuse of the Platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">13. Complaints, Notice and Takedown Procedure</h2>
                <p>
                  UdaYantu implements a policy to respond to complaints about alleged unlawful or infringing content hosted on the Platform. If you believe any content infringes your rights or violates applicable law, contact <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a> with details. We will acknowledge complaints promptly and take appropriate action, including removal of content, blocking access, or referral to law enforcement as necessary. We maintain records of complaints and their resolution.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">14. Governing Law and Dispute Resolution</h2>
                <p>
                  This Policy and any dispute arising out of or related to it shall be governed by the laws of India. Subject to mandatory statutory procedures, the courts at Basti, Uttar Pradesh shall have exclusive jurisdiction for any disputes or legal proceedings arising hereunder. However, before initiating any legal proceedings, parties shall attempt to settle disputes amicably by giving written notice to the other party and engaging in good-faith discussions. In the absence of resolution, legal action may be initiated in the courts at Basti.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">15. Amendments and Updates to this Policy</h2>
                <p>
                  UdaYantu may update this Policy from time to time to reflect changes in our practices, legal requirements, or operational needs. Material changes will be notified to registered users via the Platform and/or email. The date of the latest revision will be reflected at the top of this document. Continued use of the Platform following posted changes constitutes acceptance of the updated Policy.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">16. Contact Information</h2>
                <p>
                  If you have any questions, requests, or complaints regarding this Policy, please contact:
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm space-y-1.5">
                  <p><strong>Email:</strong> <a href="mailto:support@udayantu.com" className="text-primary hover:underline">support@udayantu.com</a></p>
                  <p><strong>Postal Address:</strong> UdaYantu Enterprise, Lucknow, Uttar Pradesh, India</p>
                  <p><strong>Legal Notice Address:</strong> Basti, Uttar Pradesh, India (for service of process and legal notices)</p>
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-150 pt-6">
                <h2 className="text-2xl font-bold text-foreground">17. Recommendations and Legal Advisory Note</h2>
                <p className="text-xs text-muted-foreground leading-normal">
                  This Policy is a comprehensive template intended to be used as the privacy & legal backbone for UdaYantu’s Platform. However, because privacy and online compliance are highly regulated areas and may change, UdaYantu should: (a) obtain a formal legal review from qualified Indian counsel specializing in IT, privacy and employment law; (b) implement internal data governance and security controls; (c) document consent mechanisms clearly; and (d) maintain records of user consents, data processing activities and any cross-border data transfers.
                </p>
                <p className="text-xs text-muted-foreground leading-normal">
                  We recommend periodic audits, security testing, and a formal grievance handling mechanism in compliance with any applicable Indian intermediary rules or data protection legislation when enacted.
                </p>
                <div className="text-sm pt-4 text-slate-600 space-y-1">
                  <p><strong>Prepared by:</strong> Legal & Compliance Team, UdaYantu Enterprise</p>
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

export default Privacy;
