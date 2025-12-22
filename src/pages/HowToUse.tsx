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
  LayoutGrid,
  Youtube,
  Link2
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
                        <MapPin className="h-4 w-4 text-primary" />
                        <span><strong>Street Address</strong> – Search by exact street address (e.g., "11 Eland Street")</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <span><strong>Suburb Chips</strong> – Use the quick-filter suburb chips below the search filters to instantly filter by popular suburbs. Each chip shows the number of displays in that area.</span>
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
                        <span><strong>Grid View</strong> – Browse displays as cards with photos and the full street address displayed as the title</span>
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
                        <span>Photos – <strong>click any photo to view it enlarged</strong>, then use arrows to browse through all photos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        <span>Videos – YouTube videos are embedded directly in the listing page in a dedicated <strong>"Videos" section</strong></span>
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
                        <MapPin className="h-4 w-4 text-primary" />
                        <span><strong>Full address displayed</strong> – Each listing card shows the complete street address as the title, so you can see exactly where the display is located at a glance</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Visitor guidance (parking, capacity, access)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span><strong>Timestamps</strong> – See when the listing was created and last updated for transparency</span>
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

                {/* Step 8 - Share with Short Links */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    8
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Share Displays with Short Links</h3>
                    <p className="text-muted-foreground mb-3">
                      Every listing has a unique, easy-to-share short link. Use it to share displays with friends and family:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <span><strong>Copy Link button</strong> – Click the link icon on any listing card or the "Copy Link" button on the listing page</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <span><strong>Short URL format</strong> – Links look like <code className="bg-muted px-1 rounded text-xs">lekkerlights.co.za/s/LL-A1B2C3</code></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <span>Share via WhatsApp, text, email, or social media</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 9 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    9
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Plan Your Lights Tour</h3>
                    <p className="text-muted-foreground mb-3">
                      Want to visit multiple displays in one trip? Use the <strong>"Plan Tour"</strong> feature to create an optimized route:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <span>Click the route icon on listing cards or "Add to Tour" button to add displays (up to 10)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span>Click "Optimize Route" to arrange stops for shortest driving distance</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-primary" />
                        <span>See estimated distance and time, then open in Google Maps for turn-by-turn directions</span>
                      </li>
                    </ul>
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
                    <div className="bg-christmas/10 rounded-lg p-3 mb-3">
                      <p className="text-sm text-christmas font-medium">
                        💡 <strong>Bulk Listings:</strong> Spotted multiple displays? Switch to "Bulk Listings" mode to submit up to 10 at once with a single edit link!
                      </p>
                    </div>
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
                    <h3 className="font-semibold text-lg mb-2">Add Basic Information (Optional)</h3>
                    <p className="text-muted-foreground mb-3">
                      You can optionally add a title and description for your display:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-christmas" />
                        <span><strong>Title</strong> – Enable the toggle to add a catchy name (or use AI to generate one)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-christmas" />
                        <span><strong>Description</strong> – Enable the toggle to describe what makes your display special (or use AI to help)</span>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      💡 Both fields are optional – if you skip them, visitors will see your location instead.
                    </p>
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
                      Start typing your address in the search field and select from the autocomplete suggestions. The address fields will be populated automatically. <strong>The system will automatically check if this address is already listed</strong> – if so, you'll see a notification with a link to request an edit link if it's your listing. If you live in a complex or estate, enable the optional fields to add those details.
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
                      <li className="flex items-start gap-2">
                        <Camera className="h-4 w-4 text-christmas mt-0.5 flex-shrink-0" />
                        <span><strong>Cover Photo</strong> – The main image that appears on your listing card. <span className="text-christmas font-medium">Upload high quality photos taken in the evening when your lights are on!</span></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Camera className="h-4 w-4 text-christmas mt-0.5 flex-shrink-0" />
                        <span><strong>Additional Photos</strong> – Up to 15 more high quality photos to show different angles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Youtube className="h-4 w-4 text-christmas mt-0.5 flex-shrink-0" />
                        <div>
                          <span><strong>YouTube Videos</strong> – To add videos:</span>
                          <ol className="list-decimal list-inside mt-1 ml-2 text-sm">
                            <li>Record a high quality video of your display at night</li>
                            <li>Upload your video separately to <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube.com</a></li>
                            <li>Copy the sharing link and paste it in the form (up to 3 videos)</li>
                          </ol>
                        </div>
                      </li>
                    </ul>
                    <div className="bg-christmas/10 rounded-lg p-3 mt-3">
                      <p className="text-sm text-christmas font-medium">
                        💡 <strong>Photo Management:</strong> When editing your listing, you can drag photos to reorder them, click "Set as Cover" on any photo to make it your main image, or remove photos you no longer want. On mobile, hold and drag to reorder.
                      </p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">⚠️ Media Consent Notice</p>
                      <p className="text-sm text-muted-foreground">
                        By submitting a picture or video, you confirm you own it or have the copyright holder's permission to share it publicly. You also confirm that any identifiable people shown have consented to being featured online (and that a parent/guardian has consented where a child is identifiable). Please avoid including personal or sensitive details such as children's faces, vehicle number plates, house numbers, security features, or anything else you wouldn't want visible publicly. Lekker Lights may edit or decline submissions, and we will remove content where a legitimate privacy concern is raised in line with our <a href="/privacy-policy" className="text-christmas hover:underline font-medium">Privacy Policy</a> and <a href="/terms-of-service" className="text-christmas hover:underline font-medium">Terms of Service</a>.
                      </p>
                    </div>
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
                  <AccordionItem value="view-photos" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I view photos and videos?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      <strong>Photos:</strong> When viewing a listing's detail page, click on any photo in the gallery to open it in a full-size 
                      lightbox view. Use the left and right arrow buttons (or keyboard arrows) to navigate between photos. 
                      Press Escape or click outside the photo to close the lightbox.
                      <br /><br />
                      <strong>Videos:</strong> YouTube videos are displayed in a dedicated "Videos" section on each listing page. 
                      Videos are embedded directly so you can watch them without leaving the site. On listing cards in Grid View, 
                      you'll see video thumbnails with a <strong>red play button</strong> overlay (displayed before photo thumbnails) 
                      and a video count badge showing how many videos are available.
                    </AccordionContent>
                  </AccordionItem>

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

                  <AccordionItem value="suburb-chips" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What are the suburb chips and how do I use them?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      The suburb chips are quick-filter buttons that appear below the main search filters on both the Grid View 
                      and Map View. Each chip displays a suburb name along with a count showing how many displays are in that area. 
                      Simply click on a suburb chip to instantly filter displays to that suburb only. Click "All Areas" to clear 
                      the suburb filter and see all displays again. The chips automatically update based on your province selection 
                      – if you select a province first, only suburbs within that province will be shown. This makes it easy to 
                      quickly explore different neighbourhoods without typing suburb names.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="map-view" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I use Map View?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      On the Browse Displays page, click the "Map" button next to the "Grid" button to switch to Map View. 
                      You'll see all displays as Christmas tree markers on an interactive map of South Africa. Click on any 
                      marker to view the display details in a panel below the map – the street address is shown as a title 
                      at the top of the panel for easy identification. From there you can favourite, get directions, 
                      or view the full listing. Use the "Refresh" button to reload the latest displays. All your filters 
                      (province, suburb, tags, and street address) also apply to the map view.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="plan-tour" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I plan a Christmas lights tour?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      You can plan a route to visit multiple displays in one trip using the <strong>"Plan Tour"</strong> feature:
                      <ol className="list-decimal list-inside mt-2 space-y-2">
                        <li>Click the <strong>route icon</strong> on any listing card (Grid View) or the <strong>"Add to Tour"</strong> button in listing details (Map View)</li>
                        <li>Add up to <strong>10 displays</strong> to your tour – displays in your tour show a purple marker with their position number on the map</li>
                        <li>Click the <strong>"Plan Tour"</strong> button to open the tour panel</li>
                        <li>Use the <strong>up/down arrows</strong> to reorder stops, or click <strong>"Optimize Route"</strong> to automatically arrange stops for the shortest driving distance</li>
                        <li>See the <strong>estimated distance and time</strong> for your tour at the top of the panel</li>
                        <li>Click <strong>"Start Tour"</strong> to open turn-by-turn navigation in your preferred maps app (optionally starting from your current location)</li>
                        <li>Use <strong>"Share Tour Link"</strong> to copy a link that others can use to see your planned route</li>
                      </ol>
                      <p className="mt-2">
                        Your tour is saved in your browser, so you can close the page and come back later to continue planning.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="view-street-address" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I see the exact street address of a display?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      <strong>In Grid View:</strong> Each listing card shows the suburb and city. To see the exact street address, 
                      hover over (or tap on mobile) the small "Address" button with the eye icon next to the location. 
                      A tooltip will appear showing the full street address including any complex name or unit number.
                      <br /><br />
                      <strong>In Map View:</strong> When you click on a marker, the display details panel appears below the map 
                      with the full street address shown as the title at the top for easy identification.
                      <br /><br />
                      <strong>Search by Address:</strong> You can also search for a specific address using the "Street Address" 
                      filter in the Filters panel. Enter the street number and name (e.g., "11 Eland Street") to find a specific display.
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

                  <AccordionItem value="count-badges" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What do the photo and video count badges mean?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      On each listing card in Grid View, you'll see small badges in the top-right corner that show:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Photo count badge</strong> (camera icon) – Shows the total number of photos uploaded for that display</li>
                        <li><strong>Video count badge</strong> (YouTube icon) – Shows how many YouTube videos are linked to the listing</li>
                      </ul>
                      <p className="mt-2">
                        These badges help you quickly identify listings with rich media content. At the bottom of each card, 
                        you'll also see thumbnail previews – <strong>video thumbnails appear first</strong> (with a red play button overlay) 
                        followed by photo thumbnails. This lets you preview the content before opening the full listing.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="short-links" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What are short links and how do I use them?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Every listing has a unique short link (e.g., <code className="bg-muted px-1 rounded text-xs">lekkerlights.co.za/s/LL-A1B2C3</code>) 
                      that makes sharing displays easy. To copy a short link:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Click the <strong>link icon</strong> on any listing card in Grid or Map view</li>
                        <li>Or click <strong>"Copy Link"</strong> on the listing detail page</li>
                      </ul>
                      <p className="mt-2">
                        Short links are automatically generated for all listings and never expire. Share them via WhatsApp, 
                        text, email, or social media – recipients will be taken directly to the listing page.
                      </p>
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

                  <AccordionItem value="instant-edit" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Can I edit my listing instantly without waiting for an email?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes! You can edit your listing instantly using the <strong>"Edit Listing"</strong> button at the bottom of 
                      any listing detail page. Here's how it works:
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Click the "Edit Listing" button on your listing's detail page</li>
                        <li>Enter the email address you used when creating the listing</li>
                        <li>If the email matches, you'll be redirected to the edit page <strong>immediately</strong></li>
                      </ol>
                      <p className="mt-2">
                        This "instant edit" feature gives you immediate access without waiting for an email to arrive. 
                        For security awareness, an edit link is still sent to your email in the background so you have 
                        a record that edit access was granted. This dual approach provides both convenience and security.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-listing" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I edit my listing after publishing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      When you publish your listing, we send a secure edit link to your email address. Click this link 
                      to update your listing details, photos, operating hours, or any other information. You can also 
                      <strong> add or remove a title and description</strong> using the toggle switches, and use the 
                      <strong> AI generation buttons</strong> to create new content if needed.
                      <strong> Edit links are valid for 1 hour only</strong> for security purposes. If your link has expired 
                      or you've lost it, you can{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">request a new one here</Link>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-link-expiry" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Why did my edit link expire?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      For security reasons, edit links are only valid for <strong>1 hour</strong> after they are generated. 
                      This prevents unauthorized access if someone else gains access to your email. When you need to make 
                      changes to your listing, simply{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">request a new edit link</Link>{" "}
                      – a fresh link will be sent to your email immediately and will be valid for another hour.
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
                      one cover photo (the main image on your listing card) and up to 15 additional photos. 
                      <strong className="text-christmas"> For best results, upload high quality photos taken in the evening when your lights are on!</strong> Visitors 
                      can click on any photo to view it full-size and browse through your gallery using navigation arrows.
                      <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">⚠️ Media Consent Notice</p>
                        <p className="text-sm">
                          By submitting a picture or video, you confirm you own it or have the copyright holder's permission to share it publicly. You also confirm that any identifiable people shown have consented to being featured online (and that a parent/guardian has consented where a child is identifiable). Please avoid including personal or sensitive details such as children's faces, vehicle number plates, house numbers, security features, or anything else you wouldn't want visible publicly. Lekker Lights may edit or decline submissions, and we will remove content where a legitimate privacy concern is raised.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="photo-management" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I reorder my photos or change my cover photo?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      When editing your listing, you have full control over your photo gallery:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Drag to reorder</strong> – Use the grip handle (⋮⋮) on any photo to drag and drop it to a new position. On mobile, hold the handle briefly then drag.</li>
                        <li><strong>Set as Cover</strong> – Click the "Set as Cover" button on any additional photo to make it your main cover image. The first photo in your gallery is always the cover.</li>
                        <li><strong>Remove photos</strong> – Click the X button on any photo to remove it from your listing.</li>
                      </ul>
                      <p className="mt-2">
                        These controls are available on both desktop (hover to reveal) and mobile (always visible). 
                        Changes take effect when you save your listing.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="video-requirements" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      How do I add videos to my listing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      To add videos to your listing:
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li><strong>Record a high quality video</strong> of your display at night when the lights are on</li>
                        <li><strong>Upload your video to <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube.com</a></strong> – you'll need a free YouTube account</li>
                        <li><strong>Copy the sharing link</strong> from YouTube (click Share button on your video)</li>
                        <li><strong>Paste the link</strong> in the YouTube Videos section of your listing form</li>
                      </ol>
                      <p className="mt-2">You can add up to 3 YouTube video URLs per listing. Videos are embedded directly in your listing page 
                      in a dedicated "Videos" section so visitors can watch without leaving the site. On your listing card in Grid View, 
                      video thumbnails will appear with a <strong>red play button</strong> overlay (shown before photo thumbnails), 
                      and a video count badge will show visitors how many videos you've added.</p>
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-primary font-medium">🌟 Get featured on our YouTube channel!</p>
                        <p className="text-sm mt-1">
                          Want your display video to be featured on the official{" "}
                          <a href="https://www.youtube.com/@LekkerLights" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            Lekker Lights YouTube Channel
                          </a>
                          ? Email your video link or video file to{" "}
                          <a href="mailto:lekkerlights.za@gmail.com" className="text-primary hover:underline font-medium">lekkerlights.za@gmail.com</a>{" "}
                          with your listing address!
                        </p>
                      </div>
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
                      No, each address can only have one listing. When you select an address, the system <strong>immediately checks if it already exists</strong> in our database. If the address is already listed, you'll see an error message right away with a link to request an edit link. This saves you time by letting you know upfront rather than after filling out the entire form. If it's your listing and you need to make changes, use your edit link or{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">request a new edit link</Link>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bulk-listings" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Can I submit multiple listings at once?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes! Use the "Bulk Listings" mode on the{" "}
                      <Link to="/create" className="text-primary hover:underline">Create Listing page</Link> to submit up to 10 
                      displays at once. Each listing in your batch can have its own:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Title and description (optional – enable via toggle, with AI generation available)</li>
                        <li>Address details</li>
                        <li>Cover photo and up to 15 additional photos</li>
                        <li>Up to 3 YouTube video URLs</li>
                        <li>Operating hours (day-by-day schedule or custom text)</li>
                        <li>Tags and display features</li>
                        <li>Visit guidance (parking, max visitors, gate access)</li>
                        <li>Complex/estate and unit number details</li>
                      </ul>
                      <p className="mt-2">
                        All listings share the same contact information, and you'll receive a single edit link 
                        to manage all of them together. This is great if you've spotted multiple displays in your neighbourhood!
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="multiple-batches" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      I submitted several batches of listings. How do I get edit links for all of them?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      If you submitted multiple batches of up to 10 listings each (using "Bulk Listings" mode several times), 
                      each batch has its own unique edit link. When you request a new edit link using the{" "}
                      <Link to="/resend-edit-link" className="text-primary hover:underline">Lost Edit Link?</Link> page 
                      and select "Bulk Listings", you'll receive a <strong>separate email for each batch</strong> you submitted.
                      <p className="mt-2">
                        For example, if you submitted 3 separate batches of displays at different times, you'll receive 3 emails 
                        – each containing the edit link for that specific batch. Make sure to check your inbox (and spam folder) 
                        for all the emails.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="title-description-optional" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Do I need to add a title and description?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      No, both title and description are completely optional! When creating or editing a listing, you'll see 
                      toggle switches to enable these fields. If you don't add them, visitors will simply see the location 
                      information (suburb and city) on your listing card. If you do want to add them, you can type your own 
                      or use the <strong>"Generate with AI"</strong> button to create suggestions automatically based on your 
                      display's tags.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="revision-history" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      What is revision history?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Every time you make changes to your listing, a new revision is created. On the edit page, you can see:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Current version number</strong> – Shows which revision you're on (e.g., v3)</li>
                        <li><strong>Change history</strong> – A list of previous changes with what was updated and when</li>
                      </ul>
                      <p className="mt-2">
                        This helps you track what changes you've made over time and when they were made. Revision history 
                        is private and only visible when editing your listing.
                      </p>
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
                  <AccordionItem value="community-listings" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Who can submit a listing?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Anyone can submit a listing! You don't have to be the homeowner – if you've spotted an amazing Christmas 
                      display while out and about, you're welcome to list it here to share with the community. We encourage 
                      neighbours, friends, and passers-by to help grow our directory of festive displays. Just make sure the 
                      information you provide is accurate and respectful of the homeowner's privacy.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="homeowner-removal" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      I'm a homeowner and want my property removed. What do I do?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      We respect your right to privacy. If your property has been listed without your consent and you'd like 
                      it removed, please:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Use the <strong>"Report Listing"</strong> button on the listing page and select "Privacy concern"</li>
                        <li>Or contact us directly using the Contact Us form with details of your property</li>
                      </ul>
                      <p className="mt-2">
                        The website developer will review your request and remove the listing. We aim to process removal 
                        requests within 1-2 business days. Please note that only the website developer can remove listings 
                        created by others.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

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
                      For display listings, we store the information you provide: title and description (if enabled), address, 
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

                  <AccordionItem value="youtube-channel" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      Does Lekker Lights have a YouTube channel?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      Yes! We have an official{" "}
                      <a href="https://www.youtube.com/@LekkerLights" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        Lekker Lights YouTube Channel
                      </a>{" "}
                      where we feature the best Christmas light displays from across South Africa. Subscribe to stay 
                      updated with new videos!
                      <p className="mt-2">
                        <strong>Want your display featured?</strong> Email your video link or video file to{" "}
                        <a href="mailto:lekkerlights.za@gmail.com" className="text-primary hover:underline">lekkerlights.za@gmail.com</a>{" "}
                        with your listing address and we may feature it on our channel!
                      </p>
                      <div className="mt-3">
                        <a href="https://www.youtube.com/@LekkerLights" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20">
                            <Youtube className="h-4 w-4 mr-2" />
                            Subscribe to YouTube
                          </Button>
                        </a>
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