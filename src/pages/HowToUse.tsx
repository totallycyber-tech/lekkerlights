import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContactUsDialog } from "@/components/ContactUsDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Plus, 
  Mail, 
  Camera, 
  Clock, 
  Tags, 
  Eye, 
  Edit, 
  AlertTriangle,
  FileText,
  Shield,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Users,
  Navigation,
  Filter,
  Map,
  MousePointerClick,
  RefreshCw,
  LayoutGrid
} from "lucide-react";

export default function HowToUse() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              How to Use Lekker Lights
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your complete guide to discovering and sharing Christmas light displays across South Africa. 
              Whether you're looking for festive displays to visit or want to share your own creation, 
              we've got you covered.
            </p>
          </div>

          {/* For Display Visitors Section */}
          <section className="mb-16">
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">For Display Visitors</h2>
              </div>
              <p className="text-muted-foreground mb-8">
                Looking for Christmas light displays to visit? Here's how to find the perfect festive experience for you and your family.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Browse Available Displays</h3>
                    <p className="text-muted-foreground mb-3">
                      Click on <strong>"Browse Displays"</strong> in the navigation menu to see all listed Christmas light displays in South Africa.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Navigation className="h-4 w-4" />
                      <Link to="/browse" className="hover:underline">Go to Browse Displays →</Link>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Filter by Location & Preferences</h3>
                    <p className="text-muted-foreground mb-3">
                      Use the search filters to narrow down displays by:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span><strong>Province</strong> – Select your province from the dropdown</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span><strong>Suburb</strong> – Type a suburb name to search in that area</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-primary" />
                        <span><strong>Tags</strong> – Filter by features like "family-friendly", "walk-through", "music-synchronized", etc.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 - Map View */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Use Map View</h3>
                    <p className="text-muted-foreground mb-3">
                      Switch between Grid View and Map View using the toggle buttons to explore displays in different ways:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-primary" />
                        <span><strong>Grid View</strong> – Browse displays as cards with photos and details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-primary" />
                        <span><strong>Map View</strong> – See all displays on an interactive map of South Africa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4 text-primary" />
                        <span><strong>Click markers</strong> – Click on any Christmas tree marker to view the display details below the map</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span><strong>Refresh</strong> – Use the Refresh button to reload the latest displays on the map</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">View Display Details</h3>
                    <p className="text-muted-foreground mb-3">
                      Click on any display card to view the full details including:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        <span>Photos and videos of the display</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Operating hours and days</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Address and directions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Visitor guidance (parking, capacity, access)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Get Directions</h3>
                    <p className="text-muted-foreground">
                      Click the <strong>"Get Directions"</strong> button on any listing to open Google Maps with turn-by-turn navigation to the display's location.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Save Your Favourites</h3>
                    <p className="text-muted-foreground mb-3">
                      Click the <strong>heart icon</strong> on any display to add it to your favourites. Your favourites are saved in your browser so you can easily find them again later.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-christmas" />
                      <span>Use the "Favourites" toggle on the Browse page to see only your saved displays.</span>
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    7
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Leave a Review</h3>
                    <p className="text-muted-foreground">
                      After visiting a display, scroll down to the reviews section and share your experience. Rate the display from 1-5 stars and optionally leave a comment to help other visitors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* For Display Owners Section */}
          <section className="mb-16">
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-christmas/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-christmas" />
                </div>
                <h2 className="font-display text-2xl font-bold">For Display Owners</h2>
              </div>
              <p className="text-muted-foreground mb-8">
                Want to share your Christmas light display with the community? Follow these steps to list your display for free.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Start Your Listing</h3>
                    <p className="text-muted-foreground mb-3">
                      Click on <strong>"List Your Display"</strong> in the navigation menu or the button on the homepage to begin creating your listing.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-christmas">
                      <Plus className="h-4 w-4" />
                      <Link to="/create" className="hover:underline">Create a Listing →</Link>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Add Basic Information</h3>
                    <p className="text-muted-foreground mb-3">
                      Fill in the essential details about your display:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-christmas" />
                        <span><strong>Title</strong> – A catchy name for your display (or use AI to generate one)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-christmas" />
                        <span><strong>Description</strong> – Tell visitors what makes your display special (or use AI to help)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Enter Your Address</h3>
                    <p className="text-muted-foreground mb-3">
                      Start typing your address in the search field and select from the autocomplete suggestions. The address fields will be populated automatically. If you live in a complex or estate, enable the optional fields to add those details.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-christmas" />
                      <span>Only South African addresses are supported.</span>
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Upload Photos & Videos</h3>
                    <p className="text-muted-foreground mb-3">
                      Showcase your display with photos and videos:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-christmas" />
                        <span><strong>Cover Photo</strong> – The main image that appears on your listing card</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-christmas" />
                        <span><strong>Additional Photos</strong> – Up to 9 more photos to show different angles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-christmas" />
                        <span><strong>YouTube Videos</strong> – Add up to 3 YouTube video URLs</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Select Display Tags</h3>
                    <p className="text-muted-foreground">
                      Choose tags that describe your display's features. Tags help visitors find displays that match what they're looking for – such as "family-friendly", "wheelchair-accessible", "music-synchronized", "nativity", and more.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Set Operating Hours</h3>
                    <p className="text-muted-foreground">
                      Toggle on the days your display is viewable and set the start and end times for each day. If your hours vary or don't fit the standard format, leave all days off and use the "Other" field to describe your schedule in your own words.
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    7
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Add Visitor Guidance</h3>
                    <p className="text-muted-foreground">
                      Help visitors plan their trip by providing information about parking, maximum visitors at a time, and any gate or security access requirements if your property is in a complex or estate.
                    </p>
                  </div>
                </div>

                {/* Step 8 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    8
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Provide Contact Details</h3>
                    <p className="text-muted-foreground mb-3">
                      Enter your contact information. Your email address is <strong>required</strong> so we can send you a secure link to edit or delete your listing. You can choose which contact details are visible to visitors using the toggle switches.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-christmas" />
                      <span>Keep your edit link email safe – you'll need it to make changes to your listing.</span>
                    </p>
                  </div>
                </div>

                {/* Step 9 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    9
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Preview & Publish</h3>
                    <p className="text-muted-foreground mb-3">
                      Use the <strong>"Preview"</strong> button to see how your listing will appear to visitors. Once you're happy with everything, agree to the Terms of Service and Privacy Policy, then click <strong>"Publish Listing"</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-christmas" />
                      <span>Your listing goes live immediately – no waiting for approval!</span>
                    </p>
                  </div>
                </div>

                {/* Step 10 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-christmas text-white rounded-full flex items-center justify-center font-bold">
                    10
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Edit or Delete Your Listing</h3>
                    <p className="text-muted-foreground mb-3">
                      After publishing, you'll receive an email with a secure edit link. Use this link to update your listing details, add new photos, change operating hours, or delete your listing entirely.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-christmas">
                      <Edit className="h-4 w-4" />
                      <Link to="/resend-edit-link" className="hover:underline">Lost your edit link? Request a new one →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find answers to common questions about using Lekker Lights.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {/* General Questions */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  General Questions
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="what-is-lekker-lights" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What is Lekker Lights?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Lekker Lights is a free community platform that helps South Africans discover and share Christmas light displays. 
                      Homeowners can list their festive displays for others to find and visit, while visitors can browse displays in their area, 
                      filter by features, get directions, and leave reviews. It's all about bringing communities together through the joy of Christmas lights!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="is-it-free" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Is it free to use?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes! Lekker Lights is completely free for both display owners and visitors. There are no fees to list your display, 
                      browse displays, or use any features on the website. We believe in making festive joy accessible to everyone.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="south-africa-only" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Is this only for South Africa?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes, Lekker Lights is currently exclusively for South African Christmas light displays. 
                      All addresses must be within South Africa, and we focus on helping South African communities 
                      discover local festive displays.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="need-account" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Do I need to create an account?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      No account is required! You can browse displays, save favourites, and leave reviews without signing up. 
                      Your favourites are stored in your browser. When listing a display, you provide an email address 
                      to receive your secure edit link, but no account registration is needed.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* For Visitors */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  For Visitors
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="save-favourites" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I save my favourite displays?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Click the heart icon on any display card to add it to your favourites. Your favourites are saved in your 
                      browser's local storage, so they'll persist across visits as long as you use the same browser and don't 
                      clear your browsing data. On the Browse page, you can use the "Show Favourites Only" toggle to filter 
                      and see only your saved displays.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="filter-displays" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I filter displays?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      On the Browse Displays page, you can filter by province (select from the dropdown), suburb (type to search), 
                      and tags (select features you're looking for). When you select multiple tags, only displays that have 
                      ALL the selected tags will be shown. Click the "Search" button after setting your filters to apply them.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="map-view" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I use Map View?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      On the Browse Displays page, click the "Map" button next to the "Grid" button to switch to Map View. 
                      You'll see all displays as Christmas tree markers on an interactive map of South Africa. Click on any 
                      marker to view the display details in a panel below the map – from there you can favourite, get directions, 
                      or view the full listing. Use the "Refresh" button to reload the latest displays. All your filters 
                      (province, suburb, tags) also apply to the map view.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-are-popular" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What does the "Popular" badge mean?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Displays earn the "Popular" badge based on community engagement. The popularity score is calculated from 
                      the number of "Get Directions" clicks plus twice the number of favourites. When a display reaches a 
                      score of 3 or more, it earns the Popular badge – indicating it's well-loved by visitors!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="report-listing" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I report a problem with a listing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      If you find a listing with incorrect information, inappropriate content, privacy concerns, or safety issues, 
                      you can report it using the "Report" button on the listing. Select a reason from the dropdown, add any 
                      additional details, and provide your contact information so we can follow up if needed. Reports are 
                      reviewed and actioned by our team.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* For Display Owners */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-christmas" />
                  For Display Owners
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="how-long-publish" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How long does it take for my listing to go live?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Your listing goes live immediately after you click "Publish Listing"! There's no waiting period or 
                      approval process. Your display will be visible to visitors right away.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-listing" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I edit my listing after publishing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      When you publish your listing, we send a secure edit link to your email address. Click this link 
                      anytime to update your listing details, photos, operating hours, or any other information. 
                      Keep this email safe! If you lose the edit link, you can{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">request a new one here</Link>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="delete-listing" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I delete my listing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Use your secure edit link to access your listing's edit page. At the bottom of the page, 
                      you'll find a "Hide Listing" button that removes your display from public view. You can use 
                      the same link to restore it later if you change your mind.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="photo-requirements" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What are the photo requirements?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Photos must be in JPEG, PNG, WebP, or GIF format and no larger than 5MB each. You can upload 
                      one cover photo (the main image on your listing card) and up to 9 additional photos. For best 
                      results, use landscape-oriented photos taken in the evening when your lights are on!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="reviews-moderation" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Are reviews moderated?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes, all reviews go through automatic AI moderation to filter out inappropriate content, spam, 
                      profanity, and personal attacks. Only approved reviews are displayed publicly. This helps 
                      maintain a positive and helpful community for everyone.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="same-address" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Can I list the same address twice?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      No, each address can only have one listing. If you try to create a listing for an address that's 
                      already registered, you'll see an error message. If it's your listing and you need to make changes, 
                      use your edit link or{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">request a new edit link</Link>.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Privacy & Legal */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Legal
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="privacy-policy" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Where can I find the Privacy Policy?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Our Privacy Policy explains how we collect, use, and protect your personal information. 
                      It covers data collection practices, how your information is stored and secured, and your rights 
                      regarding your personal data. You can read the full policy here:
                      <div className="mt-3">
                        <Link to="/privacy-policy">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Read Privacy Policy
                          </Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="terms-of-service" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Where can I find the Terms of Service?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Our Terms of Service outline the rules and guidelines for using Lekker Lights, including 
                      acceptable use, content guidelines, limitations of liability, and your responsibilities 
                      as a user. You must agree to these terms when listing a display. Read the full terms here:
                      <div className="mt-3">
                        <Link to="/terms-of-service">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Read Terms of Service
                          </Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contact-visibility" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Can I hide my contact information?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes! When creating or editing your listing, you have individual toggle switches for each 
                      contact field (name, email, phone). You can choose which details are visible to visitors. 
                      Note that your email address is always required internally so we can send you your edit link, 
                      but you can choose to hide it from public view.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-stored" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What data is stored?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      For display listings, we store the information you provide: title, description, address, 
                      photos, operating hours, tags, and contact details. For visitors, favourites are stored 
                      locally in your browser – we don't track or store your browsing activity on our servers. 
                      Reviews are stored with ratings and comments only. See our{" "}
                      <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>{" "}
                      for full details.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Support & Contact */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Support & Contact
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="contact-us" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I contact the Lekker Lights team?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      We'd love to hear from you! Whether you have questions, suggestions, feedback, or need help 
                      with anything, you can reach us using the Contact Us form. We aim to respond within 1-2 
                      business days.
                      <div className="mt-3">
                        <ContactUsDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Us
                            </Button>
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="support-website" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How can I support this website?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Lekker Lights is a passion project that costs money to run (hosting, domain, storage, etc.). 
                      If you enjoy using the website and want to help keep it running, you can make a donation. 
                      Every contribution, big or small, helps us maintain and improve the platform for the community.
                      <div className="mt-3">
                        <Link to="/donate">
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4 mr-2 text-christmas" />
                            Make a Donation
                          </Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bug-report" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      I found a bug or have a suggestion. How do I report it?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      We appreciate your feedback! Use the Contact Us form to report bugs, suggest new features, 
                      or share any ideas you have for improving Lekker Lights. Please include as much detail as 
                      possible about any issues you encounter (what you were doing, what happened, what device/browser 
                      you're using) to help us investigate and fix problems quickly.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </Accordion>
          </section>

          {/* Still Need Help CTA */}
          <section className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary/10 via-christmas/10 to-primary/10 rounded-xl p-8 border border-border">
              <h3 className="font-display text-xl font-semibold mb-2">Still Have Questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Get in touch and we'll be happy to help!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <ContactUsDialog
                  trigger={
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                  }
                />
                <Link to="/browse">
                  <Button variant="default">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Displays
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
}