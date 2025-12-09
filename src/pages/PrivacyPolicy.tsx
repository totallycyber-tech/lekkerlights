import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Lekker Lights - Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: 9 December 2025</p>

          <section className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lekker Lights ("Lekker Lights", "we", "us", or "our") provides an online platform at https://lekkerlights.co.za ("Website") that allows people to list and discover festive light displays at homes and properties ("Service"). This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Website and related services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using the Service and submitting a listing or contact form, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">2. Who We Are and How to Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is operated by Lekker Lights (the "Operator"). If you have any questions about this Privacy Policy or how your data is handled, you can contact us at:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Website: <a href="https://lekkerlights.co.za" className="text-christmas hover:underline">https://lekkerlights.co.za</a></li>
                <li>Email: <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">3. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not require users to create accounts or passwords. However, we do collect certain information when you submit a listing or contact us.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">3.1 Information You Provide Directly</h3>
              
              <h4 className="font-display text-lg font-medium text-foreground mt-4 mb-2">a) Listing and Contact Information</h4>
              <p className="text-muted-foreground leading-relaxed">When you submit a listing for your light display or contact us, we may collect:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Property address (street number, street name, suburb, city, province, postal code)</li>
                <li>Contact email address</li>
                <li>Contact phone number</li>
                <li>Listing title and description</li>
                <li>Display theme (e.g. Christmas)</li>
                <li>Dates and hours during which the display is available for public viewing</li>
                <li>Photos and/or videos you upload</li>
                <li>Any additional information you voluntarily include in your submission</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4 italic">
                Please note that photos and videos may include personal information (for example, images of people, vehicles, or neighbouring properties). You are responsible for ensuring you have the necessary consent before uploading such content.
              </p>

              <h4 className="font-display text-lg font-medium text-foreground mt-4 mb-2">b) Notification and Communication Data</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Your email address and preferences when you subscribe to notifications or newsletters (if enabled)</li>
                <li>Information you provide when contacting us for support or inquiries</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">3.2 Information Collected Automatically</h3>
              <p className="text-muted-foreground leading-relaxed">When you use the Service, we may automatically collect:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited, time and date of visits, time spent on pages, and other usage statistics</li>
                <li>Referring URLs</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                This information is used for security, analytics, and to improve the Service.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">3.3 Cookies and Similar Technologies</h3>
              <p className="text-muted-foreground leading-relaxed">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Remember your basic preferences (such as search filters)</li>
                <li>Understand how the Service is used</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                You may disable cookies in your browser settings, but some features of the Service may not function properly if you do so.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">3.4 Third-Party Services and Google Maps</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Service uses Google Maps Platform services, including Maps, Places, and Geocoding, to allow users to search for and geolocate addresses and to display maps and markers.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">When you use map-related features:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Google may collect information such as your IP address, device details, and search queries.</li>
                <li>Google processes this information according to its own Privacy Policy and Terms of Service.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                We encourage you to review Google's privacy policy and terms to understand how they handle your information.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">4. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>To receive, process, and display your listings on the Website and on maps so that visitors can find them</li>
                <li>To contact you about your listing (for example, to clarify details or address issues)</li>
                <li>To send you notifications you have opted into (e.g. alerts about new displays in certain areas, if enabled)</li>
                <li>To respond to your inquiries and support requests</li>
                <li>To monitor, maintain, and improve the performance and security of the Service</li>
                <li>To prevent fraud, abuse, and misuse (including enforcing our Terms of Service)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">5. Legal Bases for Processing (where applicable)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Where data protection laws such as the EU/UK GDPR or the South African Protection of Personal Information Act, 2013 ("POPIA") apply, we rely on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><strong>Performance of a contract:</strong> Operating the Service you request, such as publishing your listing.</li>
                <li><strong>Consent:</strong> Sending you optional email notifications or marketing messages, and using certain cookies.</li>
                <li><strong>Legitimate interests:</strong> Improving the Service, ensuring security, preventing abuse, and analysing usage.</li>
                <li><strong>Legal obligations:</strong> Complying with applicable laws and regulations.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">6. POPIA (South Africa)</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">6.1 Responsible Party</h3>
              <p className="text-muted-foreground leading-relaxed">
                For purposes of POPIA, Lekker Lights acts as the "responsible party" for personal information we collect and process via the Website and Service, except where you, as a Host, submit personal information about third parties (such as images of identifiable individuals). In those cases, you may also act as a responsible party or "responsible person" and are required to ensure that such processing is lawful.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">6.2 Lawfulness and Minimality</h3>
              <p className="text-muted-foreground leading-relaxed">
                We process personal information in a manner that is lawful, reasonable, and not intrusive to your privacy, and we only process information that is adequate, relevant, and not excessive for the purposes described in this Privacy Policy.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">6.3 Data Subject Rights under POPIA</h3>
              <p className="text-muted-foreground leading-relaxed">Under POPIA, if you are in South Africa, you have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Be informed that your personal information is being collected.</li>
                <li>Request access to the personal information we hold about you.</li>
                <li>Request correction or deletion of your personal information where it is inaccurate, irrelevant, excessive, out of date, incomplete, misleading, or obtained unlawfully.</li>
                <li>Object to the processing of your personal information in certain circumstances.</li>
                <li>Object to the processing of personal information for direct marketing purposes.</li>
                <li>Lodge a complaint with the Information Regulator (South Africa) if you believe we are not complying with POPIA.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise your rights, please contact us at <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a>.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">6.4 Hosts' Responsibilities under POPIA</h3>
              <p className="text-muted-foreground leading-relaxed">If you submit a listing on Lekker Lights, you are responsible for ensuring that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You have a lawful basis under POPIA to upload and publish any personal information in your listing (including photos and videos showing identifiable individuals or neighbouring properties).</li>
                <li>You obtain appropriate consent from any identifiable individuals appearing in your photos or videos, especially children.</li>
                <li>You do not upload unnecessary or excessive personal information, such as detailed images of neighbours' homes or licence plates, unless you have a clear lawful justification and consent where required.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">7. How We Share Your Information</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.1 Information Shared Publicly</h3>
              <p className="text-muted-foreground leading-relaxed">The following data is made publicly visible as part of a listing:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Listing title</li>
                <li>Listing description</li>
                <li>Display theme</li>
                <li>Photos and/or videos</li>
                <li>The location of the display (address and/or map marker, which may be shown at approximate or full accuracy, depending on implementation)</li>
                <li>Available dates and hours for viewing</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Anyone who visits the Website can view this information.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.2 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information with trusted third-party service providers who help us operate the Service, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Hosting and infrastructure providers</li>
                <li>Email delivery services</li>
                <li>Analytics providers</li>
                <li>Content delivery networks</li>
                <li>Google Maps Platform</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                These providers only have access to the information necessary to perform specific tasks on our behalf and are obligated to protect your information.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.3 Legal Requirements and Safety</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities, or when we believe in good faith that such action is necessary to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Comply with a legal obligation</li>
                <li>Protect and defend our rights or property</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>Protect the personal safety of users or the public</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.4 No Sale of Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide the Service, comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Listing and contact data are retained while the listing is active or as long as reasonably necessary for the purposes described in this Privacy Policy.</li>
                <li>If you request that we remove a listing or your personal information, we will take reasonable steps to delete or anonymise the data, subject to any legal or legitimate business requirements (such as security or fraud prevention, or backup retention).</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">9. Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use reasonable technical and organisational measures to protect your personal information from loss, misuse, and unauthorised access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">10. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">Depending on your jurisdiction, you may have the following rights:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal information, subject to legal and contractual limits.</li>
                <li><strong>Restriction:</strong> Request that we limit the processing of your personal information.</li>
                <li><strong>Objection:</strong> Object to certain types of processing, such as direct marketing.</li>
                <li><strong>Portability:</strong> Request that we provide your personal information in a structured, commonly used machine-readable format, where applicable.</li>
                <li><strong>Withdrawal of consent:</strong> Where processing is based on consent, you may withdraw your consent at any time.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise your rights, please contact us at <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a>. We may need to verify your identity before responding to your request.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is intended for use by adults. You must be at least 18 years old to submit a listing. Children may browse the site with the supervision and consent of a parent or guardian.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                We do not knowingly collect personal information from children under 13. If you believe that a child under 13 has provided us with personal information, please contact us so we can take appropriate action.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">12. International Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on where you are located and where our service providers are based, your information may be transferred to and processed in countries other than your own. We take steps to ensure that appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. If changes are material, we may provide additional notice, such as by email or through the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Website: <a href="https://lekkerlights.co.za" className="text-christmas hover:underline">https://lekkerlights.co.za</a></li>
                <li>Email: <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a></li>
              </ul>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
