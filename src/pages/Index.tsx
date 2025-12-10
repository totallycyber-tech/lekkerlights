import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedListings } from "@/components/FeaturedListings";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Info, Users, Flag } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Community Disclaimer Section */}
        <section className="py-8 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border shadow-sm">
                <div className="shrink-0 p-2 bg-primary/10 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Welcome to Lekker Lights!
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Lekker Lights is a community-driven platform where anyone can share Christmas light displays they've discovered. 
                    Listings may be submitted by homeowners, neighbours, friends, or members of the public who have spotted a festive display.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-1">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-christmas mt-0.5 shrink-0" />
                      <p className="text-muted-foreground text-sm">
                        <strong className="text-foreground">Community-powered:</strong> Anyone can list a display they've found.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Flag className="h-4 w-4 text-christmas mt-0.5 shrink-0" />
                      <p className="text-muted-foreground text-sm">
                        <strong className="text-foreground">Homeowners:</strong> Use "Report Listing" to request removal.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    By using this site, you agree to our{" "}
                    <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <FeaturedListings />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
