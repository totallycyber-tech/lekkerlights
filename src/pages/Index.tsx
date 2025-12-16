import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CommunityThanks } from "@/components/CommunityThanks";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Sparkles, Users, Flag, TreePine, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Festive Welcome Section */}
        <section className="py-12 relative overflow-hidden">
          {/* Background with festive gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
          
          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 opacity-20">
            <TreePine className="h-12 w-12 text-festive-green" />
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <TreePine className="h-12 w-12 text-festive-green" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Card */}
              <div className="relative p-6 sm:p-8 bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-christmas/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-festive-gold/10 rounded-full blur-3xl" />
                
                <div className="relative space-y-6">
                  {/* Header with festive styling */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-christmas/20 to-festive-gold/20 rounded-xl">
                      <Sparkles className="h-6 w-6 text-festive-gold animate-twinkle" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                        Welcome to Benoni's Festive Lights Community!
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="h-3 w-3 text-festive-gold" />
                        <span className="text-sm text-muted-foreground">Where our neighbourhood comes alive with Christmas magic</span>
                        <Star className="h-3 w-3 text-festive-gold" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    Lekker Lights is a community-driven platform where anyone can share Christmas light displays they've discovered. 
                    Listings may be submitted by homeowners, neighbours, friends, or members of the public who have spotted a festive display.
                  </p>
                  
                  {/* Feature highlights */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-christmas mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Community-powered</p>
                        <p className="text-muted-foreground text-sm">Anyone can list a display they've found</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Flag className="h-5 w-5 text-christmas mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Homeowners</p>
                        <p className="text-muted-foreground text-sm">Use "Report Listing" to request removal</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms & Privacy */}
                  <p className="text-xs text-muted-foreground/80 pt-2 border-t border-border/50">
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
        
        {/* Community Thank You Section */}
        <CommunityThanks />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
