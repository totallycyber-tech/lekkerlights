import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Lekker Lights - Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: 9 December 2025</p>

          <section className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of the Lekker Lights website at https://lekkerlights.co.za and related services ("Service"). By accessing or using the Service, including submitting a listing, editing or deleting a listing using a secure link, submitting a review, or reporting a listing, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">2. Description of the Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lekker Lights allows property owners or residents ("Hosts") to list their festive light displays and allows visitors ("Visitors") to search for, view, rate, review, and report these displays. The Service displays listings in a Grid View and on an interactive Map View based on information submitted by Hosts. Visitors can click on map markers to view listing details, use the Refresh button to reload the latest data, and filter displays by location and tags. The Service may show ratings and reviews submitted by Visitors.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We also provide a How to Use page with step-by-step guides and a Frequently Asked Questions (FAQ) section to help Hosts and Visitors understand how to use the Service effectively.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">3. No User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lekker Lights does not currently require users to create login accounts or passwords. Hosts submit their listings via an online form, providing their contact details and property information, which we use to display the listing and, where necessary, to contact the Host regarding their submission. Visitors may submit reviews, ratings, or reports without creating an account, although we may ask for basic information (such as a name or email) for verification or moderation purposes.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to introduce user accounts in the future, in which case these Terms may be updated accordingly.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">4. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old to submit a listing or otherwise act as a Host on the Service. By submitting a listing, you represent and warrant that you are at least 18 years of age and that you have the authority to agree to these Terms and to list the relevant property.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Children may browse the website with the supervision and consent of a parent or guardian.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">5. Information Provided by Hosts</h2>
              <p className="text-muted-foreground leading-relaxed">When you submit a listing, you agree to provide accurate and complete information, which may include:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Your full name</li>
                <li>Contact email address (required so we can send you a secure edit link for your listing)</li>
                <li>Contact phone number</li>
                <li>Whether your name and/or contact details should be visible to the public</li>
                <li>Property address (street number, street name, suburb, city, province, postal code)</li>
                <li>Listing title and description</li>
                <li>Dates and hours during which the display is available for public viewing</li>
                <li>Parking information (including any restrictions)</li>
                <li>Visitor limits or guidance (such as maximum visitors at a time or "no buses")</li>
                <li>Access instructions and gate/complex rules (such as security gate procedures, ID or licence requirements, dial-in codes, or calling ahead)</li>
                <li>Tags that describe your display (for example, KidFriendly, Walkthrough, Synced)</li>
                <li>Photos and other images you upload directly to the Service</li>
                <li>Links to external videos (for example, YouTube)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You acknowledge that your listing details (including all information you choose to display publicly, such as address or approximate location, description, dates/hours, tags, and images) may be displayed publicly on the Website and on maps so that Visitors can find and visit your display. Some contact details or your name may also be displayed publicly if you choose that visibility option.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">6. Editing and Deleting Listings via Secure Link</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you submit a listing, we may send a secure, unique edit link to the email address you provided. This link allows you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Edit your listing details; and/or</li>
                <li>Hide or delete your listing from public view;</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                without needing to create a user account or password.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">You agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You are responsible for keeping the edit link and the associated email secure.</li>
                <li>Anyone with access to the email and edit link may be able to modify or hide your listing.</li>
                <li>Lekker Lights is not responsible for any unauthorised changes to your listing made by someone who has gained access to your email account or edit link.</li>
                <li>If you lose access to your email or edit link, we may, at our discretion, require additional verification before making changes or may be unable to restore access.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">7. User Content</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.1 Types of User Content</h3>
              <p className="text-muted-foreground leading-relaxed">"User Content" includes any content you submit, upload, or post to the Service, including but not limited to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Listing titles and descriptions</li>
                <li>Addresses and location information</li>
                <li>Parking information, visitor limits, and access instructions</li>
                <li>Tags and attributes describing the display</li>
                <li>Photos and images</li>
                <li>Links to external media (such as YouTube videos)</li>
                <li>Reviews and ratings</li>
                <li>Reports and flags about listings</li>
                <li>Messages sent via any contact or feedback features (if enabled)</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.2 Ownership</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of your User Content. By submitting User Content to the Service, you represent and warrant that you have all necessary rights, permissions, and consents to do so and that your content does not infringe or violate the rights of any third party.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">7.3 Licence to Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable licence to host, store, use, reproduce, modify, adapt, display, publish, and distribute your User Content in connection with operating, improving, and promoting the Service, including displaying listings on maps, in search results, and in email notifications, displaying and aggregating ratings and reviews, and using reports to moderate and improve the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This licence continues for a reasonable period after you request removal of your content from the Service to allow for technical caching, backups, and necessary operational uses.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">8. Listing Rules and Responsibilities</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">8.1 Host Responsibilities</h3>
              <p className="text-muted-foreground leading-relaxed">If you submit a listing, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You are the owner of the property or have express permission from the owner or lawful occupier to list it.</li>
                <li>The information you provide, including address, description, tags, parking information, visitor limits, access instructions, and viewing hours, is accurate and not misleading.</li>
                <li>Your display and any gatherings or visits comply with applicable laws, regulations, and local bylaws (including safety, noise, and traffic regulations, estate/complex rules, and municipal bylaws).</li>
                <li>You are responsible for managing any visitors, traffic, and parking associated with your listing.</li>
                <li>You will ensure that your property is reasonably safe for visitors and free from unnecessary hazards.</li>
                <li>You will comply with POPIA and other applicable data protection laws when uploading photos or videos that may contain personal information (such as identifiable individuals or neighbouring properties).</li>
                <li>You will update or request removal of your listing if details change or if your display is no longer available for viewing.</li>
                <li>Any security or access details you provide (such as intercom instructions or gate procedures) do not unlawfully disclose sensitive information or create security risks for other residents.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You acknowledge that you are solely responsible for any consequences arising from listing your property and receiving visitors, and that Lekker Lights is not a party to any relationship between Hosts, Visitors, neighbours, or local authorities.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">8.2 Tags and Attributes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hosts may optionally select tags and attributes (such as KidFriendly, Walkthrough, Synced, Inflatables, etc.) to help Visitors understand and discover displays. You agree to use tags honestly and accurately, and not to misrepresent your display. We may adjust, remove, or standardise tags at our discretion for consistency or moderation purposes.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">8.3 Visitor Responsibilities</h3>
              <p className="text-muted-foreground leading-relaxed">If you visit a listed property, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You do so voluntarily and at your own risk.</li>
                <li>You will respect the property, the Host, neighbours, and the surrounding community.</li>
                <li>You will follow any reasonable rules, time windows, and instructions provided in the listing or by the Host, including parking and access guidance.</li>
                <li>You will comply with local laws and bylaws, including traffic and parking rules, and any rules imposed by estates or complexes.</li>
                <li>You will respect privacy and obtain consent before photographing or filming people or private areas of the property.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">9. Photography, Images, Filming and Drones</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">9.1 Images Uploaded by Hosts</h3>
              <p className="text-muted-foreground leading-relaxed">If you upload photos or other images as part of your listing, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You have obtained appropriate consent from any identifiable individuals depicted in the content, especially children, or you have taken reasonable steps to avoid capturing identifiable individuals.</li>
                <li>You will not upload images that unreasonably intrude on the privacy of neighbours or other third parties (for example, close-up images of neighbouring homes, gardens, or licence plates) unless you have their explicit consent.</li>
                <li>You are responsible for ensuring that your content complies with copyright, privacy, POPIA, and any other applicable laws.</li>
                <li>You grant Lekker Lights the right to host, display, resize, crop, or otherwise adapt your images as needed for the Website and related communications.</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">9.2 Visitors – Photography and Filming</h3>
              <p className="text-muted-foreground leading-relaxed">If you take photos or videos while visiting a listed property, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You will be respectful and will not photograph or film residents, other visitors, neighbours, or the interior of homes without the explicit consent of the property owner or lawful occupier and, where applicable, the individuals being photographed or filmed.</li>
                <li>You will comply with any reasonable instructions from the Host relating to photography or filming (for example, "no flash photography", "no photos of children", or "no filming towards neighbouring properties").</li>
                <li>You will not use photos or videos taken at a listed property in a way that harasses, embarrasses, or harms others, or that violates their privacy or data protection rights.</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">9.3 Drones and Aerial Footage</h3>
              <p className="text-muted-foreground leading-relaxed">If you use drones or other aerial devices:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You must comply with all applicable aviation laws and regulations, including those issued by the South African Civil Aviation Authority (SACAA), as well as any rules set by estates, complexes, or local authorities.</li>
                <li>You must obtain explicit permission from the Host (property owner or lawful occupier) before flying a drone over or near their property.</li>
                <li>You must avoid flying over neighbouring properties or crowded areas without appropriate consent and legal authorisation.</li>
                <li>You are responsible for any damage, injury, or legal issues arising from your use of drones or aerial devices.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Lekker Lights does not authorise or supervise on-site photography, filming, or drone use and is not responsible for any disputes, damage, or regulatory issues that may arise from such activities. Any such activities are solely between Hosts, Visitors, neighbours, and relevant authorities.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">10. Reviews and Ratings</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">10.1 Visitor Reviews</h3>
              <p className="text-muted-foreground leading-relaxed">Visitors may be able to submit ratings and written reviews about displays they have visited. By submitting a review or rating, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Your review will be based on your honest experience.</li>
                <li>You will not submit reviews that are false, misleading, defamatory, harassing, hateful, or otherwise abusive.</li>
                <li>You will not post reviews as part of any organised campaign to unfairly influence a rating (for example, review bombing or fake positive reviews).</li>
                <li>We may display your rating and review publicly, along with a display name or anonymised identifier where applicable.</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">10.2 Host and Visitor Acknowledgements</h3>
              <p className="text-muted-foreground leading-relaxed">Hosts acknowledge that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>They may receive public ratings and reviews from Visitors.</li>
                <li>Lekker Lights does not guarantee any particular rating or number of reviews.</li>
                <li>We may, at our discretion, remove or refuse to display reviews that violate these Terms or our policies.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">Visitors acknowledge that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Reviews reflect the opinions of individual users, not Lekker Lights.</li>
                <li>We do not endorse or verify every statement in user reviews.</li>
              </ul>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">10.3 AI Moderation and Human Review</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may use automated tools, including AI systems, to help moderate reviews, tags, images, reports, and other User Content for spam, harmful content, or policy violations. These tools may temporarily hide or flag content for further review. While we aim for these systems to be fair and accurate, they may not always be perfect.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We may also review content manually and may remove, edit, or refuse to display any User Content that we believe:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Violates these Terms;</li>
                <li>Violates applicable law; or</li>
                <li>Is otherwise inappropriate for the Service or our audience.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                If you believe your content was removed or moderated in error, you may contact us at <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a> to request a review.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">11. Reporting Listings</h2>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">11.1 Reporting Functionality</h3>
              <p className="text-muted-foreground leading-relaxed">Visitors may be able to report listings they believe are problematic. When you use the reporting function, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>You will select a reason from the available options (for example, "Inaccurate info", "Privacy concern", "Offensive content", "Safety issue", or similar reasons) and may add additional free-text details.</li>
                <li>You will not abuse the reporting system by submitting false or malicious reports.</li>
                <li>We may collect your name, contact details, and the date and time of the report to investigate and, where necessary, contact you for additional information.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Reports may be emailed to <a href="mailto:totallycyber.tech@gmail.com" className="text-christmas hover:underline">totallycyber.tech@gmail.com</a> and handled internally. Reports are not displayed publicly.
              </p>

              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">11.2 Our Response to Reports</h3>
              <p className="text-muted-foreground leading-relaxed">We may use reports, along with our own checks and moderation tools, to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Review and, where appropriate, edit, hide, or remove listings or other User Content;</li>
                <li>Contact the Host or Visitor involved for clarification;</li>
                <li>Take other actions we deem necessary to maintain safety, compliance, and quality on the Service.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not guarantee that every report will result in a particular action, and we may decline to take action where we determine that a report is unfounded or abusive.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">12. Prohibited Content and Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, hateful, or discriminatory.</li>
                <li>Post sexually explicit content, particularly involving minors.</li>
                <li>Post content that infringes any intellectual property or privacy rights of others.</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation with a person or entity.</li>
                <li>Create fake or misleading listings, including addresses that you do not have permission to list.</li>
                <li>Upload viruses, malware, or other harmful code, or attempt to interfere with or disrupt the Service or its infrastructure.</li>
                <li>Scrape, crawl, or systematically collect data from the Service without prior written permission.</li>
                <li>Manipulate ratings or reviews, including posting multiple reviews for the same display or coordinating others to do so dishonestly.</li>
                <li>Abuse the reporting system, including submitting false or malicious reports.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We may, at our sole discretion, remove or edit any User Content and suspend, block, or prevent submissions that violate these Terms or are otherwise inappropriate.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">13. Our Rights to Modify or Terminate the Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify, suspend, or discontinue all or part of the Service at any time, with or without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">14. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service uses third-party services such as Google Maps Platform, hosting providers, email delivery services, analytics tools, and content moderation or AI services. Your use of Google Maps and related features may be subject to additional terms and privacy policies provided by Google.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are not responsible for the availability, accuracy, or performance of third-party services and are not liable for any issues or damages arising from their use.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">15. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and all content are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">We do not warrant that:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>The Service will be uninterrupted, secure, or error-free.</li>
                <li>Listings, tags, parking information, visitor limits, access instructions, reports, or reviews will be accurate, complete, or up to date.</li>
                <li>Any property will be decorated or accessible at the time of your visit.</li>
                <li>Visits will be free from risks, accidents, crime, or other issues.</li>
                <li>Our automated moderation tools (including AI systems) will be error-free or will always make perfect decisions.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You use the Service and visit any listed property at your own risk.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">16. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, in no event shall we or our directors, employees, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or other intangible losses, arising out of or related to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Your access to or use of, or inability to access or use, the Service;</li>
                <li>Any conduct or content of other users or third parties on the Service;</li>
                <li>Any accident, injury, damage, or dispute arising from a visit to a listed property;</li>
                <li>Any reliance on listings, tags, parking information, visitor limits, access instructions, ratings, reviews, or reports;</li>
                <li>Any unauthorised access, use, or alteration of your transmissions or content;</li>
                <li>Any actions taken (or not taken) as a result of automated or AI-based moderation or in response to reports.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our total liability to you for any claims arising out of or related to the Service shall be limited, to the fullest extent permitted by law, to a reasonable nominal amount determined by us.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">17. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless us and our directors, employees, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Your use of the Service;</li>
                <li>Your User Content;</li>
                <li>Your violation of these Terms;</li>
                <li>Your violation of any rights of another person or entity;</li>
                <li>Any visit to a property listed by you or visited by you;</li>
                <li>Any photography, filming, or drone activity undertaken by you;</li>
                <li>Any dispute related to ratings, reviews, tags, or reports associated with your listing or submitted by you.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">18. Changes to These Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. When we do, we will revise the "Last updated" date at the top of this document. If changes are material, we may provide additional notice, such as by email or through the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your continued use of the Service after any changes to the Terms constitutes your acceptance of the updated Terms.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">19. Governing Law and Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law principles. You agree that any disputes arising out of or relating to these Terms or the Service will be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">20. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the remaining provisions will remain in full force and effect.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">21. Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms constitute the entire agreement between you and us regarding your use of the Service and supersede any prior agreements or understandings, whether written or oral, relating to the subject matter herein.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-4">22. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
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
      <BackToTop />
    </div>
  );
}
